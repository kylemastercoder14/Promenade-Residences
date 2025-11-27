import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { WhatsNewForm } from "@/features/whats-new/components/form";
import { requireAuth } from "@/lib/auth-utils";
import { Role } from "@prisma/client";

const Page = async () => {
  const session = await requireAuth({ roles: [Role.SUPERADMIN, Role.ADMIN] });
  const userRole = (session.user.role as Role) ?? Role.USER;
  return (
    <HydrateClient>
      <ErrorBoundary
        fallback={
          <Error title="Error" message="An unexpected error occurred." />
        }
      >
        <Suspense fallback={<Loading message="Loading..." />}>
          <WhatsNewForm initialData={null} canPublish={userRole === Role.SUPERADMIN} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;

