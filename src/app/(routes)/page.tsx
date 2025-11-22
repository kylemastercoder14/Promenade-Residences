
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, CalendarDays, Mail } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { LandingHighlights } from "@/components/landing/highlights";
import { BillingAndDiscovery } from "@/components/landing/billing";
import { LandingFooter } from "@/components/landing/footer";

const memoCategories = ["All", "Memos", "Dues", "Amenities"];

const importantMemos = [
  {
    id: 1,
    icon: AlertTriangle,
    title: "Water Interruption Advisory - May 20 - 21",
    link: "#water-interruption",
  },
  {
    id: 2,
    icon: CalendarDays,
    title: "Gate Schedule Change - Starting May 17",
    link: "#gate-schedule",
  },
];

const reservationHighlight = {
  title: "Amenities Reservation",
  description: "Basketball Court is reserved on May 10, 2025 | 5:00 - 7:00 PM",
  cta: "Reserve Now",
};

const Page = () => {
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

          <div className="mt-12 flex w-full max-w-xl mx-auto justify-center gap-4 text-sm font-medium">
            {memoCategories.map((category) => (
              <button
                key={category}
                className={cn(
                  "rounded-full border border-white/20 px-5 py-2 text-white/80 transition",
                  category === "All" ? "bg-white/15 text-white shadow-lg" : "hover:bg-white/10",
                )}
              >
                {category}
              </button>
            ))}
          </div>

          <section className="mt-10 grid w-full max-w-3xl mx-auto gap-6">
            <div className="rounded-2xl border border-white/15 bg-white/85 p-5 text-foreground shadow-lg backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  Important Memos
                </p>
                <Button variant="ghost" size="sm" className="text-green-900">
                  View all
                </Button>
              </div>
              <div className="space-y-4">
                {importantMemos.map((memo) => (
                  <div key={memo.id} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                    <div className="mt-1 rounded-full bg-[#f8f5ef] p-2 text-[#c28b1c]">
                      <memo.icon className="size-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{memo.title}</p>
                      <Link href={memo.link} className="text-sm font-medium text-green-900 underline">
                        Read More
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/85 p-5 text-foreground shadow-lg backdrop-blur">
              <div>
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  {reservationHighlight.title}
                </p>
                <p className="mt-2 text-base font-medium">{reservationHighlight.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button className="bg-[#327248] px-6 text-white hover:bg-[#28603c]">
                  {reservationHighlight.cta}
                </Button>
                <Button variant="outline" className="gap-2">
                  <Mail className="size-4" />
                  Contact Admin
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
