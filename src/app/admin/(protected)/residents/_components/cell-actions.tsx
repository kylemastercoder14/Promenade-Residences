"use client";

import React from "react";

import {
  EditIcon,
  MoreHorizontal,
  ArchiveIcon,
  RefreshCwIcon,
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
import { Resident } from "@prisma/client";
import { toast } from "sonner";
import { useArchiveOrRetrieveResident } from "@/features/residents/hooks/use-residents";
import AlertModal from "@/components/alert-modal";

const CellActions = ({ resident }: { resident: Resident }) => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const archiveOrRetrieve = useArchiveOrRetrieveResident();

  async function handleAction() {
    archiveOrRetrieve.mutate(
      {
        id: resident.id,
        isArchived: !resident.isArchived,
      },
      {
        onSuccess: () => {
          toast.success(
            `Resident ${resident.isArchived ? "retrieved" : "archived"} successfully`
          );
          router.refresh();
        },
        onError: (error) => {
          toast.error(
            `Failed to ${resident.isArchived ? "retrieve" : "archive"} resident: ${error.message}`
          );
        },
      }
    );
  }
  return (
    <>
      <AlertModal
        onConfirm={handleAction}
        title={resident.isArchived ? "Retrieve Resident" : "Archive Resident"}
        description={`You are about to ${resident.isArchived ? "retrieve" : "archive"} this resident. This action cannot be undone.`}
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
            onClick={() => router.push(`/admin/residents/${resident.id}`)}
          >
            <EditIcon className="size-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {resident.isArchived ? (
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

