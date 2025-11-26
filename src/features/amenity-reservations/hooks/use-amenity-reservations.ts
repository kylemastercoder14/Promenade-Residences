import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

export const useSuspenseAmenityReservations = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.amenityReservations.getMany.queryOptions());
};

export const useSuspenseAmenityReservation = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.amenityReservations.getOne.queryOptions({ id })
  );
};

export const useAmenityReservationsByDateRange = (
  startDate: Date,
  endDate: Date,
  amenity?: "court" | "gazebo" | "parking area"
) => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.amenityReservations.getByDateRange.queryOptions({
      startDate,
      endDate,
      amenity,
    })
  );
};

export const useCreateAmenityReservation = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.amenityReservations.createReservation.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.amenityReservations.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.amenityReservations.getOne.queryOptions({ id: data.id })
        );
        toast.success("Reservation created successfully");
      },
      onError: (error) => {
        toast.error(`Failed to create reservation: ${error.message}`);
      },
    })
  );
};

export const useCreateWalkIn = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.amenityReservations.createWalkIn.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.amenityReservations.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.amenityReservations.getOne.queryOptions({ id: data.id })
        );
        toast.success("Walk-in reservation created and approved");
      },
      onError: (error) => {
        toast.error(`Failed to create walk-in reservation: ${error.message}`);
      },
    })
  );
};

export const useUpdateAmenityReservation = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.amenityReservations.updateReservation.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.amenityReservations.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.amenityReservations.getOne.queryOptions({ id: data.id })
        );
        toast.success("Reservation updated successfully");
      },
      onError: (error) => {
        toast.error(`Failed to update reservation: ${error.message}`);
      },
    })
  );
};

export const useDeleteAmenityReservation = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.amenityReservations.deleteReservation.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.amenityReservations.getMany.queryOptions()
        );
        toast.success("Reservation deleted successfully");
      },
      onError: (error) => {
        toast.error(`Failed to delete reservation: ${error.message}`);
      },
    })
  );
};

export const useArchiveAmenityReservation = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.amenityReservations.archiveReservation.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.amenityReservations.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.amenityReservations.getOne.queryOptions({ id: data.id })
        );
        toast.success(
          data.isArchived
            ? "Reservation archived successfully"
            : "Reservation retrieved successfully"
        );
      },
      onError: (error) => {
        toast.error(`Failed to update reservation: ${error.message}`);
      },
    })
  );
};

export const useUpdateReservationStatus = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.amenityReservations.updateStatus.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.amenityReservations.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.amenityReservations.getOne.queryOptions({ id: data.id })
        );
        toast.success("Reservation status updated successfully");
      },
      onError: (error) => {
        toast.error(`Failed to update status: ${error.message}`);
      },
    })
  );
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.amenityReservations.updatePaymentStatus.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.amenityReservations.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.amenityReservations.getOne.queryOptions({ id: data.id })
        );
        toast.success("Payment status updated successfully");
      },
      onError: (error) => {
        toast.error(`Failed to update payment status: ${error.message}`);
      },
    })
  );
};

