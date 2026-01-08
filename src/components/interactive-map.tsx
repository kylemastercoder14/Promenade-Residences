/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { Plus, Minus, RefreshCcw, Hand, MousePointerClick } from "lucide-react";
import { LotDetailsDialog } from "@/components/lot-details-dialog";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface LegendItem {
  label: string;
  color: string;
}

interface InteractiveMapProps {
  svgPath: string;
  className?: string;
  legend?: LegendItem[];
}

// Helper function to extract block and lot number from SVG element
const extractBlockAndLot = (lotElement: Element): { blockNo: string; lotNo: string | null } | null => {
  // Get the lot ID from the lot element itself
  const lotId = lotElement.getAttribute("id");
  if (!lotId || !lotId.startsWith("LOT")) {
    return null;
  }

  // Extract lot number from "LOT1", "LOT2", "LOT2-2", etc.
  // For "LOT2-2", we use the first number (2) as the lot number
  const lotMatch = lotId.match(/LOT(\d+)/);
  const lotNo = lotMatch ? lotMatch[1] : null;
  if (!lotNo) {
    return null;
  }

  // Now find the block ID by traversing up the tree from the lot element
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

  // Extract block number from "BLK1", "BLK2", etc.
  const blockMatch = blockId.match(/BLK(\d+)/);
  const blockNo = blockMatch ? blockMatch[1] : null;

  if (!blockNo) {
    return null;
  }

  return { blockNo, lotNo };
};

const DRAG_THRESHOLD = 100; // milliseconds

