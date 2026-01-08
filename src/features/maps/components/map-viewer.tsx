
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Pencil } from "lucide-react";
import Link from "next/link";
import { Maps } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MapViewerProps = {
  maps: Maps[];
};

const LEGEND_ITEMS = [
  { label: "For Rent", color: "bg-blue-500", availability: "For rent" },
  { label: "Occupied", color: "bg-red-500", availability: "Occupied" },
  { label: "For Sale", color: "bg-green-500", availability: "For sale" },
  { label: "Amenity", color: "bg-purple-500", availability: "Amenity" },
] as const;

export const MapViewer = ({ maps }: MapViewerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [svgError, setSvgError] = useState<string | null>(null);
  const [loadedSvgs, setLoadedSvgs] = useState<Map<string, string>>(new Map());
  const [selectedMap, setSelectedMap] = useState<Maps | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Sort maps: separate amenities from regular lots, then sort by blockNo and lotNo
  const sortedMaps = useMemo(() => {
    const regularLots = maps.filter((map) =>
      map.availability.toLowerCase() !== "amenity" && map.lotNo
    );
    const amenities = maps.filter((map) =>
      map.availability.toLowerCase() === "amenity" || !map.lotNo
    );

    // Sort regular lots by blockNo and lotNo
    const sortedRegularLots = regularLots.sort((a, b) => {
      const blockCompare = a.blockNo.localeCompare(b.blockNo, undefined, { numeric: true });
      if (blockCompare !== 0) return blockCompare;
      const lotA = a.lotNo || "";
      const lotB = b.lotNo || "";
      return lotA.localeCompare(lotB, undefined, { numeric: true });
    });

    // Sort amenities by blockNo and street (or name if available)
    const sortedAmenities = amenities.sort((a, b) => {
      const blockCompare = a.blockNo.localeCompare(b.blockNo, undefined, { numeric: true });
      if (blockCompare !== 0) return blockCompare;
      return (a.street || "").localeCompare(b.street || "", undefined, { numeric: true });
    });

    // Combine: regular lots first, then amenities
    return [...sortedRegularLots, ...sortedAmenities];
  }, [maps]);


  // Fetch and load all SVG contents
  useEffect(() => {
    if (sortedMaps.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSvgError(null);
    const newLoadedSvgs = new Map<string, string>();
    let completed = 0;
    let hasError = false;

    sortedMaps.forEach((map) => {
      if (!map.attachmentUrl) {
        completed++;
        if (completed === sortedMaps.length) {
          setIsLoading(false);
          setLoadedSvgs(newLoadedSvgs);
        }
        return;
      }

      fetch(map.attachmentUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to load SVG: ${res.status} ${res.statusText}`);
          }
          return res.text();
        })
        .then((text) => {
          if (text && text.includes('<svg')) {
            newLoadedSvgs.set(map.id, text);
          } else {
            console.error('Invalid SVG content for map:', map.id);
          }
        })
        .catch((err) => {
          console.error("Error loading SVG:", err);
          console.error("SVG URL:", map.attachmentUrl);
          if (!hasError) {
            setSvgError(err.message);
            hasError = true;
          }
        })
        .finally(() => {
          completed++;
          if (completed === sortedMaps.length) {
            setIsLoading(false);
            setLoadedSvgs(new Map(newLoadedSvgs));
          }
        });
    });
  }, [sortedMaps]);

  // Combine all SVGs into a single SVG with structured layout
  const combinedSvg = useMemo(() => {
    // Get availability color hex function
    const getAvailabilityColorHex = (availability: string) => {
      const colorMap: Record<string, string> = {
        "bg-blue-500": "#3b82f6",
        "bg-red-500": "#ef4444",
        "bg-green-500": "#22c55e",
        "bg-purple-500": "#a855f7",
        "bg-gray-400": "#9ca3af",
      };
      const item = LEGEND_ITEMS.find(
        (item) => item.availability.toLowerCase() === availability.toLowerCase()
      );
      const colorClass = item?.color || "bg-gray-400";
      return colorMap[colorClass] || "#9ca3af";
    };
    if (loadedSvgs.size === 0) return "";

    const parser = new DOMParser();

    // Separate items by type
    const roadLines: Array<{ content: string; street: string; id: string }> = [];
    const amenities: Array<{ content: string; blockNo: string; street: string; id: string; availability: string }> = [];
    const lots: Array<{ content: string; blockNo: string; lotNo: string; id: string; availability: string }> = [];

    sortedMaps.forEach((map) => {
      const svgContent = loadedSvgs.get(map.id);
      if (!svgContent) return;

      const street = (map.street || "").toUpperCase();
      const isRoadLine = street.includes("ROADLINE") || street.includes("LINE");
      const isAmenity = map.availability.toLowerCase() === "amenity" || !map.lotNo;

      if (isRoadLine) {
        roadLines.push({
          content: svgContent,
          street: map.street || "",
          id: map.id,
        });
      } else if (isAmenity) {
        amenities.push({
          content: svgContent,
          blockNo: map.blockNo,
          street: map.street || "",
          id: map.id,
          availability: map.availability,
        });
      } else {
        lots.push({
          content: svgContent,
          blockNo: map.blockNo,
          lotNo: map.lotNo || "",
          id: map.id,
          availability: map.availability,
        });
      }
    });

    // Group lots by block number
    const lotsByBlock = new Map<string, typeof lots>();
    lots.forEach((lot) => {
      if (!lotsByBlock.has(lot.blockNo)) {
        lotsByBlock.set(lot.blockNo, []);
      }
      lotsByBlock.get(lot.blockNo)!.push(lot);
    });

    // Sort lots within each block by lot number
    lotsByBlock.forEach((blockLots) => {
      blockLots.sort((a, b) => {
        const lotA = a.lotNo || "";
        const lotB = b.lotNo || "";
        return lotA.localeCompare(lotB, undefined, { numeric: true });
      });
    });

    // Get sorted block numbers
    const sortedBlocks = Array.from(lotsByBlock.keys()).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

    // Layout configuration
    const LOT_SPACING = 0; // No spacing between lots
    const ROW_SPACING = 20; // Spacing between rows

    // Create background group for road lines
    const backgroundGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    backgroundGroup.setAttribute("id", "background-lines");
    backgroundGroup.setAttribute("style", "opacity: 0.3;");

    // Add road lines first (as background)
    roadLines.forEach((roadLine) => {
      const svgDoc = parser.parseFromString(roadLine.content, "image/svg+xml");
      const svgElement = svgDoc.documentElement;
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

      // Clone all children from the SVG
      Array.from(svgElement.children).forEach((child) => {
        g.appendChild(child.cloneNode(true));
      });

      backgroundGroup.appendChild(g);
    });

    // Create main content group
    const combinedGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    combinedGroup.setAttribute("id", "combined-map");

    let maxWidth = 0;
    let maxHeight = 0;

    // Helper function to get SVG dimensions
    const getSvgDimensions = (svgContent: string) => {
      const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgElement = svgDoc.documentElement;
      const viewBox = svgElement.getAttribute("viewBox");
      if (viewBox) {
        const [, , w, h] = viewBox.split(" ").map(Number);
        return { width: w, height: h };
      }
      return {
        width: Number(svgElement.getAttribute("width")) || 100,
        height: Number(svgElement.getAttribute("height")) || 100,
      };
    };

    // Layout lots in rows by block
    let rowStartY = 0;
    sortedBlocks.forEach((blockNo) => {
      const blockLots = lotsByBlock.get(blockNo)!;
      let currentX = 0;
      let rowHeight = 0;

      blockLots.forEach((lotData) => {
        const { width, height } = getSvgDimensions(lotData.content);
        rowHeight = Math.max(rowHeight, height);

        const svgDoc = parser.parseFromString(lotData.content, "image/svg+xml");
        const svgElement = svgDoc.documentElement;

        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("transform", `translate(${currentX}, ${rowStartY})`);
        g.setAttribute("data-block", lotData.blockNo);
        g.setAttribute("data-lot", lotData.lotNo);
        g.setAttribute("data-map-id", lotData.id);
        g.setAttribute("class", "map-lot-group");
        g.setAttribute("style", "cursor: pointer; opacity: 1; transition: opacity 0.2s;");

        // Clone all children from the SVG
        Array.from(svgElement.children).forEach((child) => {
          g.appendChild(child.cloneNode(true));
        });

        // Add availability indicator
        const indicator = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        indicator.setAttribute("cx", String(width / 2));
        indicator.setAttribute("cy", String(height / 2));
        indicator.setAttribute("r", String(Math.min(width, height) * 0.15));
        indicator.setAttribute("fill", getAvailabilityColorHex(lotData.availability));
        indicator.setAttribute("opacity", "0.8");
        indicator.setAttribute("stroke", "#ffffff");
        indicator.setAttribute("stroke-width", "2");
        indicator.setAttribute("class", "availability-indicator");
        indicator.setAttribute("pointer-events", "none");
        g.appendChild(indicator);

        combinedGroup.appendChild(g);

        currentX += width + LOT_SPACING;
        maxWidth = Math.max(maxWidth, currentX);
      });

      rowStartY += rowHeight + ROW_SPACING;
      maxHeight = Math.max(maxHeight, rowStartY);
    });

    // Add amenities at specific positions (you can customize these positions)
    const amenityX = maxWidth + 50; // Position amenities to the right
    let amenityY = 0;

    amenities.forEach((amenityData) => {
      const { width, height } = getSvgDimensions(amenityData.content);
      const svgDoc = parser.parseFromString(amenityData.content, "image/svg+xml");
      const svgElement = svgDoc.documentElement;

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", `translate(${amenityX}, ${amenityY})`);
      g.setAttribute("data-block", amenityData.blockNo);
      g.setAttribute("data-lot", "");
      g.setAttribute("data-map-id", amenityData.id);
      g.setAttribute("class", "map-lot-group");
      g.setAttribute("style", "cursor: pointer; opacity: 1; transition: opacity 0.2s;");

      // Clone all children from the SVG
      Array.from(svgElement.children).forEach((child) => {
        g.appendChild(child.cloneNode(true));
      });

      // Add availability indicator
      const indicator = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      indicator.setAttribute("cx", String(width / 2));
      indicator.setAttribute("cy", String(height / 2));
      indicator.setAttribute("r", String(Math.min(width, height) * 0.15));
      indicator.setAttribute("fill", getAvailabilityColorHex(amenityData.availability));
      indicator.setAttribute("opacity", "0.8");
      indicator.setAttribute("stroke", "#ffffff");
      indicator.setAttribute("stroke-width", "2");
      indicator.setAttribute("class", "availability-indicator");
      indicator.setAttribute("pointer-events", "none");
      g.appendChild(indicator);

      combinedGroup.appendChild(g);

      amenityY += height + 20;
      maxWidth = Math.max(maxWidth, amenityX + width);
      maxHeight = Math.max(maxHeight, amenityY);
    });

    // Create the combined SVG
    const combinedSvgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    combinedSvgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    combinedSvgElement.setAttribute("viewBox", `0 0 ${maxWidth} ${maxHeight}`);
    combinedSvgElement.setAttribute("width", String(maxWidth));
    combinedSvgElement.setAttribute("height", String(maxHeight));
    combinedSvgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // Add style element for hover effects
    const styleElement = document.createElementNS("http://www.w3.org/2000/svg", "style");
    styleElement.textContent = `
      .map-lot-group {
        cursor: pointer;
        opacity: 1;
        transition: opacity 0.2s;
        pointer-events: all;
      }
      .map-lot-group:hover {
        opacity: 0.7;
      }
      .map-lot-group * {
        pointer-events: all;
      }
    `;
    combinedSvgElement.appendChild(styleElement);

    // Add background group (road lines) first, then main content
    if (backgroundGroup.children.length > 0) {
      combinedSvgElement.appendChild(backgroundGroup);
    }
    combinedSvgElement.appendChild(combinedGroup);

    console.log('Combined SVG dimensions:', maxWidth, maxHeight);
    console.log('Combined SVG element:', combinedSvgElement);

    const serializer = new XMLSerializer();
    return serializer.serializeToString(combinedSvgElement);
  }, [loadedSvgs, sortedMaps]);

  // Add click handlers using mousedown/mouseup to detect clicks vs drags
  useEffect(() => {
    if (!svgContainerRef.current || !combinedSvg) return;

    let mouseDownTime = 0;
    let mouseDownX = 0;
    let mouseDownY = 0;
    let isDragging = false;

    const handleMouseDown = (e: MouseEvent) => {
      mouseDownTime = Date.now();
      mouseDownX = e.clientX;
      mouseDownY = e.clientY;
      isDragging = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = Math.abs(e.clientX - mouseDownX);
      const deltaY = Math.abs(e.clientY - mouseDownY);
      if (deltaX > 5 || deltaY > 5) {
        isDragging = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const clickDuration = Date.now() - mouseDownTime;
      const deltaX = Math.abs(e.clientX - mouseDownX);
      const deltaY = Math.abs(e.clientY - mouseDownY);

      // Only treat as click if it was quick and didn't move much
      if (clickDuration < 300 && deltaX < 5 && deltaY < 5 && !isDragging) {
        const svgElement = svgContainerRef.current?.querySelector('svg');
        if (!svgElement) return;

        // Use elementFromPoint to find what was clicked
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (!element) return;

        // Find the closest group with data-map-id
        let current: Element | null = element;
        while (current && current !== svgElement) {
          if (current.getAttribute && current.getAttribute('data-map-id')) {
            const mapId = current.getAttribute('data-map-id');
            if (mapId) {
              const map = sortedMaps.find((m) => m.id === mapId);
              if (map) {
                console.log('Map clicked:', mapId, map);
                setSelectedMap(map);
                setIsDialogOpen(true);
                return;
              }
            }
          }
          current = current.parentElement;
        }
      }
    };

    const container = svgContainerRef.current;
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
    };
  }, [combinedSvg, sortedMaps]);


  if (sortedMaps.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh] bg-muted rounded-xl">
        <p className="text-muted-foreground">No maps available</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Map Viewer */}
      <div className="relative w-full h-[60vh] cursor-grabbing bg-muted rounded-xl overflow-hidden border">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading maps...</p>
          </div>
        ) : svgError ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <p className="text-destructive">Error loading maps</p>
            <p className="text-sm text-muted-foreground">{svgError}</p>
          </div>
        ) : combinedSvg ? (
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={2}
            centerOnInit
            limitToBounds={false}
            doubleClick={{ disabled: true }}
          >
            {({ zoomIn, zoomOut, resetTransform, centerView }) => (
              <>
                {/* Controls */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => zoomIn()}
                    className="bg-white/90 hover:bg-white"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => zoomOut()}
                    className="bg-white/90 hover:bg-white"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => resetTransform()}
                    className="bg-white/90 hover:bg-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => centerView()}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* SVG Content */}
                <TransformComponent
                  wrapperClass="w-full h-full"
                  contentClass="w-full h-full"
                  wrapperStyle={{
                    width: '100%',
                    height: '100%',
                    position: 'relative'
                  }}
                >
                  <div
                    ref={svgContainerRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      padding: '0',
                      margin: '0',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: combinedSvg.replace(
                          /<svg([^>]*)>/,
                          '<svg$1 preserveAspectRatio="xMidYMid meet" style="display: block; width: 100%; height: 100%;">'
                        )
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No maps available</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 flex-wrap">
        <p className="text-sm font-semibold text-muted-foreground">Legend:</p>
        {LEGEND_ITEMS.map((item) => {
          const count = sortedMaps.filter(
            (map) => map.availability.toLowerCase() === item.availability.toLowerCase()
          ).length;
          return (
            <div key={item.label} className="flex items-center gap-2">
              <div className={cn("w-4 h-4 rounded", item.color)} />
              <span className="text-sm text-muted-foreground">
                {item.label} ({count})
              </span>
            </div>
          );
        })}
      </div>

      {/* Map Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMap?.availability.toLowerCase() === "amenity" ? (
                <>Amenity Details - {selectedMap.street}</>
              ) : (
                <>Lot Details - Block {selectedMap?.blockNo} {selectedMap?.lotNo && `Lot ${selectedMap.lotNo}`}</>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedMap?.availability.toLowerCase() === "amenity"
                ? "View detailed information about this amenity"
                : "View detailed information about this lot"}
            </DialogDescription>
          </DialogHeader>
          {selectedMap && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedMap.availability.toLowerCase() !== "amenity" && (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Block Number</p>
                      <p className="text-base">{selectedMap.blockNo}</p>
                    </div>
                    {selectedMap.lotNo && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Lot Number</p>
                        <p className="text-base">{selectedMap.lotNo}</p>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    {selectedMap.availability.toLowerCase() === "amenity" ? "Name" : "Street"}
                  </p>
                  <p className="text-base">{selectedMap.street}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Lot Size</p>
                  <p className="text-base">{selectedMap.lotSize} sqm</p>
                </div>
                {selectedMap.availability.toLowerCase() !== "amenity" && (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">House Type</p>
                      <p className="text-base">{selectedMap.houseType}</p>
                    </div>
                    {selectedMap.minPrice && selectedMap.maxPrice && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Price Range</p>
                        <p className="text-base">
                          ₱{selectedMap.minPrice.toLocaleString()}
                          {selectedMap.maxPrice > selectedMap.minPrice && ` - ₱${selectedMap.maxPrice.toLocaleString()}`}
                        </p>
                      </div>
                    )}
                    {selectedMap.paymentMethod && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Payment Method</p>
                        <p className="text-base">{selectedMap.paymentMethod}</p>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Availability</p>
                  <p className="text-base capitalize">{selectedMap.availability}</p>
                </div>
              </div>
              {selectedMap.notes && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Notes</p>
                  <p className="text-base">{selectedMap.notes}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button asChild variant="primary">
                  <Link href={`/admin/maps/${selectedMap.id}`}>
                    <Pencil className="size-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

