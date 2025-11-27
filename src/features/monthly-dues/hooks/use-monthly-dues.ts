import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

export const useSuspenseResidentsSummary = (year?: number) => {
  const trpc = useTRPC();
  // Use regular useQuery to avoid SSR authentication issues
  return useQuery(
    trpc.monthlyDues.getResidentsSummary.queryOptions(
      year !== undefined ? { year } : {}
    )
  );
};

export const useSuspenseResidentMonthlyDues = (
  residentId: string,
  year?: number
) => {
  const trpc = useTRPC();
  // Use regular useQuery to avoid SSR authentication issues
  return useQuery(
    trpc.monthlyDues.getByResident.queryOptions({ residentId, year })
  );
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.monthlyDues.createPayment.mutationOptions({
      onSuccess: (data, variables) => {
        // Invalidate all residents summary queries (for all years)
        queryClient.invalidateQueries({
          queryKey: [["monthlyDues", "getResidentsSummary"]],
        });
        // Invalidate the specific resident's monthly dues for the payment year
        queryClient.invalidateQueries(
          trpc.monthlyDues.getByResident.queryOptions({
            residentId: data.residentId,
            year: variables.year,
          })
        );
        // Also invalidate residents query in case archive status changed
        queryClient.invalidateQueries({
          queryKey: [["residents", "getMany"]],
        });
        toast.success("Payment recorded successfully");
      },
      onError: (error) => {
        toast.error(`Failed to record payment: ${error.message}`);
      },
    })
  );
};

export const useCreateBatchPayment = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.monthlyDues.createBatchPayment.mutationOptions({
      onSuccess: (data, variables) => {
        // Invalidate all residents summary queries
        queryClient.invalidateQueries({
          queryKey: [["monthlyDues", "getResidentsSummary"]],
        });
        // Invalidate the specific resident's monthly dues
        queryClient.invalidateQueries(
          trpc.monthlyDues.getByResident.queryOptions({
            residentId: variables.residentId,
            year: variables.year,
          })
        );
        // Also invalidate residents query in case archive status changed
        queryClient.invalidateQueries({
          queryKey: [["residents", "getMany"]],
        });
        toast.success(`Payment recorded successfully for ${variables.payments.length} month${variables.payments.length > 1 ? "s" : ""}`);
      },
      onError: (error) => {
        toast.error(`Failed to record payment: ${error.message}`);
      },
    })
  );
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.monthlyDues.deletePayment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.monthlyDues.getResidentsSummary.queryOptions()
        );
        toast.success("Payment deleted successfully");
      },
      onError: (error) => {
        toast.error(`Failed to delete payment: ${error.message}`);
      },
    })
  );
};

export const useUpdateMonthlyDueStatus = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.monthlyDues.updateStatus.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.monthlyDues.getByResident.queryOptions({
            residentId: data.residentId,
            year: data.year,
          })
        );
        queryClient.invalidateQueries({
          queryKey: [["monthlyDues", "getResidentsSummary"]],
        });
        toast.success(`Monthly due marked as ${data.status.toLowerCase()}`);
      },
      onError: (error) => {
        toast.error(`Failed to update status: ${error.message}`);
      },
    })
  );
};

