import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { Role } from "@/generated/prisma/enums";
import {
  createSystemLog,
  LogAction,
  LogModule,
  createLogDescription,
} from "@/lib/system-log";

export const accountsRouter = createTRPCRouter({
  updateRole: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.enum(Role),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.findUnique({ where: { id: input.id } });
      const result = await prisma.user.update({
        where: { id: input.id },
        data: { role: input.role },
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.UPDATE,
        module: LogModule.ACCOUNTS,
        entityId: input.id,
        entityType: "Account",
        description: createLogDescription(
          LogAction.UPDATE,
          "Account",
          user?.email || input.id,
          `Changed role to ${input.role}`
        ),
        metadata: { oldRole: user?.role, newRole: input.role },
      });

      return result;
    }),
  updateAccount: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.email("Invalid email address"),
        image: z.string().optional(),
        role: z.enum(Role),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const oldUser = await prisma.user.findUnique({ where: { id: input.id } });
      const result = await prisma.user.update({
        where: { id: input.id },
        data: {
          name: input.name,
          email: input.email,
          image: input.image,
          role: input.role,
        },
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.UPDATE,
        module: LogModule.ACCOUNTS,
        entityId: input.id,
        entityType: "Account",
        description: createLogDescription(
          LogAction.UPDATE,
          "Account",
          input.email,
          "Updated account details"
        ),
        metadata: {
          changes: {
            name: oldUser?.name !== input.name,
            email: oldUser?.email !== input.email,
            role: oldUser?.role !== input.role,
          },
        },
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
      const user = await prisma.user.findUnique({ where: { id: input.id } });
      const result = await prisma.user.update({
        where: { id: input.id },
        data: { isArchived: input.isArchived },
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: input.isArchived ? LogAction.ARCHIVE : LogAction.RETRIEVE,
        module: LogModule.ACCOUNTS,
        entityId: input.id,
        entityType: "Account",
        description: createLogDescription(
          input.isArchived ? LogAction.ARCHIVE : LogAction.RETRIEVE,
          "Account",
          user?.email || input.id
        ),
      });

      return result;
    }),
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ input }) => {
      return prisma.user.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
    }),
  getMany: protectedProcedure.query(() => {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),
});
