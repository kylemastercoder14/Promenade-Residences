"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Info, MapPin, Monitor } from "lucide-react";
import { InteractiveMap } from "@/components/interactive-map";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// Legend items reflect the status/availability used in the mapping data
const legend = [
  { label: "Available", color: "bg-[#2ea36f]" }, // e.g. For Sale / For Rent
  { label: "Reserved", color: "bg-[#f3b340]" },
  { label: "Sold / Occupied", color: "bg-[#d64545]" },
];

const LotAvailabilities = () => {
  const trpc = useTRPC();
  const isMobile = useIsMobile();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  const { data: searchResults = [], isLoading: isSearching } = useQuery(
    trpc.maps.searchPublic.queryOptions(
      { query: searchTerm ?? "" },
      {
        enabled: !!searchTerm && searchTerm.trim().length > 0,
      }
    )
  );

  const handleSearch = () => {
    const trimmed = searchInput.trim();
    setSearchTerm(trimmed.length ? trimmed : null);
  };

  return (
    <div className="min-h-screen bg-[#f6f5f2] text-[#1c2a1d]">
      <Navbar variant="community" />

      <div className="pt-36 pb-10">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-4xl bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.4em] text-[#1f5c34]">
                  Community Map
                </p>
                <h1 className="text-2xl sm:text-3xl font-serif uppercase text-[#1c2a1d]">Lot Availabilities</h1>
                <p className="text-xs sm:text-sm text-[#4f5f53]">
                  Use the search and controls to inspect available lots, reservations, and sold slots across the village.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Search lot / block / street…"
                  className="flex-1 bg-[#f4f7f0]"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
                <Button
                  className="rounded-full bg-[#1f5c34] px-6 text-white hover:bg-[#174328]"
                  type="button"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Mobile Disclaimer */}
                {isMobile && (
                  <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-4">
                    <Monitor className="size-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold text-amber-900">
                        Better Experience on Larger Screens
                      </p>
                      <p className="text-xs text-amber-800">
                        For the best experience browsing lot availabilities, we recommend using a laptop or desktop computer. The interactive map works best with a mouse and larger screen for easier navigation and lot selection.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-[#e4e7de] bg-[#f9faf7] p-4">
                  <div className="flex items-center gap-2 text-sm text-[#4f5f53]">
                    <Info className="size-4 text-[#1f5c34] shrink-0" />
                    <span className={cn(
                      "text-xs sm:text-sm"
                    )}>
                      {isMobile
                        ? "Tap on any lot to view details. Use pinch to zoom, or use the zoom controls on the map."
                        : "Click on any lot to view details. Use mouse wheel to zoom, drag to pan, or use the controls on the map."
                      }
                    </span>
                  </div>
                </div>

                {/* Search results summary */}
                {searchTerm && (
                  <div className="rounded-2xl border border-[#e4e7de] bg-white p-4 space-y-3">
                    <p className="text-sm font-semibold text-[#1c2a1d]">
                      Search results for <span className="font-mono">“{searchTerm}”</span>
                    </p>
                    {isSearching ? (
                      <p className="text-sm text-[#4f5f53]">Searching lots…</p>
                    ) : searchResults.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No lots found matching your search. Try a different block, lot, or street.
                      </p>
                    ) : (
                      <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                        {searchResults.map((lot) => (
                          <div
                            key={lot.id}
                            className="rounded-xl border border-[#e4e7de] bg-[#f9faf7] p-3 text-sm space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="size-4 text-[#1f5c34]" />
                                <p className="font-semibold text-[#1c2a1d]">
                                  Block {lot.blockNo}
                                  {lot.lotNo && `, Lot ${lot.lotNo}`}
                                </p>
                              </div>
                              <span className="text-xs rounded-full bg-[#e7f3eb] px-2 py-0.5 text-[#1f5c34] capitalize">
                                {lot.availability.toLowerCase()}
                              </span>
                            </div>
                            <p className="text-xs text-[#4f5f53]">{lot.street}</p>
                            <div className="flex flex-wrap gap-3 text-xs text-[#4f5f53]">
                              {lot.lotSize > 0 && (
                                <span>Lot size: {lot.lotSize} sqm</span>
                              )}
                              {lot.houseType && <span>Type: {lot.houseType}</span>}
                              {lot.minPrice > 0 && (
                                <span>
                                  Price: ₱{lot.minPrice.toLocaleString()}
                                  {lot.maxPrice > lot.minPrice &&
                                    `–₱${lot.maxPrice.toLocaleString()}`}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-[28px] border border-[#e4e7de] bg-linear-to-br from-white to-[#f3f5ef] p-4 shadow-inner">
                <div className="rounded-2xl border border-[#cbd2c7] bg-white/70 p-4">
                  <div
                    className={cn(
                      "w-full rounded-xl border border-[#e4e4e0] bg-[#f9faf7] relative",
                      "h-[70vh] min-h-[500px] sm:h-[600px]"
                    )}
                    style={{ overflow: "hidden" }}
                  >
                    <InteractiveMap
                      svgPath="/Promenade_Map.svg"
                      className="w-full h-full"
                      legend={legend}
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs text-[#7a867b] text-center">
                  {isMobile
                    ? "Interactive map with zoom and pan. Tap lots to view details, or use zoom controls."
                    : "Interactive map with zoom and pan functionality. Click on any lot to view details, or use the zoom controls to navigate."
                  }
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

