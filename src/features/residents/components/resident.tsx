"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Loading } from "@/components/loading";
import { ResidentForm } from "./resident-form";
import { useSuspenseResident } from "@/features/residents/hooks/use-residents";

export const Resident = ({
  residentId,
}: {
  residentId: string;
}) => {
  const isCreateMode = residentId === "create";
  const { data: resident } = isCreateMode
    ? { data: null }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    : useSuspenseResident(residentId);

  return (
    <ErrorBoundary
      fallback={<Error title="Error" message="Failed to load resident" />}
    >
      <Suspense fallback={<Loading message="Loading resident..." />}>
        <ResidentForm initialData={resident} />
      </Suspense>
    </ErrorBoundary>
  );
};

