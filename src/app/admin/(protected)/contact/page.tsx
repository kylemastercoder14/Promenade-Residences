import Heading from "@/components/heading";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { Client } from "./_components/client";
import { prefetchContacts } from "@/lib/prefetchers/contact";
import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();
  prefetchContacts();

  return (
    <div>
      <Heading
        title="Contact Messages"
        description="Review contact form submissions from residents and visitors."
      />

      <div className="mt-5">
        <HydrateClient>
          <ErrorBoundary
            fallback={
              <Error title="Error" message="Unable to load contact messages right now." />
            }
          >
            <Suspense fallback={<Loading message="Loading contact messages..." />}>
              <Client />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;

