import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { ContactStatus } from "@prisma/client";

export const useSuspenseContacts = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.contact.getMany.queryOptions());
};

export const useUpdateContactStatus = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.contact.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.contact.getMany.queryOptions());
        toast.success("Contact status updated successfully");
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to update contact status");
      },
    })
  );
};

export const useArchiveContact = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.contact.archive.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.contact.getMany.queryOptions());
        toast.success("Contact archived successfully");
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to archive contact");
      },
    })
  );
};
