/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
"use client";

import { useState, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { Plus, Minus, RefreshCcw, Hand, MousePointerClick } from "lucide-react";
import { MapForm } from "@/features/maps/components/form";
import { Maps } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface AdminInteractiveMapProps {
  className?: string;
}

// Helper function to extract block and lot number from SVG element
const extractBlockAndLot = (lotElement: Element): { blockNo: string; lotNo: string | null } | null => {
  const lotId = lotElement.getAttribute("id");
  if (!lotId || !lotId.startsWith("LOT")) {
    return null;
  }

  const lotMatch = lotId.match(/LOT(\d+)/);
  const lotNo = lotMatch ? lotMatch[1] : null;
  if (!lotNo) {
    return null;
  }

  let current: Element | null = lotElement.parentElement;
  let blockId: string | null = null;

  while (current && current !== document.body) {
    const id = current.getAttribute("id");
    if (id && id.startsWith("BLK")) {
      blockId = id;
      break;
    }
    current = current.parentElement;
  }

  if (!blockId) {
    return null;
  }

  const blockMatch = blockId.match(/BLK(\d+)/);
  const blockNo = blockMatch ? blockMatch[1] : null;

  if (!blockNo) {
    return null;
  }

  return { blockNo, lotNo };
};

export const AdminInteractiveMap = ({ className = "" }: AdminInteractiveMapProps) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [interactionMode, setInteractionMode] = useState<"pan" | "select">("pan");
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const dialogOpenRef = useRef<boolean>(false);
  const dialogJustClosedRef = useRef<boolean>(false);
  const dialogOpenTimeRef = useRef<number>(0);
  const trpc = useTRPC();

  // Query existing lot data when block/lot is selected
  const { data: existingLot, isLoading: isLoadingLot } = useQuery(
    trpc.maps.getByBlockAndLot.queryOptions(
      {
        blockNo: selectedBlock || "",
        lotNo: selectedLot || undefined,
      },
      {
        enabled: !!selectedBlock && formDialogOpen,
      }
    )
  );

  // Fetch SVG content
  useEffect(() => {
    fetch("/Promenade_Map.svg")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch SVG: ${res.status}`);
        }
        return res.text();
      })
      .then((text) => {
        if (text && text.trim().length > 0) {
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(text, "image/svg+xml");
          const lotElements = svgDoc.querySelectorAll('[id^="LOT"]');

          lotElements.forEach((element) => {
            element.setAttribute("data-lot-clickable", "true");
            const htmlEl = element as HTMLElement;
            if (htmlEl.style) {
              htmlEl.style.pointerEvents = "auto";
              htmlEl.style.cursor = "pointer";
            }
          });

          const serializer = new XMLSerializer();
          const modifiedSvg = serializer.serializeToString(svgDoc);
          setSvgContent(modifiedSvg);
        } else {
          throw new Error("SVG content is empty");
        }
      })
      .catch((error) => {
        console.error("Error loading SVG:", error);
      });
  }, []);

  // Track dialog state
  useEffect(() => {
    console.log("Dialog state changed:", formDialogOpen, "selectedBlock:", selectedBlock, "selectedLot:", selectedLot);
    dialogOpenRef.current = formDialogOpen;
    if (!formDialogOpen) {
      dialogJustClosedRef.current = true;
      setTimeout(() => {
        dialogJustClosedRef.current = false;
      }, 300);
    }
  }, [formDialogOpen, selectedBlock, selectedLot]);

  // Helper to check if element is part of an amenity
  const isAmenityElement = (element: Element): boolean => {
    let current: Element | null = element;
    while (current && current !== document.body) {
      const id = current.getAttribute("id");
      if (id && (
        id === "COURT" ||
        id.startsWith("AMENITY") ||
        id === "PARK" ||
        id === "POOL" ||
        id === "GARDEN" ||
        id === "PLAYGROUND"
      )) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  };

  // Handle lot click
  const handleLotClick = (blockNo: string, lotNo: string | null) => {
    console.log("handleLotClick called with:", { blockNo, lotNo });
    try {
      dialogOpenTimeRef.current = Date.now();
      setSelectedBlock(blockNo);
      setSelectedLot(lotNo);
      setFormDialogOpen(true);
      console.log("State updated - formDialogOpen: true, selectedBlock:", blockNo, "selectedLot:", lotNo, "openTime:", dialogOpenTimeRef.current);
    } catch (error) {
      console.error("Error in handleLotClick:", error);
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <TransformWrapper
        initialScale={1}
        minScale={0.3}
        maxScale={5}
        limitToBounds={false}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
        panning={{
          disabled: interactionMode === "select",
          lockAxisX: false,
          lockAxisY: false,
        }}
        doubleClick={{ disabled: false, mode: "zoomIn" }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%", position: "relative" }}
              contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <div
                ref={svgContainerRef}
                className="w-full h-full flex items-center justify-center"
                style={{ minHeight: "100%", position: "relative" }}
                onClickCapture={(e) => {
                  console.log("onClickCapture fired, mode:", interactionMode);

                  if (interactionMode !== "select") {
                    console.log("Not in select mode, ignoring click");
                    return;
                  }

                  if (dialogOpenRef.current || dialogJustClosedRef.current) {
                    console.log("Dialog open or just closed, ignoring click");
                    return;
                  }

                  const target = e.target as Element;
                  console.log("Click target:", target.tagName, target.id, target.className);

                  const container = svgContainerRef.current;
                  if (!container) {
                    console.log("Container not found");
                    return;
                  }

                  const isInContainer = container === target || container.contains(target);
                  if (!isInContainer) {
                    console.log("Click outside container");
                    return;
                  }

                  const svgElement = container.querySelector("svg");
                  if (!svgElement) {
                    console.log("SVG element not found");
                    return;
                  }

                  const isInSvg = target === svgElement || svgElement.contains(target);
                  if (!isInSvg && target !== container) {
                    console.log("Click not on SVG");
                    return;
                  }

                  const clickX = (e as any).clientX || (e as any).pageX;
                  const clickY = (e as any).clientY || (e as any).pageY;
                  console.log("Click coordinates:", clickX, clickY);

                  let lotElement: Element | null = null;

                  const findLotElementUp = (element: Element): Element | null => {
                    if (isAmenityElement(element)) {
                      return null;
                    }
                    let current: Element | null = element;
                    while (current && current !== document.body) {
                      const id = current.getAttribute("id");
                      const dataAttr = current.getAttribute("data-lot-clickable");
                      if ((id && id.startsWith("LOT")) || dataAttr === "true") {
                        return current;
                      }
                      current = current.parentElement;
                    }
                    return null;
                  };

                  if (clickX !== undefined && clickY !== undefined) {
                    const elementsAtPoint = document.elementsFromPoint(clickX, clickY);
                    console.log("Elements at point:", elementsAtPoint.length);

                    let isClickOnAmenity = false;
                    for (const element of elementsAtPoint) {
                      if (svgElement.contains(element) || element === svgElement) {
                        if (isAmenityElement(element)) {
                          console.log("Click is on amenity");
                          isClickOnAmenity = true;
                          break;
                        }
                      }
                    }

                    if (isClickOnAmenity) {
                      return;
                    }

                    for (const element of elementsAtPoint) {
                      if (svgElement.contains(element) || element === svgElement) {
                        lotElement = findLotElementUp(element);
                        if (lotElement) {
                          console.log("Found lot element from elementsAtPoint:", lotElement.id);
                          break;
                        }
                      }
                    }
                  }

                  if (!lotElement) {
                    if (!isAmenityElement(target)) {
                      let current: Element | null = target;
                      while (current && current !== document.body) {
                        if (isAmenityElement(current)) {
                          break;
                        }
                        const id = current.getAttribute("id");
                        if (id && id.startsWith("LOT")) {
                          lotElement = current;
                          console.log("Found lot element from target tree:", lotElement.id);
                          break;
                        }
                        current = current.parentElement;
                      }
                    }
                  }

                  if (lotElement) {
                    console.log("Lot element found:", lotElement.id);
                    e.stopPropagation();
                    e.preventDefault();

                    const blockAndLot = extractBlockAndLot(lotElement);
                    console.log("Extracted block and lot:", blockAndLot);
                    if (blockAndLot) {
                      console.log("Calling handleLotClick with:", blockAndLot);
                      // Use setTimeout to delay the state update and prevent event bubbling
                      setTimeout(() => {
                        handleLotClick(blockAndLot.blockNo, blockAndLot.lotNo);
                      }, 50);
                    } else {
                      console.log("Failed to extract block and lot");
                    }
                  } else {
                    console.log("No lot element found");
                  }
                }}
              >
                {svgContent ? (
                  <div
                    className={cn(
                      interactionMode === "select" ? "cursor-pointer" : "cursor-grab"
                    )}
                    style={{
                      userSelect: "none",
                      width: "100%",
                      minHeight: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-[#f9faf7]">
                    <div className="text-sm text-[#4f5f53]">Loading map...</div>
                  </div>
                )}
              </div>
            </TransformComponent>

            {/* Interaction Mode Toggle */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-white/95 backdrop-blur-sm rounded-lg border border-[#e4e7de] shadow-md p-1">
              <Button
                size="sm"
                variant={interactionMode === "pan" ? "default" : "ghost"}
                className={cn(
                  "h-8 px-3 text-xs",
                  interactionMode === "pan"
                    ? "bg-[#1f5c34] text-white hover:bg-[#1f5c34]/90"
                    : "text-[#4c594e] hover:bg-[#f0f0f0]"
                )}
                onClick={() => setInteractionMode("pan")}
              >
                <Hand className="size-3 mr-1.5" />
                Pan/Zoom
              </Button>
              <Button
                size="sm"
                variant={interactionMode === "select" ? "default" : "ghost"}
                className={cn(
                  "h-8 px-3 text-xs",
                  interactionMode === "select"
                    ? "bg-[#1f5c34] text-white hover:bg-[#1f5c34]/90"
                    : "text-[#4c594e] hover:bg-[#f0f0f0]"
                )}
                onClick={() => setInteractionMode("select")}
              >
                <MousePointerClick className="size-3 mr-1.5" />
                Select Lot
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-white text-[#1f5c34] shadow-md hover:bg-[#f0f0f0]"
                variant="outline"
                onClick={() => zoomIn()}
                aria-label="Zoom in"
              >
                <Plus className="size-4" />
              </Button>
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-white text-[#1f5c34] shadow-md hover:bg-[#f0f0f0]"
                variant="outline"
                onClick={() => zoomOut()}
                aria-label="Zoom out"
              >
                <Minus className="size-4" />
              </Button>
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-white text-[#1f5c34] shadow-md hover:bg-[#f0f0f0]"
                variant="outline"
                onClick={() => resetTransform()}
                aria-label="Reset view"
              >
                <RefreshCcw className="size-4" />
              </Button>
            </div>
          </>
        )}
      </TransformWrapper>

      {/* Form Dialog */}
      <Dialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          const timeSinceOpen = Date.now() - dialogOpenTimeRef.current;
          console.log("Dialog onOpenChange called with:", open, "current state:", formDialogOpen, "selectedBlock:", selectedBlock, "selectedLot:", selectedLot, "timeSinceOpen:", timeSinceOpen);

          // Prevent closing if we just opened (within last 500ms) - this prevents the click event from closing it
          if (!open && formDialogOpen && timeSinceOpen < 500) {
            console.log("Preventing dialog close - just opened", timeSinceOpen, "ms ago");
            return;
          }

          setFormDialogOpen(open);
          if (!open) {
            // Reset selection when dialog closes
            console.log("Resetting selection");
            setSelectedBlock(null);
            setSelectedLot(null);
            dialogOpenTimeRef.current = 0;
          }
        }}
      >
        <DialogContent className="max-w-5xl! max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBlock && selectedLot
                ? `Create/Edit Lot - Block ${selectedBlock}, Lot ${selectedLot}`
                : selectedBlock
                ? `Create/Edit Lot - Block ${selectedBlock}`
                : "Create/Edit Lot"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for this lot. Block and lot numbers are pre-filled from the map.
            </DialogDescription>
          </DialogHeader>
          {selectedBlock ? (
            <div className="mt-4">
              {isLoadingLot ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading lot information...
                </div>
              ) : (
                <MapForm
                  // If lot exists in DB, edit it; otherwise, create a new one with block/lot pre-filled
                  initialData={
                    existingLot
                      ? existingLot
                      : ({
                          id: "" as string, // empty id -> treated as create in MapForm
                          blockNo: selectedBlock,
                          lotNo: selectedLot || null,
                          street: "",
                          lotSize: 0,
                          houseType: "",
                          minPrice: 0,
                          maxPrice: 0,
                          paymentMethod: "",
                          attachmentUrl: "",
                          availability: "",
                          notes: null,
                          createdAt: new Date(),
                          updatedAt: new Date(),
                        } as Maps)
                  }
                />
              )}
            </div>
          ) : (
            <div className="mt-4 p-4 text-center text-muted-foreground">
              No lot selected
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-20 left-3 z-30 bg-black/80 text-white text-xs p-2 rounded">
          <div>Dialog Open: {formDialogOpen ? 'Yes' : 'No'}</div>
          <div>Block: {selectedBlock || 'None'}</div>
          <div>Lot: {selectedLot || 'None'}</div>
          <div>Mode: {interactionMode}</div>
        </div>
      )}
    </div>
  );
};

