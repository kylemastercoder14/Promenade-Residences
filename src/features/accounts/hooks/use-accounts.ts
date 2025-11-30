import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const useSuspenseAccounts = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.accounts.getMany.queryOptions());
};

export const useSuspenseAccount = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.accounts.getOne.queryOptions({ id }));
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.accounts.updateRole.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.accounts.getMany.queryOptions());
        queryClient.invalidateQueries(
          trpc.accounts.getOne.queryOptions({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Failed to update role: ${error.message}`);
      },
    })
  );
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.accounts.updateAccount.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.accounts.getMany.queryOptions());
        queryClient.invalidateQueries(
          trpc.accounts.getOne.queryOptions({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Failed to update role: ${error.message}`);
      },
    })
  );
};

export const useArchiveOrRetrieveAccount = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.accounts.archiveOrRetrieve.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.accounts.getMany.queryOptions());
      },
      onError: (error) => {
        toast.error(`Failed to update account status: ${error.message}`);
      },
    })
  );
};

export const useApproveOrRejectAccount = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.accounts.approveOrReject.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.accounts.getMany.queryOptions());
        queryClient.invalidateQueries(
          trpc.accounts.getOne.queryOptions({ id: data.id })
        );
        toast.success(`Account ${data.isApproved ? "approved" : "rejected"} successfully`);
      },
      onError: (error) => {
        toast.error(`Failed to update approval status: ${error.message}`);
      },
    })
  );
};
