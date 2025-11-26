import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

export const prefetchResidents = () => {
  return prefetch(trpc.residents.getMany.queryOptions());
};

export const prefetchResident = (id: string) => {
  return prefetch(trpc.residents.getOne.queryOptions({ id }));
};

