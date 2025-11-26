/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useSuspenseMap } from "@/features/maps/hooks/use-maps";
import { MapForm } from "./form";

export const Map = ({ mapId }: { mapId: string }) => {
  const isCreate = mapId === "create";

  // If creating → do NOT fetch
  // cast fetched data to any (or the MapForm expected type) to satisfy TypeScript
  const map = isCreate ? null : useSuspenseMap(mapId).data;

  return (
    <div>
      {isCreate ? (
        <MapForm initialData={null} />
      ) : (
        <MapForm initialData={map} />
      )}
    </div>
  );
};
