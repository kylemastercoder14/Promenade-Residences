import { prefetch, trpc } from "@/trpc/server";

export const prefetchNotifications = () => {
  return prefetch(trpc.notifications.getRecent.queryOptions({ limit: 50 }));
};

