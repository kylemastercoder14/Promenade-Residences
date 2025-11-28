/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useCreateAmenityReservation } from "@/features/amenity-reservations/hooks/use-amenity-reservations";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ResidentReservationCalendar } from "./resident-calendar";
import {
  CalendarDate,
} from "@internationalized/date";
import ImageUpload from "@/components/image-upload";

const formSchema = z
  .object({
    userType: z.enum(["resident", "tenant", "visitor"]),
    userId: z.string().optional(),
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    amenity: z.enum(["COURT", "GAZEBO"]),
    date: z.date(),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    numberOfGuests: z.number().min(1, "Number of guests is required"),
    purpose: z.string().optional(),
    paymentMethod: z.enum(["CASH", "GCASH", "MAYA", "OTHER_BANK"]).optional(),
    proofOfPayment: z.string().optional(),
  })
  .refine(
    (data) => {
      // For visitors, userId is not required
      if (data.userType === "visitor") {
        return true;
      }
      // For residents/tenants, fullName is required (userId is optional if resident doesn't have account)
      return data.fullName.length > 0;
    },
    {
      message: "Please select a household member or enter a name",
      path: ["fullName"],
    }
  )
  .refine(
    (data) => {
      // Email is required for visitors
      if (data.userType === "visitor") {
        return !!data.email && data.email.trim() !== "";
      }
      return true;
    },
    {
      message: "Email is required for visitors",
      path: ["email"],
    }
  )
  .refine((data) => {
    // If payment method is not CASH, proof of payment is required
    if (data.paymentMethod && data.paymentMethod !== "CASH" && !data.proofOfPayment) {
      return false;
    }
    return true;
  }, {
    message: "Proof of payment is required for non-cash payment methods",
    path: ["proofOfPayment"],
  });

type FormData = z.infer<typeof formSchema>;

const steps = ["person", "amenity", "summary"] as const;
type Step = (typeof steps)[number];

