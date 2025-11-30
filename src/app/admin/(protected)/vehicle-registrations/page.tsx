import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { prefetchVehicleRegistrations } from "@/lib/prefetchers/vehicle-registrations";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { Client } from "./_components/client";
import { requireAuth } from "@/lib/auth-utils";
import { Role } from "@prisma/client";

const Page = async () => {
  await requireAuth({ roles: [Role.SUPERADMIN, Role.ACCOUNTING] });
  prefetchVehicleRegistrations();
  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Vehicle Registrations"
          description="Manage vehicle registrations, view details, and handle archiving."
        />
        <div className="flex items-center gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href="/admin/vehicle-registrations/create">
              <PlusIcon className="size-4" />
              Register Vehicle
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
            <Suspense fallback={<Loading message='Loading vehicle registrations...' />}>
              <Client />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;

