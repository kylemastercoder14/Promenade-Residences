"use client";

import React from "react";

import {
  EditIcon,
  MoreHorizontal,
  ArchiveIcon,
  RefreshCwIcon,
  EyeIcon,
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
import { useRouter } from "next/navigation";
import { VehicleRegistration } from "@prisma/client";
import { toast } from "sonner";
import { useArchiveOrRetrieveVehicleRegistration } from "@/features/vehicle-registrations/hooks/use-vehicle-registrations";
import AlertModal from "@/components/alert-modal";

const CellActions = ({ vehicle }: { vehicle: VehicleRegistration }) => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const archiveOrRetrieve = useArchiveOrRetrieveVehicleRegistration();

  async function handleAction() {
    archiveOrRetrieve.mutate(
      {
        id: vehicle.id,
        isArchived: !vehicle.isArchived,
      },
      {
        onSuccess: () => {
          toast.success(
            `Vehicle registration ${vehicle.isArchived ? "retrieved" : "archived"} successfully`
          );
          router.refresh();
        },
        onError: (error) => {
          toast.error(
            `Failed to ${vehicle.isArchived ? "retrieve" : "archive"} vehicle registration: ${error.message}`
          );
        },
      }
    );
  }
  return (
    <>
      <AlertModal
        onConfirm={handleAction}
        title={vehicle.isArchived ? "Retrieve Vehicle Registration" : "Archive Vehicle Registration"}
        description={`You are about to ${vehicle.isArchived ? "retrieve" : "archive"} this vehicle registration. This action cannot be undone.`}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 ml-2.5">
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
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <RefreshCwIcon className="size-4" />
              Retrieve
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <ArchiveIcon className="size-4" />
              Archive
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellActions;

