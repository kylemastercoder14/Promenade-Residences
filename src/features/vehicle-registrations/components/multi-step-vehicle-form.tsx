/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useState } from "react";
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
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import ImageUpload from "@/components/image-upload";
import { useCreateVehicleRegistrationForResident } from "@/features/vehicle-registrations/hooks/use-vehicle-registrations";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

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
  paymentMethod: z.enum(["CASH", "GCASH", "MAYA", "OTHER_BANK"]).optional(),
  proofOfPayment: z.string().optional(),
  residentId: z.string().optional(),
}).refine((data) => {
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

const steps = ["vehicle", "driver", "summary"] as const;
type Step = (typeof steps)[number];

export const MultiStepVehicleForm = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>("vehicle");
  const createVehicleRegistration = useCreateVehicleRegistrationForResident();
  const trpc = useTRPC();

  // Fetch household members for dropdown
  const { data: householdMembers = [] } = useQuery(
    trpc.auth.getHouseholdMembers.queryOptions()
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      model: "",
      yearOfManufacture: new Date().getFullYear(),
      color: "",
      plateNumber: "",
      vehicleType: "SEDAN",
      chassisNumber: "",
      engineNumber: "",
      licenseNumber: "",
      expiryDate: new Date(),
      relationshipToVehicle: "OWNER",
      orAttachment: undefined,
      crAttachment: undefined,
      paymentMethod: undefined,
      proofOfPayment: undefined,
      residentId: undefined,
    },
  });

  const getResidentFullName = (resident: {
    firstName: string;
    middleName?: string | null;
    lastName: string;
    suffix?: string | null;
  }) => {
    const parts = [
      resident.firstName,
      resident.middleName,
      resident.lastName,
      resident.suffix,
    ].filter(Boolean);
    return parts.join(" ");
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createVehicleRegistration.mutateAsync(data);
      form.reset();
      setStep("vehicle");
      router.refresh();
      toast.success("Vehicle registration submitted successfully!");
    } catch (error) {
      console.error("Error saving vehicle registration:", error);
    }
  };

  const handleNext = () => {
    if (step === "vehicle") {
      // Validate vehicle fields
      const vehicleFields = ["brand", "model", "yearOfManufacture", "color", "plateNumber", "vehicleType", "chassisNumber", "engineNumber"] as const;
      const isValid = vehicleFields.every((field) => {
        const value = form.getValues(field);
        return value !== undefined && value !== null && value !== "";
      });
      if (isValid) {
        setStep("driver");
      } else {
        form.trigger(vehicleFields);
      }
    } else if (step === "driver") {
      // Validate driver fields
      const driverFields = ["licenseNumber", "expiryDate", "relationshipToVehicle"] as const;
      const isValid = driverFields.every((field) => {
        const value = form.getValues(field);
        return value !== undefined && value !== null && value !== "";
      });
      if (isValid) {
        setStep("summary");
      } else {
        form.trigger(driverFields);
      }
    }
  };

  const handleBack = () => {
    if (step === "driver") {
      setStep("vehicle");
    } else if (step === "summary") {
      setStep("driver");
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
          <h1 className="text-4xl font-serif uppercase text-[#111]">
            Vehicle Registration Form
          </h1>
          <p className="text-sm text-[#4b554c]">
            Provide accurate vehicle and driver information for access
            sticker processing. This form is available only to
            authenticated residents.
          </p>
        </div>

        <div className="rounded-full bg-[#dfe7dd] p-1">
          <div
            className={cn(
              "rounded-full py-1 text-center text-xs font-semibold uppercase tracking-[0.5em] text-white transition-all",
              step === "vehicle"
                ? "w-1/3 bg-[#1f5c34]"
                : step === "driver"
                ? "w-2/3 bg-[#1f5c34]"
                : "w-full bg-[#1f5c34]"
            )}
          >
            {step === "summary"
              ? "Step 3 of 3"
              : step === "driver"
              ? "Step 2 of 3"
              : "Step 1 of 3"}
          </div>
        </div>

        {step === "vehicle" && (
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Brand
                </Label>
                <Input
                  placeholder="Brand (e.g. HONDA)"
                  className="mt-1 bg-[#f6f8f5]"
                  {...form.register("brand")}
                />
                {form.formState.errors.brand && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.brand.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Model
                </Label>
                <Input
                  placeholder="Model (e.g. CIVIC)"
                  className="mt-1 bg-[#f6f8f5]"
                  {...form.register("model")}
                />
                {form.formState.errors.model && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.model.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Year of Manufacture
                </Label>
                <Input
                  type="number"
                  placeholder="Year (e.g. 2024)"
                  className="mt-1 bg-[#f6f8f5]"
                  {...form.register("yearOfManufacture", { valueAsNumber: true })}
                />
                {form.formState.errors.yearOfManufacture && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.yearOfManufacture.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Color
                </Label>
                <Input
                  placeholder="Color (e.g. Pearl White)"
                  className="mt-1 bg-[#f6f8f5]"
                  {...form.register("color")}
                />
                {form.formState.errors.color && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.color.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Plate Number
                </Label>
                <Input
                  placeholder="Plate Number (e.g. ABC 1234)"
                  className="mt-1 bg-[#f6f8f5]"
                  {...form.register("plateNumber")}
                />
                {form.formState.errors.plateNumber && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.plateNumber.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Vehicle Type
                </Label>
                <Select
                  onValueChange={(value) => form.setValue("vehicleType", value as FormData["vehicleType"])}
                  value={form.watch("vehicleType")}
                >
                  <SelectTrigger className="mt-1 w-full bg-[#f6f8f5]">
                    <SelectValue placeholder="Vehicle Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEDAN">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="TRUCK">Truck</SelectItem>
                    <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.vehicleType && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.vehicleType.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Chassis Number
                </Label>
                <Input
                  placeholder="Chassis Number"
                  className="mt-1 bg-[#f6f8f5]"
                  {...form.register("chassisNumber")}
                />
                {form.formState.errors.chassisNumber && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.chassisNumber.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Engine Number
                </Label>
                <Input
                  placeholder="Engine Number"
                  className="mt-1 bg-[#f6f8f5]"
                  {...form.register("engineNumber")}
                />
                {form.formState.errors.engineNumber && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.engineNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
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

        {step === "driver" && (
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  License Number
                </Label>
                <Input
                  placeholder="License Number"
                  className="mt-1 bg-[#f6f8f5]"
                  {...form.register("licenseNumber")}
                />
                {form.formState.errors.licenseNumber && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.licenseNumber.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Expiry Date
                </Label>
                <Input
                  type="date"
                  placeholder="Expiry Date"
                  className="mt-1 bg-[#f6f8f5]"
                  value={form.watch("expiryDate") ? format(form.watch("expiryDate"), "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    form.setValue("expiryDate", value ? new Date(value) : new Date());
                  }}
                />
                {form.formState.errors.expiryDate && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.expiryDate.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Relationship to Owner
                </Label>
                <Select
                  onValueChange={(value) => form.setValue("relationshipToVehicle", value as FormData["relationshipToVehicle"])}
                  value={form.watch("relationshipToVehicle")}
                >
                  <SelectTrigger className="mt-1 w-full bg-[#f6f8f5]">
                    <SelectValue placeholder="Relationship to Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OWNER">Owner</SelectItem>
                    <SelectItem value="FAMILY_MEMBER">Family Member</SelectItem>
                    <SelectItem value="COMPANY_DRIVER">Company Driver</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.relationshipToVehicle && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.relationshipToVehicle.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-[#1a2c1f]">
                Registered To (Optional)
              </Label>
              <Select
                onValueChange={(value) => form.setValue("residentId", value === "none" ? undefined : value)}
                value={form.watch("residentId") || "none"}
              >
                <SelectTrigger className="mt-1 w-full bg-[#f6f8f5]">
                  <SelectValue placeholder="Select household member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {householdMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {getResidentFullName(member)} {member.isHead && "(Head)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Official Receipt (OR)
                </Label>
                <div className="mt-1">
                  <ImageUpload
                    imageCount={1}
                    maxSize={5}
                    onImageUpload={(url) =>
                      form.setValue("orAttachment", typeof url === "string" ? url : url[0])
                    }
                    defaultValue={form.watch("orAttachment")}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Certificate of Registration (CR)
                </Label>
                <div className="mt-1">
                  <ImageUpload
                    imageCount={1}
                    maxSize={5}
                    onImageUpload={(url) =>
                      form.setValue("crAttachment", typeof url === "string" ? url : url[0])
                    }
                    defaultValue={form.watch("crAttachment")}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <Label className="text-sm font-semibold text-[#1a2c1f]">
                  Payment Method
                </Label>
                <Select
                  onValueChange={(value) => form.setValue("paymentMethod", value as FormData["paymentMethod"])}
                  value={form.watch("paymentMethod")}
                >
                  <SelectTrigger className="mt-1 w-full bg-[#f6f8f5]">
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
                  Proof of Payment{" "}
                  {form.watch("paymentMethod") && form.watch("paymentMethod") !== "CASH" && (
                    <span className="text-destructive">*</span>
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
              </div>
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
            <div className="rounded-[24px] border border-[#e3e9df] bg-white shadow-sm">
              <div className="flex flex-col gap-6 p-6 lg:flex-row">
                <div className="flex-1 space-y-2">
                  <p className="text-base font-semibold uppercase text-[#6b766d]">
                    Vehicle Information
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-[#6b766d]">Model / Year:</span>{" "}
                      <span className="font-semibold">
                        {form.watch("brand")} {form.watch("model")}
                      </span>{" "}
                      <span className="text-[#6b766d]">
                        {form.watch("yearOfManufacture")}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#6b766d]">Color:</span>{" "}
                      <span className="font-semibold">
                        {form.watch("color")}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#6b766d]">Plate:</span>{" "}
                      <span className="font-semibold">
                        {form.watch("plateNumber")}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#6b766d]">Type:</span>{" "}
                      <span className="font-semibold">
                        {form.watch("vehicleType")}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#6b766d]">Chassis:</span>{" "}
                      <span className="font-semibold">
                        {form.watch("chassisNumber")}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#6b766d]">Engine:</span>{" "}
                      <span className="font-semibold">
                        {form.watch("engineNumber")}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <p className="text-base font-semibold uppercase text-[#6b766d]">
                    Driver Information
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-[#6b766d]">License No.:</span>{" "}
                      <span className="font-semibold">
                        {form.watch("licenseNumber")}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#6b766d]">Expiry:</span>{" "}
                      <span className="font-semibold">
                        {form.watch("expiryDate") ? format(form.watch("expiryDate"), "MMM dd, yyyy") : "—"}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#6b766d]">Relationship:</span>{" "}
                      <span className="font-semibold">
                        {form.watch("relationshipToVehicle") === "OWNER" ? "Owner" : form.watch("relationshipToVehicle") === "FAMILY_MEMBER" ? "Family Member" : "Company Driver"}
                      </span>
                    </p>
                    {form.watch("residentId") && (() => {
                      const member = householdMembers.find(m => m.id === form.watch("residentId"));
                      return member ? (
                        <p>
                          <span className="text-[#6b766d]">Registered To:</span>{" "}
                          <span className="font-semibold">
                            {getResidentFullName(member)}
                          </span>
                        </p>
                      ) : null;
                    })()}
                    {form.watch("paymentMethod") && (
                      <p>
                        <span className="text-[#6b766d]">Payment Method:</span>{" "}
                        <span className="font-semibold">
                          {form.watch("paymentMethod") === "CASH" ? "Cash" : form.watch("paymentMethod") === "GCASH" ? "GCash" : "Bank Transfer"}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
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
                {isSubmitting ? "Submitting..." : "Confirm Registration"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <aside className="rounded-[28px] bg-[#0d0d0d] p-6 text-white">
        <div className="relative h-full w-full overflow-hidden rounded-[24px]">
          <Image
            src="/faq-vehicle.png"
            alt="Vehicle Registration FAQ"
            fill
            className="object-cover"
          />
        </div>
      </aside>
    </div>
  );
};

