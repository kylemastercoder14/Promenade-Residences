import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

export const useSuspenseMaps = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.maps.getMany.queryOptions());
};

export const useSuspenseMap = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.maps.getOne.queryOptions({ id }));
};

export const useCreateMap = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.maps.createMap.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.maps.getMany.queryOptions());
        queryClient.invalidateQueries(
          trpc.maps.getOne.queryOptions({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Failed to create lot: ${error.message}`);
      },
    })
  );
};
