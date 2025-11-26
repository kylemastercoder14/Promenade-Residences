"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Error } from "@/components/error";
import { Loading } from "@/components/loading";
import { VehicleRegistrationForm } from "./vehicle-registration-form";
import { useSuspenseVehicleRegistration } from "@/features/vehicle-registrations/hooks/use-vehicle-registrations";

export const VehicleRegistration = ({
  vehicleRegistrationId,
}: {
  vehicleRegistrationId: string;
}) => {
  const isCreateMode = vehicleRegistrationId === "create";
  const { data: vehicleRegistration } = isCreateMode
    ? { data: null }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    : useSuspenseVehicleRegistration(vehicleRegistrationId);

  return (
    <ErrorBoundary
      fallback={<Error title="Error" message="Failed to load vehicle registration" />}
    >
      <Suspense fallback={<Loading message="Loading vehicle registration..." />}>
        <VehicleRegistrationForm initialData={vehicleRegistration} />
      </Suspense>
    </ErrorBoundary>
  );
};

