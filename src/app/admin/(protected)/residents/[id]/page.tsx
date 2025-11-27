import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Loading } from "@/components/loading";
import { prefetchResident } from "@/lib/prefetchers/residents";
import { Resident } from "@/features/residents/components/resident";
import { Suspense } from "react";
import { Role } from "@prisma/client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth({ roles: [Role.SUPERADMIN, Role.ADMIN] });
  const { id } = await params;
  if (id !== "create") {
    prefetchResident(id);
  }

  return (
    <HydrateClient>
      <ErrorBoundary
        fallback={
          <Error title="Error" message="An unexpected error occurred." />
        }
      >
        <Suspense fallback={<Loading />}>
          <Resident residentId={id} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;

