"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Loading } from "@/components/loading";
import { AnnouncementForm } from "./form";
import { useSuspenseAnnouncement } from "@/features/announcements/hooks/use-announcements";

export const Announcement = ({
  announcementId,
  canPublish,
}: {
  announcementId: string;
  canPublish: boolean;
}) => {
  const isCreateMode = announcementId === "create";
  const { data: announcement } = isCreateMode
    ? { data: null }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    : useSuspenseAnnouncement(announcementId);

  return (
    <ErrorBoundary
      fallback={<Error title="Error" message="Failed to load announcement" />}
    >
      <Suspense fallback={<Loading message="Loading announcement..." />}>
        <AnnouncementForm initialData={announcement} canPublish={canPublish} />
      </Suspense>
    </ErrorBoundary>
  );
};

