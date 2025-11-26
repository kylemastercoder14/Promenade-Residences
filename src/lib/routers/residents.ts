import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { createSystemLog, LogAction, LogModule, createLogDescription } from "@/lib/system-log";

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
  getOne: protectedProcedure
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
  getMany: protectedProcedure.query(() => {
    return prisma.resident.findMany({
      where: {
        isArchived: false,
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
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
  create: protectedProcedure
    .input(residentSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
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
        metadata: { typeOfResidency: result.typeOfResidency, isHead: result.isHead },
      });

      return result;
    }),
  update: protectedProcedure
    .input(residentSchema)
    .mutation(async ({ input, ctx }) => {
      if (!input.id) {
        throw new Error("Resident ID is required for update");
      }

      const oldResident = await prisma.resident.findUnique({
        where: { id: input.id },
      });

      const { id, ...data } = input;
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
  archiveOrRetrieve: protectedProcedure
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

