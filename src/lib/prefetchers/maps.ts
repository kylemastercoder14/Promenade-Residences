import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type Input = inferInput<typeof trpc.maps.getMany>;

export const prefetchMaps = (params: Input) => {
  return prefetch(trpc.maps.getMany.queryOptions(params));
};

export const prefetchMap = (id: string) => {
  return prefetch(trpc.maps.getOne.queryOptions({ id }));
};
