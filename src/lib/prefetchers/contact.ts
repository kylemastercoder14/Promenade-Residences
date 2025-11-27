import { prefetch, trpc } from "@/trpc/server";

export const prefetchContacts = () => {
  return prefetch(trpc.contact.getMany.queryOptions());
};

