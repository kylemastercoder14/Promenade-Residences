import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useGetMyResident = () => {
  const trpc = useTRPC();
  return useQuery(trpc.auth.getMyResident.queryOptions());
};

export const useGetHouseholdMembers = () => {
  const trpc = useTRPC();
  return useQuery(trpc.auth.getHouseholdMembers.queryOptions());
};

export const useAddHouseholdMember = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.auth.addHouseholdMember.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [["auth", "getMyResident"]] });
        queryClient.invalidateQueries({ queryKey: [["auth", "getHouseholdMembers"]] });
      },
    })
  );
};

export const useRemoveHouseholdMember = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.auth.removeHouseholdMember.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [["auth", "getHouseholdMembers"]] });
      },
    })
  );
};

