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
import { AmenityReservation } from "@prisma/client";

const formSchema = z
  .object({
    userType: z.enum(["resident", "tenant", "visitor"]),
    userId: z.string().optional(),
    fullName: z.string().min(1, "Full name is required"),
    amenity: z.enum(["COURT", "GAZEBO", "PARKING_AREA"]),
    date: z.date(),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    numberOfGuests: z.number().min(1, "Number of guests is required"),
    purpose: z.string().optional(),
    paymentMethod: z.string().min(1, "Payment method is required"),
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

  // Fetch users for resident/tenant selection
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
    return amenity as "COURT" | "GAZEBO" | "PARKING_AREA";
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: initialData ? mapUserType(initialData.userType) : "visitor",
      userId: initialData?.userId || undefined,
      fullName: initialData?.fullName || "",
      amenity: initialData ? mapAmenity(initialData.amenity) : "COURT",
      date: initialData ? new Date(initialData.date) : new Date(),
      startTime: initialData?.startTime || "",
      endTime: initialData?.endTime || "",
      numberOfGuests: initialData?.numberOfGuests || 1,
      purpose: initialData?.purpose || "",
      paymentMethod: initialData?.paymentMethod || "",
      isWalkIn: false,
    },
  });

  const userType = form.watch("userType");
  const amenity = form.watch("amenity");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");
  const isWalkIn = form.watch("isWalkIn");

  // Filter users by type (resident or tenant)
  const filteredUsers = useMemo(() => {
    if (userType === "visitor") return [];
    return (
      users?.filter((user) => {
        if (userType === "resident") {
          return user.role === "USER";
        } else if (userType === "tenant") {
          return user.role === "USER";
        }
        return false;
      }) || []
    );
  }, [users, userType]);

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
    } else if (amenity === "PARKING_AREA") {
      return hours <= 15 ? 1000 : 800; // 1000 per event (15h max), 800 monthly
    }
    return 0;
  }, [amenity, startTime, endTime]);

  // Auto-fill full name when user is selected
  const handleUserChange = (userId: string) => {
    const selectedUser = filteredUsers.find((u) => u.id === userId);
    if (selectedUser) {
      form.setValue("fullName", selectedUser.name || selectedUser.email);
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
          amenity: data.amenity,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          numberOfGuests: data.numberOfGuests,
          purpose: data.purpose,
          paymentMethod: data.paymentMethod,
          amountToPay: calculatedAmount,
          amountPaid: initialData.amountPaid,
          status: initialData.status.toLowerCase() as "pending" | "approved" | "rejected" | "cancelled",
          paymentStatus: initialData.paymentStatus.toLowerCase() as "pending" | "paid" | "refunded",
          receiptUrl: initialData.receiptUrl ?? undefined,
        });
        onSuccess?.();
      } else if (isWalkIn) {
        await createWalkIn.mutateAsync({
          userType: data.userType,
          userId: data.userId,
          fullName: data.fullName,
          amenity: data.amenity,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          numberOfGuests: data.numberOfGuests,
          purpose: data.purpose,
          paymentMethod: data.paymentMethod,
          amountToPay: calculatedAmount,
          amountPaid: calculatedAmount,
          status: "approved",
          paymentStatus: "paid",
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
          amenity: data.amenity,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          numberOfGuests: data.numberOfGuests,
          purpose: data.purpose,
          paymentMethod: data.paymentMethod,
          amountToPay: calculatedAmount,
          amountPaid: 0,
          status: "pending",
          paymentStatus: "pending",
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

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
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
                          {filteredUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name || user.email} ({user.email})
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
                name="amenity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Amenity <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select amenity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="COURT">Basketball Court</SelectItem>
                        <SelectItem value="GAZEBO">Gazebo</SelectItem>
                        <SelectItem value="PARKING_AREA">
                          Parking Area
                        </SelectItem>
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

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Payment Method <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="gcash">GCash</SelectItem>
                      <SelectItem value="bank transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              {amenity === "PARKING_AREA" && (
                <p className="text-xs text-muted-foreground mt-1">
                  {calculatedAmount === 1000
                    ? "1000 pesos per event (15 hours max)"
                    : "800 pesos per month"}
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Reservation"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
