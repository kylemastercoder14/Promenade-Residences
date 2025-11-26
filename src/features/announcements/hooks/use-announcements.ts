import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

export const useSuspenseAnnouncements = (
  options?: {
    includeArchived?: boolean;
    page?: number;
    limit?: number;
    category?: "IMPORTANT" | "EMERGENCY" | "UTILITIES" | "OTHER";
    publication?: "PUBLISHED" | "DRAFT";
    search?: string;
  }
) => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.announcements.getMany.queryOptions(options || {})
  );
};

export const useSuspenseAnnouncement = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.announcements.getOne.queryOptions({ id })
  );
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.announcements.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.announcements.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.announcements.getOne.queryOptions({ id: data.id })
        );
        toast.success("Announcement created successfully");
      },
      onError: (error) => {
        toast.error(`Failed to create announcement: ${error.message}`);
      },
    })
  );
};

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.announcements.update.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.announcements.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.announcements.getOne.queryOptions({ id: data.id })
        );
        toast.success("Announcement updated successfully");
      },
      onError: (error) => {
        toast.error(`Failed to update announcement: ${error.message}`);
      },
    })
  );
};

export const useArchiveAnnouncement = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.announcements.archive.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.announcements.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.announcements.getOne.queryOptions({ id: data.id })
        );
        toast.success(
          data.isArchived
            ? "Announcement archived successfully"
            : "Announcement retrieved successfully"
        );
      },
      onError: (error) => {
        toast.error(`Failed to update announcement: ${error.message}`);
      },
    })
  );
};

