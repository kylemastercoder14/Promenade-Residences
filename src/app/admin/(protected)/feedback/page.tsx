import Heading from "@/components/heading";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { Client } from "./_components/client";
import { prefetchFeedbacks } from "@/lib/prefetchers/feedback";
import { requireAuth } from "@/lib/auth-utils";
import { Role } from "@prisma/client";

const Page = async () => {
  await requireAuth({ roles: [Role.SUPERADMIN] });
  prefetchFeedbacks();

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Resident Feedback"
          description="Review comments, suggestions, and reports submitted by residents."
        />
      </div>

      <div className="mt-5">
        <HydrateClient>
          <ErrorBoundary
            fallback={
              <Error title="Error" message="Unable to load feedback right now." />
            }
          >
            <Suspense fallback={<Loading message="Loading feedback..." />}>
              <Client />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;


