"use client";

import React from "react";

import {
  EditIcon,
  MoreHorizontal,
  ArchiveIcon,
  RefreshCwIcon,
  EyeIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { VehicleRegistration } from "@prisma/client";
import { toast } from "sonner";
import {
  useArchiveOrRetrieveVehicleRegistration,
  useApproveVehicleRegistration,
  useRejectVehicleRegistration,
} from "@/features/vehicle-registrations/hooks/use-vehicle-registrations";
import AlertModal from "@/components/alert-modal";

const CellActions = ({ vehicle }: { vehicle: VehicleRegistration }) => {
  const router = useRouter();
  const [openArchive, setOpenArchive] = React.useState(false);
  const [openReject, setOpenReject] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const archiveOrRetrieve = useArchiveOrRetrieveVehicleRegistration();
  const approve = useApproveVehicleRegistration();
  const reject = useRejectVehicleRegistration();

  const status = (vehicle as any).status || "PENDING";
  const isPending = status === "PENDING" && !vehicle.isArchived;

  async function handleArchive() {
    archiveOrRetrieve.mutate(
      {
        id: vehicle.id,
        isArchived: !vehicle.isArchived,
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      }
    );
  }

  async function handleApprove() {
    approve.mutate(
      { id: vehicle.id },
      {
        onSuccess: () => {
          router.refresh();
        },
      }
    );
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    reject.mutate(
      {
        id: vehicle.id,
        rejectionReason: rejectionReason.trim(),
      },
      {
        onSuccess: () => {
          setRejectionReason("");
          setOpenReject(false);
          router.refresh();
        },
      }
    );
  }

  return (
    <>
      <AlertModal
        onConfirm={handleArchive}
        title={vehicle.isArchived ? "Retrieve Vehicle Registration" : "Archive Vehicle Registration"}
        description={`You are about to ${vehicle.isArchived ? "retrieve" : "archive"} this vehicle registration. This action cannot be undone.`}
        isOpen={openArchive}
        onClose={() => setOpenArchive(false)}
      />
      <Dialog open={openReject} onOpenChange={setOpenReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vehicle Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this vehicle registration. This reason will be saved and visible to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenReject(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={reject.isPending}>
              {reject.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex items-center gap-2 ml-2.5">
        {isPending && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleApprove}
              disabled={approve.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Approve</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setOpenReject(true)}
              disabled={reject.isPending}
            >
              <XCircle className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Reject</span>
            </Button>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => router.push(`/admin/vehicle-registrations/${vehicle.id}/view`)}
            >
              <EyeIcon className="size-4" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push(`/admin/vehicle-registrations/${vehicle.id}`)}
            >
              <EditIcon className="size-4" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {vehicle.isArchived ? (
              <DropdownMenuItem onClick={() => setOpenArchive(true)}>
                <RefreshCwIcon className="size-4" />
                Retrieve
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setOpenArchive(true)}>
                <ArchiveIcon className="size-4" />
                Archive
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};

export default CellActions;

