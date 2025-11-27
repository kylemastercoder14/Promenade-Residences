import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { Role } from "@prisma/client";
import {
  createSystemLog,
  LogAction,
  LogModule,
  createLogDescription,
} from "@/lib/system-log";
import { TRPCError } from "@trpc/server";
import { ADMIN_FEATURE_ACCESS, hasRequiredRole } from "@/lib/rbac";

const accountsProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasRequiredRole(ctx.auth.user.role, ADMIN_FEATURE_ACCESS.ACCOUNTS)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to manage accounts.",
    });
  }

  return next();
});

export const accountsRouter = createTRPCRouter({
  updateRole: accountsProcedure
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
        metadata: {
          oldRole: user?.role ?? null,
          newRole: input.role,
        },
      });

      return result;
    }),
  updateAccount: accountsProcedure
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
  archiveOrRetrieve: accountsProcedure
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
  getOne: accountsProcedure
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
  getMany: accountsProcedure.query(() => {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),
});
