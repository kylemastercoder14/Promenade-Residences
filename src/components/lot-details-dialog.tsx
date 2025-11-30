"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, User, Home } from "lucide-react";
interface Resident {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  contactNumber: string;
  emailAddress: string | null;
  typeOfResidency: string;
  isHead: boolean;
}

interface LotDetails {
  id: string;
  blockNo: string;
  lotNo: string | null;
  street: string;
  lotSize: number;
  houseType: string;
  minPrice: number;
  maxPrice: number;
  paymentMethod: string;
  availability: string;
  notes: string | null;
  residents: Resident[];
}

interface LotDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lotDetails: LotDetails | null;
  isLoading?: boolean;
  blockNo?: string | null;
  lotNo?: string | null;
}

const formatAvailabilityStatus = (availability: string): string => {
  const status = availability.toUpperCase();
  if (status.includes("AVAILABLE") || status.includes("VACANT")) {
    return "Available";
  }
  if (status.includes("OCCUPIED")) {
    return "Occupied";
  }
  if (status.includes("RENT") || status.includes("FOR RENT")) {
    return "For Rent";
  }
  if (status.includes("SALE") || status.includes("FOR SALE")) {
    return "For Sale";
  }
  if (status.includes("RESERVED")) {
    return "Reserved";
  }
  if (status.includes("SOLD")) {
    return "Sold";
  }
  return availability;
};

const getAvailabilityBadgeVariant = (availability: string): "default" | "secondary" | "destructive" | "outline" => {
  const status = availability.toUpperCase();
  if (status.includes("AVAILABLE") || status.includes("VACANT")) {
    return "default";
  }
  if (status.includes("OCCUPIED")) {
    return "secondary";
  }
  if (status.includes("RENT") || status.includes("FOR RENT")) {
    return "outline";
  }
  if (status.includes("SALE") || status.includes("FOR SALE")) {
    return "outline";
  }
  if (status.includes("RESERVED")) {
    return "secondary";
  }
  if (status.includes("SOLD")) {
    return "destructive";
  }
  return "outline";
};

export const LotDetailsDialog = ({ open, onOpenChange, lotDetails, isLoading, blockNo, lotNo }: LotDetailsDialogProps) => {
  // Use provided block/lot or fall back to lotDetails
  const displayBlockNo = blockNo || lotDetails?.blockNo || "";
  const displayLotNo = lotNo || lotDetails?.lotNo || null;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-[#1f5c34]" />
              Block {displayBlockNo}
              {displayLotNo && `, Lot ${displayLotNo}`}
            </DialogTitle>
            <DialogDescription>Loading lot information...</DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!lotDetails) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-[#1f5c34]" />
              Block {displayBlockNo}
              {displayLotNo && `, Lot ${displayLotNo}`}
            </DialogTitle>
            <DialogDescription>
              {lotDetails?.street || "Lot information"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="py-4 text-center text-sm text-muted-foreground">
              This lot is not registered in the system.
            </div>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#1f5c34] flex items-center gap-2">
                <MapPin className="size-4" />
                Location
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Block:</span>
                  <p className="font-medium">{displayBlockNo}</p>
                </div>
                {displayLotNo && (
                  <div>
                    <span className="text-muted-foreground">Lot:</span>
                    <p className="font-medium">{displayLotNo}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const headOfHousehold = lotDetails.residents.find((r) => r.isHead);
  const otherResidents = lotDetails.residents.filter((r) => !r.isHead);

  const formatName = (resident: Resident) => {
    const parts = [resident.firstName];
    if (resident.middleName) parts.push(resident.middleName);
    parts.push(resident.lastName);
    if (resident.suffix) parts.push(resident.suffix);
    return parts.join(" ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-5 text-[#1f5c34]" />
            Block {lotDetails.blockNo}
            {lotDetails.lotNo && `, Lot ${lotDetails.lotNo}`}
          </DialogTitle>
          <DialogDescription>{lotDetails.street}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <Badge variant={getAvailabilityBadgeVariant(lotDetails.availability)}>
              {formatAvailabilityStatus(lotDetails.availability)}
            </Badge>
          </div>

          <Separator />

          {/* Property Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#1f5c34] flex items-center gap-2">
              <Home className="size-4" />
              Property Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Lot Size:</span>
                <p className="font-medium">{lotDetails.lotSize} sqm</p>
              </div>
              <div>
                <span className="text-muted-foreground">House Type:</span>
                <p className="font-medium">{lotDetails.houseType}</p>
              </div>
              {lotDetails.minPrice > 0 && (
                <div>
                  <span className="text-muted-foreground">Price Range:</span>
                  <p className="font-medium">
                    ₱{lotDetails.minPrice.toLocaleString()}
                    {lotDetails.maxPrice > lotDetails.minPrice && ` - ₱${lotDetails.maxPrice.toLocaleString()}`}
                  </p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Payment Method:</span>
                <p className="font-medium">{lotDetails.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Owner/Resident Information */}
          {lotDetails.residents.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#1f5c34] flex items-center gap-2">
                  <User className="size-4" />
                  {headOfHousehold ? "Owner/Resident" : "Residents"}
                </h3>
                {headOfHousehold && (
                  <div className="rounded-lg border border-[#e4e7de] bg-[#f9faf7] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{formatName(headOfHousehold)}</p>
                      <Badge variant="outline" className="text-xs">
                        {headOfHousehold.typeOfResidency === "RESIDENT" ? "Owner" : "Tenant"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="size-3" />
                      <span>{headOfHousehold.contactNumber}</span>
                    </div>
                    {headOfHousehold.emailAddress && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="size-3" />
                        <span>{headOfHousehold.emailAddress}</span>
                      </div>
                    )}
                  </div>
                )}
                {otherResidents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Other Household Members:</p>
                    {otherResidents.map((resident) => (
                      <div key={resident.id} className="rounded-lg border border-[#e4e7de] bg-white p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{formatName(resident)}</p>
                          <Badge variant="outline" className="text-xs">
                            {resident.typeOfResidency === "RESIDENT" ? "Owner" : "Tenant"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Phone className="size-3" />
                          <span>{resident.contactNumber}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Notes */}
          {lotDetails.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#1f5c34]">Notes</h3>
                <p className="text-sm text-muted-foreground">{lotDetails.notes}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

