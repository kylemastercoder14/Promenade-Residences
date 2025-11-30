"use client";

import React from "react";

import {
  EditIcon,
  MoreHorizontal,
  ArchiveIcon,
  RefreshCwIcon,
  CheckIcon,
  XIcon,
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
import { User } from "@prisma/client";
import { toast } from "sonner";
import { useArchiveOrRetrieveAccount, useApproveOrRejectAccount } from "@/features/accounts/hooks/use-accounts";
import AlertModal from "@/components/alert-modal";

const CellActions = ({ user }: { user: User }) => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [approveOpen, setApproveOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const archiveOrRetrieve = useArchiveOrRetrieveAccount();
  const approveOrReject = useApproveOrRejectAccount();

  async function handleAction() {
    archiveOrRetrieve.mutate(
      {
        id: user.id,
        isArchived: !user.isArchived,
      },
      {
        onSuccess: () => {
          toast.success(
            `Account ${user.isArchived ? "retrieved" : "archived"} successfully`
          );
          router.refresh();
        },
        onError: (error) => {
          toast.error(
            `Failed to ${user.isArchived ? "retrieve" : "archive"} account: ${error.message}`
          );
        },
      }
    );
  }

  async function handleApprove() {
    approveOrReject.mutate(
      {
        id: user.id,
        isApproved: true,
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      }
    );
  }

  async function handleReject() {
    approveOrReject.mutate(
      {
        id: user.id,
        isApproved: false,
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      }
    );
  }
  return (
    <>
      <AlertModal
        onConfirm={handleAction}
        title={user.isArchived ? "Retrieve Account" : "Archive Account"}
        description={`You are about to ${user.isArchived ? "retrieve" : "archive"} this account. This action cannot be undone.`}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
      <AlertModal
        onConfirm={handleApprove}
        title="Approve Account"
        description="Are you sure you want to approve this account? The user will be able to access the system."
        isOpen={approveOpen}
        onClose={() => setApproveOpen(false)}
      />
      <AlertModal
        onConfirm={handleReject}
        title="Reject Account"
        description="Are you sure you want to reject this account? The user will not be able to access the system."
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
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
            onClick={() => router.push(`/admin/accounts/${user.id}`)}
          >
            <EditIcon className="size-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {!user.isApproved && (
            <>
              <DropdownMenuItem onClick={() => setApproveOpen(true)}>
                <CheckIcon className="size-4" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRejectOpen(true)}>
                <XIcon className="size-4" />
                Reject
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {user.isArchived ? (
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
