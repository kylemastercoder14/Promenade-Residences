import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Loading } from "@/components/loading";
import { Map } from "@/features/maps/components/map";
import { Suspense } from "react";
import { prefetchMap } from '@/lib/prefetchers/maps';

interface PageProps {
  params: Promise<{
	id: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { id } = await params;
  if (id !== "create") {
	prefetchMap(id);
  }

  return (
	<HydrateClient>
	  <ErrorBoundary
		fallback={
		  <Error title="Error" message="An unexpected error occurred." />
		}
	  >
		<Suspense fallback={<Loading message='Loading map...' />}>
		  <Map mapId={id} />
		</Suspense>
	  </ErrorBoundary>
	</HydrateClient>
  );
};

export default Page;
