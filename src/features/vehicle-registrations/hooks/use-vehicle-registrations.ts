import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

export const useSuspenseVehicleRegistrations = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.vehicleRegistrations.getMany.queryOptions()
  );
};

export const useSuspenseVehicleRegistration = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.vehicleRegistrations.getOne.queryOptions({ id })
  );
};

export const useCreateVehicleRegistration = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.vehicleRegistrations.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.vehicleRegistrations.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.vehicleRegistrations.getOne.queryOptions({ id: data.id })
        );
        queryClient.invalidateQueries(
          trpc.vehicleRegistrations.getMyVehicles.queryOptions()
        );
        toast.success("Vehicle registration created successfully");
      },
      onError: (error) => {
        toast.error(`Failed to create vehicle registration: ${error.message}`);
      },
    })
  );
};

export const useUpdateVehicleRegistration = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.vehicleRegistrations.update.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.vehicleRegistrations.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.vehicleRegistrations.getOne.queryOptions({ id: data.id })
        );
        toast.success("Vehicle registration updated successfully");
      },
      onError: (error) => {
        toast.error(`Failed to update vehicle registration: ${error.message}`);
      },
    })
  );
};

export const useArchiveOrRetrieveVehicleRegistration = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.vehicleRegistrations.archiveOrRetrieve.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.vehicleRegistrations.getMany.queryOptions()
        );
        queryClient.invalidateQueries(
          trpc.vehicleRegistrations.getOne.queryOptions({ id: data.id })
        );
        queryClient.invalidateQueries(
          trpc.vehicleRegistrations.getMyVehicles.queryOptions()
        );
        toast.success(
          data.isArchived
            ? "Vehicle registration archived successfully"
            : "Vehicle registration retrieved successfully"
        );
      },
      onError: (error) => {
        toast.error(`Failed to update vehicle registration: ${error.message}`);
      },
    })
  );
};

export const useGetMyVehicles = () => {
  const trpc = useTRPC();
  return useQuery(trpc.vehicleRegistrations.getMyVehicles.queryOptions());
};

