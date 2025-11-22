"use client";

import * as React from "react";

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
  IconMapPin,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { CustomCalendar } from "@/components/custom-calendar";
import {
  CalendarDate,
  fromDate,
  getLocalTimeZone,
  today,
} from "@internationalized/date";

type Reservation = {
  id: string;
  date: Date;
  amenity: "Clubhouse" | "Parking Area" | "Basketball Court";
  resident: string;
  timeSlot: string;
  status: "Approved" | "Pending" | "Cancelled";
};

const amenityColors: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  "Clubhouse": {
    bg: "bg-blue-100 dark:bg-blue-900/20",
    border: "border-blue-500",
    text: "text-blue-700 dark:text-blue-300",
  },
  "Parking Area": {
    bg: "bg-green-100 dark:bg-green-900/20",
    border: "border-green-500",
    text: "text-green-700 dark:text-green-300",
  },
  "Basketball Court": {
    bg: "bg-orange-100 dark:bg-orange-900/20",
    border: "border-orange-500",
    text: "text-orange-700 dark:text-orange-300",
  },
};

const amenityIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "Clubhouse": IconBuildingWarehouse,
  "Parking Area": IconMapPin,
  "Basketball Court": IconCalendar,
};

// Sample reservations data
const sampleReservations: Reservation[] = [
  {
    id: "1",
    date: new Date(2025, 10, 22), // November 22, 2025
    amenity: "Clubhouse",
    resident: "John Doe",
    timeSlot: "10:00 AM - 2:00 PM",
    status: "Approved",
  },
  {
    id: "2",
    date: new Date(2025, 10, 23),
    amenity: "Parking Area",
    resident: "Jane Smith",
    timeSlot: "3:00 PM - 5:00 PM",
    status: "Approved",
  },
  {
    id: "3",
    date: new Date(2025, 10, 24),
    amenity: "Basketball Court",
    resident: "Mike Johnson",
    timeSlot: "6:00 PM - 8:00 PM",
    status: "Pending",
  },
  {
    id: "4",
    date: new Date(2025, 10, 21),
    amenity: "Clubhouse",
    resident: "Sarah Williams",
    timeSlot: "1:00 PM - 4:00 PM",
    status: "Approved",
  },
  {
    id: "5",
    date: new Date(2025, 10, 22),
    amenity: "Parking Area",
    resident: "David Brown",
    timeSlot: "9:00 AM - 12:00 PM",
    status: "Approved",
  },
];

export function AmenityReservationCalendar() {
  const timeZone = getLocalTimeZone();
  const [selectedDate, setSelectedDate] = React.useState<CalendarDate>(
    today(timeZone)
  );

  const eventsForSelectedDate = sampleReservations.filter((reservation) => {
    const reservationDate = fromDate(reservation.date, timeZone);
    return (
      reservationDate.year === selectedDate.year &&
      reservationDate.month === selectedDate.month &&
      reservationDate.day === selectedDate.day
    );
  });

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
          minValue={today(timeZone)}
          value={selectedDate}
          onChange={(date) => {
            if (date) {
              setSelectedDate(date as CalendarDate);
            }
          }}
          aria-label="Amenity reservation calendar"
        />

        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-semibold">
            Reservations for {formattedSelectedDate}
          </h4>
          {eventsForSelectedDate.length > 0 ? (
            <div className="space-y-2">
              {eventsForSelectedDate.map((reservation) => {
                const colors = amenityColors[reservation.amenity];
                const IconComponent = amenityIcons[reservation.amenity];
                return (
                  <div
                    key={reservation.id}
                    className={`p-3 rounded-lg border ${colors.bg} ${colors.border} ${colors.text} border-2`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <IconComponent className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {reservation.amenity}
                          </p>
                          <p className="text-xs opacity-80 mt-0.5">
                            {reservation.resident}
                          </p>
                          <p className="text-xs opacity-70 mt-0.5">
                            {reservation.timeSlot}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          reservation.status === "Approved"
                            ? "default"
                            : reservation.status === "Pending"
                            ? "secondary"
                            : "destructive"
                        }
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
                <span className="text-muted-foreground">{amenity}</span>
              </div>
            );
          })}
        </div>
      </CardFooter>
    </Card>
  );
}

