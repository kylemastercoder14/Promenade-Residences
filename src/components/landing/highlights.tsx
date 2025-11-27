"use client";

import { Button } from "@/components/ui/button";
import {
  BookOpenText,
  MapPin,
  Megaphone,
  Newspaper,
  Radio,
  Trees,
} from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

const whatsNewTypeConfig = {
  BLOG: {
    title: "Blog",
    description: "Community stories, updates, and homeowner spotlights.",
    icon: BookOpenText,
  },
  NEWS: {
    title: "News",
    description: "Official advisories and notices from management.",
    icon: Newspaper,
  },
  GO_TO_PLACES: {
    title: "Go to Places",
    description: "Nearby shops, parks, and establishments to explore.",
    icon: MapPin,
  },
  MEDIA_HUB: {
    title: "Media Hub",
    description: "Videos, podcasts, and multimedia recaps.",
    icon: Radio,
  },
} as const;

const amenityHighlights = [
  { title: "Multi-Purpose Hall", properties: 2, accent: "from-[#a9712b]/70 to-[#6f3d0e]/90" },
  { title: "Gazebo", properties: 1, accent: "from-[#8aa05d]/70 to-[#4d5f2f]/90" },
  { title: "Basketball Court", properties: 0, accent: "from-[#c97d37]/70 to-[#8b4618]/90" },
  { title: "Swimming Pool", properties: 3, accent: "from-[#4da7c6]/70 to-[#1b5a73]/90" },
];

export const LandingHighlights = () => {
  const trpc = useTRPC();

  // Fetch summary of published items by type
  const { data: typesSummary, isLoading } = useQuery(
    trpc.whatsNew.getTypesSummary.queryOptions()
  );

  // Generate items array from summary data
  const whatsNewItems = Object.entries(whatsNewTypeConfig).map(([type, config]) => ({
    type: type as keyof typeof whatsNewTypeConfig,
    ...config,
    count: typesSummary?.[type as keyof typeof typesSummary] || 0,
  }));

  return (
    <section id='news' className="w-full bg-white text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#327248]">
            What&apos;s New?
          </p>
          <h2 className="mt-3 text-3xl font-semibold uppercase tracking-wide text-[#1d2a1f]">
            Discover the latest happenings
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            Stay up to date with resident memos, events, guides, and curated content built
            exclusively for the Promenade community.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-2xl border border-[#e6ede7] bg-[#f9fbfa] p-5 shadow-sm"
              >
                <div className="h-12 w-12 rounded-xl bg-[#e1eee6] animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            ))
          ) : (
            whatsNewItems.map((item) => (
              <div
                key={item.type}
                className="flex flex-col gap-3 rounded-2xl border border-[#e6ede7] bg-[#f9fbfa] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e1eee6] text-[#327248]">
                  <item.icon className="size-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#21412c]">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.count} {item.count === 1 ? "item" : "items"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center">
          <Button className="gap-2 rounded-full bg-[#327248] px-6 text-white hover:bg-[#28583b]" asChild>
            <Link href="/community">
              Explore more what&apos;s new
              <Megaphone className="size-4" />
            </Link>
          </Button>
        </div>

        {/* <div className="rounded-3xl bg-gradient-to-br from-[#30583f] to-[#183222] p-8 text-white shadow-2xl">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.2fr]">
            <div className="flex flex-col gap-4 rounded-2xl bg-white/10 p-6 backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-white/80">
                <Trees className="size-4" />
                Find Properties or Reserve Amenities
              </div>
              <p className="text-2xl font-semibold leading-snug">
                Explore available lots or lock in an amenity for your next gathering.
              </p>
              <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
                <p className="text-sm uppercase tracking-wide text-white/70">122 Maple St</p>
                <p className="text-3xl font-semibold">View 2D Mapping</p>
                <p className="mt-2 text-sm text-white/80">Dues: Unpaid</p>
                <Button
                  variant="secondary"
                  className="mt-6 w-full rounded-full border border-white/40 bg-white/20 text-white hover:bg-white/40"
                >
                  View 2D mapping
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {amenityHighlights.map((amenity) => (
                <div
                  key={amenity.title}
                  className={`relative min-h-[170px] overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br ${amenity.accent} shadow-lg`}
                >
                  <div className="relative flex h-full flex-col justify-between p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                        {amenity.properties} {amenity.properties === 1 ? "Property" : "Properties"}
                      </p>
                      <p className="text-lg font-semibold text-white">{amenity.title}</p>
                    </div>
                    <Button
                      variant="secondary"
                      className="self-start rounded-full border border-white/60 bg-white/20 px-4 py-1 text-xs text-white hover:bg-white/40"
                    >
                      See more
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
};

