/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { Plus, Minus, RefreshCcw } from "lucide-react";

interface LegendItem {
  label: string;
  color: string;
}

interface InteractiveMapProps {
  svgPath: string;
  className?: string;
  legend?: LegendItem[];
}

export const InteractiveMap = ({ svgPath, className = "", legend = [] }: InteractiveMapProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Preload the image to check if it exists
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = svgPath;
  }, [svgPath]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <TransformWrapper
        initialScale={1}
        minScale={0.3}
        maxScale={5}
        limitToBounds={false}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
        panning={{ disabled: false }}
        doubleClick={{ disabled: false, mode: "zoomIn" }}
        onPanningStart={() => setIsDragging(true)}
        onPanningStop={() => setIsDragging(false)}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%", position: "relative" }}
              contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {imageError ? (
                <div className="text-center p-8 text-[#4f5f53]">
                  <p className="text-sm font-medium mb-2">Map not found</p>
                  <p className="text-xs">Unable to load: {svgPath}</p>
                </div>
              ) : (
                <img
                  src={svgPath}
                  alt="Promenade Map"
                  className={`${isDragging ? "cursor-grabbing" : "cursor-grab"} ${imageLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
                  draggable={false}
                  style={{
                    userSelect: "none",
                    maxWidth: "100%",
                    width: "auto",
                    height: "auto",
                    display: "block",
                    objectFit: "contain",
                    // @ts-expect-error - WebkitUserDrag is a valid CSS property
                    WebkitUserDrag: "none",
                  }}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              )}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-[#f9faf7]">
                  <div className="text-sm text-[#4f5f53]">Loading map...</div>
                </div>
              )}
            </TransformComponent>

            {/* Legend - Inside Canvas */}
            {legend.length > 0 && (
              <div className="absolute bottom-3 left-3 z-10 rounded-lg border border-[#e4e7de] bg-white/95 backdrop-blur-sm px-4 py-3 shadow-md">
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
    </div>
  );
};