export const ResidentReservationForm = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>("person");
  const createReservation = useCreateAmenityReservation();
  const trpc = useTRPC();

  // Fetch household members for resident/tenant selection
  const { data: householdMembers = [] } = useQuery(
    trpc.auth.getHouseholdMembers.queryOptions()
  );

  // Fetch users to match with residents
  const { data: users = [] } = useQuery(trpc.accounts.getMany.queryOptions());

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: "resident",
      userId: undefined,
      fullName: "",
      email: "",
      amenity: "COURT",
      date: new Date(),
      startTime: "",
      endTime: "",
      numberOfGuests: 1,
      purpose: "",
      paymentMethod: undefined,
      proofOfPayment: undefined,
    },
  });

  const userType = form.watch("userType");
  const amenity = form.watch("amenity");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");
  const selectedDate = form.watch("date");

  // Convert selected date to CalendarDate for the calendar component
  const calendarSelectedDate = useMemo(() => {
    const date = selectedDate || new Date();
    return new CalendarDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
  }, [selectedDate]);

  // Filter residents by typeOfResidency and match with users
  const filteredResidentsWithUsers = useMemo(() => {
    if (userType === "visitor") return [];

    const residencyType = userType === "resident" ? "RESIDENT" : "TENANT";

    // Filter household members by residency type and active status
    // Include the head regardless of type when "resident" is selected
    const filteredResidents =
      householdMembers?.filter((resident) => {
        if (resident.isArchived) return false;
        // If resident is selected, include all RESIDENT types OR the head (regardless of type)
        if (userType === "resident") {
          return (
            resident.typeOfResidency === "RESIDENT" || resident.isHead === true
          );
        }
        // If tenant is selected, only show TENANT types
        return resident.typeOfResidency === residencyType;
      }) || [];

    // Map residents to include user info if available, but still show residents without users
    const residentsWithUsers = filteredResidents
      .map((resident) => {
        const fullName =
          `${resident.firstName} ${resident.middleName || ""} ${resident.lastName}${resident.suffix ? ` ${resident.suffix}` : ""}`.trim();

        // Try to find matching user by email
        const user = resident.emailAddress
          ? users?.find(
              (u) =>
                u.email.toLowerCase() ===
                  resident.emailAddress?.toLowerCase() &&
                u.role === "USER" &&
                !u.isArchived
            )
          : null;

        return {
          resident,
          user: user || null,
          fullName,
          email: resident.emailAddress || null,
          userId: user?.id || null,
        };
      })
      // Only filter out if we require a user (for now, show all residents)
      .filter((item) => item !== null);

    return [...residentsWithUsers].sort((a, b) => {
      // Sort by isHead first (head should be first), then by name
      if (a.resident.isHead && !b.resident.isHead) return -1;
      if (!a.resident.isHead && b.resident.isHead) return 1;
      const nameA = a.fullName.toLowerCase();
      const nameB = b.fullName.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [householdMembers, users, userType]);

  // Calculate amount based on amenity and duration
  const calculatedAmount = useMemo(() => {
    if (!startTime || !endTime) return 0;

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (amenity === "GAZEBO") {
      return 60; // 60 pesos for 3 hours
    } else if (amenity === "COURT") {
      return hours * 100; // 100 pesos per hour
    }
    return 0;
  }, [amenity, startTime, endTime]);

  // Auto-fill full name and email when user is selected
  const handleUserChange = (value: string) => {
    // value can be either userId or residentId (if no user exists)
    const selected = filteredResidentsWithUsers.find(
      (item) =>
        (item.userId && item.userId === value) || item.resident.id === value
    );
    if (selected) {
      form.setValue("fullName", selected.fullName);
      // Auto-populate email from resident's email address
      if (selected.email) {
        form.setValue("email", selected.email);
      }
      // Only set userId if a user exists, otherwise leave it undefined
      if (selected.userId) {
        form.setValue("userId", selected.userId);
      } else {
        form.setValue("userId", undefined);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createReservation.mutateAsync({
        userType: data.userType,
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        amenity: data.amenity,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        numberOfGuests: data.numberOfGuests,
        purpose: data.purpose,
        paymentMethod: data.paymentMethod,
        proofOfPayment: data.proofOfPayment,
        amountToPay: calculatedAmount,
        amountPaid: 0,
        status: "pending",
        paymentStatus: "pending",
      });
      form.reset();
      setStep("person");
      router.refresh();
      toast.success(
        "Reservation submitted successfully! It will be reviewed by the admin."
      );
    } catch (error: any) {
      console.error("Error saving reservation:", error);
      toast.error(error?.message || "Failed to create reservation");
    }
  };

  const handleNext = () => {
    if (step === "person") {
      // For residents/tenants, we need fullName and either userId or a selected resident
      const fullName = form.getValues("fullName");
      const email = form.getValues("email");
      const userId = form.getValues("userId");
      const selectedResident = filteredResidentsWithUsers.find(
        (item) => item.fullName === fullName
      );

      if (userType === "visitor") {
        if (!fullName) {
          form.trigger("fullName");
          return;
        }
        // Email is required for visitors
        if (!email || email.trim() === "") {
          form.trigger("email");
          return;
        }
      } else {
        // For resident/tenant, we need fullName and a selected household member
        if (!fullName || !selectedResident) {
          if (!fullName) form.trigger("fullName");
          if (!selectedResident) form.trigger("userId");
          return;
        }
        // Set userId if we have a selected resident with a user
        if (selectedResident.userId && !userId) {
          form.setValue("userId", selectedResident.userId);
        }
      }
      setStep("amenity");
    } else if (step === "amenity") {
      const amenityFields = [
        "amenity",
        "date",
        "startTime",
        "endTime",
        "numberOfGuests",
      ] as const;
      const isValid = amenityFields.every((field) => {
        const value = form.getValues(field);
        return value !== undefined && value !== null && value !== "";
      });
      if (isValid) {
        setStep("summary");
      } else {
        form.trigger(amenityFields);
      }
    }
  };

  const handleBack = () => {
    if (step === "amenity") {
      setStep("person");
    } else if (step === "summary") {
      setStep("amenity");
    }
  };

  const handleConfirm = () => {
    form.handleSubmit(onSubmit)();
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#1f5c34]">
            Amenities Reservation
          </p>
          <h1 className="text-3xl font-serif uppercase text-[#111]">
            Fill out reservation details
          </h1>
        </div>

        <div className="rounded-full bg-[#dfe7dd] p-1">
          <div
            className={cn(
              "rounded-full py-1 text-center text-xs font-semibold uppercase tracking-[0.4em] text-white transition-all",
              step === "person"
                ? "w-1/3 bg-[#1f5c34]"
                : step === "amenity"
                  ? "w-2/3 bg-[#1f5c34]"
                  : "w-full bg-[#1f5c34]"
            )}
          >
            {step === "person"
              ? "Step 1 of 3"
              : step === "amenity"
                ? "Step 2 of 3"
                : "Step 3 of 3"}
          </div>
        </div>

        {step === "person" && (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
          >
            <RadioGroup
              value={userType}
              onValueChange={(value) => {
                form.setValue("userType", value as FormData["userType"]);
                form.setValue("userId", undefined);
                form.setValue("fullName", "");
                form.setValue("email", "");
              }}
              className="mt-4 grid gap-3 md:grid-cols-2"
            >
              {[
                {
                  value: "resident",
                  title: "Resident",
                  desc: "Registered homeowner or tenant with verified account.",
                },
                {
                  value: "visitor",
                  title: "Visitor",
                  desc: "Guests requiring temporary amenity access.",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 transition",
                    userType === option.value
                      ? "border-[#1f5c34] bg-[#e5f2ea]"
                      : "border-[#e5e8df] hover:border-[#1f5c34]/50"
                  )}
                >
                  <RadioGroupItem value={option.value} className="mt-1" />
                  <div>
                    <p className="font-semibold text-[#1f2b1d]">
                      {option.title}
                    </p>
                    <p className="text-sm text-[#5b665c]">{option.desc}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>

            {userType !== "visitor" && (
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Select Household Member{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={handleUserChange}
                  value={
                    form.watch("userId") ||
                    filteredResidentsWithUsers.find(
                      (item) => item.fullName === form.watch("fullName")
                    )?.resident.id ||
                    ""
                  }
                >
                  <SelectTrigger className="mt-1 w-full bg-[#f5f8f3]">
                    <SelectValue placeholder="Select household member" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredResidentsWithUsers.length > 0 ? (
                      filteredResidentsWithUsers.map((item) => (
                        <SelectItem
                          key={item.userId || item.resident.id}
                          value={item.userId || item.resident.id}
                        >
                          {item.fullName} {item.resident.isHead && "(Head)"}
                          {!item.userId && " (Family Member)"}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No household members found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.userId && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.userId.message}
                  </p>
                )}
                {filteredResidentsWithUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    No {userType === "resident" ? "residents" : "tenants"} found
                    in your household.
                  </p>
                )}
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold text-[#1a2c1f]">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter full name"
                className="mt-1 bg-[#f5f8f3]"
                disabled={userType !== "visitor" && !!form.watch("userId")}
                {...form.register("fullName")}
              />
              {form.formState.errors.fullName && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-semibold text-[#1a2c1f]">
                Email Address{" "}
                {userType === "visitor" && <span className="text-destructive">*</span>}
                {userType !== "visitor" && <span className="text-muted-foreground">(optional)</span>}
              </Label>
              <Input
                type="email"
                placeholder="Enter email address"
                className="mt-1 bg-[#f5f8f3]"
                disabled={userType !== "visitor" && !!form.watch("userId")}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                className="rounded-full bg-[#1f5c34] px-8 text-white hover:bg-[#174128]"
                onClick={handleNext}
                type="button"
              >
                Next
              </Button>
            </div>
          </form>
        )}

        {step === "amenity" && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
          >
            <p className="text-sm font-semibold uppercase text-[#1f5c34]">
              Amenity Details
            </p>
            <div className="mt-2 grid gap-3 md:grid-cols-3">
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Type of Amenity <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("amenity", value as FormData["amenity"])
                  }
                  value={form.watch("amenity")}
                >
                  <SelectTrigger className="mt-1 w-full bg-[#f5f8f3]">
                    <SelectValue placeholder="Choose amenity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COURT">Basketball Court</SelectItem>
                    <SelectItem value="GAZEBO">Gazebo</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.amenity && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.amenity.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Reservation Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  className="mt-1 bg-[#f5f8f3]"
                  value={
                    form.watch("date")
                      ? format(form.watch("date"), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    form.setValue("date", value ? new Date(value) : new Date());
                  }}
                  min={format(new Date(), "yyyy-MM-dd")}
                  readOnly
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Select a date from the calendar below
                </p>
                {form.formState.errors.date && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Number of Guests <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  min="1"
                  className="mt-1 bg-[#f5f8f3]"
                  {...form.register("numberOfGuests", { valueAsNumber: true })}
                />
                {form.formState.errors.numberOfGuests && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.numberOfGuests.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Start Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="time"
                  className="mt-1 bg-[#f5f8f3]"
                  {...form.register("startTime")}
                />
                {form.formState.errors.startTime && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.startTime.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  End Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="time"
                  className="mt-1 bg-[#f5f8f3]"
                  {...form.register("endTime")}
                />
                {form.formState.errors.endTime && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Payment Method{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("paymentMethod", value as FormData["paymentMethod"])
                  }
                  value={form.watch("paymentMethod")}
                >
                  <SelectTrigger className="mt-1 w-full bg-[#f5f8f3]">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="GCASH">GCash</SelectItem>
                    <SelectItem value="OTHER_BANK">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.paymentMethod && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.paymentMethod.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Total Amount
                </Label>
                <Input
                  placeholder="₱0.00"
                  className="mt-1 bg-[#f5f8f3]"
                  value={`₱${calculatedAmount.toLocaleString()}`}
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {amenity === "GAZEBO"
                    ? "60 pesos for 3 hours"
                    : "100 pesos per hour"}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <Label className="text-sm font-semibold text-[#1a2c1f]">
                Proof of Payment{" "}
                {form.watch("paymentMethod") && form.watch("paymentMethod") !== "CASH" ? (
                  <span className="text-destructive">*</span>
                ) : (
                  <span className="text-muted-foreground">(optional)</span>
                )}
              </Label>
              <div className="mt-1">
                <ImageUpload
                  imageCount={1}
                  maxSize={5}
                  onImageUpload={(url) =>
                    form.setValue("proofOfPayment", typeof url === "string" ? url : url[0])
                  }
                  defaultValue={form.watch("proofOfPayment")}
                />
              </div>
              {form.formState.errors.proofOfPayment && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.proofOfPayment.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {!form.watch("paymentMethod")
                  ? "Select a payment method first. Proof of payment is required for non-cash payments."
                  : form.watch("paymentMethod") !== "CASH"
                    ? "Proof of payment is required for non-cash payments"
                    : "Upload proof of payment (optional for cash payments)"}
              </p>
            </div>

            <div>
              <Label className="text-sm font-semibold text-[#1a2c1f]">
                Purpose{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                placeholder="Enter purpose of reservation"
                className="mt-1 bg-[#f5f8f3]"
                {...form.register("purpose")}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                className="rounded-full px-6"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                type="button"
                className="rounded-full bg-[#1f5c34] px-8 text-white hover:bg-[#174128]"
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          </form>
        )}

        {step === "summary" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#e3e9df] bg-white shadow-sm">
              <div className="flex flex-col gap-6 p-6 lg:flex-row">
                <div className="flex-1 space-y-2">
                  <p className="text-base font-semibold uppercase text-[#6b766d]">
                    Guest Information
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-[#6b766d]">Type:</span>{" "}
                      <span className="font-semibold capitalize">
                        {userType}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#6b766d]">Name:</span>{" "}
                      <span className="font-semibold">
                        {form.watch("fullName")}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <p className="text-base font-semibold uppercase text-[#6b766d]">
                    Amenity Details
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-[#6b766d]">Amenity:</span>{" "}
                      <span className="font-semibold">
                        {form.watch("amenity") === "COURT"
                          ? "Basketball Court"
                          : "Gazebo"}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#6b766d]">Date:</span>{" "}
                      <span className="font-semibold">
                        {form.watch("date")
                          ? format(form.watch("date"), "MMMM d, yyyy")
                          : "—"}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#6b766d]">Time:</span>{" "}
                      <span className="font-semibold">
                        {form.watch("startTime")} - {form.watch("endTime")}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#6b766d]">Guests:</span>{" "}
                      <span className="font-semibold">
                        {form.watch("numberOfGuests")}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#6b766d]">Total Amount:</span>{" "}
                      <span className="font-semibold">
                        ₱{calculatedAmount.toLocaleString()}
                      </span>
                    </p>
                    {form.watch("paymentMethod") && (
                      <p>
                        <span className="text-[#6b766d]">Payment Method:</span>{" "}
                        <span className="font-semibold">
                          {form.watch("paymentMethod") === "CASH" ? "Cash" : form.watch("paymentMethod") === "GCASH" ? "GCash" : "Bank Transfer"}
                        </span>
                      </p>
                    )}
                    {form.watch("proofOfPayment") && (
                      <p>
                        <span className="text-[#6b766d]">Proof of Payment:</span>{" "}
                        <a
                          href={form.watch("proofOfPayment")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-semibold hover:underline"
                        >
                          View Document
                        </a>
                      </p>
                    )}
                    {form.watch("email") && (
                      <p>
                        <span className="text-[#6b766d]">Email:</span>{" "}
                        <span className="font-semibold">
                          {form.watch("email")}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4">
              <Button
                variant="outline"
                className="rounded-full px-6"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                className="rounded-full bg-[#1f5c34] px-8 text-white hover:bg-[#174128]"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Confirm Reservation"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <aside className="relative h-full w-full">
        <ResidentReservationCalendar
          selectedDate={calendarSelectedDate}
          onDateSelect={(date) => {
            form.setValue("date", date);
          }}
        />
      </aside>
    </div>
  );
};
