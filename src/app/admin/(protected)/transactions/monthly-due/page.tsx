import Heading from "@/components/heading";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Client } from "./_components/client";
import { requireAuth } from "@/lib/auth-utils";
import { Role } from "@prisma/client";

const Page = async () => {
  await requireAuth({ roles: [Role.SUPERADMIN, Role.ACCOUNTING] });
  // Note: Prefetch removed - client-side fetching handles authentication properly
  // Server-side prefetch was causing 401 errors due to auth context timing

  return (
    <div>
      <Heading
        title="Monthly Dues"
        description="Manage monthly due payments for residents and tenants"
      />
      <div className="mt-5">
        <HydrateClient>
          <ErrorBoundary
            fallback={
              <Error title="Error" message="An unexpected error occurred." />
            }
          >
            <Client />
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;
