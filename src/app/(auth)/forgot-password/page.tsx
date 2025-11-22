"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const images = [
  "/auth-slider/1.png",
  "/auth-slider/2.png",
  "/auth-slider/3.png",
];

type ForgotPasswordForm = {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
};

const initialFormState: ForgotPasswordForm = {
  email: "",
  otp: "",
  password: "",
  confirmPassword: "",
};

const stepTitles = ["Verify Email", "Enter OTP", "Reset Password"];
const stepDescriptions = [
  "We will email you a 6-digit verification code.",
  "Enter the code from your inbox to continue.",
  "Create a strong password to secure your account.",
];

const requiredFieldsPerStep: Array<Array<keyof ForgotPasswordForm>> = [
  ["email"],
  ["otp"],
  ["password", "confirmPassword"],
];

const Page = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [formData, setFormData] = React.useState<ForgotPasswordForm>(initialFormState);
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCurrentSlide(api.selectedScrollSnap() + 1);
    api.on("select", () => setCurrentSlide(api.selectedScrollSnap() + 1));
  }, [api]);

  const progressValue = ((activeStep + 1) / stepTitles.length) * 100;
  const isLastStep = activeStep === stepTitles.length - 1;
  const passwordsMatch = formData.password === formData.confirmPassword;

  const canAdvance = requiredFieldsPerStep[activeStep].every((field) => {
    if (field === "password" || field === "confirmPassword") {
      return formData[field].trim().length >= 8;
    }
    return formData[field].trim().length > 0;
  });

  const handleFieldChange =
    (field: keyof ForgotPasswordForm) =>
    (value: string | React.ChangeEvent<HTMLInputElement>) => {
      const resolvedValue = typeof value === "string" ? value : value.target.value;
      setFormData((prev) => ({ ...prev, [field]: resolvedValue }));
    };

  const handleNext = () => {
    if (!isLastStep && canAdvance && (activeStep !== 2 || passwordsMatch)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canAdvance || !passwordsMatch) return;
    // Placeholder: integrate with API or mutation when available
    console.log("Forgot password payload:", formData);
  };

  const renderStepFields = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="grid gap-3">
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleFieldChange("email")}
            />
          </div>
        );
      case 1:
        return (
          <div className="grid gap-3">
            <Label>Verification Code</Label>
            <InputOTP
              maxLength={6}
              value={formData.otp}
              onChange={handleFieldChange("otp")}
              className="w-full justify-center"
            >
              <InputOTPGroup>
                <InputOTPSlot className='size-14' index={0} />
                <InputOTPSlot className='size-14' index={1} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot className='size-14' index={2} />
                <InputOTPSlot className='size-14' index={3} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot className='size-14' index={4} />
                <InputOTPSlot className='size-14' index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive the code? Check your spam folder or request a new one.
            </p>
          </div>
        );
      case 2:
        return (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleFieldChange("password")}
              />
              <p className="text-xs text-muted-foreground">
                Use at least 8 characters with a mix of letters and numbers.
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleFieldChange("confirmPassword")}
                aria-invalid={formData.confirmPassword.length > 0 && !passwordsMatch}
              />
              {!passwordsMatch && formData.confirmPassword.length > 0 && (
                <p className="text-xs text-destructive">Passwords do not match.</p>
              )}
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
            <p className="mt-4 text-xl font-semibold tracking-tight">Forgot your password?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Follow the steps to securely reset your account access.
            </p>

            <div className="my-7 flex w-full flex-col gap-4 rounded-lg border border-dashed p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Step {activeStep + 1} of {stepTitles.length}
                  </span>
                  <span className="font-medium text-foreground">{stepTitles[activeStep]}</span>
                </div>
                <Progress value={progressValue} />
              </div>
              <p className="text-sm text-muted-foreground">{stepDescriptions[activeStep]}</p>
            </div>

            <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit}>
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
                  onClick={isLastStep ? undefined : handleNext}
                  variant="primary"
                  disabled={!canAdvance || (activeStep === 2 && !passwordsMatch)}
                >
                  {isLastStep ? "Reset password" : "Next"}
                </Button>
              </div>
            </form>

            <p className="mt-5 text-center text-sm">
              Remembered your password?
              <Link prefetch href="/sign-in" className="ml-1 text-green-900 underline">
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
                      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => api?.scrollTo(idx)}
                            className={`h-1 rounded-full transition-all ${
                              currentSlide === idx + 1 ? "w-8 bg-white" : "w-8 bg-gray-500"
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

