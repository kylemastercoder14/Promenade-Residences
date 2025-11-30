import Heading from "@/components/heading";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { requireAuth } from "@/lib/auth-utils";
import { ContactDetails } from "./_components/contact-details";
import { prefetch, trpc } from "@/trpc/server";
import { Role } from "@prisma/client";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  await requireAuth({ roles: [Role.SUPERADMIN] });
  const { id } = await params;
  await prefetch(trpc.contact.getOne.queryOptions({ id }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Contact Details"
          description="View full details of the contact message."
        />
      </div>

      <div className="mt-5">
        <HydrateClient>
          <ErrorBoundary
            fallback={
              <Error title="Error" message="Unable to load contact details right now." />
            }
          >
            <Suspense fallback={<Loading message="Loading contact details..." />}>
              <ContactDetails contactId={id} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;

