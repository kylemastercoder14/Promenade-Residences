import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Loading } from "@/components/loading";
import { prefetchVehicleRegistration } from "@/lib/prefetchers/vehicle-registrations";
import { VehicleRegistration } from "@/features/vehicle-registrations/components/vehicle-registration";
import { Suspense } from "react";
import { Role } from "@prisma/client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth({ roles: [Role.SUPERADMIN, Role.ACCOUNTING] });
  const { id } = await params;
  if (id !== "create") {
    prefetchVehicleRegistration(id);
  }

  return (
    <HydrateClient>
      <ErrorBoundary
        fallback={
          <Error title="Error" message="An unexpected error occurred." />
        }
      >
        <Suspense fallback={<Loading />}>
          <VehicleRegistration vehicleRegistrationId={id} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;

