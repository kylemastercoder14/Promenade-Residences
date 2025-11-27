import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { ADMIN_FEATURE_ACCESS, hasRequiredRole } from "@/lib/rbac";

const logsProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasRequiredRole(ctx.auth.user.role, ADMIN_FEATURE_ACCESS.SYSTEM_LOGS)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to view system logs.",
    });
  }

  return next();
});

export const logsRouter = createTRPCRouter({
  getOne: logsProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ input }) => {
      return prisma.systemLog.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          user: true,
        },
      });
    }),
  getMany: logsProcedure.query(() => {
    return prisma.systemLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
      },
    });
  }),
});
