import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Loading } from "@/components/loading";
import { Suspense } from "react";
import { Client } from "./_components/client";
import { Role } from "@prisma/client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const session = await requireAuth({ roles: [Role.SUPERADMIN, Role.ADMIN] });
  const userRole = (session.user.role as Role) ?? Role.USER;
  const { id } = await params;

  return (
    <HydrateClient>
      <ErrorBoundary
        fallback={
          <Error title="Error" message="An unexpected error occurred." />
        }
      >
        <Suspense fallback={<Loading message="Loading..." />}>
          <Client id={id} canPublish={userRole === Role.SUPERADMIN} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;

