"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Loading } from "@/components/loading";
import { useSuspenseVehicleRegistration } from "@/features/vehicle-registrations/hooks/use-vehicle-registrations";
import { VehicleRegistration } from "@prisma/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
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
import { FileText, ExternalLink } from "lucide-react";

const getResidentFullName = (resident: {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
} | null) => {
  if (!resident) return "N/A";
  const parts = [
    resident.firstName,
    resident.middleName,
    resident.lastName,
    resident.suffix,
  ].filter(Boolean);
  return parts.join(" ");
};

const formatPaymentMethod = (method: string | null | undefined) => {
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

const formatVehicleType = (type: string) => {
  switch (type) {
    case "SEDAN":
      return "Sedan";
    case "SUV":
      return "SUV";
    case "TRUCK":
      return "Truck";
    case "MOTORCYCLE":
      return "Motorcycle";
    default:
      return type;
  }
};

const formatRelationship = (relationship: string) => {
  switch (relationship) {
    case "OWNER":
      return "Owner";
    case "FAMILY_MEMBER":
      return "Family Member";
    case "COMPANY_DRIVER":
      return "Company Driver";
    default:
      return relationship;
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
      <ExternalLink className="size-3" />
    </a>
  );
};

export const VehicleRegistrationDetails = ({
  vehicleRegistrationId,
}: {
  vehicleRegistrationId: string;
}) => {
  const router = useRouter();
  const { data: vehicle } = useSuspenseVehicleRegistration(vehicleRegistrationId);

  return (
    <div>
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} variant="outline" size="icon">
          <ArrowLeft className="size-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <Heading
          title="Vehicle Registration Details"
          description="View complete vehicle registration information"
        />
        <div className="ml-auto">
          <Button
            onClick={() => router.push(`/admin/vehicle-registrations/${vehicle.id}`)}
            variant="primary"
            size="sm"
          >
            <Edit className="size-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="mt-5 space-y-6">
        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
            <CardDescription>Basic vehicle details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Brand</p>
                <p className="font-semibold">{vehicle.brand}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Model</p>
                <p className="font-semibold">{vehicle.model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year of Manufacture</p>
                <p className="font-semibold">{vehicle.yearOfManufacture}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Color</p>
                <p className="font-semibold">{vehicle.color}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plate Number</p>
                <p className="font-semibold">{vehicle.plateNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle Type</p>
                <Badge variant="secondary">{formatVehicleType(vehicle.vehicleType)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Information */}
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
            <CardDescription>License and relationship details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">License Number</p>
                <p className="font-semibold">{vehicle.licenseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiry Date</p>
                <p className="font-semibold">
                  {format(new Date(vehicle.expiryDate), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Relationship to Vehicle</p>
                <Badge variant="secondary">
                  {formatRelationship(vehicle.relationshipToVehicle)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registered To</p>
                <p className="font-semibold">
                  {getResidentFullName(vehicle.resident)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        {(vehicle.paymentMethod || vehicle.proofOfPayment) && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Payment method and proof</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-semibold">
                    {formatPaymentMethod(vehicle.paymentMethod)}
                  </p>
                </div>
                {vehicle.proofOfPayment && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Proof of Payment</p>
                    {renderAttachment(vehicle.proofOfPayment, "Proof of Payment")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attachments */}
        {(vehicle.orAttachment || vehicle.crAttachment) && (
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
              <CardDescription>Official documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicle.orAttachment && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Official Receipt (OR)</p>
                    {renderAttachment(vehicle.orAttachment, "Official Receipt")}
                  </div>
                )}
                {vehicle.crAttachment && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Certificate of Registration (CR)
                    </p>
                    {renderAttachment(vehicle.crAttachment, "Certificate of Registration")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Registration Details</CardTitle>
            <CardDescription>System information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Registration Date</p>
                <p className="font-semibold">
                  {format(new Date(vehicle.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-semibold">
                  {format(new Date(vehicle.updatedAt), "MMM dd, yyyy 'at' hh:mm a")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={vehicle.isArchived ? "destructive" : "default"}>
                  {vehicle.isArchived ? "Archived" : "Active"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

