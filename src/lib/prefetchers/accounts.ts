import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type Input = inferInput<typeof trpc.accounts.getMany>;

export const prefetchAccounts = (params: Input) => {
  return prefetch(trpc.accounts.getMany.queryOptions(params));
};

export const prefetchAccount = (id: string) => {
  return prefetch(trpc.accounts.getOne.queryOptions({ id }));
};
