import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

export const useSuspenseWhatsNew = (
  options?: {
    includeArchived?: boolean;
    page?: number;
    limit?: number;
    type?: "BLOG" | "NEWS" | "GO_TO_PLACES" | "MEDIA_HUB";
    category?:
      | "INVESTMENT"
      | "TRAVEL"
      | "SHOPPING"
      | "FOOD"
      | "LIFESTYLE"
      | "TECHNOLOGY"
      | "HEALTH"
      | "EDUCATION"
      | "ENTERTAINMENT"
      | "OTHER";
    publication?: "PUBLISHED" | "DRAFT";
    isFeatured?: boolean;
    search?: string;
  }
) => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.whatsNew.getMany.queryOptions(options || {})
  );
};

export const useCreateWhatsNew = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.whatsNew.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.whatsNew.getMany.queryOptions());
        toast.success("What's New item created successfully");
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to create item");
      },
    })
  );
};

export const useUpdateWhatsNew = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.whatsNew.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.whatsNew.getMany.queryOptions());
        toast.success("What's New item updated successfully");
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to update item");
      },
    })
  );
};

export const useArchiveWhatsNew = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.whatsNew.archive.mutationOptions({
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(trpc.whatsNew.getMany.queryOptions());
        toast.success(
          variables.isArchived
            ? "Item archived successfully"
            : "Item restored successfully"
        );
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to archive/restore item");
      },
    })
  );
};

