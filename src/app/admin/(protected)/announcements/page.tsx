import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { Client } from "./_components/client";
import { requireAuth } from "@/lib/auth-utils";
import { prefetchAnnouncements } from "@/lib/prefetchers/announcements";
import { Role } from "@prisma/client";

const Page = async () => {
  await requireAuth({ roles: [Role.SUPERADMIN, Role.ADMIN] });
  prefetchAnnouncements();
  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Announcements"
          description="Manage and create announcements"
        />
        <div className="flex items-center gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href="/admin/announcements/create">
              <PlusIcon className="size-4" />
              Create Announcement
            </Link>
          </Button>
        </div>
      </div>
      <div className="mt-5">
        <HydrateClient>
          <ErrorBoundary
            fallback={
              <Error title="Error" message="An unexpected error occurred." />
            }
          >
            <Suspense fallback={<Loading message="Loading announcements..." />}>
              <Client />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;

