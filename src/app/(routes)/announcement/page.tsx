"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { cn } from "@/lib/utils";
import { AlertTriangle, Zap, Wrench, Info, Pin } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { AnnouncementCategory } from "@prisma/client";

type CategoryFilter = "All" | AnnouncementCategory;

const memoCategories: CategoryFilter[] = ["All", "IMPORTANT", "EMERGENCY", "UTILITIES", "OTHER"];

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

const Page = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const trpc = useTRPC();

  // Fetch all published announcements
  const { data: announcements = [], isLoading } = useQuery(
    trpc.announcements.getPublished.queryOptions({
      category: selectedCategory === "All" ? null : selectedCategory,
      limit: 200, // Large limit to get all announcements
    })
  );

  // Server already filters by category, so no need to filter on client side
  const displayedAnnouncements = announcements;

  // Get icon for announcement based on category
  const getAnnouncementIcon = (category: AnnouncementCategory) => {
    return categoryIcons[category] || Info;
  };

  return (
    <>
      <div className="min-h-screen bg-[#f6f5f2]">
        <Navbar />

        <main className="container mx-auto px-6 py-40">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-[#1d402a] mb-8">Announcements</h1>

            {/* Category Filter Tabs */}
            <div className="mb-8 flex flex-wrap gap-4">
              {memoCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "rounded-full border px-5 py-2 text-sm font-medium transition",
                    selectedCategory === category
                      ? "bg-[#327248] text-white border-[#327248] shadow-md"
                      : "bg-white text-[#1d402a] border-[#dfe3d9] hover:bg-[#f7faf7]"
                  )}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading announcements...
                </div>
              ) : displayedAnnouncements.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No announcements found
                </div>
              ) : (
                displayedAnnouncements.map((announcement) => {
                  const IconComponent = getAnnouncementIcon(announcement.category);
                  return (
                    <div
                      key={announcement.id}
                      className={cn(
                        "rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md",
                        announcement.isPin && "border-[#327248] border-2 bg-[#f7faf7]"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "mt-1 rounded-full p-2 shrink-0",
                          announcement.category === "IMPORTANT" && "bg-[#fef3c7] text-[#c28b1c]",
                          announcement.category === "EMERGENCY" && "bg-[#fee2e2] text-[#dc2626]",
                          announcement.category === "UTILITIES" && "bg-[#dbeafe] text-[#2563eb]",
                          announcement.category === "OTHER" && "bg-[#f3f4f6] text-[#6b7280]"
                        )}>
                          <IconComponent className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <h2 className="text-lg font-semibold text-[#1d402a]">
                                {announcement.title}
                              </h2>
                              {announcement.isPin && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#327248]/10 px-2 py-0.5 text-xs font-medium text-[#327248] shrink-0">
                                  <Pin className="size-3" />
                                  Pinned
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                              {format(new Date(announcement.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                          <p className="text-sm text-[#4a5a4f] mb-3 whitespace-pre-wrap">
                            {announcement.description}
                          </p>
                          {announcement.schedule && (
                            <div className="mt-3 pt-3 border-t border-[#dfe3d9]">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">Scheduled:</span>{" "}
                                {format(new Date(announcement.schedule), "MMMM d, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                          )}
                          {announcement.attachment && (
                            <div className="mt-3">
                              <a
                                href={announcement.attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[#327248] hover:underline inline-flex items-center gap-1"
                              >
                                View Attachment
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>

        <LandingFooter />
      </div>
    </>
  );
};

export default Page;

