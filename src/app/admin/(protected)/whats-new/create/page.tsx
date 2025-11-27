import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { WhatsNewForm } from "@/features/whats-new/components/form";
import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();
  return (
    <HydrateClient>
      <ErrorBoundary
        fallback={
          <Error title="Error" message="An unexpected error occurred." />
        }
      >
        <Suspense fallback={<Loading message="Loading..." />}>
          <WhatsNewForm initialData={null} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;

