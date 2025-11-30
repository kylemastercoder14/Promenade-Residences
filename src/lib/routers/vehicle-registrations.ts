import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { createSystemLog, LogAction, LogModule, createLogDescription } from "@/lib/system-log";
import { TRPCError } from "@trpc/server";
import { ADMIN_FEATURE_ACCESS, hasRequiredRole } from "@/lib/rbac";

const adminVehicleProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasRequiredRole(ctx.auth.user.role, [...ADMIN_FEATURE_ACCESS.VEHICLE_REGISTRATIONS])) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to manage vehicle registrations.",
    });
  }

  return next();
});

const vehicleRegistrationSchema = z.object({
  id: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  yearOfManufacture: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, "Color is required"),
  plateNumber: z.string().min(1, "Plate number is required"),
  vehicleType: z.enum(["SEDAN", "SUV", "TRUCK", "MOTORCYCLE"]),
  licenseNumber: z.string().min(1, "License number is required"),
  expiryDate: z.date(),
  relationshipToVehicle: z.enum(["OWNER", "FAMILY_MEMBER", "COMPANY_DRIVER"]),
  orAttachment: z.string().optional(),
  crAttachment: z.string().optional(),
  paymentMethod: z.enum(["CASH", "GCASH", "MAYA", "OTHER_BANK"]).optional(),
  proofOfPayment: z.string().optional(),
  residentId: z.string().optional(),
});

export const vehicleRegistrationsRouter = createTRPCRouter({
  getOne: adminVehicleProcedure
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
  getMany: adminVehicleProcedure.query(() => {
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
  getMyVehicles: protectedProcedure.query(async ({ ctx }) => {
    const userEmail = ctx.auth.user.email;

    // Get current user's resident record (household head)
    const headResident = await prisma.resident.findFirst({
      where: {
        emailAddress: userEmail,
        isHead: true,
      },
    });

    if (!headResident || !headResident.mapId) {
      return [];
    }

    // Get all residents with the same mapId (household members)
    const householdMembers = await prisma.resident.findMany({
      where: {
        mapId: headResident.mapId,
        isArchived: false,
      },
      select: {
        id: true,
      },
    });

    const memberIds = householdMembers.map((m) => m.id);

    // Get all vehicles registered to household members
    const vehicles = await prisma.vehicleRegistration.findMany({
      where: {
        residentId: {
          in: memberIds,
        },
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

    return vehicles;
  }),
  create: adminVehicleProcedure
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
  createForResident: protectedProcedure
    .input(vehicleRegistrationSchema.omit({ id: true }))
    .mutation(async ({ input, ctx }) => {
      const userEmail = ctx.auth.user.email;

      // Get current user's resident record (household head)
      const headResident = await prisma.resident.findFirst({
        where: {
          emailAddress: userEmail,
          isHead: true,
        },
      });

      if (!headResident || !headResident.mapId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must be a registered resident to register a vehicle.",
        });
      }

      // Get all residents with the same mapId (household members)
      const householdMembers = await prisma.resident.findMany({
        where: {
          mapId: headResident.mapId,
          isArchived: false,
        },
        select: {
          id: true,
        },
      });

      const memberIds = householdMembers.map((m) => m.id);

      // Validate that the residentId (if provided) belongs to the user's household
      if (input.residentId && !memberIds.includes(input.residentId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only register vehicles for members of your household.",
        });
      }

      // If no residentId is provided, default to the head of household
      const residentId = input.residentId || headResident.id;

      const result = await prisma.vehicleRegistration.create({
        data: {
          ...input,
          residentId: residentId,
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
  update: adminVehicleProcedure
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
  archiveOrRetrieve: adminVehicleProcedure
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

