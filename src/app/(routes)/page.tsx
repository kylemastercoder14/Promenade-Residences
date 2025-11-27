"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AlertTriangle, Mail, Zap, Wrench, Info, Pin } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { LandingHighlights } from "@/components/landing/highlights";
import { BillingAndDiscovery } from "@/components/landing/billing";
import { LandingFooter } from "@/components/landing/footer";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { AnnouncementCategory } from "@prisma/client";

type CategoryFilter = "All" | AnnouncementCategory;

const memoCategories: CategoryFilter[] = [
  "All",
  "IMPORTANT",
  "EMERGENCY",
  "UTILITIES",
  "OTHER",
];

const categoryLabels: Record<CategoryFilter, string> = {
  All: "All",
  IMPORTANT: "Important",
  EMERGENCY: "Emergency",
  UTILITIES: "Utilities",
  OTHER: "Other",
};

const categoryIcons: Record<AnnouncementCategory, typeof AlertTriangle> = {
  IMPORTANT: AlertTriangle,
  EMERGENCY: Zap,
  UTILITIES: Wrench,
  OTHER: Info,
};

// Helper function to format time
const formatTime = (time: string) => {
  try {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
};

// Helper function to format amenity name
const formatAmenityName = (amenity: string) => {
  return amenity
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

const Page = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("All");
  const trpc = useTRPC();

  // Fetch published announcements
  const { data: announcements = [], isLoading } = useQuery(
    trpc.announcements.getPublished.queryOptions({
      category: selectedCategory === "All" ? null : selectedCategory,
      limit: 2,
    })
  );

  // Fetch latest amenity reservation
  const { data: latestReservation, isLoading: isLoadingReservation } = useQuery(
    trpc.amenityReservations.getLatest.queryOptions()
  );

  // Filter announcements by selected category
  const displayedAnnouncements =
    selectedCategory === "All"
      ? announcements
      : announcements.filter((ann) => ann.category === selectedCategory);

  // Get icon for announcement based on category
  const getAnnouncementIcon = (category: AnnouncementCategory) => {
    return categoryIcons[category] || Info;
  };
  return (
    <>
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero.png"
            alt="Promenade Residence"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />

          <main className="mt-20 flex flex-1 flex-col items-center px-6 py-16 text-white">
            <section className="w-full max-w-5xl mx-auto text-center">
              <h1 className="mt-2 text-4xl font-serif tracking-wider leading-tight uppercase sm:text-5xl lg:text-7xl">
                The Promenade <br /> Residence
              </h1>
            </section>

            <div className="mt-12 flex w-full max-w-xl mx-auto justify-center gap-4 text-sm font-medium flex-wrap">
              {memoCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "rounded-full border border-white/20 px-5 py-2 text-white/80 transition",
                    selectedCategory === category
                      ? "bg-white/15 text-white shadow-lg"
                      : "hover:bg-white/10"
                  )}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>

            <section className="mt-10 grid w-full max-w-3xl mx-auto gap-6">
              <div className="rounded-2xl border border-white/15 bg-white/85 p-5 text-foreground shadow-lg backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    {selectedCategory === "All"
                      ? "Announcements"
                      : `${categoryLabels[selectedCategory]} Announcements`}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-900"
                    asChild
                  >
                    <Link href="/announcement">View all</Link>
                  </Button>
                </div>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading announcements...
                    </div>
                  ) : displayedAnnouncements.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No announcements found
                    </div>
                  ) : (
                    displayedAnnouncements.map((announcement) => {
                      const IconComponent = getAnnouncementIcon(
                        announcement.category
                      );
                      return (
                        <div
                          key={announcement.id}
                          className={cn(
                            "flex items-start gap-3 rounded-lg border p-3 transition",
                            announcement.isPin
                              ? "border-[#327248] border-2 bg-[#f7faf7]"
                              : "border-border/60"
                          )}
                        >
                          <div className="mt-1 rounded-full bg-[#f8f5ef] p-2 text-[#c28b1c] shrink-0">
                            <IconComponent className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground">
                                  {announcement.title}
                                </p>
                                {announcement.isPin && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#327248]/10 px-2 py-0.5 text-xs font-medium text-[#327248] shrink-0">
                                    <Pin className="size-3" />
                                    Pinned
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {announcement.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {format(
                                  new Date(announcement.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </span>
                              {announcement.schedule && (
                                <span className="text-xs text-muted-foreground">
                                  Scheduled:{" "}
                                  {format(
                                    new Date(announcement.schedule),
                                    "MMM d, yyyy"
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/85 p-5 text-foreground shadow-lg backdrop-blur">
                <div>
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    Amenities Reservation
                  </p>
                  {isLoadingReservation ? (
                    <p className="mt-2 text-base font-medium text-muted-foreground">
                      Loading reservation...
                    </p>
                  ) : latestReservation ? (
                    <p className="mt-2 text-base font-medium">
                      {formatAmenityName(latestReservation.amenity)} is reserved
                      on{" "}
                      {format(new Date(latestReservation.date), "MMM d, yyyy")}{" "}
                      | {formatTime(latestReservation.startTime)} -{" "}
                      {formatTime(latestReservation.endTime)}
                    </p>
                  ) : (
                    <p className="mt-2 text-base font-medium">
                      No upcoming reservations scheduled
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    className="bg-[#327248] px-6 text-white hover:bg-[#28603c]"
                    asChild
                  >
                    <Link href="/amenities-reservation">Reserve Now</Link>
                  </Button>
                  <Button variant="outline" className="gap-2" asChild>
                    <Link href="/contact">
                      <Mail className="size-4" />
                      Contact Admin
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      <LandingHighlights />
      <BillingAndDiscovery />
      <LandingFooter />
    </>
  );
};

export default Page;
