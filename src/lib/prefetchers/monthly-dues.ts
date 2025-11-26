import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type GetResidentsSummaryInput = inferInput<typeof trpc.monthlyDues.getResidentsSummary>;
type GetByResidentInput = inferInput<typeof trpc.monthlyDues.getByResident>;

export const prefetchResidentsSummary = (params?: GetResidentsSummaryInput) => {
  return prefetch(trpc.monthlyDues.getResidentsSummary.queryOptions(params || {}));
};

export const prefetchResidentMonthlyDues = (params: GetByResidentInput) => {
  return prefetch(trpc.monthlyDues.getByResident.queryOptions(params));
};

