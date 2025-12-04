/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Heading from "@/components/heading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCreateAmenityReservation,
  useCreateWalkIn,
  useUpdateAmenityReservation,
} from "@/features/amenity-reservations/hooks/use-amenity-reservations";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AmenityReservation, PaymentMethod } from "@prisma/client";
import ImageUpload from "@/components/image-upload";
import { FormDescription } from "@/components/ui/form";

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
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    proofOfPayment: z.string().optional(),
    isWalkIn: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.userType !== "visitor" && !data.userId) {
        return false;
      }
      return true;
    },
    {
      message: "User selection is required for residents and tenants",
      path: ["userId"],
    }
  )
  .refine(
    (data) => {
      // If payment method is not CASH, proof of payment is required
      if (data.paymentMethod && data.paymentMethod !== PaymentMethod.CASH && !data.proofOfPayment) {
        return false;
      }
      return true;
    },
    {
      message: "Proof of payment is required for non-cash payment methods",
      path: ["proofOfPayment"],
    }
  )
  .refine(
    (data) => {
      // Email is required for visitors
      if (data.userType === "visitor" && !data.email) {
        return false;
      }
      return true;
    },
    {
      message: "Email is required for visitors",
      path: ["email"],
    }
  );

export const ReservationForm = ({
  initialData,
  onSuccess,
}: {
  initialData: AmenityReservation | null;
  onSuccess?: () => void;
}) => {
  const router = useRouter();
  const createReservation = useCreateAmenityReservation();
  const createWalkIn = useCreateWalkIn();
  const updateReservation = useUpdateAmenityReservation();
  const trpc = useTRPC();
  const isEditMode = !!initialData;

  // Fetch residents and users for resident/tenant selection
  const { data: residents } = useSuspenseQuery(
    trpc.residents.getMany.queryOptions()
  );
  const { data: users } = useSuspenseQuery(
    trpc.accounts.getMany.queryOptions()
  );

  // Map Prisma enum values to form values
  const mapUserType = (type: string) => {
    if (type === "RESIDENT") return "resident";
    if (type === "TENANT") return "tenant";
    return "visitor";
  };

  const mapAmenity = (amenity: string) => {
    return amenity as "COURT" | "GAZEBO";
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: initialData ? mapUserType(initialData.userType) : "visitor",
      userId: initialData?.userId || undefined,
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      amenity: initialData ? mapAmenity(initialData.amenity) : "COURT",
      date: initialData ? new Date(initialData.date) : new Date(),
      startTime: initialData?.startTime || "",
      endTime: initialData?.endTime || "",
      numberOfGuests: initialData?.numberOfGuests || 1,
      purpose: initialData?.purpose || "",
      paymentMethod: initialData?.paymentMethod || undefined,
      proofOfPayment: initialData?.proofOfPayment || "",
      isWalkIn: false,
    },
  });

  const userType = form.watch("userType");
  const amenity = form.watch("amenity");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");
  const isWalkIn = form.watch("isWalkIn");

  // Filter residents by typeOfResidency and match with users
  const filteredResidentsWithUsers = useMemo(() => {
    if (userType === "visitor") return [];

    // Map userType to ResidencyType
    const residencyType = userType === "resident" ? "RESIDENT" : "TENANT";

    // Filter residents by typeOfResidency and active status
    const filteredResidents =
      residents?.filter((resident) => {
        if (resident.typeOfResidency !== residencyType) return false;
        if (resident.isArchived) return false;
        // Only include residents that have an email (needed to match with user)
        if (!resident.emailAddress) return false;
        return true;
      }) || [];

    // Match residents with users by email
    const residentsWithUsers = filteredResidents
      .map((resident) => {
        const user = users?.find(
          (u) =>
            u.email.toLowerCase() === resident.emailAddress?.toLowerCase() &&
            u.role === "USER" &&
            !u.isArchived
        );
        if (!user) return null;

        return {
          resident,
          user,
          fullName: `${resident.firstName} ${resident.middleName || ""} ${resident.lastName}${resident.suffix ? ` ${resident.suffix}` : ""}`.trim(),
          email: resident.emailAddress,
          userId: user.id,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Sort by full name for a nicer dropdown
    return [...residentsWithUsers].sort((a, b) => {
      const nameA = a.fullName.toLowerCase();
      const nameB = b.fullName.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [residents, users, userType]);

  // Calculate amount based on amenity and duration
  const calculatedAmount = useMemo(() => {
    if (!startTime || !endTime) return 0;

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // Guard against invalid ranges (end before start)
    if (!Number.isFinite(hours) || hours <= 0) {
      return 0;
    }

    if (amenity === "GAZEBO") {
      // 60 pesos per 3-hour block (ceil to next block)
      const blocks = Math.ceil(hours / 3);
      return blocks * 60;
    } else if (amenity === "COURT") {
      // 100 pesos per hour
      return hours * 100;
    }
    return 0;
  }, [amenity, startTime, endTime]);

  // Auto-fill full name and email when user is selected
  const handleUserChange = (userId: string) => {
    const selected = filteredResidentsWithUsers.find((item) => item.userId === userId);
    if (selected) {
      form.setValue("fullName", selected.fullName);
      form.setValue("email", selected.email || "");
      form.setValue("userId", userId);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (isEditMode && initialData) {
        // Update existing reservation
        await updateReservation.mutateAsync({
          id: initialData.id,
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
          amountPaid: initialData.amountPaid,
          status: initialData.status.toLowerCase() as "pending" | "approved" | "rejected" | "cancelled",
          receiptUrl: initialData.receiptUrl ?? undefined,
        });
        onSuccess?.();
      } else if (isWalkIn) {
        await createWalkIn.mutateAsync({
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
          amountPaid: calculatedAmount,
          status: "approved",
        });
        if (!isEditMode) {
          router.push("/admin/transactions/amenity-reservation");
        } else {
          onSuccess?.();
        }
      } else {
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
        });
        if (!isEditMode) {
          router.push("/admin/transactions/amenity-reservation");
        } else {
          onSuccess?.();
        }
      }
    } catch (error) {
      console.error("Error saving reservation:", error);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div>
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} variant="outline" size="icon">
          <ArrowLeft className="size-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <Heading
          title={isEditMode ? "Edit Amenity Reservation" : "Create Amenity Reservation"}
          description={isEditMode ? "Update reservation details" : "Create a new amenity reservation"}
        />
      </div>
      <div className="mt-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Walk-in Checkbox */}
            <FormField
              control={form.control}
              name="isWalkIn"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Walk-in Reservation
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Check this for walk-in reservations. Status will be
                      auto-approved and payment will be marked as paid.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="grid lg:grid-cols-2 grid-cols-1 items-start gap-6">
              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      User Type <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("userId", undefined);
                        form.setValue("fullName", "");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="resident">Resident</SelectItem>
                        <SelectItem value="tenant">Tenant</SelectItem>
                        <SelectItem value="visitor">Visitor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {userType !== "visitor" && (
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Select User <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={handleUserChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredResidentsWithUsers.map((item) => (
                            <SelectItem key={item.userId} value={item.userId}>
                              {item.fullName} ({item.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Full Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={
                          isSubmitting ||
                          Boolean(userType !== "visitor" && form.watch("userId"))
                        }
                        placeholder="Enter full name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email Address{" "}
                      {userType === "visitor" && (
                        <span className="text-destructive">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        disabled={
                          isSubmitting ||
                          Boolean(userType !== "visitor" && form.watch("userId"))
                        }
                        placeholder="name@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amenity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Amenity <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select amenity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="COURT">Basketball Court</SelectItem>
                        <SelectItem value="GAZEBO">Gazebo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Date <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        disabled={isSubmitting}
                        {...field}
                        min={new Date().toISOString().split("T")[0]}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Start Time <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="time" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      End Time <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="time" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Number of Guests{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        disabled={isSubmitting}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Payment Method{" "}
                      {form.watch("paymentMethod") !== PaymentMethod.CASH && (
                        <span className="text-destructive">*</span>
                      )}
                    </FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value as PaymentMethod)
                      }
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                        <SelectItem value={PaymentMethod.GCASH}>GCash</SelectItem>
                        <SelectItem value={PaymentMethod.MAYA}>Maya</SelectItem>
                        <SelectItem value={PaymentMethod.OTHER_BANK}>
                          Bank Transfer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("paymentMethod") &&
                form.watch("paymentMethod") !== PaymentMethod.CASH && (
                  <FormField
                    control={form.control}
                    name="proofOfPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Proof of Payment{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <ImageUpload
                            imageCount={1}
                            maxSize={5}
                            onImageUpload={(url) =>
                              field.onChange(
                                typeof url === "string" ? url : url[0]
                              )
                            }
                            defaultValue={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload proof of payment (e.g., screenshot, deposit
                          slip)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
            </div>

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Purpose{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="Enter purpose of reservation"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount Display */}
            <div className="p-4 border rounded-lg bg-muted">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Amount to Pay:</span>
                <span className="text-lg font-bold">
                  ₱{calculatedAmount.toLocaleString()}
                </span>
              </div>
              {amenity === "GAZEBO" && (
                <p className="text-xs text-muted-foreground mt-1">
                  60 pesos for 3 hours
                </p>
              )}
              {amenity === "COURT" && (
                <p className="text-xs text-muted-foreground mt-1">
                  100 pesos per hour
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
