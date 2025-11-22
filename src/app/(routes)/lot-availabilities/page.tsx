"use client";

import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Plus, Minus, RefreshCcw, Info } from "lucide-react";

const legend = [
  { label: "Available", color: "bg-[#2ea36f]" },
  { label: "Reserved", color: "bg-[#f3b340]" },
  { label: "Sold", color: "bg-[#d64545]" },
];

const LotAvailabilities = () => {
  return (
    <div className="min-h-screen bg-[#f6f5f2] text-[#1c2a1d]">
      <Navbar variant="community" />

      <div className="pt-36 pb-10">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[32px] bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#1f5c34]">
                  Community Map
                </p>
                <h1 className="text-3xl font-serif uppercase text-[#1c2a1d]">Lot Availabilities</h1>
                <p className="text-sm text-[#4f5f53]">
                  Use the search and controls to inspect open lots, reservations, and sold slots across the village.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Input placeholder="Search lot / block / street…" className="flex-1 bg-[#f4f7f0]" />
                <Button className="rounded-full bg-[#1f5c34] px-6 text-white hover:bg-[#174328]">Search</Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#e4e7de] bg-[#f9faf7] p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Plus className="size-4 text-[#1f5c34]" />
                  Zoom In
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Minus className="size-4 text-[#1f5c34]" />
                  Zoom Out
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCcw className="size-4 text-[#1f5c34]" />
                  Reset View
                </div>
                <div className="flex items-center gap-2 text-sm text-[#4f5f53]">
                  <Info className="size-4 text-[#1f5c34]" />
                  Hover lots to preview status
                </div>
              </div>

              <div className="rounded-[28px] border border-[#e4e7de] bg-gradient-to-br from-white to-[#f3f5ef] p-4 shadow-inner">
                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="flex-1 space-y-3">
                    <div className="grid gap-2 text-sm text-[#4c594e]">
                      {legend.map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full ${item.color}`} />
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[#7a867b]">
                      This is a static preview. Zoom and pan interactions will be activated once the full SVG map is
                      available.
                    </p>
                  </div>

                  <div className="flex-1 rounded-2xl border border-dashed border-[#cbd2c7] bg-white/70 p-4">
                    <div className="h-64 rounded-xl border border-[#e4e4e0] bg-[repeating-linear-gradient(90deg,#f9f9f7,#f9f9f7_18px,#ededeb_19px),repeating-linear-gradient(#f9f9f7,#f9f9f7_18px,#ededeb_19px)] relative overflow-hidden">
                      <div className="absolute inset-8 border-2 border-[#c4cec0] rounded-xl" />
                      <div className="absolute inset-16 grid grid-cols-8 gap-2">
                        {Array.from({ length: 48 }).map((_, idx) => (
                          <div key={idx} className="rounded-md border border-[#d9ded4] bg-white hover:bg-[#e9f4ed]" />
                        ))}
                      </div>
                      <div className="absolute top-3 right-3 flex flex-col gap-2 text-xs">
                        <Button size="icon" className="h-8 w-8 rounded-full bg-white text-[#1f5c34]" variant="outline">
                          <Plus className="size-4" />
                        </Button>
                        <Button size="icon" className="h-8 w-8 rounded-full bg-white text-[#1f5c34]" variant="outline">
                          <Minus className="size-4" />
                        </Button>
                        <Button size="icon" className="h-8 w-8 rounded-full bg-white text-[#1f5c34]" variant="outline">
                          <RefreshCcw className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[32px] bg-white p-4 shadow-lg">
            <div className="grid h-full w-full place-items-center">
              <div className="relative h-full w-full overflow-hidden rounded-[24px] border border-[#e4e7de]">
                <Image
                  src="/lot-available.png"
                  alt="Lot availability poster"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 360px"
                  priority
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default LotAvailabilities;

