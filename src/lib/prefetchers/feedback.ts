import { prefetch, trpc } from "@/trpc/server";

export const prefetchFeedbacks = () => {
  return prefetch(trpc.feedback.getMany.queryOptions());
};


