"use client";

import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/components/google-logo";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import React from "react";
import Autoplay from "embla-carousel-autoplay";

const images = [
  "/auth-slider/1.png",
  "/auth-slider/2.png",
  "/auth-slider/3.png",
];

const Page = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div className="w-full h-full grid lg:grid-cols-2 gap-0">
          {/* Carousel Section */}
          <div className="hidden lg:flex items-center justify-center p-8">
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
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={src}
                        alt={`Slide ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />

                      {/* Pagination Dots */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
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

          {/* Form Section */}
          <div className="relative max-w-lg m-auto w-full flex flex-col items-center px-5 py-8">
            <p className="mt-4 text-xl font-semibold tracking-tight">
              Welcome back!
            </p>

            <Image
              src="/login.svg"
              alt="Login Illustration"
              width={150}
              height={150}
            />

            <Button variant="outline" className="mt-8 w-full gap-3">
              <GoogleLogo />
              Continue with Google
            </Button>

            <div className="my-7 w-full flex items-center justify-center overflow-hidden">
              <Separator />
              <span className="text-sm px-2">OR</span>
              <Separator />
            </div>

            <LoginForm />

            <p className="mt-5 text-sm text-center">
              Don&apos;t have an account?
              <Link
                prefetch
                href="/sign-up"
                className="ml-1 text-green-900 underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Page;
