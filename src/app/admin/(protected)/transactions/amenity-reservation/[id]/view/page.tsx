import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Loading } from "@/components/loading";
import { Suspense } from "react";
import { prefetchAmenityReservation } from "@/lib/prefetchers/amenity-reservations";
import { AmenityReservationDetails } from "@/features/amenity-reservations/components/amenity-reservation-details";
import { Role } from "@prisma/client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth({ roles: [Role.SUPERADMIN, Role.ACCOUNTING] });
  const { id } = await params;
  prefetchAmenityReservation(id);

  return (
    <HydrateClient>
      <ErrorBoundary
        fallback={
          <Error title="Error" message="An unexpected error occurred." />
        }
      >
        <Suspense fallback={<Loading message="Loading reservation details..." />}>
          <AmenityReservationDetails amenityReservationId={id} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;

