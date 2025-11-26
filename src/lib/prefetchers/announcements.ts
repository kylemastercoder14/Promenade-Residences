import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type Input = inferInput<typeof trpc.accounts.getMany>;

export const prefetchAnnouncements = (params: Input) => {
  return prefetch(trpc.amenityReservations.getMany.queryOptions(params));
};

export const prefetchAnnouncement = (id: string) => {
  return prefetch(trpc.amenityReservations.getOne.queryOptions({ id }));
};
