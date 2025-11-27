import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { TRPCError } from "@trpc/server";
import {
  createSystemLog,
  LogAction,
  LogModule,
  createLogDescription,
} from "@/lib/system-log";
import { authClient } from "../auth-client";
import { ADMIN_FEATURE_ACCESS, hasRequiredRole } from "@/lib/rbac";

const residentsProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasRequiredRole(ctx.auth.user.role, ADMIN_FEATURE_ACCESS.RESIDENTS)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to manage residents.",
    });
  }

  return next();
});

const residentSchema = z.object({
  id: z.string().optional(),
  typeOfResidency: z.enum(["RESIDENT", "TENANT"]),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE", "PREFER_NOT_TO_SAY"]),
  dateOfBirth: z.date(),
  contactNumber: z.string().min(1, "Contact number is required"),
  emailAddress: z.string().email().optional().or(z.literal("")),
  isHead: z.boolean().default(false),
  mapId: z.string().optional(),
});

export const residentsRouter = createTRPCRouter({
  getOne: residentsProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ input }) => {
      return prisma.resident.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          map: {
            select: {
              id: true,
              blockNo: true,
              lotNo: true,
              street: true,
            },
          },
        },
      });
    }),
  getMany: residentsProcedure.query(() => {
    return prisma.resident.findMany({
      include: {
        map: {
          select: {
            id: true,
            blockNo: true,
            lotNo: true,
            street: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  create: residentsProcedure
    .input(residentSchema)
    .mutation(async ({ input, ctx }) => {
      const { ...data } = input;

      // Ensure only one head of household per property/household
      if (data.isHead && data.mapId) {
        const existingHead = await prisma.resident.findFirst({
          where: { mapId: data.mapId, isHead: true },
        });

        if (existingHead) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This household already has a head account.",
          });
        }
      }

      const result = await prisma.resident.create({
        data: {
          ...data,
          emailAddress: data.emailAddress === "" ? null : data.emailAddress,
          mapId: data.mapId === "" ? null : data.mapId,
        },
        include: {
          map: {
            select: {
              id: true,
              blockNo: true,
              lotNo: true,
              street: true,
            },
          },
        },
      });

      // Automatically create an auth user/account for head of household
      if (result.isHead && result.emailAddress) {
        const existingUser = await prisma.user.findUnique({
          where: { email: result.emailAddress },
        });

        if (!existingUser) {
          const fullName = `${result.firstName} ${result.lastName}`.trim();

          await authClient.signUp.email({
            email: result.emailAddress,
            password: "password123",
            name: fullName,
          });
        }
      }

      const fullName = `${result.firstName} ${result.lastName}`;

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.CREATE,
        module: LogModule.RESIDENTS,
        entityId: result.id,
        entityType: "Resident",
        description: createLogDescription(
          LogAction.CREATE,
          "Resident",
          fullName,
          `${result.typeOfResidency}${result.isHead ? " (Household Head)" : ""}`
        ),
        metadata: {
          typeOfResidency: result.typeOfResidency,
          isHead: result.isHead,
        },
      });

      return result;
    }),
  update: residentsProcedure
    .input(residentSchema)
    .mutation(async ({ input, ctx }) => {
      if (!input.id) {
        throw new Error("Resident ID is required for update");
      }

      const { ...data } = input;
      const result = await prisma.resident.update({
        where: {
          id: input.id,
        },
        data: {
          ...data,
          emailAddress: data.emailAddress === "" ? null : data.emailAddress,
          mapId: data.mapId === "" ? null : data.mapId,
        },
        include: {
          map: {
            select: {
              id: true,
              blockNo: true,
              lotNo: true,
              street: true,
            },
          },
        },
      });

      const fullName = `${result.firstName} ${result.lastName}`;
      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.UPDATE,
        module: LogModule.RESIDENTS,
        entityId: result.id,
        entityType: "Resident",
        description: createLogDescription(
          LogAction.UPDATE,
          "Resident",
          fullName
        ),
      });

      return result;
    }),
  archiveOrRetrieve: residentsProcedure
    .input(
      z.object({
        id: z.string(),
        isArchived: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const resident = await prisma.resident.findUnique({
        where: { id: input.id },
      });
      const result = await prisma.resident.update({
        where: {
          id: input.id,
        },
        data: {
          isArchived: input.isArchived,
        },
      });

      const fullName = resident
        ? `${resident.firstName} ${resident.lastName}`
        : input.id;
      await createSystemLog({
        userId: ctx.auth.user.id,
        action: input.isArchived ? LogAction.ARCHIVE : LogAction.RETRIEVE,
        module: LogModule.RESIDENTS,
        entityId: input.id,
        entityType: "Resident",
        description: createLogDescription(
          input.isArchived ? LogAction.ARCHIVE : LogAction.RETRIEVE,
          "Resident",
          fullName
        ),
      });

      return result;
    }),
});
