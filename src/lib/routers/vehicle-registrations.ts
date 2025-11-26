import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { createSystemLog, LogAction, LogModule, createLogDescription } from "@/lib/system-log";

const vehicleRegistrationSchema = z.object({
  id: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  yearOfManufacture: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, "Color is required"),
  plateNumber: z.string().min(1, "Plate number is required"),
  vehicleType: z.enum(["SEDAN", "SUV", "TRUCK", "MOTORCYCLE"]),
  chassisNumber: z.string().min(1, "Chassis number is required"),
  engineNumber: z.string().min(1, "Engine number is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  expiryDate: z.date(),
  relationshipToVehicle: z.enum(["OWNER", "FAMILY_MEMBER", "COMPANY_DRIVER"]),
  orAttachment: z.string().optional(),
  crAttachment: z.string().optional(),
  residentId: z.string().optional(),
});

export const vehicleRegistrationsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ input }) => {
      return prisma.vehicleRegistration.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          resident: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              suffix: true,
            },
          },
        },
      });
    }),
  getMany: protectedProcedure.query(() => {
    return prisma.vehicleRegistration.findMany({
      where: {
        isArchived: false,
      },
      include: {
        resident: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            suffix: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  create: protectedProcedure
    .input(vehicleRegistrationSchema.omit({ id: true }))
    .mutation(async ({ input, ctx }) => {
      const result = await prisma.vehicleRegistration.create({
        data: {
          ...input,
          residentId: input.residentId && input.residentId !== "" ? input.residentId : null,
        },
        include: {
          resident: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              suffix: true,
            },
          },
        },
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.CREATE,
        module: LogModule.VEHICLE_REGISTRATIONS,
        entityId: result.id,
        entityType: "VehicleRegistration",
        description: createLogDescription(
          LogAction.CREATE,
          "Vehicle Registration",
          `${result.brand} ${result.model} (${result.plateNumber})`
        ),
        metadata: { plateNumber: result.plateNumber, vehicleType: result.vehicleType },
      });

      return result;
    }),
  update: protectedProcedure
    .input(vehicleRegistrationSchema.extend({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const oldVehicle = await prisma.vehicleRegistration.findUnique({
        where: { id: input.id },
      });
      const { id, ...data } = input;
      const result = await prisma.vehicleRegistration.update({
        where: {
          id: id,
        },
        data: {
          ...data,
          residentId: data.residentId && data.residentId !== "" ? data.residentId : null,
        },
        include: {
          resident: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              suffix: true,
            },
          },
        },
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.UPDATE,
        module: LogModule.VEHICLE_REGISTRATIONS,
        entityId: result.id,
        entityType: "VehicleRegistration",
        description: createLogDescription(
          LogAction.UPDATE,
          "Vehicle Registration",
          `${result.brand} ${result.model} (${result.plateNumber})`
        ),
      });

      return result;
    }),
  archiveOrRetrieve: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isArchived: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const vehicle = await prisma.vehicleRegistration.findUnique({
        where: { id: input.id },
      });
      const result = await prisma.vehicleRegistration.update({
        where: {
          id: input.id,
        },
        data: {
          isArchived: input.isArchived,
        },
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: input.isArchived ? LogAction.ARCHIVE : LogAction.RETRIEVE,
        module: LogModule.VEHICLE_REGISTRATIONS,
        entityId: input.id,
        entityType: "VehicleRegistration",
        description: createLogDescription(
          input.isArchived ? LogAction.ARCHIVE : LogAction.RETRIEVE,
          "Vehicle Registration",
          vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})` : input.id
        ),
      });

      return result;
    }),
});

