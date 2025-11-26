/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSuspenseResidentsSummary } from "@/features/monthly-dues/hooks/use-monthly-dues";
import { ResidentMonthlyDues } from "@/features/monthly-dues/components/resident-monthly-dues";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/loading";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Client = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const { data: residentsSummary, isLoading, error, refetch } = useSuspenseResidentsSummary(year);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Debug logging
  useEffect(() => {
    if (residentsSummary) {
      console.log("Residents Summary Data:", residentsSummary);
      console.log("Residents Count:", residentsSummary.length);
    }
    if (error) {
      console.error("Error loading residents summary:", error);
    }
  }, [residentsSummary, error]);

  // Refetch when year changes
  useEffect(() => {
    refetch();
  }, [year, refetch]);

  // Filter residents based on search term
  const filteredResidents = useMemo(() => {
    if (!residentsSummary || !searchTerm.trim()) {
      return residentsSummary || [];
    }

    const searchLower = searchTerm.toLowerCase().trim();
    return residentsSummary.filter((resident) => {
      // Search by resident name
      const fullName = [
        resident.firstName,
        resident.middleName,
        resident.lastName,
        resident.suffix,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      // Search by block and lot number
      const blockLot = resident.map
        ? `block ${resident.map.blockNo} lot ${resident.map.lotNo || ""}`.toLowerCase()
        : "";

      // Search by street
      const street = resident.map?.street?.toLowerCase() || "";

      return (
        fullName.includes(searchLower) ||
        blockLot.includes(searchLower) ||
        street.includes(searchLower)
      );
    });
  }, [residentsSummary, searchTerm]);

  // Only show loading on initial load, not when refetching
  if (isLoading && !residentsSummary) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Select Year:</label>
            <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by resident name, block, or lot number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                disabled
              />
            </div>
          </div>
        </div>
        <Loading message="Loading monthly dues..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Select Year:</label>
            <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by resident name, block, or lot number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                disabled
              />
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center text-destructive">
            Error loading monthly dues: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Year Selector and Search */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Select Year:</label>
          <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by resident name, block, or lot number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Residents List */}
      {!residentsSummary ? (
        <Card>
          <CardContent className="p-8 text-center space-y-2">
            <p className="text-muted-foreground font-medium">
              Loading residents...
            </p>
          </CardContent>
        </Card>
      ) : residentsSummary.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center space-y-2">
            <p className="text-muted-foreground font-medium">
              No active households found for {year}
            </p>
            <p className="text-sm text-muted-foreground">
              Please add household heads first or check if all households are archived.
            </p>
          </CardContent>
        </Card>
      ) : filteredResidents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center space-y-2">
            <p className="text-muted-foreground font-medium">
              No households found matching "{searchTerm}"
            </p>
            <p className="text-sm text-muted-foreground">
              Try searching by household head name, block number, or lot number
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResidents.map((resident) => {
            console.log("Rendering resident:", resident.id, resident.firstName, resident.lastName);
            return (
              <ResidentMonthlyDues
                key={resident.id}
                residentId={resident.id}
                year={year}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

