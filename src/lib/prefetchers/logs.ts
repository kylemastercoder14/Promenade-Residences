import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type Input = inferInput<typeof trpc.logs.getMany>;

export const prefetchLogs = (params: Input) => {
  return prefetch(trpc.logs.getMany.queryOptions(params));
};

export const prefetchAccount = (id: string) => {
  return prefetch(trpc.logs.getOne.queryOptions({ id }));
};
