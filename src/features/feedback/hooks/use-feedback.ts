import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

export const useSuspenseFeedbacks = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.feedback.getMany.queryOptions());
};

export const useCreateFeedback = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.feedback.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.feedback.getMany.queryOptions());
        toast.success("Thanks for your feedback! We'll review it shortly.");
      },
      onError: (error) => {
        toast.error(
          error?.message || "We couldn't submit your feedback. Try again."
        );
      },
    })
  );
};


