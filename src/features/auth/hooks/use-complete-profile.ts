/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

export const useCompleteProfile = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.auth.completeProfile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["auth", "checkProfileComplete"]],
        });
        toast.success("Profile completed successfully!");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to complete profile");
      },
    })
  );
};
