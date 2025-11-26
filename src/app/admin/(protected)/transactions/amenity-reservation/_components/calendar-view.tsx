"use client";

import { useState, useMemo } from "react";
import { CustomCalendar } from "@/components/custom-calendar";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  AmenityType,
  ReservationStatus,
  PaymentStatus,
} from "@/generated/prisma/enums";
import {
  MoreVertical,
  Edit,
  Archive,
  ArchiveRestore,
  WalletIcon,
  FileTextIcon,
} from "lucide-react";
import {
  useArchiveAmenityReservation,
  useUpdateReservationStatus,
  useUpdatePaymentStatus,
  useSuspenseAmenityReservation,
} from "@/features/amenity-reservations/hooks/use-amenity-reservations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';

type Reservation = {
  id: string;
  userType: string;
  fullName: string;
  amenity: AmenityType;
  date: Date;
  startTime: string;
  endTime: string;
  numberOfGuests: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  isArchived?: boolean;
};

type CalendarViewProps = {
  reservations: Reservation[];
};

export const CalendarView = ({ reservations }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<CalendarDate>(
    today(getLocalTimeZone())
  );

  // Group reservations by date
  const reservationsByDate = useMemo(() => {
    const grouped = new Map<string, Reservation[]>();
    reservations.forEach((reservation) => {
      const dateKey = format(new Date(reservation.date), "yyyy-MM-dd");
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(reservation);
    });
    return grouped;
  }, [reservations]);

  // Get reservations for selected date
  const selectedDateReservations = useMemo(() => {
    const dateKey = format(
      selectedDate.toDate(getLocalTimeZone()),
      "yyyy-MM-dd"
    );
    return reservationsByDate.get(dateKey) || [];
  }, [selectedDate, reservationsByDate]);

  // Prepare reservations map for calendar indicators
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

  const getAmenityColor = (amenity: AmenityType) => {
    switch (amenity) {
      case "COURT":
        return "bg-blue-500";
      case "GAZEBO":
        return "bg-green-500";
      case "PARKING_AREA":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "REJECTED":
        return "bg-red-500";
      case "CANCELLED":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_600px] gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Reservation Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <CustomCalendar
              value={selectedDate}
              onChange={(date) => setSelectedDate(date as CalendarDate)}
              minValue={today(getLocalTimeZone())}
              size="reservation-admin"
              reservations={reservationsMap}
            />
            {/* Legend */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Legend:</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Court</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Gazebo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Parking Area</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Reservations -{" "}
            {format(selectedDate.toDate(getLocalTimeZone()), "MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateReservations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reservations for this date
            </p>
          ) : (
            <div className="space-y-4">
              {selectedDateReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  getAmenityColor={getAmenityColor}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ReservationCard = ({
  reservation,
  getAmenityColor,
  getStatusColor,
}: {
  reservation: Reservation;
  getAmenityColor: (amenity: AmenityType) => string;
  getStatusColor: (status: ReservationStatus) => string;
}) => {
  const router = useRouter();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [paymentStatusChangeOpen, setPaymentStatusChangeOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ReservationStatus>(
    reservation.status
  );
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>(
    reservation.paymentStatus
  );

  const archiveMutation = useArchiveAmenityReservation();
  const statusMutation = useUpdateReservationStatus();
  const paymentStatusMutation = useUpdatePaymentStatus();
  const { data: reservationData } = useSuspenseAmenityReservation(
    reservation.id
  );

  const handleArchive = () => {
    archiveMutation.mutate({
      id: reservation.id,
      isArchived: !reservation.isArchived,
    });
    setArchiveOpen(false);
  };

  const handleStatusChange = () => {
    statusMutation.mutate({
      id: reservation.id,
      status: newStatus,
    });
    setStatusChangeOpen(false);
  };

  const handlePaymentStatusChange = () => {
    paymentStatusMutation.mutate({
      id: reservation.id,
      paymentStatus: newPaymentStatus,
      amountPaid:
        newPaymentStatus === "PAID" ? reservationData.amountToPay : undefined,
    });
    setPaymentStatusChangeOpen(false);
  };

  return (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              getAmenityColor(reservation.amenity)
            )}
          />
          <span className="font-semibold capitalize">
            {reservation.amenity}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn("text-xs", getStatusColor(reservation.status))}>
            {reservation.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push(`/admin/transactions/amenity-reservation/${reservation.id}`)}>
                <Edit className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusChangeOpen(true)}>
                <FileTextIcon className="size-4" />
                Change Status
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setPaymentStatusChangeOpen(true)}
              >
                <WalletIcon className="size-4" />
                Change Payment Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
                {reservation.isArchived ? (
                  <>
                    <ArchiveRestore className="h-4 w-4" />
                    Retrieve
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />
                    Archive
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="text-sm space-y-1">
        <p>
          <span className="font-medium">Time:</span> {reservation.startTime} -{" "}
          {reservation.endTime}
        </p>
        <p>
          <span className="font-medium">Reservee:</span> {reservation.fullName}{" "}
          ({reservation.userType})
        </p>
        <p>
          <span className="font-medium">Guests:</span>{" "}
          {reservation.numberOfGuests} pax
        </p>
        <p>
          <span className="font-medium">Payment:</span>{" "}
          <Badge
            variant="outline"
            className={cn(
              reservation.paymentStatus === "PAID"
                ? "border-green-500 text-green-700"
                : "border-yellow-500 text-yellow-700"
            )}
          >
            {reservation.paymentStatus}
          </Badge>
        </p>
      </div>

      {/* Status Change Dialog */}
      <AlertDialog open={statusChangeOpen} onOpenChange={setStatusChangeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Reservation Status</AlertDialogTitle>
            <AlertDialogDescription>
              Select the new status for this reservation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select
              value={newStatus}
              onValueChange={(value) =>
                setNewStatus(value as ReservationStatus)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange}>
              Update Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Status Change Dialog */}
      <AlertDialog
        open={paymentStatusChangeOpen}
        onOpenChange={setPaymentStatusChangeOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Payment Status</AlertDialogTitle>
            <AlertDialogDescription>
              Select the new payment status for this reservation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select
              value={newPaymentStatus}
              onValueChange={(value) =>
                setNewPaymentStatus(value as PaymentStatus)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePaymentStatusChange}>
              Update Payment Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive/Retrieve Confirmation Dialog */}
      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reservation.isArchived
                ? "Retrieve Reservation?"
                : "Archive Reservation?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reservation.isArchived
                ? "This will restore the reservation and make it visible again."
                : "This will archive the reservation. It will be hidden from the main view but can be retrieved later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              {reservation.isArchived ? "Retrieve" : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
