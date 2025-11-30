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
} from "@prisma/client";
import {
  MoreVertical,
  Edit,
  Archive,
  ArchiveRestore,
  WalletIcon,
  FileTextIcon,
  Printer,
  Eye,
} from "lucide-react";
import {
  useArchiveAmenityReservation,
  useUpdateReservationStatus,
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
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
      // Filter out PARKING_AREA
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

  const getAmenityColor = (amenity: AmenityType) => {
    switch (amenity) {
      case "COURT":
        return "bg-blue-500";
      case "GAZEBO":
        return "bg-green-500";
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
  const [newStatus, setNewStatus] = useState<ReservationStatus>(
    reservation.status
  );
  const [rejectionRemarks, setRejectionRemarks] = useState("");

  const archiveMutation = useArchiveAmenityReservation();
  const statusMutation = useUpdateReservationStatus();
  const { data: reservationData } = useSuspenseAmenityReservation(
    reservation.id
  );
  const amountToPay = reservationData?.amountToPay ?? 0;
  const amountPaid = reservationData?.amountPaid ?? 0;
  const paymentMethod = reservationData?.paymentMethod ?? "N/A";
  const proofUrl = reservationData?.receiptUrl ?? null;

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
      rejectionRemarks: newStatus === "REJECTED" ? rejectionRemarks : undefined,
    });
    setStatusChangeOpen(false);
    setRejectionRemarks("");
  };

  const formatCurrency = (value?: number | null) =>
    `₱${(value ?? 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const openReceiptWindow = (content: string) => {
    const printWindow = window.open("", "_blank", "width=720,height=900");
    if (!printWindow) {
      toast.error("Unable to open the receipt window. Please allow pop-ups.");
      return;
    }
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };

  const handlePrintReceipt = () => {
    if (!reservationData) return;
    const eventDate = format(new Date(reservationData.date), "MMMM d, yyyy");
    const generatedOn = format(new Date(), "PPpp");
    const outstanding = amountToPay - (reservationData.amountPaid ?? 0);

    const html = `
      <html>
        <body style="font-family:Arial,sans-serif;padding:32px;color:#111;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="margin:0;font-size:22px;">Promenade Residences</h1>
            <p style="margin:4px 0;font-size:12px;">Official Amenity Reservation Receipt</p>
            <h2 style="margin:12px 0 0;font-size:18px;">${reservationData.amenity} Reservation</h2>
          </div>
          <div style="margin-bottom:16px;font-size:12px;line-height:1.5;">
            <strong>Reservation ID:</strong> ${reservationData.id}<br/>
            <strong>Generated On:</strong> ${generatedOn}
          </div>
          <div style="margin-bottom:16px;font-size:12px;line-height:1.5;">
            <strong>Reservee:</strong> ${reservationData.fullName}<br/>
            <strong>User Type:</strong> ${reservationData.userType}<br/>
            <strong>Amenity:</strong> ${reservationData.amenity}<br/>
            <strong>Date & Time:</strong> ${eventDate}, ${reservationData.startTime} - ${reservationData.endTime}<br/>
            <strong>Guests:</strong> ${reservationData.numberOfGuests} pax
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;">
            <thead>
              <tr>
                <th style="text-align:left;border-bottom:1px solid #999;padding:6px;">Description</th>
                <th style="text-align:right;border-bottom:1px solid #999;padding:6px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:6px;border-bottom:1px solid #eee;">Reservation Fee</td>
                <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(amountToPay)}</td>
              </tr>
              <tr>
                <td style="padding:6px;border-bottom:1px solid #eee;">Amount Paid</td>
                <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(reservationData.amountPaid)}</td>
              </tr>
              <tr>
                <td style="padding:6px;border-bottom:1px solid #eee;">Outstanding Balance</td>
                <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(outstanding)}</td>
              </tr>
            </tbody>
          </table>
          <div style="font-size:12px;margin-bottom:4px;">
            <strong>Payment Method:</strong> ${paymentMethod}
          </div>
          <div style="font-size:12px;margin-bottom:16px;">
            <strong>Proof of Payment:</strong> ${
              reservationData.receiptUrl
                ? "Attached in system"
                : "Not submitted"
            }
          </div>
          <p style="font-size:11px;color:#555;margin-top:24px;">
            This is a system-generated receipt. Please keep a copy for your records.
          </p>
        </body>
      </html>
    `;

    openReceiptWindow(html);
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
              <DropdownMenuItem onSelect={() => router.push(`/admin/transactions/amenity-reservation/${reservation.id}/view`)}>
                <Eye className="h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push(`/admin/transactions/amenity-reservation/${reservation.id}`)}>
                <Edit className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusChangeOpen(true)}>
                <FileTextIcon className="size-4" />
                Change Status
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
        <div className="flex justify-between items-center gap-2 mt-2">
          {proofUrl ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(proofUrl, "_blank");
              }}
            >
              View proof of payment
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">
              Proof of payment not uploaded
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handlePrintReceipt();
            }}
          >
            <Printer className="h-4 w-4" />
            Print receipt
          </Button>
        </div>
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
          <div className="py-4 space-y-4">
            <div>
              <Label>Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => {
                  setNewStatus(value as ReservationStatus);
                  if (value !== "REJECTED") {
                    setRejectionRemarks("");
                  }
                }}
              >
                <SelectTrigger className="w-full mt-2">
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
            {newStatus === "REJECTED" && (
              <div>
                <Label htmlFor="rejectionRemarks">
                  Rejection Remarks <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="rejectionRemarks"
                  placeholder="Enter reason for rejection..."
                  value={rejectionRemarks}
                  onChange={(e) => setRejectionRemarks(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRejectionRemarks("");
                setStatusChangeOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={newStatus === "REJECTED" && !rejectionRemarks.trim()}
            >
              Update Status
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
