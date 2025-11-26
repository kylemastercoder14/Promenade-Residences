import { prefetch, trpc } from "@/trpc/server";

export const prefetchAmenityReservations = () => {
  return prefetch(trpc.amenityReservations.getMany.queryOptions());
};

export const prefetchAmenityReservation = (id: string) => {
  return prefetch(trpc.amenityReservations.getOne.queryOptions({ id }));
};
