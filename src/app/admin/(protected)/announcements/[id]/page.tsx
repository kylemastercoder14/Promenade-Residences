import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Loading } from "@/components/loading";
import { Suspense } from "react";
import { prefetchAnnouncement } from "@/lib/prefetchers/announcements";
import { Announcement } from "@/features/announcements/components/announcement";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();

  const { id } = await params;
  if (id !== "create") {
    prefetchAnnouncement(id);
  }

  return (
    <HydrateClient>
      <ErrorBoundary
        fallback={
          <Error title="Error" message="An unexpected error occurred." />
        }
      >
        <Suspense fallback={<Loading message="Loading announcement..." />}>
          <Announcement announcementId={id} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;

