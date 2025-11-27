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
import { Role } from "@prisma/client";

const Page = async () => {
  await requireAuth({ roles: [Role.SUPERADMIN, Role.ADMIN] });
  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="What's New"
          description="Manage and create What's New items"
        />
        <Button asChild variant="primary" size="sm">
          <Link href="/admin/whats-new/create">
            <PlusIcon className="size-4" />
            Create Item
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
            <Suspense fallback={<Loading message="Loading items..." />}>
              <Client />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;

