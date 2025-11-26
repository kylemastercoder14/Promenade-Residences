"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@prisma/client";
import {
  MoreVertical,
  Edit,
  ArchiveRestore,
  WalletIcon,
  FileTextIcon,
} from "lucide-react";
import { ReservationForm } from "@/features/amenity-reservations/components/form";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

type ArchivedReservationsViewProps = {
  reservations: Reservation[];
};

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

const ArchivedReservationRow = ({
  reservation,
}: {
  reservation: Reservation;
}) => {
  const [editOpen, setEditOpen] = useState(false);
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
      isArchived: false, // Retrieve
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
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                getAmenityColor(reservation.amenity)
              )}
            />
            <span className="font-medium capitalize">
              {reservation.amenity.replace("_", " ")}
            </span>
          </div>
        </TableCell>
        <TableCell>{reservation.fullName}</TableCell>
        <TableCell>{reservation.userType}</TableCell>
        <TableCell>
          {format(new Date(reservation.date), "MMM d, yyyy")}
        </TableCell>
        <TableCell>
          {reservation.startTime} - {reservation.endTime}
        </TableCell>
        <TableCell>{reservation.numberOfGuests} pax</TableCell>
        <TableCell>
          <Badge className={cn("text-xs", getStatusColor(reservation.status))}>
            {reservation.status}
          </Badge>
        </TableCell>
        <TableCell>
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
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Reservation</DialogTitle>
                  </DialogHeader>
                  <ReservationForm
                    initialData={reservationData}
                    onSuccess={() => setEditOpen(false)}
                  />
                </DialogContent>
              </Dialog>
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
                <ArchiveRestore className="h-4 w-4" />
                Retrieve
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Reservation</DialogTitle>
          </DialogHeader>
          <ReservationForm
            initialData={reservationData}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

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

      {/* Retrieve Confirmation Dialog */}
      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retrieve Reservation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the reservation and make it visible in the active
              reservations view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Retrieve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const ArchivedReservationsView = ({
  reservations,
}: ArchivedReservationsViewProps) => {
  if (reservations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center py-8">
            No archived reservations found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Archived Reservations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amenity</TableHead>
                <TableHead>Reservee</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <ArchivedReservationRow
                  key={reservation.id}
                  reservation={reservation}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

