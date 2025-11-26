import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

export const prefetchVehicleRegistrations = () => {
  return prefetch(trpc.vehicleRegistrations.getMany.queryOptions());
};

export const prefetchVehicleRegistration = (id: string) => {
  return prefetch(trpc.vehicleRegistrations.getOne.queryOptions({ id }));
};

