"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MailIcon, PhoneIcon, CalendarIcon } from "lucide-react";
import { ContactStatus } from "@prisma/client";
import { useUpdateContactStatus } from "@/features/contact/hooks/use-contact";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

const statusStyles: Record<
  ContactStatus,
  { label: string; className: string }
> = {
  NEW: {
    label: "New",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  },
  RESOLVED: {
    label: "Resolved",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100",
  },
  CLOSED: {
    label: "Closed",
    className:
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
  },
};

export const ContactDetails = ({ contactId }: { contactId: string }) => {
  const trpc = useTRPC();
  const router = useRouter();
  const { data: contact } = useSuspenseQuery(
    trpc.contact.getOne.queryOptions({ id: contactId })
  );
  const updateStatus = useUpdateContactStatus();

  const handleStatusUpdate = (status: ContactStatus) => {
    updateStatus.mutate({
      id: contact.id,
      status,
    });
  };

  const status = statusStyles[contact.status];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{contact.fullName}</CardTitle>
              <CardDescription>
                Contact message submitted on{" "}
                {format(new Date(contact.createdAt), "MMM d, yyyy 'at' hh:mm a")}
              </CardDescription>
            </div>
            <Badge className={status.className} variant="secondary">
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MailIcon className="h-4 w-4" />
                Email
              </div>
              <p className="font-medium">{contact.email}</p>
            </div>
            {contact.phoneNumber && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PhoneIcon className="h-4 w-4" />
                  Phone Number
                </div>
                <p className="font-medium">{contact.phoneNumber}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              Subject
            </div>
            <p className="font-medium text-lg">{contact.subject}</p>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Message</div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="whitespace-pre-wrap">{contact.message}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            {contact.status !== "NEW" && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate("NEW")}
              >
                <Clock className="mr-2 h-4 w-4" />
                Mark as New
              </Button>
            )}
            {contact.status !== "IN_PROGRESS" && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate("IN_PROGRESS")}
              >
                <Clock className="mr-2 h-4 w-4" />
                Mark as In Progress
              </Button>
            )}
            {contact.status !== "RESOLVED" && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate("RESOLVED")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Resolved
              </Button>
            )}
            {contact.status !== "CLOSED" && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate("CLOSED")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Closed
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="ml-auto"
            >
              Back to List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

