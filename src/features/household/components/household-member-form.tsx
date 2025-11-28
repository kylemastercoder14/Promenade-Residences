/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAddHouseholdMember, useGetMyResident } from "../hooks/use-household";
import { ResidencyType, Sex } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type HouseholdMemberFormData = {
  typeOfResidency: string;
  firstName: string;
  middleName: string;
  lastName: string;
  sex: string;
  dateOfBirth: string;
  age: string;
  contactNumber: string;
  emailAddress: string;
};

const stepTitles = [
  "Residency Information",
  "Personal Details",
  "Contact Information",
];

const residencyOptions = [
  {
    value: "homeowner",
    title: "Owner",
    description: "Primary homeowner",
  },
  {
    value: "tenant",
    title: "Tenant",
    description: "Currently leasing",
  },
];

const requiredFieldsPerStep: Array<Array<keyof HouseholdMemberFormData>> = [
  ["typeOfResidency", "firstName", "lastName"],
  ["sex", "dateOfBirth"],
  ["contactNumber"],
];

const calculateAge = (date: string) => {
  if (!date) return "";
  const today = new Date();
  const birthDate = new Date(date);

  if (Number.isNaN(birthDate.getTime())) {
    return "";
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? String(age) : "";
};

export const HouseholdMemberForm = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<HouseholdMemberFormData>({
    typeOfResidency: "homeowner", // Automatically set to owner
    firstName: "",
    middleName: "",
    lastName: "",
    sex: "",
    dateOfBirth: "",
    age: "",
    contactNumber: "",
    emailAddress: "",
  });

  const { data: myResident, isLoading: isLoadingResident } = useGetMyResident();
  const addMemberMutation = useAddHouseholdMember();

  const progressValue = ((activeStep + 1) / stepTitles.length) * 100;
  const isLastStep = activeStep === stepTitles.length - 1;
  const canAdvance = requiredFieldsPerStep[activeStep].every(
    (field) => formData[field].trim().length > 0
  );

  const handleFieldChange =
    (field: keyof HouseholdMemberFormData) =>
    (value: string | React.ChangeEvent<HTMLInputElement>) => {
      const resolvedValue =
        typeof value === "string" ? value : value.target.value;

      setFormData((prev) => {
        const next = { ...prev, [field]: resolvedValue };

        if (field === "dateOfBirth") {
          next.age = calculateAge(resolvedValue);
        }

        return next;
      });
    };

  const handleNext = () => {
    if (!isLastStep && canAdvance) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canAdvance) {
      toast.error("Please fill in all required fields for this step.");
      return;
    }

    if (!myResident) {
      toast.error("Unable to verify household head. Please try again.");
      return;
    }

    try {
      await addMemberMutation.mutateAsync({
        typeOfResidency:
          formData.typeOfResidency === "homeowner"
            ? ResidencyType.RESIDENT
            : ResidencyType.TENANT,
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        sex: formData.sex.toUpperCase() as Sex,
        dateOfBirth: formData.dateOfBirth,
        contactNumber: formData.contactNumber,
        emailAddress: formData.emailAddress || undefined,
      });

      toast.success("Household member added successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to add household member");
    }
  };

  const renderStepFields = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="grid gap-4">
            {/* Type of Residency is automatically set to "Owner" and hidden */}
            <div className="grid gap-2">
              <Label>First Name</Label>
              <Input
                value={formData.firstName}
                onChange={handleFieldChange("firstName")}
                placeholder="Juan"
              />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                Middle Name{" "}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                value={formData.middleName}
                onChange={handleFieldChange("middleName")}
                placeholder="Reyes"
              />
            </div>
            <div className="grid gap-2">
              <Label>Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={handleFieldChange("lastName")}
                placeholder="Dela Cruz"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Sex</Label>
              <Select
                value={formData.sex}
                onValueChange={handleFieldChange("sex")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="prefer-not-to-say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={handleFieldChange("dateOfBirth")}
              />
            </div>
            <div className="grid gap-2">
              <Label>Age</Label>
              <Input
                value={formData.age}
                readOnly
                placeholder="Automatically calculated"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Contact Number</Label>
              <Input
                value={formData.contactNumber}
                onChange={handleFieldChange("contactNumber")}
                placeholder="+63 912 345 6789"
              />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                Email Address{" "}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                type="email"
                value={formData.emailAddress}
                onChange={handleFieldChange("emailAddress")}
                placeholder="name@example.com"
              />
            </div>
            {myResident && (
              <div className="rounded-lg border border-dashed p-4 bg-muted/50">
                <p className="text-sm font-medium mb-1">Household Address</p>
                <p className="text-sm text-muted-foreground">
                  Block {myResident.block}, Lot {myResident.lot || "N/A"}, {myResident.street}
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoadingResident) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!myResident) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">
          Unable to verify household head
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Please complete your profile first or contact support if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Step {activeStep + 1} of {stepTitles.length}
          </span>
          <span className="font-medium text-foreground">
            {stepTitles[activeStep]}
          </span>
        </div>
        <Progress value={progressValue} />
      </div>

      {renderStepFields()}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handlePrevious}
          disabled={activeStep === 0}
        >
          Previous
        </Button>
        <Button
          type={isLastStep ? "submit" : "button"}
          className="flex-1"
          variant="primary"
          onClick={isLastStep ? undefined : handleNext}
          disabled={!canAdvance || addMemberMutation.isPending}
        >
          {isLastStep
            ? addMemberMutation.isPending
              ? "Adding..."
              : "Add Member"
            : "Next"}
        </Button>
      </div>
    </form>
  );
};