export const InteractiveMap = ({ svgPath, className = "", legend = [] }: InteractiveMapProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const [selectedLotElementId, setSelectedLotElementId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [panningDisabled, setPanningDisabled] = useState(false);
  const [interactionMode, setInteractionMode] = useState<"pan" | "select">("pan"); // "pan" for drag/zoom, "select" for clicking lots
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const dragStartTimeRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false); // Use ref for immediate access
  const lastMouseDownRef = useRef<{ x: number; y: number; target: Element | null } | null>(null);
  const dialogOpenRef = useRef<boolean>(false); // Use ref for immediate access to dialog state
  const dialogJustClosedRef = useRef<boolean>(false); // Track if dialog just closed
  const panStartPositionRef = useRef<{ x: number; y: number } | null>(null); // Track where panning started
  const hasPannedRef = useRef<boolean>(false); // Track if actual panning has occurred
  const trpc = useTRPC();

  // Fetch SVG content and modify it to add click handlers
  useEffect(() => {
    fetch(svgPath)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch SVG: ${res.status}`);
        }
        return res.text();
      })
      .then((text) => {
        if (text && text.trim().length > 0) {
          // Parse the SVG and add onClick handlers to lot elements
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(text, "image/svg+xml");
          const lotElements = svgDoc.querySelectorAll('[id^="LOT"]');

          lotElements.forEach((element) => {
            // Add a data attribute to identify lot elements
            element.setAttribute("data-lot-clickable", "true");
            // Add pointer-events style to ensure clicks work
            const htmlEl = element as HTMLElement;
            if (htmlEl.style) {
              htmlEl.style.pointerEvents = "auto";
              htmlEl.style.cursor = "pointer";
            }
          });

          // Serialize back to string
          const serializer = new XMLSerializer();
          const modifiedSvg = serializer.serializeToString(svgDoc);
          setSvgContent(modifiedSvg);
          setImageLoaded(true);
        } else {
          throw new Error("SVG content is empty");
        }
      })
      .catch((error) => {
        console.error("Error loading SVG:", error);
        setImageError(true);
      });
  }, [svgPath]);

  // Query lot details
  const { data: lotDetails, isLoading: isLoadingLot, error: lotError } = useQuery(
    trpc.maps.getByBlockAndLot.queryOptions(
      {
        blockNo: selectedBlock || "",
        lotNo: selectedLot || undefined,
      },
      {
        enabled: !!selectedBlock && dialogOpen,
      }
    )
  );

  // Debug query state
  useEffect(() => {
    if (selectedBlock) {
      console.log("Query state - enabled:", !!selectedBlock && dialogOpen, "block:", selectedBlock, "lot:", selectedLot, "isLoading:", isLoadingLot, "data:", lotDetails, "error:", lotError);
    }
  }, [selectedBlock, selectedLot, dialogOpen, isLoadingLot, lotDetails, lotError]);

  // Debug: Log dialog state changes
  useEffect(() => {
    console.log("Dialog state changed - open:", dialogOpen, "block:", selectedBlock, "lot:", selectedLot, "details:", lotDetails, "isLoading:", isLoadingLot);
    dialogOpenRef.current = dialogOpen;
    if (!dialogOpen) {
      // Set a flag when dialog closes, reset after a delay
      dialogJustClosedRef.current = true;
      setTimeout(() => {
        dialogJustClosedRef.current = false;
      }, 300); // 300ms delay before allowing dialog to reopen
    }
  }, [dialogOpen, selectedBlock, selectedLot, lotDetails, isLoadingLot]);

  // Highlight the selected lot in the SVG based on its availability/status
  useEffect(() => {
    if (!svgContainerRef.current) return;
    const container = svgContainerRef.current;
    const svgElement = container.querySelector("svg");
    if (!svgElement) return;

    // Clear previous highlight
    const prevHighlighted = svgElement.querySelectorAll("[data-selected-lot-highlight='true']");
    prevHighlighted.forEach((el) => {
      el.removeAttribute("data-selected-lot-highlight");
      (el as SVGElement).style.stroke = "";
      (el as SVGElement).style.strokeWidth = "";
    });

    if (!selectedLotElementId) return;

    const lotGroup = svgElement.querySelector<SVGElement>(`#${CSS.escape(selectedLotElementId)}`);
    if (!lotGroup) return;

    // Map availability/status to color (aligned with legend)
    const availability = lotDetails?.availability?.toLowerCase() ?? "";
    let color = "#2ea36f"; // default: available
    if (availability.includes("reserve")) {
      color = "#f3b340"; // reserved
    } else if (availability.includes("sold") || availability.includes("occupied")) {
      color = "#d64545"; // sold / occupied
    }

    lotGroup.setAttribute("data-selected-lot-highlight", "true");
    lotGroup.style.stroke = color;
    lotGroup.style.strokeWidth = "4";
  }, [selectedLotElementId, lotDetails, svgContent]);

  // Track mouse down position to distinguish clicks from drags
  const mouseDownRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasMovedRef = useRef<boolean>(false);

  // Handle clicks on the SVG using mouseup to better distinguish from drags
  const handleSvgMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    // Stop propagation to prevent TransformWrapper from handling it
    e.stopPropagation();

    // Check if we had a mouse down on a lot element
    if (!mouseDownRef.current) {
      console.log("Ignoring mouseup - no mouse down tracked");
      return;
    }

    // Check drag state from ref (more immediate than state)
    if (isDraggingRef.current) {
      console.log("Ignoring mouseup - currently dragging (from ref)");
      // Reset after a short delay
      setTimeout(() => {
        isDraggingRef.current = false;
        hasMovedRef.current = false;
        mouseDownRef.current = null;
      }, 100);
      return;
    }

    // Only process if we haven't moved (it's a real click, not a drag end)
    if (hasMovedRef.current) {
      console.log("Ignoring mouseup - mouse moved (was a drag)");
      hasMovedRef.current = false;
      mouseDownRef.current = null;
      return;
    }

    // Don't handle if we're currently dragging (state check as backup)
    // But give it a small grace period since state might lag
    if (isDragging) {
      const timeSinceMouseDown = Date.now() - (mouseDownRef.current?.time || 0);
      if (timeSinceMouseDown > 50) {
        // If it's been more than 50ms and we're still dragging, it's probably a real drag
        console.log("Ignoring mouseup - currently dragging (from state), time:", timeSinceMouseDown);
        return;
      }
      // Otherwise, it might just be state lag, proceed with click
      console.log("Proceeding with click despite isDragging state (likely state lag)");
    }

    // Use the native event to get the actual element that was clicked
    const nativeEvent = e.nativeEvent;
    const target = nativeEvent.target as Element;
    console.log("MouseUp detected on:", target.tagName, target.id, target.className);

    // Find the lot element from the clicked target
    let lotElement: Element | null = null;
    let current: Element | null = target;

    // Traverse up to find a LOT element
    while (current && current !== document.body) {
      const id = current.getAttribute("id");
      if (id && id.startsWith("LOT")) {
        lotElement = current;
        break;
      }
      current = current.parentElement;
    }

    if (!lotElement) {
      console.log("No LOT element found in target tree");
      // Try finding by coordinates using document.elementFromPoint
      const elementAtPoint = document.elementFromPoint(nativeEvent.clientX, nativeEvent.clientY);
      if (elementAtPoint) {
        console.log("Trying elementFromPoint:", elementAtPoint.tagName, elementAtPoint.id);
        current = elementAtPoint;
        while (current && current !== document.body) {
          const id = current.getAttribute("id");
          if (id && id.startsWith("LOT")) {
            lotElement = current;
            break;
          }
          current = current.parentElement;
        }
      }
    }

    if (!lotElement) {
      console.log("No LOT element found after all attempts");
      mouseDownRef.current = null;
      hasMovedRef.current = false;
      return;
    }

    console.log("Found LOT element:", lotElement.id);

    const blockAndLot = extractBlockAndLot(lotElement);
    console.log("Extracted block and lot:", blockAndLot);

    if (blockAndLot) {
      console.log("Setting dialog state - block:", blockAndLot.blockNo, "lot:", blockAndLot.lotNo);
      setSelectedBlock(blockAndLot.blockNo);
      setSelectedLot(blockAndLot.lotNo);
      setDialogOpen(true);
      console.log("Dialog state set to open");
    } else {
      console.log("Failed to extract block and lot");
    }

    mouseDownRef.current = null;
    hasMovedRef.current = false;
  };

  const handleSvgMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Use native event to get the actual clicked element
    const nativeEvent = e.nativeEvent;
    const target = nativeEvent.target as Element;

    // Find if we clicked on a lot element
    let isLotElement = false;
    let current: Element | null = target;

    while (current && current !== document.body) {
      const id = current.getAttribute("id");
      if (id && id.startsWith("LOT")) {
        isLotElement = true;
        break;
      }
      current = current.parentElement;
    }

    if (isLotElement) {
      // Prevent TransformWrapper from starting a pan when clicking on lots
      e.stopPropagation();
      e.preventDefault();

      mouseDownRef.current = {
        x: nativeEvent.clientX,
        y: nativeEvent.clientY,
        time: Date.now(),
      };
      hasMovedRef.current = false;
      isDraggingRef.current = false; // Reset drag state
      console.log("Mouse down on lot element - preventing pan", target.id);
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // If we're already dragging from TransformWrapper, don't check mouse movement
    if (isDraggingRef.current || isDragging) {
      return;
    }

    // If mouse moves while down, mark it as a drag
    // Only check if we're actually tracking a mouse down (on a lot element)
    if (mouseDownRef.current && !hasMovedRef.current) {
      const dx = Math.abs(e.clientX - mouseDownRef.current.x);
      const dy = Math.abs(e.clientY - mouseDownRef.current.y);

      // If moved more than 20px, it's definitely a drag
      // Smaller movements might just be mouse jitter or TransformComponent adjustments
      if (dx > 20 || dy > 20) {
        hasMovedRef.current = true;
        console.log("Mouse moved during click - marking as drag", { dx, dy });
      }
    }
  };

  // Track global mousedown and mousemove events
  useEffect(() => {
    const handleGlobalMouseDown = (e: MouseEvent) => {
      lastMouseDownRef.current = {
        x: e.clientX,
        y: e.clientY,
        target: e.target as Element,
      };
      // Reset pan tracking on new mousedown
      if (interactionMode === "pan") {
        panStartPositionRef.current = {
          x: e.clientX,
          y: e.clientY,
        };
        hasPannedRef.current = false;
      }
      console.log("Global mousedown:", e.clientX, e.clientY, (e.target as Element)?.id);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      // Only check if mouse button is actually held down (button 1 = left mouse button)
      if (e.buttons !== 1) {
        // Mouse button not held down, reset pan tracking
        if (panStartPositionRef.current) {
          panStartPositionRef.current = null;
          hasPannedRef.current = false;
          setPanningDisabled(false);
        }
        return;
      }

      // Check if we're in pan mode and waiting to confirm drag
      if (interactionMode === "pan" && panStartPositionRef.current && !hasPannedRef.current && panningDisabled) {
        const dx = Math.abs(e.clientX - panStartPositionRef.current.x);
        const dy = Math.abs(e.clientY - panStartPositionRef.current.y);
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If moved more than 10 pixels, enable panning
        if (distance > 10) {
          hasPannedRef.current = true;
          setPanningDisabled(false);
          console.log("Drag confirmed - enabling panning after", distance.toFixed(2), "pixels");
        }
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      console.log("Global mouseup - mode:", interactionMode, "hasPanned:", hasPannedRef.current);

      // If we were in pan mode and didn't actually pan, make sure panning is re-enabled
      if (interactionMode === "pan" && !hasPannedRef.current && panStartPositionRef.current) {
        // This was just a click, not a drag - re-enable panning for next time
        console.log("Global mouseup - was a click, not a drag, re-enabling panning");
        setPanningDisabled(false);
      }

      // Reset pan tracking when mouse button is released
      panStartPositionRef.current = null;
      hasPannedRef.current = false;

      // Only reset panningDisabled if we're in pan mode
      if (interactionMode === "pan") {
        setPanningDisabled(false);
      }
    };

    document.addEventListener("mousedown", handleGlobalMouseDown, true);
    document.addEventListener("mousemove", handleGlobalMouseMove, true);
    document.addEventListener("mouseup", handleGlobalMouseUp, true);

    return () => {
      document.removeEventListener("mousedown", handleGlobalMouseDown, true);
      document.removeEventListener("mousemove", handleGlobalMouseMove, true);
      document.removeEventListener("mouseup", handleGlobalMouseUp, true);
    };
  }, [interactionMode, panningDisabled]);

  // Add click handlers to SVG elements after it loads
  useEffect(() => {
    if (!svgContent || !svgContainerRef.current) {
      console.log("SVG content or container not ready");
      return;
    }

    const container = svgContainerRef.current;
    const svgElement = container.querySelector("svg") as SVGSVGElement | null;

    if (!svgElement) {
      console.log("SVG element not found");
      return;
    }

    console.log("SVG element found, setting up handlers");

    // Ensure SVG is visible and properly sized
    // Preserve aspect ratio while making it responsive
    const viewBox = svgElement.getAttribute("viewBox");
    if (viewBox) {
      // SVG has viewBox, make it responsive
      // Remove fixed width/height attributes to allow responsive scaling
      svgElement.removeAttribute("width");
      svgElement.removeAttribute("height");
    }
    // Set styles to make SVG visible and responsive
    svgElement.style.width = "100%";
    svgElement.style.height = "auto";
    svgElement.style.maxWidth = "100%";
    svgElement.style.display = "block";
    svgElement.style.visibility = "visible";
    svgElement.style.opacity = "1";

    // Find all lot elements
    const lotElements = svgElement.querySelectorAll('[id^="LOT"]');
    console.log(`Found ${lotElements.length} lot elements`);

    const handleLotClick = (e: MouseEvent) => {
      console.log("=== LOT CLICK HANDLER FIRED ===", (e.target as Element).id);
      e.stopPropagation();
      e.preventDefault();
      e.stopImmediatePropagation();

      const target = e.target as Element;
      console.log("Direct lot click handler fired on:", target.id, target.tagName, target);

      // Find the lot element
      let lotElement: Element | null = null;
      let current: Element | null = target;

      while (current && current !== document.body) {
        const id = current.getAttribute("id");
        if (id && id.startsWith("LOT")) {
          lotElement = current;
          break;
        }
        current = current.parentElement;
      }

      if (!lotElement) {
        console.log("No lot element found, trying elementFromPoint");
        const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY);
        if (elementAtPoint) {
          current = elementAtPoint;
          while (current && current !== document.body) {
            const id = current.getAttribute("id");
            if (id && id.startsWith("LOT")) {
              lotElement = current;
              break;
            }
            current = current.parentElement;
          }
        }
      }

      if (!lotElement) {
        console.log("Failed to find lot element");
        return;
      }

      console.log("Found lot element:", lotElement.id);
      const blockAndLot = extractBlockAndLot(lotElement);
      console.log("Extracted block and lot:", blockAndLot);

      if (blockAndLot) {
        console.log("Setting dialog from direct handler - block:", blockAndLot.blockNo, "lot:", blockAndLot.lotNo);
        setSelectedBlock(blockAndLot.blockNo);
        setSelectedLot(blockAndLot.lotNo);
        setDialogOpen(true);
        console.log("Dialog state should be set to open now");
      } else {
        console.log("Failed to extract block and lot from:", lotElement.id);
      }
    };

    const handleLotMouseDown = (e: MouseEvent) => {
      console.log("=== LOT MOUSEDOWN HANDLER FIRED ===", (e.target as Element).id);
      e.stopPropagation();
      e.preventDefault();
      e.stopImmediatePropagation();
      console.log("Lot mousedown - preventing pan on:", (e.target as Element).id);
      // Disable panning temporarily to prevent TransformWrapper from starting
      setPanningDisabled(true);
      // Mark that we're handling this, so panning shouldn't start
      isDraggingRef.current = false;
      // Re-enable panning after a short delay
      setTimeout(() => {
        setPanningDisabled(false);
      }, 200);
    };

    // Global click handler on the SVG element itself
    const handleSvgClick = (e: MouseEvent) => {
      const target = e.target as Element;
      let current: Element | null = target;
      let lotElement: Element | null = null;

      // Find if we clicked on a lot element
      while (current && current !== svgElement) {
        const id = current.getAttribute("id");
        if (id && id.startsWith("LOT")) {
          lotElement = current;
          break;
        }
        current = current.parentElement;
      }

      if (lotElement) {
        console.log("=== SVG CLICK HANDLER - Found lot element ===", lotElement.id);
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();

        const blockAndLot = extractBlockAndLot(lotElement);
        console.log("SVG click - extracted block and lot:", blockAndLot);

        if (blockAndLot) {
          console.log("SVG click - opening dialog for block:", blockAndLot.blockNo, "lot:", blockAndLot.lotNo);
          setSelectedBlock(blockAndLot.blockNo);
          setSelectedLot(blockAndLot.lotNo);
          setDialogOpen(true);
        }
      }
    };

    // Add click handler to SVG element with capture phase
    svgElement.addEventListener("click", handleSvgClick, true);
    console.log("Added global click handler to SVG element");

    lotElements.forEach((element) => {
      // Make elements clickable
      const el = element as HTMLElement;
      el.style.cursor = "pointer";
      el.style.transition = "opacity 0.2s";
      el.style.pointerEvents = "auto";

      // Add hover effects
      const handleMouseEnter = () => {
        if (!isDraggingRef.current && !isDragging) {
          el.style.opacity = "0.7";
        }
      };

      const handleMouseLeave = () => {
        el.style.opacity = "1";
      };

      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);

      console.log("Styled lot element:", element.id);
    });

    // Cleanup
    return () => {
      svgElement.removeEventListener("click", handleSvgClick, true);
      lotElements.forEach((element) => {
        const el = element as HTMLElement;
        el.style.cursor = "";
        el.style.opacity = "";
        el.style.transition = "";
      });
    };
  }, [svgContent, isDragging]);

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
          disabled: panningDisabled || interactionMode === "select", // Disable panning in select mode
          lockAxisX: false,
          lockAxisY: false,
        }}
        doubleClick={{ disabled: false, mode: "zoomIn" }}
        onPanningStart={(e) => {
          console.log("onPanningStart called, mode:", interactionMode, "panningDisabled:", panningDisabled);

          // In select mode, completely prevent panning - lot clicking is handled by click handlers
          if (interactionMode === "select") {
            console.log("onPanningStart - preventing panning in select mode");
            setPanningDisabled(true);
            // Stop event propagation to prevent any panning
            const event = e as any;
            if (event?.stopPropagation) {
              event.stopPropagation();
            }
            if (event?.preventDefault) {
              event.preventDefault();
            }
            return;
          }

          // In pan mode, initially disable panning until we confirm it's a real drag
          if (interactionMode === "pan") {
            // Store the initial position when panning starts
            if (lastMouseDownRef.current) {
              panStartPositionRef.current = {
                x: lastMouseDownRef.current.x,
                y: lastMouseDownRef.current.y,
              };
            }
            hasPannedRef.current = false;
            // Initially disable panning until we confirm it's a real drag
            setPanningDisabled(true);
            setIsDragging(true);
            isDraggingRef.current = true;
            dragStartTimeRef.current = Date.now();
            console.log("onPanningStart - pan mode (temporarily disabled until drag confirmed)");
            return;
          }
        }}
        onPanning={(e) => {
          // In pan mode, check if we've moved enough distance to enable panning
          if (interactionMode === "pan" && panStartPositionRef.current && !hasPannedRef.current) {
            const currentX = (e as any).clientX || 0;
            const currentY = (e as any).clientY || 0;
            const dx = Math.abs(currentX - panStartPositionRef.current.x);
            const dy = Math.abs(currentY - panStartPositionRef.current.y);
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Only enable panning if moved more than 10 pixels
            if (distance > 10) {
              hasPannedRef.current = true;
              setPanningDisabled(false);
              console.log("onPanning - confirmed drag, enabling panning after", distance.toFixed(2), "pixels");
            } else {
              console.log("onPanning - movement too small:", distance.toFixed(2), "pixels, keeping panning disabled");
            }
          }
        }}
        onPanningStop={() => {
          console.log("Panning stopped");
          setIsDragging(false);
          isDraggingRef.current = false;
          panStartPositionRef.current = null;
          hasPannedRef.current = false;
          dragStartTimeRef.current = 0;
          hasMovedRef.current = false;
          mouseDownRef.current = null;
          // Re-enable panning if in pan mode
          if (interactionMode === "pan") {
            setPanningDisabled(false);
          }
        }}
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
                  console.log("Container onClickCapture - fired, mode:", interactionMode);

                  // Only process lot clicks in "select" mode
                  if (interactionMode !== "select") {
                    console.log("Container onClickCapture - not in select mode, ignoring");
                    return;
                  }

                  // Don't process if dialog is open or just closed - use ref for immediate access
                  if (dialogOpenRef.current || dialogJustClosedRef.current) {
                    console.log("Container onClickCapture - ignoring click (dialog open or just closed)");
                    return;
                  }

                  // Check if the click target is a lot element - use capture phase
                  const target = e.target as Element;
                  console.log("Container onClickCapture - target:", target.tagName, target.id);

                  // Check if the click is within the SVG container (not on dialog overlay)
                  const container = svgContainerRef.current;
                  if (!container) {
                    console.log("Container onClickCapture - container not found");
                    return;
                  }

                  // Check if target is within container (including the container itself)
                  const isInContainer = container === target || container.contains(target);
                  if (!isInContainer) {
                    console.log("Container onClickCapture - click outside container, target:", target.tagName, target.id);
                    return;
                  }

                  // Also check if target is actually part of the SVG (not just the container div)
                  const svgElement = container.querySelector("svg");
                  if (!svgElement) {
                    console.log("Container onClickCapture - SVG element not found");
                    return;
                  }

                  // Check if target is within SVG or is the SVG itself
                  const isInSvg = target === svgElement || svgElement.contains(target);
                  if (!isInSvg && target !== container) {
                    console.log("Container onClickCapture - click not on SVG or container, target:", target.tagName, target.id);
                    return;
                  }

                  // Use elementsFromPoint to get ALL elements at the click point
                  // This is more reliable than elementFromPoint which only returns the topmost element
                  const clickX = (e as any).clientX || (e as any).pageX;
                  const clickY = (e as any).clientY || (e as any).pageY;

                  let lotElement: Element | null = null;

                  // Helper to check if element is part of an amenity (should be skipped)
                  const isAmenityElement = (element: Element): boolean => {
                    let current: Element | null = element;
                    while (current && current !== document.body) {
                      const id = current.getAttribute("id");
                      // Check for common amenity IDs (COURT, AMENITY, PARK, POOL, etc.)
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

                  // Helper to find lot element by searching up the tree
                  const findLotElementUp = (element: Element): Element | null => {
                    // First check if this is an amenity element - if so, skip it
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

                  // Helper to find lot elements by searching down the tree from a parent
                  const findLotElementDown = (parent: Element): Element | null => {
                    // Check if parent itself is an amenity - if so, skip it
                    if (isAmenityElement(parent)) {
                      return null;
                    }

                    // Check if parent itself is a lot element
                    const parentId = parent.getAttribute("id");
                    if (parentId && parentId.startsWith("LOT")) {
                      return parent;
                    }

                    // Search all children for lot elements, but exclude amenity groups
                    const allElements = parent.querySelectorAll("[id^='LOT']");
                    if (allElements.length > 0) {
                      // Filter out elements that are inside amenity groups
                      const lotElements = Array.from(allElements).filter(el => !isAmenityElement(el));

                      if (lotElements.length > 0) {
                        // Check which lot element contains the click point
                        for (const el of lotElements) {
                          const rect = el.getBoundingClientRect();
                          if (clickX >= rect.left && clickX <= rect.right &&
                              clickY >= rect.top && clickY <= rect.bottom) {
                            return el;
                          }
                        }
                        // If no element contains the point, return the first one (fallback)
                        return lotElements[0] as Element;
                      }
                    }
                    return null;
                  };

                  if (clickX !== undefined && clickY !== undefined) {
                    // Get all elements at this point (stacked elements)
                    const elementsAtPoint = document.elementsFromPoint(clickX, clickY);
                    console.log("Container onClickCapture - elementsAtPoint count:", elementsAtPoint.length);

                    // First, check if any element at the click point is part of an amenity
                    let isClickOnAmenity = false;
                    for (const element of elementsAtPoint) {
                      if (svgElement.contains(element) || element === svgElement) {
                        if (isAmenityElement(element)) {
                          console.log("Container onClickCapture - click is on amenity, skipping lot detection");
                          isClickOnAmenity = true;
                          break;
                        }
                      }
                    }

                    // If click is on an amenity, don't search for lot elements
                    if (isClickOnAmenity) {
                      return;
                    }

                    // Check all elements at the click point to find a lot element
                    for (const element of elementsAtPoint) {
                      // Only check elements within the SVG
                      if (svgElement.contains(element) || element === svgElement) {
                        lotElement = findLotElementUp(element);
                        if (lotElement) {
                          console.log("Container onClickCapture - found lot element (up):", lotElement.id, "from element:", element.tagName, element.id);
                          break;
                        }
                      }
                    }

                    // If still not found and target is the SVG element itself, search down the tree
                    if (!lotElement && (target === svgElement || target.id === "Layer_1")) {
                      console.log("Container onClickCapture - target is SVG, searching down tree");
                      lotElement = findLotElementDown(svgElement);
                      if (lotElement) {
                        console.log("Container onClickCapture - found lot element (down):", lotElement.id);
                      }
                    }
                  }

                  // Fallback: if elementsFromPoint didn't work, try searching from the target
                  if (!lotElement) {
                    // Skip if target is part of an amenity
                    if (!isAmenityElement(target)) {
                      let current: Element | null = target;
                      while (current && current !== document.body) {
                        // Skip if we encounter an amenity element
                        if (isAmenityElement(current)) {
                          break;
                        }
                        const id = current.getAttribute("id");
                        if (id && id.startsWith("LOT")) {
                          lotElement = current;
                          console.log("Container onClickCapture - found lot element (fallback up):", lotElement.id);
                          break;
                        }
                        current = current.parentElement;
                      }
                    }
                  }

                  if (lotElement) {
                    console.log("Container onClickCapture - found lot element:", lotElement.id);
                    e.stopPropagation();
                    e.preventDefault();

                    const blockAndLot = extractBlockAndLot(lotElement);
                    console.log("Container onClickCapture - extracted block and lot:", blockAndLot);

                    if (blockAndLot) {
                    console.log("Container onClickCapture - opening dialog for block:", blockAndLot.blockNo, "lot:", blockAndLot.lotNo);
                      setSelectedBlock(blockAndLot.blockNo);
                      setSelectedLot(blockAndLot.lotNo);
                      setSelectedLotElementId(lotElement.id);
                      setDialogOpen(true);
                      // Prevent panning
                      setPanningDisabled(true);
                      setTimeout(() => {
                        setPanningDisabled(false);
                      }, 300);
                    }
                  }
                }}
                onMouseDownCapture={(e) => {
                  console.log("Container onMouseDownCapture - fired, mode:", interactionMode);

                  // Only process lot clicks in "select" mode
                  if (interactionMode !== "select") {
                    console.log("Container onMouseDownCapture - not in select mode, ignoring");
                    return;
                  }

                  // Don't process if dialog is open or just closed - use ref for immediate access
                  if (dialogOpenRef.current || dialogJustClosedRef.current) {
                    console.log("Container onMouseDownCapture - ignoring click (dialog open or just closed)");
                    return;
                  }

                  // Check if mousedown is on a lot element - use capture phase
                  const target = e.target as Element;
                  console.log("Container onMouseDownCapture - target:", target.tagName, target.id);

                  // Check if the click is within the SVG container (not on dialog overlay)
                  const container = svgContainerRef.current;
                  if (!container) {
                    console.log("Container onMouseDownCapture - container not found");
                    return;
                  }

                  // Check if target is within container (including the container itself)
                  const isInContainer = container === target || container.contains(target);
                  if (!isInContainer) {
                    console.log("Container onMouseDownCapture - click outside container, target:", target.tagName, target.id);
                    return;
                  }

                  // Also check if target is actually part of the SVG (not just the container div)
                  const svgElement = container.querySelector("svg");
                  if (!svgElement) {
                    console.log("Container onMouseDownCapture - SVG element not found");
                    return;
                  }

                  // Check if target is within SVG or is the SVG itself
                  const isInSvg = target === svgElement || svgElement.contains(target);
                  if (!isInSvg && target !== container) {
                    console.log("Container onMouseDownCapture - click not on SVG or container, target:", target.tagName, target.id);
                    return;
                  }

                  // Use elementsFromPoint to get ALL elements at the click point
                  // This is more reliable than elementFromPoint which only returns the topmost element
                  const clickX = (e as any).clientX || (e as any).pageX;
                  const clickY = (e as any).clientY || (e as any).pageY;

                  let lotElement: Element | null = null;

                  // Helper to check if element is part of an amenity (should be skipped)
                  const isAmenityElement = (element: Element): boolean => {
                    let current: Element | null = element;
                    while (current && current !== document.body) {
                      const id = current.getAttribute("id");
                      // Check for common amenity IDs (COURT, AMENITY, PARK, POOL, etc.)
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

                  // Helper to find lot element by searching up the tree
                  const findLotElementUp = (element: Element): Element | null => {
                    // First check if this is an amenity element - if so, skip it
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

                  // Helper to find lot elements by searching down the tree from a parent
                  const findLotElementDown = (parent: Element): Element | null => {
                    // Check if parent itself is an amenity - if so, skip it
                    if (isAmenityElement(parent)) {
                      return null;
                    }

                    // Check if parent itself is a lot element
                    const parentId = parent.getAttribute("id");
                    if (parentId && parentId.startsWith("LOT")) {
                      return parent;
                    }

                    // Search all children for lot elements, but exclude amenity groups
                    const allElements = parent.querySelectorAll("[id^='LOT']");
                    if (allElements.length > 0) {
                      // Filter out elements that are inside amenity groups
                      const lotElements = Array.from(allElements).filter(el => !isAmenityElement(el));

                      if (lotElements.length > 0) {
                        // Check which lot element contains the click point
                        for (const el of lotElements) {
                          const rect = el.getBoundingClientRect();
                          if (clickX >= rect.left && clickX <= rect.right &&
                              clickY >= rect.top && clickY <= rect.bottom) {
                            return el;
                          }
                        }
                        // If no element contains the point, return the first one (fallback)
                        return lotElements[0] as Element;
                      }
                    }
                    return null;
                  };

                  if (clickX !== undefined && clickY !== undefined) {
                    // Get all elements at this point (stacked elements)
                    const elementsAtPoint = document.elementsFromPoint(clickX, clickY);
                    console.log("Container onMouseDownCapture - elementsAtPoint count:", elementsAtPoint.length);

                    // First, check if any element at the click point is part of an amenity
                    let isClickOnAmenity = false;
                    for (const element of elementsAtPoint) {
                      if (svgElement.contains(element) || element === svgElement) {
                        if (isAmenityElement(element)) {
                          console.log("Container onMouseDownCapture - click is on amenity, skipping lot detection");
                          isClickOnAmenity = true;
                          break;
                        }
                      }
                    }

                    // If click is on an amenity, don't search for lot elements
                    if (isClickOnAmenity) {
                      return;
                    }

                    // Check all elements at the click point to find a lot element
                    for (const element of elementsAtPoint) {
                      // Only check elements within the SVG
                      if (svgElement.contains(element) || element === svgElement) {
                        lotElement = findLotElementUp(element);
                        if (lotElement) {
                          console.log("Container onMouseDownCapture - found lot element (up):", lotElement.id, "from element:", element.tagName, element.id);
                          break;
                        }
                      }
                    }

                    // If still not found and target is the SVG element itself, search down the tree
                    if (!lotElement && (target === svgElement || target.id === "Layer_1")) {
                      console.log("Container onMouseDownCapture - target is SVG, searching down tree");
                      lotElement = findLotElementDown(svgElement);
                      if (lotElement) {
                        console.log("Container onMouseDownCapture - found lot element (down):", lotElement.id);
                      }
                    }
                  }

                  // Fallback: if elementsFromPoint didn't work, try searching from the target
                  if (!lotElement) {
                    // Skip if target is part of an amenity
                    if (!isAmenityElement(target)) {
                      let current: Element | null = target;
                      while (current && current !== document.body) {
                        // Skip if we encounter an amenity element
                        if (isAmenityElement(current)) {
                          break;
                        }
                        const id = current.getAttribute("id");
                        if (id && id.startsWith("LOT")) {
                          lotElement = current;
                          console.log("Container onMouseDownCapture - found lot element (fallback up):", lotElement.id);
                          break;
                        }
                        current = current.parentElement;
                      }
                    }
                  }

                  if (lotElement) {
                    const lotId = lotElement.getAttribute("id");
                    console.log("Container onMouseDownCapture - found lot element:", lotId, "from target:", (target as Element)?.id || target.tagName);
                    e.stopPropagation();
                    e.preventDefault();

                    // Extract block and lot and open dialog
                    const blockAndLot = extractBlockAndLot(lotElement);
                    console.log("Container onMouseDownCapture - extracted block:", blockAndLot?.blockNo, "lot:", blockAndLot?.lotNo, "from lot element:", lotId);

                    if (blockAndLot) {
                    console.log("Container onMouseDownCapture - setting state - block:", blockAndLot.blockNo, "lot:", blockAndLot.lotNo);
                      setSelectedBlock(blockAndLot.blockNo);
                      setSelectedLot(blockAndLot.lotNo);
                      setSelectedLotElementId(lotId || null);
                      console.log("Container onMouseDownCapture - setting dialogOpen to true");
                      setDialogOpen(true);
                      console.log("Container onMouseDownCapture - state set, dialog should open");
                    } else {
                      console.log("Container onMouseDownCapture - failed to extract block and lot from:", lotId);
                    }

                    setPanningDisabled(true);
                    setTimeout(() => {
                      setPanningDisabled(false);
                    }, 300);
                    return;
                  }
                }}
              >
                {imageError ? (
                  <div className="text-center p-8 text-[#4f5f53]">
                    <p className="text-sm font-medium mb-2">Map not found</p>
                    <p className="text-xs">Unable to load: {svgPath}</p>
                  </div>
                ) : svgContent ? (
                  <div
                    onMouseUp={handleSvgMouseUp}
                    onMouseDown={handleSvgMouseDown}
                    onMouseMove={handleSvgMouseMove}
                    className={cn(
                      interactionMode === "select" ? "cursor-pointer" : isDragging ? "cursor-grabbing" : "cursor-grab"
                    )}
                    style={{
                      userSelect: "none",
                      width: "100%",
                      minHeight: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: imageLoaded ? 1 : 0,
                      transition: "opacity 0.3s",
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

            {/* Beta / experimental disclaimer inside canvas (top side) */}
            <div className="absolute top-3 left-3 z-20 max-w-xs rounded-md border border-[#e4e7de] bg-white/95 backdrop-blur-sm px-3 py-2 shadow-sm text-[11px] text-[#4f5f53] pointer-events-none">
              <span className="font-semibold text-[#1f5c34]">Beta notice:</span>{" "}
              This 2D mapping feature is currently in beta/experimental mode. Some interactions may not work perfectly yet,
              but lot availability data is accurate.
            </div>

            {/* Legend - Fixed position outside TransformComponent */}
            {legend.length > 0 && (
              <div className="absolute bottom-16 left-3 z-20 rounded-lg border border-[#e4e7de] bg-white/95 backdrop-blur-sm px-4 py-3 shadow-md pointer-events-none">
                <p className="mb-2 text-xs font-semibold uppercase text-[#1f5c34]">Legend</p>
                <div className="grid gap-2 text-sm text-[#4c594e]">
                  {legend.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interaction Mode Toggle - Bottom Center */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-white/95 backdrop-blur-sm rounded-lg border flex-wrap border-[#e4e7de] shadow-md p-1">
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

      {/* Lot Details Dialog */}
      <LotDetailsDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          console.log("Dialog onOpenChange called with:", open);
          if (!open) {
            // Close dialog and reset selection
            setDialogOpen(false);
            setSelectedBlock(null);
            setSelectedLot(null);
          }
        }}
        lotDetails={lotDetails || null}
        isLoading={isLoadingLot}
        blockNo={selectedBlock}
        lotNo={selectedLot}
      />
    </div>
  );
};
