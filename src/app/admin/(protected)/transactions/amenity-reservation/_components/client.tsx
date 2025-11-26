"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarView } from "./calendar-view";
import { ArchivedReservationsView } from "./archived-view";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AmenityType, ReservationStatus } from "@prisma/client";
import { Search } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Client = () => {
  const trpc = useTRPC();
  const { data: allReservations } = useSuspenseQuery(
    trpc.amenityReservations.getMany.queryOptions({ includeArchived: true })
  );

  const [activeTab, setActiveTab] = useState("active");
  const [selectedAmenity, setSelectedAmenity] = useState<AmenityType | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter active reservations
  const filteredActiveReservations = useMemo(() => {
    let filtered = allReservations.filter((r) => !r.isArchived);

    // Filter by amenity
    if (selectedAmenity !== "all") {
      filtered = filtered.filter((r) => r.amenity === selectedAmenity);
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((r) => {
        const fullName = r.fullName?.toLowerCase() || "";
        const amenity = r.amenity?.toLowerCase() || "";
        const userType = r.userType?.toLowerCase() || "";
        const timeRange = `${r.startTime} - ${r.endTime}`.toLowerCase();

        return (
          fullName.includes(query) ||
          amenity.includes(query) ||
          userType.includes(query) ||
          timeRange.includes(query)
        );
      });
    }

    return filtered;
  }, [allReservations, selectedAmenity, selectedStatus, searchQuery]);

  // Filter archived reservations
  const filteredArchivedReservations = useMemo(() => {
    let filtered = allReservations.filter((r) => r.isArchived);

    // Filter by amenity
    if (selectedAmenity !== "all") {
      filtered = filtered.filter((r) => r.amenity === selectedAmenity);
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((r) => {
        const fullName = r.fullName?.toLowerCase() || "";
        const amenity = r.amenity?.toLowerCase() || "";
        const userType = r.userType?.toLowerCase() || "";
        const timeRange = `${r.startTime} - ${r.endTime}`.toLowerCase();

        return (
          fullName.includes(query) ||
          amenity.includes(query) ||
          userType.includes(query) ||
          timeRange.includes(query)
        );
      });
    }

    return filtered;
  }, [allReservations, selectedAmenity, selectedStatus, searchQuery]);

  return (
    <Card>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="active">Active Reservations</TabsTrigger>
                <TabsTrigger value="archived">
                  Archived Reservations
                  {allReservations.filter((r) => r.isArchived).length > 0 && (
                    <span className="rounded-full bg-destructive text-white py-0.5 px-1.5 text-[9px]">
                      {allReservations.filter((r) => r.isArchived).length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by name, amenity, time..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Filter by Amenity */}
              <div className="space-y-2">
                <Label>Filter by Amenity</Label>
                <Select value={selectedAmenity} onValueChange={(value) => setSelectedAmenity(value as typeof selectedAmenity)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select amenity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Amenities</SelectItem>
                    <SelectItem value="COURT">Basketball Court</SelectItem>
                    <SelectItem value="GAZEBO">Gazebo</SelectItem>
                    <SelectItem value="PARKING_AREA">Parking Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Status */}
              <div className="space-y-2">
                <Label>Filter by Status</Label>
                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as typeof selectedStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <TabsContent value="active" className="mt-0">
            <CalendarView reservations={filteredActiveReservations} />
          </TabsContent>
          <TabsContent value="archived" className="mt-0">
            <ArchivedReservationsView reservations={filteredArchivedReservations} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

