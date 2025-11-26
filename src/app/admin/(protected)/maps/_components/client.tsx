"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapViewer } from "@/features/maps/components/map-viewer";
import { useSuspenseMaps } from "@/features/maps/hooks/use-maps";
import { Maps } from "@prisma/client";

export const Client = () => {
  const { data: maps } = useSuspenseMaps();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMaps, setFilteredMaps] = useState<Maps[]>(maps || []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredMaps(maps || []);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = (maps || []).filter(
      (map) =>
        map.blockNo.toLowerCase().includes(query) ||
        map.lotNo?.toLowerCase().includes(query) ||
        map.street.toLowerCase().includes(query)
    );
    setFilteredMaps(filtered);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardContent>
        {/* Search */}
        <div className="w-full space-y-2">
          <div className="flex rounded-md shadow-xs">
            <Input
              type="search"
              placeholder="Search lot, block or street..."
              className="-me-px rounded-r-none shadow-none focus-visible:z-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button variant="primary" className="rounded-l-none" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>
        <div className="mt-5">
          <MapViewer maps={filteredMaps} />
        </div>
      </CardContent>
    </Card>
  );
};
