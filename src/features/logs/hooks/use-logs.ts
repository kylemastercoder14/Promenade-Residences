import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useSuspenseLogs = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.logs.getMany.queryOptions());
};

export const useSuspenseLog = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.logs.getOne.queryOptions({ id }));
};
