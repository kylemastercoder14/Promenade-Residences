"use client";

import * as React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconBuildingWarehouse,
  IconCalendar,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { CustomCalendar } from "@/components/custom-calendar";
import {
  CalendarDate,
  fromDate,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import { AmenityType, ReservationStatus } from "@prisma/client";
import { useMemo } from "react";

const amenityColors: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  GAZEBO: {
    bg: "bg-green-100 dark:bg-green-900/20",
    border: "border-green-500",
    text: "text-green-700 dark:text-green-300",
  },
  COURT: {
    bg: "bg-blue-100 dark:bg-blue-900/20",
    border: "border-blue-500",
    text: "text-blue-700 dark:text-blue-300",
  },
};

const amenityIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  GAZEBO: IconBuildingWarehouse,
  COURT: IconCalendar,
};

const formatTime = (time24: string) => {
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export function AmenityReservationCalendar() {
  const trpc = useTRPC();
  const timeZone = getLocalTimeZone();
  const [selectedDate, setSelectedDate] = React.useState<CalendarDate>(
    today(timeZone)
  );

  const { data: reservations } = useSuspenseQuery(
    trpc.amenityReservations.getMany.queryOptions()
  );

  // Prepare reservations map for calendar
  const reservationsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        date: string;
        reservations: Array<{
          amenity: string;
          startTime: string;
          endTime: string;
        }>;
      }
    >();
    reservations.forEach((reservation) => {
      if (reservation.amenity === "PARKING_AREA") return;
      const dateKey = format(new Date(reservation.date), "yyyy-MM-dd");
      if (!map.has(dateKey)) {
        map.set(dateKey, { date: dateKey, reservations: [] });
      }
      const entry = map.get(dateKey)!;
      entry.reservations.push({
        amenity: reservation.amenity,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
      });
    });
    return map;
  }, [reservations]);

  const eventsForSelectedDate = useMemo(() => {
    const dateKey = format(
      selectedDate.toDate(timeZone),
      "yyyy-MM-dd"
    );
    return reservations.filter((reservation) => {
      if (reservation.amenity === "PARKING_AREA") return false;
      const reservationDate = format(new Date(reservation.date), "yyyy-MM-dd");
      return reservationDate === dateKey;
    });
  }, [reservations, selectedDate, timeZone]);

  const formattedSelectedDate = format(
    selectedDate.toDate(timeZone),
    "MMMM d, yyyy"
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amenity Reservations</CardTitle>
        <CardDescription>
          View and manage amenity reservations by date
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CustomCalendar
          value={selectedDate}
          onChange={(date) => {
            if (date) {
              setSelectedDate(date as CalendarDate);
            }
          }}
          size="dashboard"
          reservations={reservationsMap}
          aria-label="Amenity reservation calendar"
        />

        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-semibold">
            Reservations for {formattedSelectedDate}
          </h4>
          {eventsForSelectedDate.length > 0 ? (
            <div className="space-y-2">
              {eventsForSelectedDate.map((reservation) => {
                const colors = amenityColors[reservation.amenity] || amenityColors.COURT;
                const IconComponent = amenityIcons[reservation.amenity] || IconCalendar;
                const statusMap: Record<ReservationStatus, "default" | "secondary" | "destructive"> = {
                  APPROVED: "default",
                  PENDING: "secondary",
                  REJECTED: "destructive",
                  CANCELLED: "destructive",
                };
                return (
                  <div
                    key={reservation.id}
                    className={`p-3 rounded-lg border ${colors.bg} ${colors.border} ${colors.text} border-2`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <IconComponent className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm capitalize">
                            {reservation.amenity.replace("_", " ")}
                          </p>
                          <p className="text-xs opacity-80 mt-0.5">
                            {reservation.fullName}
                          </p>
                          <p className="text-xs opacity-70 mt-0.5">
                            {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={statusMap[reservation.status]}
                        className="shrink-0 text-xs"
                      >
                        {reservation.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No reservations for this date
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap items-center gap-3 w-full">
          <span className="text-sm font-medium text-muted-foreground">
            Legend:
          </span>
          {Object.entries(amenityColors).map(([amenity, colors]) => {
            return (
              <div
                key={amenity}
                className="flex items-center gap-1.5 text-xs"
              >
                <div
                  className={`w-3 h-3 rounded-full ${colors.bg} ${colors.border} border`}
                />
                <span className="text-muted-foreground capitalize">
                  {amenity.replace("_", " ")}
                </span>
              </div>
            );
          })}
        </div>
      </CardFooter>
    </Card>
  );
}

