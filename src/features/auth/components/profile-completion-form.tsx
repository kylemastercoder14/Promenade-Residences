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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useCompleteProfile } from "../hooks/use-complete-profile";
import { ResidencyType, Sex } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ProfileFormData = {
  residencyType: string;
  firstName: string;
  middleName: string;
  lastName: string;
  sex: string;
  dateOfBirth: string;
  age: string;
  block: string;
  lot: string;
  street: string;
  contactNumber: string;
};

const stepTitles = [
  "Residency Information",
  "Personal Details",
  "Address Details",
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

const requiredFieldsPerStep: Array<Array<keyof ProfileFormData>> = [
  ["residencyType", "firstName", "lastName"],
  ["sex", "dateOfBirth"],
  ["block", "lot", "street"],
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

const streetOptions = [
  "Utah Drive",
  "San Antonio Drive",
  "Beverly Hills Blvd.",
  "Los Angeles Blvd.",
  "Dallas Drive",
  "Portland Drive",
];

export const ProfileCompletionForm = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<ProfileFormData>({
    residencyType: "",
    firstName: "",
    middleName: "",
    lastName: "",
    sex: "",
    dateOfBirth: "",
    age: "",
    block: "",
    lot: "",
    street: "",
    contactNumber: "",
  });

  const completeProfileMutation = useCompleteProfile();

  const progressValue = ((activeStep + 1) / stepTitles.length) * 100;
  const isLastStep = activeStep === stepTitles.length - 1;
  const canAdvance = requiredFieldsPerStep[activeStep].every(
    (field) => formData[field].trim().length > 0
  );

  const handleFieldChange =
    (field: keyof ProfileFormData) =>
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

    try {
      await completeProfileMutation.mutateAsync({
        residencyType:
          formData.residencyType === "homeowner"
            ? ResidencyType.RESIDENT
            : ResidencyType.TENANT,
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        sex: formData.sex.toUpperCase() as Sex,
        dateOfBirth: formData.dateOfBirth,
        contactNumber: formData.contactNumber,
        block: formData.block,
        lot: formData.lot || undefined,
        street: formData.street,
      });

      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete profile");
    }
  };

  const renderStepFields = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Type of Residency</Label>
              <RadioGroup
                value={formData.residencyType}
                onValueChange={handleFieldChange("residencyType")}
              >
                {residencyOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 rounded-lg border p-4"
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      <div className="font-medium">{option.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
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
              <Label>Block</Label>
              <Input
                value={formData.block}
                onChange={handleFieldChange("block")}
              />
            </div>
            <div className="grid gap-2">
              <Label>Lot</Label>
              <Input value={formData.lot} onChange={handleFieldChange("lot")} />
            </div>
            <div className="grid gap-2">
              <Label>Street</Label>
              <Select
                value={formData.street}
                onValueChange={handleFieldChange("street")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select street" />
                </SelectTrigger>
                <SelectContent>
                  {streetOptions.map((street) => (
                    <SelectItem key={street} value={street}>
                      {street}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 3:
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
          </div>
        );
      default:
        return null;
    }
  };

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
          onClick={handleNext}
          disabled={!canAdvance}
        >
          {isLastStep
            ? completeProfileMutation.isPending
              ? "Completing..."
              : "Complete Profile"
            : "Next"}
        </Button>
      </div>
    </form>
  );
};

