import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import {
  createSystemLog,
  LogAction,
  LogModule,
  createLogDescription,
} from "@/lib/system-log";
import { TRPCError } from "@trpc/server";
import { ADMIN_FEATURE_ACCESS, hasRequiredRole, normalizeRole } from "@/lib/rbac";

const whatsNewSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["BLOG", "NEWS", "GO_TO_PLACES", "MEDIA_HUB"]),
  category: z
    .enum([
      "INVESTMENT",
      "TRAVEL",
      "SHOPPING",
      "FOOD",
      "LIFESTYLE",
      "TECHNOLOGY",
      "HEALTH",
      "EDUCATION",
      "ENTERTAINMENT",
      "OTHER",
    ])
    .nullable()
    .optional(),
  content: z.string().optional(),
  imageUrl: z.string().optional(),
  attachmentUrl: z.string().optional(),
  publication: z.enum(["PUBLISHED", "DRAFT"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
});

const adminWhatsNewProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!hasRequiredRole(ctx.auth.user.role, [...ADMIN_FEATURE_ACCESS.WHATS_NEW])) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to manage news and events.",
    });
  }

  return next();
});

export const whatsNewRouter = createTRPCRouter({
  // Public endpoint for published items (for landing page and community page)
  getPublished: baseProcedure
    .input(
      z
        .object({
          type: z
            .enum(["BLOG", "NEWS", "GO_TO_PLACES", "MEDIA_HUB"])
            .nullable()
            .optional(),
          category: z
            .enum([
              "INVESTMENT",
              "TRAVEL",
              "SHOPPING",
              "FOOD",
              "LIFESTYLE",
              "TECHNOLOGY",
              "HEALTH",
              "EDUCATION",
              "ENTERTAINMENT",
              "OTHER",
            ])
            .nullable()
            .optional(),
          limit: z.number().min(1).max(100).default(10),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const where: any = {
        isArchived: false,
        publication: "PUBLISHED",
        ...(input?.type && { type: input.type }),
        ...(input?.category && { category: input.category }),
      };

      const items = await prisma.whatsNew.findMany({
        where,
        orderBy: [
          { isFeatured: "desc" },
          { createdAt: "desc" },
        ],
        take: input?.limit || 10,
      });

      return items;
    }),

  // Public endpoint to get a single published item by ID
  getPublishedOne: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const item = await prisma.whatsNew.findFirst({
        where: {
          id: input.id,
          isArchived: false,
          publication: "PUBLISHED",
        },
      });

      if (!item) {
        throw new Error("Item not found");
      }

      return item;
    }),

  // Get all types summary (for highlights section)
  getTypesSummary: baseProcedure.query(async () => {
    const items = await prisma.whatsNew.findMany({
      where: {
        isArchived: false,
        publication: "PUBLISHED",
      },
      select: {
        type: true,
      },
    });

    // Count items by type
    const summary = {
      BLOG: items.filter((item) => item.type === "BLOG").length,
      NEWS: items.filter((item) => item.type === "NEWS").length,
      GO_TO_PLACES: items.filter((item) => item.type === "GO_TO_PLACES").length,
      MEDIA_HUB: items.filter((item) => item.type === "MEDIA_HUB").length,
    };

    return summary;
  }),

  getOne: adminWhatsNewProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ input }) => {
      return prisma.whatsNew.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
    }),

  getMany: adminWhatsNewProcedure
    .input(
      z
        .object({
          includeArchived: z.boolean().default(false),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(10),
          type: z
            .enum(["BLOG", "NEWS", "GO_TO_PLACES", "MEDIA_HUB"])
            .nullable()
            .optional(),
          category: z
            .enum([
              "INVESTMENT",
              "TRAVEL",
              "SHOPPING",
              "FOOD",
              "LIFESTYLE",
              "TECHNOLOGY",
              "HEALTH",
              "EDUCATION",
              "ENTERTAINMENT",
              "OTHER",
            ])
            .nullable()
            .optional(),
          publication: z.enum(["PUBLISHED", "DRAFT"]).nullable().optional(),
          isFeatured: z.boolean().nullable().optional(),
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
        ...(input?.type !== null &&
          input?.type !== undefined && { type: input.type }),
        ...(input?.category !== null &&
          input?.category !== undefined && { category: input.category }),
        ...(input?.publication !== null &&
          input?.publication !== undefined && { publication: input.publication }),
        ...(input?.isFeatured !== null &&
          input?.isFeatured !== undefined && { isFeatured: input.isFeatured }),
        ...(input?.search !== null &&
          input?.search !== undefined &&
          input.search.trim() !== "" && {
            OR: [
              { title: { contains: input.search, mode: "insensitive" } },
              { description: { contains: input.search, mode: "insensitive" } },
            ],
          }),
      };

      const [data, total] = await Promise.all([
        prisma.whatsNew.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limit,
        }),
        prisma.whatsNew.count({ where }),
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

  create: adminWhatsNewProcedure
    .input(whatsNewSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const userRole = normalizeRole(ctx.auth.user.role);
      const canPublish = hasRequiredRole(
        userRole,
        [...ADMIN_FEATURE_ACCESS.WHATS_NEW_PUBLISH]
      );

      const result = await prisma.whatsNew.create({
        data: {
          ...data,
          publication: canPublish ? data.publication : "DRAFT",
          category: data.category || null,
        },
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.CREATE,
        module: LogModule.ANNOUNCEMENTS,
        entityId: result.id,
        entityType: "WhatsNew",
        description: createLogDescription(
          LogAction.CREATE,
          "What's New",
          result.title,
          `Type: ${result.type}, Status: ${result.publication}`
        ),
        metadata: { type: result.type, publication: result.publication },
      });

      return result;
    }),

  update: adminWhatsNewProcedure
    .input(whatsNewSchema)
    .mutation(async ({ input, ctx }) => {
      if (!input.id) {
        throw new Error("What's New ID is required for update");
      }

      const oldItem = await prisma.whatsNew.findUnique({
        where: { id: input.id },
      });

      const { id, ...data } = input;
      const userRole = normalizeRole(ctx.auth.user.role);
      const canPublish = hasRequiredRole(
        userRole,
        [...ADMIN_FEATURE_ACCESS.WHATS_NEW_PUBLISH]
      );

      const result = await prisma.whatsNew.update({
        where: {
          id: input.id,
        },
        data: {
          ...data,
          publication: canPublish ? data.publication : "DRAFT",
          category: data.category || null,
        },
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.UPDATE,
        module: LogModule.ANNOUNCEMENTS,
        entityId: result.id,
        entityType: "WhatsNew",
        description: createLogDescription(
          LogAction.UPDATE,
          "What's New",
          result.title
        ),
      });

      return result;
    }),

  archive: adminWhatsNewProcedure
    .input(
      z.object({
        id: z.string(),
        isArchived: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const item = await prisma.whatsNew.findUnique({
        where: { id: input.id },
      });
      const result = await prisma.whatsNew.update({
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
        entityType: "WhatsNew",
        description: createLogDescription(
          input.isArchived ? LogAction.ARCHIVE : LogAction.RETRIEVE,
          "What's New",
          item?.title || input.id
        ),
      });

      return result;
    }),
});

