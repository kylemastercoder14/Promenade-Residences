import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Loading } from "@/components/loading";
import { prefetchAccount } from "@/lib/prefetchers/accounts";
import { Account } from "@/features/accounts/components/account";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { id } = await params;
  if (id !== "create") {
    prefetchAccount(id);
  }

  return (
    <HydrateClient>
      <ErrorBoundary
        fallback={
          <Error title="Error" message="An unexpected error occurred." />
        }
      >
        <Suspense fallback={<Loading />}>
          <Account accountId={id} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
