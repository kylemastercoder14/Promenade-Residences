import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

export const useCurrentUser = () => {
  const trpc = useTRPC();
  return useQuery(trpc.settings.getCurrentUser.queryOptions());
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.settings.updateProfile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["settings", "getCurrentUser"]],
        });
        toast.success("Profile updated successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update profile");
      },
    })
  );
};

export const useChangePassword = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.settings.changePassword.mutationOptions({
      onSuccess: () => {
        toast.success("Password changed successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to change password");
      },
    })
  );
};

export const useActiveSessions = () => {
  const trpc = useTRPC();
  return useQuery(trpc.settings.getActiveSessions.queryOptions());
};

