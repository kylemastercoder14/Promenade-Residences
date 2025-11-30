"use client";

import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Info } from "lucide-react";
import { InteractiveMap } from "@/components/interactive-map";

// Legend items reflect the status/availability used in the mapping data
const legend = [
  { label: "Available", color: "bg-[#2ea36f]" }, // e.g. For Sale / For Rent
  { label: "Reserved", color: "bg-[#f3b340]" },
  { label: "Sold / Occupied", color: "bg-[#d64545]" },
];

const LotAvailabilities = () => {
  return (
    <div className="min-h-screen bg-[#f6f5f2] text-[#1c2a1d]">
      <Navbar variant="community" />

      <div className="pt-36 pb-10">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-4xl bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#1f5c34]">
                  Community Map
                </p>
                <h1 className="text-3xl font-serif uppercase text-[#1c2a1d]">Lot Availabilities</h1>
                <p className="text-sm text-[#4f5f53]">
                  Use the search and controls to inspect available lots, reservations, and sold slots across the village.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Input placeholder="Search lot / block / street…" className="flex-1 bg-[#f4f7f0]" />
                <Button className="rounded-full bg-[#1f5c34] px-6 text-white hover:bg-[#174328]">Search</Button>
              </div>

              <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-[#e4e7de] bg-[#f9faf7] p-4">
                <div className="flex items-center gap-2 text-sm text-[#4f5f53]">
                  <Info className="size-4 text-[#1f5c34]" />
                  Click on any lot to view details. Use mouse wheel to zoom, drag to pan, or use the controls on the map.
                </div>
              </div>

              <div className="rounded-[28px] border border-[#e4e7de] bg-linear-to-br from-white to-[#f3f5ef] p-4 shadow-inner">
                <div className="rounded-2xl border border-[#cbd2c7] bg-white/70 p-4">
                  <div className="h-[600px] w-full rounded-xl border border-[#e4e4e0] bg-[#f9faf7] relative" style={{ overflow: "hidden" }}>
                    <InteractiveMap
                      svgPath="/Promenade_Map.svg"
                      className="w-full h-full"
                      legend={legend}
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs text-[#7a867b] text-center">
                  Interactive map with zoom and pan functionality. Click on any lot to view details, or use the zoom controls to navigate.
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-4xl bg-white p-4 shadow-lg">
            <div className="grid h-full w-full place-items-center">
              <div className="relative h-full w-full overflow-hidden rounded-3xl border border-[#e4e7de]">
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

