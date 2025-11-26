import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

export const useSuspenseResidents = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.residents.getMany.queryOptions()
  );
};

export const useSuspenseResident = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.residents.getOne.queryOptions({ id })
  );
};

export const useCreateResident = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.residents.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.residents.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.residents.getOne.queryOptions({ id: data.id })
        );
        toast.success("Resident created successfully");
      },
      onError: (error) => {
        toast.error(`Failed to create resident: ${error.message}`);
      },
    })
  );
};

export const useUpdateResident = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.residents.update.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.residents.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.residents.getOne.queryOptions({ id: data.id })
        );
        toast.success("Resident updated successfully");
      },
      onError: (error) => {
        toast.error(`Failed to update resident: ${error.message}`);
      },
    })
  );
};

export const useArchiveOrRetrieveResident = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.residents.archiveOrRetrieve.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.residents.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.residents.getOne.queryOptions({ id: data.id })
        );
        toast.success(
          data.isArchived
            ? "Resident archived successfully"
            : "Resident retrieved successfully"
        );
      },
      onError: (error) => {
        toast.error(`Failed to update resident: ${error.message}`);
      },
    })
  );
};

