"use client";

import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/components/google-logo";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import React from "react";
import Autoplay from "embla-carousel-autoplay";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSignUp } from "@/features/auth/hooks/use-sign-up";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const images = [
  "/auth-slider/1.png",
  "/auth-slider/2.jpg",
  "/auth-slider/3.jpg",
  "/auth-slider/4.jpg",
  "/auth-slider/5.jpg",
  "/auth-slider/6.jpg",
];

type SignUpFormData = {
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
  email: string;
  contactNumber: string;
  password: string;
};

const STORAGE_KEY = "signupFormData";

const initialFormData: SignUpFormData = {
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
  email: "",
  contactNumber: "",
  password: "",
};

const stepTitles = [
  "Residency Information",
  "Personal Details",
  "Address Details",
  "Account Security",
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

const requiredFieldsPerStep: Array<Array<keyof SignUpFormData>> = [
  ["residencyType", "firstName", "lastName"],
  ["sex", "dateOfBirth"],
  ["block", "lot", "street"],
  ["email", "contactNumber", "password"],
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

// Parse Google name into first, middle, and last name
const parseGoogleName = (fullName: string | null | undefined) => {
  if (!fullName) return { firstName: "", middleName: "", lastName: "" };

  const nameParts = fullName.trim().split(/\s+/);

  if (nameParts.length === 0) {
    return { firstName: "", middleName: "", lastName: "" };
  }

  if (nameParts.length === 1) {
    return { firstName: nameParts[0], middleName: "", lastName: "" };
  }

  if (nameParts.length === 2) {
    return { firstName: nameParts[0], middleName: "", lastName: nameParts[1] };
  }

  // 3 or more parts: first name, middle name(s), last name
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  const middleName = nameParts.slice(1, -1).join(" ");

  return { firstName, middleName, lastName };
};

const Page = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [formData, setFormData] =
    React.useState<SignUpFormData>(initialFormData);
  const [activeStep, setActiveStep] = React.useState(0);
  const signUpMutation = useSignUp();

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const storedFormData = localStorage.getItem(STORAGE_KEY);

    if (storedFormData) {
      try {
        const parsedData = JSON.parse(storedFormData) as SignUpFormData;
        setFormData(parsedData);
      } catch (error) {
        console.error("Failed to parse stored form data", error);
      }
    }
  }, []);

  // Populate name fields from Google session data
  React.useEffect(() => {
    const populateFromGoogle = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user?.name && (!formData.firstName || !formData.lastName)) {
          const parsedName = parseGoogleName(session.data.user.name);
          const userEmail = session.data?.user?.email || "";

          setFormData((prev) => ({
            ...prev,
            firstName: prev.firstName || parsedName.firstName,
            middleName: prev.middleName || parsedName.middleName,
            lastName: prev.lastName || parsedName.lastName,
            email: prev.email || userEmail,
          }));
        }
      } catch (error) {
        // Silently fail if session check fails
        console.error("Failed to get session:", error);
      }
    };

    populateFromGoogle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const progressValue = ((activeStep + 1) / stepTitles.length) * 100;
  const isLastStep = activeStep === stepTitles.length - 1;
  const canAdvance = requiredFieldsPerStep[activeStep].every((field) => {
    const value = formData[field];
    if (field === "contactNumber") {
      // Contact number must have at least 10 digits
      return String(value).trim().length >= 10;
    }
    return String(value).trim().length > 0;
  });

  const handleFieldChange =
    (field: keyof SignUpFormData) =>
    (value: string | React.ChangeEvent<HTMLInputElement>) => {
      const resolvedValue =
        typeof value === "string" ? value : value.target.value;

      setFormData((prev) => {
        const next = { ...prev };

        if (field === "contactNumber") {
          // Only allow numeric characters
          next[field] = resolvedValue.replace(/\D/g, "");
        } else {
          next[field] = resolvedValue;
        }

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
    if (!canAdvance || signUpMutation.isPending) return;

    try {
      await signUpMutation.mutateAsync({
        residencyType: formData.residencyType === "homeowner" ? "RESIDENT" : "TENANT",
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        suffix: undefined,
        sex: formData.sex.toUpperCase().replace("-", "_") as "MALE" | "FEMALE" | "PREFER_NOT_TO_SAY",
        dateOfBirth: formData.dateOfBirth,
        block: formData.block,
        lot: formData.lot || undefined,
        street: formData.street,
        email: formData.email,
        contactNumber: formData.contactNumber,
        password: formData.password,
      });
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error("Sign-up error:", error);
    }
  };

  const renderStepFields = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label>Type of Residency</Label>
              <RadioGroup
                value={formData.residencyType}
                onValueChange={handleFieldChange("residencyType")}
                className="grid lg:grid-cols-2 grid-cols-1 gap-3"
              >
                {residencyOptions.map((option) => {
                  const isActive = formData.residencyType === option.value;

                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                        isActive
                          ? "border-[#327248] bg-[#327248]/5 shadow-sm"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem
                        value={option.value}
                        className="mt-1"
                        aria-label={option.title}
                      />
                      <div>
                        <p className="font-semibold">{option.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
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
                  <SelectItem value="Utah Drive">Utah Drive</SelectItem>
                  <SelectItem value="San Antonio Drive">San Antonio Drive</SelectItem>
                  <SelectItem value="Beverly Hills Blvd.">Beverly Hills Blvd.</SelectItem>
                  <SelectItem value="Los Angeles Blvd.">Los Angeles Blvd.</SelectItem>
                  <SelectItem value="Dallas Drive">Dallas Drive</SelectItem>
                  <SelectItem value="Portland Drive">Portland Drive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={handleFieldChange("email")}
                placeholder="name@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label>Contact Number</Label>
              <Input
                type="tel"
                value={formData.contactNumber}
                onChange={handleFieldChange("contactNumber")}
                placeholder="639000000000"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={15}
              />
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={handleFieldChange("password")}
                placeholder="••••••••"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div className="grid h-full w-full gap-0 lg:grid-cols-2">
          {/* Form Section */}
          <div className="relative m-auto flex w-full max-w-lg flex-col items-center px-5 py-8">
            <p className="mt-4 text-xl font-semibold tracking-tight">
              Create an account
            </p>

            <Button
              variant="outline"
              className="mt-8 w-full gap-3"
              onClick={async () => {
                const { error } = await authClient.signIn.social({
                  provider: "google",
                  callbackURL: "/sign-up",
                });

                if (error) {
                  toast.error(`Error signing in with Google: ${error.message}`);
                }
              }}
            >
              <GoogleLogo />
              Continue with Google
            </Button>

            <div className="my-7 flex w-full items-center justify-center overflow-hidden">
              <Separator />
              <span className="px-2 text-sm">OR</span>
              <Separator />
            </div>

            <form
              className="flex w-full flex-col gap-6"
              onSubmit={handleSubmit}
            >
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
                  disabled={!canAdvance || signUpMutation.isPending}
                >
                  {isLastStep ? (signUpMutation.isPending ? "Creating..." : "Create account") : "Next"}
                </Button>
              </div>
            </form>

            <p className="mt-5 text-center text-sm">
              Already have an account?
              <Link
                prefetch
                href="/sign-in"
                className="ml-1 text-green-900 underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Carousel Section */}
          <div className="hidden items-center justify-center p-8 lg:flex">
            <Carousel
              plugins={[
                Autoplay({
                  delay: 2000,
                }),
              ]}
              setApi={setApi}
              className="w-full"
            >
              <CarouselContent>
                {images.map((src, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                      <Image
                        src={src}
                        alt={`Slide ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />

                      {/* Pagination Dots */}
                      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => api?.scrollTo(idx)}
                            className={`h-1 rounded-full transition-all ${
                              current === idx + 1
                                ? "w-8 bg-white"
                                : "w-8 bg-gray-500"
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Page;
