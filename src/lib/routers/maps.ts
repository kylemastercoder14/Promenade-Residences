import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { createSystemLog, LogAction, LogModule, createLogDescription } from "@/lib/system-log";

export const mapsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ input }) => {
      return prisma.maps.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
    }),
  getMany: protectedProcedure.query(() => {
    return prisma.maps.findMany();
  }),
  createMap: protectedProcedure
    .input(
      z.object({
        blockNo: z.string(),
        lotNo: z.string().optional(),
        street: z.string(),
        lotSize: z.number(),
        houseType: z.string(),
        minPrice: z.number(),
        maxPrice: z.number(),
        paymentMethod: z.string(),
        attachmentUrl: z.string(),
        availability: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await prisma.maps.create({
        data: {
          lotNo: input.lotNo,
          blockNo: input.blockNo,
          street: input.street,
          lotSize: input.lotSize,
          houseType: input.houseType,
          minPrice: input.minPrice,
          maxPrice: input.maxPrice,
          paymentMethod: input.paymentMethod,
          attachmentUrl: input.attachmentUrl,
          availability: input.availability,
          notes: input.notes,
        },
      });

      const location = `Block ${result.blockNo}${result.lotNo ? `, Lot ${result.lotNo}` : ""}, ${result.street}`;
      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.CREATE,
        module: LogModule.MAPS,
        entityId: result.id,
        entityType: "Map",
        description: createLogDescription(
          LogAction.CREATE,
          "Map/Property",
          location
        ),
        metadata: { blockNo: result.blockNo, lotNo: result.lotNo, street: result.street },
      });

      return result;
    }),
});
