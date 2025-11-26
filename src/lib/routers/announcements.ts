/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { createSystemLog, LogAction, LogModule, createLogDescription } from "@/lib/system-log";

const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  category: z.enum(["IMPORTANT", "EMERGENCY", "UTILITIES", "OTHER"]),
  isForAll: z.boolean().default(true),
  description: z.string().min(1, "Description is required"),
  attachment: z.string().optional(),
  schedule: z.date().optional(),
  isPin: z.boolean().default(false),
  publication: z.enum(["PUBLISHED", "DRAFT"]).default("DRAFT"),
});

export const announcementsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ input }) => {
      return prisma.announcement.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
    }),
  getMany: protectedProcedure
    .input(
      z
        .object({
          includeArchived: z.boolean().default(false),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(10),
          category: z
            .enum(["IMPORTANT", "EMERGENCY", "UTILITIES", "OTHER"])
            .nullable()
            .optional(),
          publication: z.enum(["PUBLISHED", "DRAFT"]).nullable().optional(),
          search: z.string().nullable().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const page = input?.page || 1;
      const limit = input?.limit || 10;
      const skip = (page - 1) * limit;

      const where: any = {
        isArchived: input?.includeArchived ? undefined : false,
        ...(input?.category !== null && input?.category !== undefined && { category: input.category }),
        ...(input?.publication !== null && input?.publication !== undefined && { publication: input.publication }),
        ...(input?.search !== null && input?.search !== undefined && input.search.trim() !== "" && {
          OR: [
            { title: { contains: input.search, mode: "insensitive" } },
            { description: { contains: input.search, mode: "insensitive" } },
          ],
        }),
      };

      const [data, total] = await Promise.all([
        prisma.announcement.findMany({
          where,
          orderBy: [{ isPin: "desc" }, { createdAt: "desc" }],
          skip,
          take: limit,
        }),
        prisma.announcement.count({ where }),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),
  create: protectedProcedure
    .input(announcementSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const result = await prisma.announcement.create({
        data: {
          ...data,
        },
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.CREATE,
        module: LogModule.ANNOUNCEMENTS,
        entityId: result.id,
        entityType: "Announcement",
        description: createLogDescription(
          LogAction.CREATE,
          "Announcement",
          result.title,
          `Category: ${result.category}, Status: ${result.publication}`
        ),
        metadata: { category: result.category, publication: result.publication },
      });

      return result;
    }),
  update: protectedProcedure
    .input(announcementSchema)
    .mutation(async ({ input, ctx }) => {
      if (!input.id) {
        throw new Error("Announcement ID is required for update");
      }

      const oldAnnouncement = await prisma.announcement.findUnique({
        where: { id: input.id },
      });

      const { id, ...data } = input;
      const result = await prisma.announcement.update({
        where: {
          id: input.id,
        },
        data,
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.UPDATE,
        module: LogModule.ANNOUNCEMENTS,
        entityId: result.id,
        entityType: "Announcement",
        description: createLogDescription(
          LogAction.UPDATE,
          "Announcement",
          result.title
        ),
      });

      return result;
    }),
  archive: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isArchived: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const announcement = await prisma.announcement.findUnique({
        where: { id: input.id },
      });
      const result = await prisma.announcement.update({
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
        module: LogModule.ANNOUNCEMENTS,
        entityId: input.id,
        entityType: "Announcement",
        description: createLogDescription(
          input.isArchived ? LogAction.ARCHIVE : LogAction.RETRIEVE,
          "Announcement",
          announcement?.title || input.id
        ),
      });

      return result;
    }),
});
