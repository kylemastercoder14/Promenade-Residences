import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { prefetchAccounts } from "@/lib/prefetchers/accounts";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { Client } from "./_components/client";
import { requireAuth } from '@/lib/auth-utils';

const Page = async () => {
  await requireAuth();
  prefetchAccounts();
  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Manage Accounts"
          description="Easily handle account creation, editing, archiving, and restoration."
        />
        <Button asChild variant="primary" size="sm">
          <Link href="/admin/accounts/create">
            <PlusIcon className="size-4" />
            Create Account
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
            <Suspense fallback={<Loading message='Loading accounts...' />}>
              <Client />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;
