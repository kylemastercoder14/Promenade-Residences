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
import { prefetchMaps } from "@/lib/prefetchers/maps";
import { Role } from "@prisma/client";

const Page = async () => {
  await requireAuth({ roles: [Role.SUPERADMIN] });
  prefetchMaps();
  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="2D Mapping"
          description="Manage and add details on the available lots"
        />
        <Button asChild variant="primary" size="sm">
          <Link href="/admin/maps/create">
            <PlusIcon className="size-4" />
            Create Lot
          </Link>
        </Button>
      </div>
      <div className="mt-5">
        <HydrateClient>
          <ErrorBoundary
            fallback={
              <Error title="Error" message="An unexpected error occurred." />
            }
          >
            <Suspense fallback={<Loading message="Loading mapping..." />}>
              <Client />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;
