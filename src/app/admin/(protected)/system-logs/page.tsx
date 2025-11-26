import Heading from "@/components/heading";
import { prefetchLogs } from "@/lib/prefetchers/logs";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { Client } from "./_components/client";
import { requireAuth } from '@/lib/auth-utils';

const Page = async () => {
  await requireAuth();
  prefetchLogs();
  return (
	<div>
	  <div className="flex items-center justify-between">
		<Heading
		  title="Manage System Logs"
		  description="Easily handle all actions"
		/>
	  </div>
	  <div className="mt-5">
		<HydrateClient>
		  <ErrorBoundary
			fallback={
			  <Error title="Error" message="An unexpected error occurred." />
			}
		  >
			<Suspense fallback={<Loading message='Loading system logs...' />}>
			  <Client />
			</Suspense>
		  </ErrorBoundary>
		</HydrateClient>
	  </div>
	</div>
  );
};

export default Page;
