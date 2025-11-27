"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { WhatsNewForm } from "@/features/whats-new/components/form";

export const Client = ({ id }: { id: string }) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.whatsNew.getOne.queryOptions({ id }));
  return <WhatsNewForm initialData={data} />;
};

