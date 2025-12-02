import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";
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
  getByBlockAndLot: baseProcedure
    .input(
      z.object({
        blockNo: z.string(),
        lotNo: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const map = await prisma.maps.findFirst({
        where: {
          blockNo: input.blockNo,
          lotNo: input.lotNo || null,
        },
        include: {
          residents: {
            where: {
              isArchived: false,
            },
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              suffix: true,
              contactNumber: true,
              emailAddress: true,
              typeOfResidency: true,
              isHead: true,
            },
          },
        },
      });
      return map;
    }),

  // Public search endpoint for lot availabilities page.
  // Allows residents to search lots by block number, lot number, or street name.
  searchPublic: baseProcedure
    .input(
      z.object({
        query: z.string().min(1, "Search text is required"),
      })
    )
    .query(async ({ input }) => {
      const raw = input.query.trim();
      if (!raw) {
        return [];
      }

      const q = raw.toLowerCase();
      const numeric = raw.replace(/\D/g, "");

      const results = await prisma.maps.findMany({
        where: {
          OR: [
            // Match block numbers containing the numeric part (e.g. "3" → BLK3)
            ...(numeric
              ? [
                  {
                    blockNo: {
                      contains: numeric,
                      mode: "insensitive",
                    },
                  },
                ]
              : []),
            // Match lot numbers if numeric portion is present
            ...(numeric
              ? [
                  {
                    lotNo: {
                      contains: numeric,
                      mode: "insensitive",
                    },
                  },
                ]
              : []),
            // Match street name by text
            {
              street: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        },
        orderBy: [
          { blockNo: "asc" },
          { lotNo: "asc" },
        ],
        take: 50,
        select: {
          id: true,
          blockNo: true,
          lotNo: true,
          street: true,
          lotSize: true,
          houseType: true,
          minPrice: true,
          maxPrice: true,
          paymentMethod: true,
          availability: true,
        },
      });

      return results;
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
  updateMap: protectedProcedure
    .input(
      z.object({
        id: z.string(),
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
      const { id, ...updateData } = input;
      const result = await prisma.maps.update({
        where: { id },
        data: {
          lotNo: updateData.lotNo,
          blockNo: updateData.blockNo,
          street: updateData.street,
          lotSize: updateData.lotSize,
          houseType: updateData.houseType,
          minPrice: updateData.minPrice,
          maxPrice: updateData.maxPrice,
          paymentMethod: updateData.paymentMethod,
          attachmentUrl: updateData.attachmentUrl,
          availability: updateData.availability,
          notes: updateData.notes,
        },
      });

      const location = `Block ${result.blockNo}${result.lotNo ? `, Lot ${result.lotNo}` : ""}, ${result.street}`;
      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.UPDATE,
        module: LogModule.MAPS,
        entityId: result.id,
        entityType: "Map",
        description: createLogDescription(
          LogAction.UPDATE,
          "Map/Property",
          location
        ),
        metadata: { blockNo: result.blockNo, lotNo: result.lotNo, street: result.street },
      });

      return result;
    }),
});
