"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!api) return;
    setCurrentSlide(api.selectedScrollSnap() + 1);
    api.on("select", () => setCurrentSlide(api.selectedScrollSnap() + 1));
  }, [api]);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!token) {
      toast.error("Invalid reset token. Please request a new password reset.");
      router.push("/forgot-password");
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } else {
      toast.success(
        "Your password has been reset successfully. You can now log in with your new password."
      );
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    }
  };

  const isPending = form.formState.isSubmitting;

  if (!token) {
    return (
      <Card className="w-full">
        <CardContent className="px-5 py-10 text-center">
          <Image
            src="/warning.svg"
            alt="Error Illustration"
            width={150}
            height={150}
            className="mx-auto"
          />
          <p className="text-lg mt-5 font-semibold">Invalid or missing token.</p>
          <p className="mt-2 mb-5 text-sm text-muted-foreground">
            Please check the link you used or request a new password reset.
          </p>
          <Link
            href="/forgot-password"
            className="text-primary text-sm hover:underline font-medium"
          >
            Request a new password reset &rarr;
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div className="grid h-full w-full gap-0 lg:grid-cols-2">
          {/* Form Section */}
          <div className="relative m-auto flex w-full max-w-lg flex-col items-center px-5 py-8">
            <p className="mt-4 text-xl font-semibold tracking-tight">
              Reset your password
            </p>
            <p className="mt-1 mb-5 text-sm text-muted-foreground">
              Enter your new password below to regain access to your account.
            </p>

            <Image
              src="/reset.svg"
              alt="Reset Password Illustration"
              className="mb-4"
              width={200}
              height={200}
            />

            <Form {...form}>
              <form
                className="w-full space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="">
                        New Password <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="New Password"
                          className="w-full"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="">
                        Confirm Password{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm Password"
                          className="w-full"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={isPending}
                  variant="primary"
                  type="submit"
                  className="mt-2 w-full"
                >
                  {isPending ? "Resetting..." : "Reset Password"}
                </Button>

                <p className="text-sm text-center mt-2">
                  Remember your password?{" "}
                  <Link
                    href="/sign-in"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign In
                  </Link>
                </p>
              </form>
            </Form>
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
                              currentSlide === idx + 1
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

