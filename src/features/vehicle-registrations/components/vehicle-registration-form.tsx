/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateVehicleRegistration,
  useUpdateVehicleRegistration,
} from "@/features/vehicle-registrations/hooks/use-vehicle-registrations";
import { VehicleRegistration } from "@prisma/client";
import { format } from "date-fns";
import ImageUpload from "@/components/image-upload";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

const formSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  yearOfManufacture: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  color: z.string().min(1, "Color is required"),
  plateNumber: z.string().min(1, "Plate number is required"),
  vehicleType: z.enum(["SEDAN", "SUV", "TRUCK", "MOTORCYCLE"]),
  chassisNumber: z.string().min(1, "Chassis number is required"),
  engineNumber: z.string().min(1, "Engine number is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  expiryDate: z.date(),
  relationshipToVehicle: z.enum(["OWNER", "FAMILY_MEMBER", "COMPANY_DRIVER"]),
  orAttachment: z.string().optional(),
  crAttachment: z.string().optional(),
  residentId: z.string().optional(),
});

export const VehicleRegistrationForm = ({
  initialData,
}: {
  initialData: VehicleRegistration | null;
}) => {
  const router = useRouter();
  const createVehicleRegistration = useCreateVehicleRegistration();
  const updateVehicleRegistration = useUpdateVehicleRegistration();
  const trpc = useTRPC();
  const isEditMode = !!initialData;

  // Fetch residents for dropdown
  const { data: residents } = useSuspenseQuery(
    trpc.residents.getMany.queryOptions()
  );

  const getResidentFullName = (resident: any) => {
    const parts = [
      resident.firstName,
      resident.middleName,
      resident.lastName,
      resident.suffix,
    ].filter(Boolean);
    return parts.join(" ");
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: initialData?.brand ?? "",
      model: initialData?.model ?? "",
      yearOfManufacture:
        initialData?.yearOfManufacture ?? new Date().getFullYear(),
      color: initialData?.color ?? "",
      plateNumber: initialData?.plateNumber ?? "",
      vehicleType: (initialData?.vehicleType ?? "SEDAN") as
        | "SEDAN"
        | "SUV"
        | "TRUCK"
        | "MOTORCYCLE",
      chassisNumber: initialData?.chassisNumber ?? "",
      engineNumber: initialData?.engineNumber ?? "",
      licenseNumber: initialData?.licenseNumber ?? "",
      expiryDate: initialData?.expiryDate
        ? new Date(initialData.expiryDate)
        : new Date(),
      relationshipToVehicle: (initialData?.relationshipToVehicle ?? "OWNER") as
        | "OWNER"
        | "FAMILY_MEMBER"
        | "COMPANY_DRIVER",
      orAttachment: initialData?.orAttachment ?? undefined,
      crAttachment: initialData?.crAttachment ?? undefined,
      residentId: initialData?.residentId ?? undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (isEditMode && initialData) {
        await updateVehicleRegistration.mutateAsync({
          id: initialData.id,
          ...data,
        });
      } else {
        await createVehicleRegistration.mutateAsync(data);
      }
      router.push("/admin/vehicle-registrations");
    } catch (error) {
      console.error("Error saving vehicle registration:", error);
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
          title={
            isEditMode
              ? "Edit Vehicle Registration"
              : "Create Vehicle Registration"
          }
          description={
            isEditMode
              ? "Update vehicle registration details"
              : "Register a new vehicle"
          }
        />
      </div>
      <div className="mt-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Brand <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brand" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Model <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter model" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="yearOfManufacture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Year of Manufacture{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="YYYY"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Color <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Vehicle Type <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SEDAN">Sedan</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="TRUCK">Truck</SelectItem>
                        <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Plate Number <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter plate number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      License Number <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter license number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="chassisNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Chassis Number <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter chassis number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engineNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Engine Number <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter engine number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Expiry Date <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value ? format(field.value, "yyyy-MM-dd") : ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? new Date(value) : new Date());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relationshipToVehicle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Relationship to Vehicle{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OWNER">Owner</SelectItem>
                        <SelectItem value="FAMILY_MEMBER">
                          Family Member
                        </SelectItem>
                        <SelectItem value="COMPANY_DRIVER">
                          Company Driver
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="residentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Resident/Tenant <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select resident/tenant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {residents.filter((f) => !f.isArchived).map((resident) => (
                        <SelectItem key={resident.id} value={resident.id}>
                          {getResidentFullName(resident)} ({resident.typeOfResidency === "RESIDENT" ? "Resident" : "Tenant"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Link this vehicle to a resident or tenant
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="orAttachment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      OR Attachment{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <ImageUpload
                        imageCount={1}
                        maxSize={5}
                        onImageUpload={(url) =>
                          field.onChange(typeof url === "string" ? url : url[0])
                        }
                        defaultValue={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload Official Receipt (OR) document
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="crAttachment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      CR Attachment{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <ImageUpload
                        imageCount={1}
                        maxSize={5}
                        onImageUpload={(url) =>
                          field.onChange(typeof url === "string" ? url : url[0])
                        }
                        defaultValue={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload Certificate of Registration (CR) document
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                    ? "Update Registration"
                    : "Create Registration"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
