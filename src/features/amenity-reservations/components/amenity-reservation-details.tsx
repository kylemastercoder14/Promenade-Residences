"use client";

import { useSuspenseAmenityReservation } from "@/features/amenity-reservations/hooks/use-amenity-reservations";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Image as ImageIcon, FileText } from "lucide-react";
import Heading from "@/components/heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  AmenityType,
  ReservationStatus,
  PaymentStatus,
  PaymentMethod,
} from "@prisma/client";

const formatAmenity = (amenity: AmenityType) => {
  switch (amenity) {
    case "COURT":
      return "Basketball Court";
    case "GAZEBO":
      return "Gazebo";
    case "PARKING_AREA":
      return "Parking Area";
    default:
      return amenity;
  }
};

const formatUserType = (userType: string) => {
  switch (userType) {
    case "RESIDENT":
      return "Resident";
    case "TENANT":
      return "Tenant";
    case "VISITOR":
      return "Visitor";
    default:
      return userType;
  }
};

const formatPaymentMethod = (method: PaymentMethod | null | undefined) => {
  if (!method) return "Not specified";
  switch (method) {
    case "CASH":
      return "Cash";
    case "GCASH":
      return "GCash";
    case "MAYA":
      return "Maya";
    case "OTHER_BANK":
      return "Bank Transfer";
    default:
      return method;
  }
};

const getStatusColor = (status: ReservationStatus) => {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "CANCELLED":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getPaymentStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case "PAID":
      return "border-green-500 text-green-700";
    case "PENDING":
      return "border-yellow-500 text-yellow-700";
    case "REFUNDED":
      return "border-blue-500 text-blue-700";
    default:
      return "border-gray-500 text-gray-700";
  }
};

const isImageFile = (url: string) => {
  const extension = url.split(".").pop()?.toLowerCase();
  const imageExtensions = ["png", "jpg", "jpeg", "svg", "webp", "avif", "gif"];
  return extension && imageExtensions.includes(extension);
};

const renderAttachment = (url: string, alt: string) => {
  if (isImageFile(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <div className="relative w-32 h-32 border rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
          <Image
            src={url}
            alt={alt}
            fill
            className="object-cover"
          />
        </div>
      </a>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
    >
      <FileText className="size-4" />
      <span className="text-sm font-medium">View Document</span>
    </a>
  );
};

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return "₱0.00";
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const AmenityReservationDetails = ({
  amenityReservationId,
}: {
  amenityReservationId: string;
}) => {
  const router = useRouter();
  const { data: reservation } = useSuspenseAmenityReservation(
    amenityReservationId
  );

  return (
    <div>
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} variant="outline" size="icon">
          <ArrowLeft className="size-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <Heading
          title="Amenity Reservation Details"
          description="View complete reservation information"
        />
        <div className="ml-auto">
          <Button
            onClick={() =>
              router.push(
                `/admin/transactions/amenity-reservation/${reservation.id}`
              )
            }
            variant="primary"
            size="sm"
          >
            <Edit className="size-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="mt-5 space-y-6">
        {/* Reservation Information */}
        <Card>
          <CardHeader>
            <CardTitle>Reservation Information</CardTitle>
            <CardDescription>Basic reservation details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amenity</p>
                <Badge variant="secondary" className="mt-1">
                  {formatAmenity(reservation.amenity)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">
                  {format(new Date(reservation.date), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-semibold">
                  {reservation.startTime} - {reservation.endTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Number of Guests</p>
                <p className="font-semibold">{reservation.numberOfGuests} pax</p>
              </div>
              {reservation.purpose && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="font-semibold">{reservation.purpose}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reservee Information */}
        <Card>
          <CardHeader>
            <CardTitle>Reservee Information</CardTitle>
            <CardDescription>Reservation holder details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-semibold">{reservation.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User Type</p>
                <Badge variant="secondary">
                  {formatUserType(reservation.userType)}
                </Badge>
              </div>
              {reservation.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{reservation.email}</p>
                </div>
              )}
              {reservation.user && (
                <div>
                  <p className="text-sm text-muted-foreground">Account</p>
                  <p className="font-semibold">{reservation.user.name || reservation.user.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Payment details and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-semibold">
                  {formatPaymentMethod(reservation.paymentMethod)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                <p className="font-semibold">
                  {formatCurrency(reservation.amountToPay)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="font-semibold">
                  {formatCurrency(reservation.amountPaid)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "mt-1",
                    getPaymentStatusColor(reservation.paymentStatus)
                  )}
                >
                  {reservation.paymentStatus}
                </Badge>
              </div>
              {reservation.proofOfPayment && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Proof of Payment
                  </p>
                  {renderAttachment(
                    reservation.proofOfPayment,
                    "Proof of Payment"
                  )}
                </div>
              )}
              {reservation.receiptUrl && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Receipt
                  </p>
                  {renderAttachment(reservation.receiptUrl, "Receipt")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>Status Information</CardTitle>
            <CardDescription>Reservation and payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Reservation Status</p>
                <Badge
                  className={cn("mt-1 text-xs capitalize", getStatusColor(reservation.status))}
                >
                  {reservation.status.toLowerCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Archived</p>
                <Badge variant={reservation.isArchived ? "destructive" : "default"}>
                  {reservation.isArchived ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
            <CardDescription>System information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-semibold">
                  {format(
                    new Date(reservation.createdAt),
                    "MMM dd, yyyy 'at' hh:mm a"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-semibold">
                  {format(
                    new Date(reservation.updatedAt),
                    "MMM dd, yyyy 'at' hh:mm a"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

