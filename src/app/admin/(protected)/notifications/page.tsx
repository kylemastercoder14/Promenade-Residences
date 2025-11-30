import Heading from "@/components/heading";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { Client } from "./_components/client";
import { prefetchNotifications } from "@/lib/prefetchers/notifications";
import { requireAuth } from "@/lib/auth-utils";
import { Role } from "@prisma/client";

const Page = async () => {
  await requireAuth({ roles: [Role.SUPERADMIN, Role.ADMIN] });
  prefetchNotifications();

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Notifications"
          description="View all system notifications including payments, reservations, and feedback."
        />
      </div>

      <div className="mt-5">
        <HydrateClient>
          <ErrorBoundary
            fallback={
              <Error title="Error" message="Unable to load notifications right now." />
            }
          >
            <Suspense fallback={<Loading message="Loading notifications..." />}>
              <Client />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;

