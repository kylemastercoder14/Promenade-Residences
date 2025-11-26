import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";

export const logsRouter = createTRPCRouter({
  getOne: protectedProcedure
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
  getMany: protectedProcedure.query(() => {
    return prisma.systemLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
      },
    });
  }),
});
