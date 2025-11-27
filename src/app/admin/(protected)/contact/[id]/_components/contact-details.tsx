"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MailIcon, PhoneIcon, CalendarIcon } from "lucide-react";
import { ContactStatus } from "@prisma/client";
import {
  useReplyToContact,
  useUpdateContactStatus,
} from "@/features/contact/hooks/use-contact";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
  },
};

export const ContactDetails = ({ contactId }: { contactId: string }) => {
  const trpc = useTRPC();
  const router = useRouter();
  const { data: contact } = useSuspenseQuery(
    trpc.contact.getOne.queryOptions({ id: contactId })
  );
  const updateStatus = useUpdateContactStatus();
  const replyMutation = useReplyToContact();
  const [replyMessage, setReplyMessage] = useState("");

  const handleStatusUpdate = (status: ContactStatus) => {
    updateStatus.mutate({
      id: contact.id,
      status,
    });
  };

  const status = statusStyles[contact.status];
  const replies = contact.replies ?? [];

  const handleReplySubmit = () => {
    const trimmed = replyMessage.trim();
    if (!trimmed) return;
    replyMutation.mutate(
      {
        id: contact.id,
        message: trimmed,
      },
      {
        onSuccess: () => {
          setReplyMessage("");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{contact.fullName}</CardTitle>
              <CardDescription>
                Contact message submitted on{" "}
                {format(
                  new Date(contact.createdAt),
                  "MMM d, yyyy 'at' hh:mm a"
                )}
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

          <div className="flex gap-2 pt-4 flex-wrap">
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

      <Card>
        <CardHeader>
          <CardTitle>Reply to Message</CardTitle>
          <CardDescription>
            Your response will be emailed directly to {contact.fullName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-reply">Reply</Label>
            <Textarea
              id="contact-reply"
              minLength={5}
              rows={4}
              placeholder={`Type your reply to ${contact.fullName}...`}
              value={replyMessage}
              onChange={(event) => setReplyMessage(event.target.value)}
              disabled={replyMutation.isPending}
            />
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>This reply will be sent to {contact.email}.</p>
            <Button
              variant="primary"
              onClick={handleReplySubmit}
              disabled={
                replyMutation.isPending || replyMessage.trim().length < 5
              }
            >
              {replyMutation.isPending ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation History</CardTitle>
          <CardDescription>
            Review every reply shared with {contact.fullName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{contact.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {contact.email}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(
                    new Date(contact.createdAt),
                    "MMM d, yyyy 'at' hh:mm a"
                  )}
                </span>
              </div>
              <p className="mt-2 text-sm whitespace-pre-wrap">
                {contact.message}
              </p>
            </div>

            {replies.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No replies have been recorded yet.
              </p>
            )}

            {replies.map((reply) => (
              <div key={reply.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">
                      {reply.admin?.name || "Promenade Residences Admin"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reply.admin?.email || "noreply@promenade.local"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(
                      new Date(reply.createdAt),
                      "MMM d, yyyy 'at' hh:mm a"
                    )}
                  </span>
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap">
                  {reply.message}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
