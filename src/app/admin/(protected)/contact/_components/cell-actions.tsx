"use client";

import { Contact, ContactStatus } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Archive, CheckCircle2, Clock, Eye } from "lucide-react";
import { useUpdateContactStatus, useArchiveContact } from "@/features/contact/hooks/use-contact";
import { useRouter } from "next/navigation";

export const CellActions = ({ contact }: { contact: Contact }) => {
  const router = useRouter();
  const updateStatus = useUpdateContactStatus();
  const archiveContact = useArchiveContact();

  const handleStatusUpdate = (status: ContactStatus) => {
    updateStatus.mutate({
      id: contact.id,
      status,
    });
  };

  const handleArchive = () => {
    archiveContact.mutate({
      id: contact.id,
      isArchived: true,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push(`/admin/contact/${contact.id}`)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleStatusUpdate("NEW")}
          disabled={contact.status === "NEW"}
        >
          <Clock className="mr-2 h-4 w-4" />
          Mark as New
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusUpdate("IN_REVIEW")}
          disabled={contact.status === "IN_REVIEW"}
        >
          <Clock className="mr-2 h-4 w-4" />
          Mark as In Review
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusUpdate("RESOLVED")}
          disabled={contact.status === "RESOLVED"}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Mark as Resolved
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleArchive}>
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

