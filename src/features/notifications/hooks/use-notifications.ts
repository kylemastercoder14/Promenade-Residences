import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useSuspenseNotifications = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.notifications.getRecent.queryOptions({ limit: 50 }));
};

