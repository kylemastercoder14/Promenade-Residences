import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { ContactStatus } from "@prisma/client";

const contactCreateSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .min(7, "Contact number must be at least 7 digits")
    .max(20, "Contact number is too long")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(5, "Subject is required").max(200),
  message: z.string().min(20, "Message is too short").max(2000),
});

export const contactRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z
        .object({
          status: z.nativeEnum(ContactStatus).optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(10),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      // If pagination params are provided, return paginated response
      if (input?.page || input?.limit) {
        const page = input?.page || 1;
        const limit = input?.limit || 10;
        const skip = (page - 1) * limit;

        const where: any = {
          isArchived: false,
          ...(input?.status && { status: input.status }),
          ...(input?.search && input.search.trim() !== "" && {
            OR: [
              { fullName: { contains: input.search, mode: "insensitive" } },
              { email: { contains: input.search, mode: "insensitive" } },
              { subject: { contains: input.search, mode: "insensitive" } },
              { message: { contains: input.search, mode: "insensitive" } },
            ],
          }),
        };

        const [data, total] = await Promise.all([
          prisma.contact.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          prisma.contact.count({ where }),
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
      }

      // Otherwise, return flat array (for admin table)
      const where: any = {
        isArchived: false,
        ...(input?.status && { status: input.status }),
      };

      return prisma.contact.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return prisma.contact.findUniqueOrThrow({
        where: { id: input.id },
      });
    }),

  create: baseProcedure
    .input(contactCreateSchema)
    .mutation(async ({ input }) => {
      return prisma.contact.create({
        data: {
          fullName: input.fullName,
          email: input.email,
          phoneNumber: input.phoneNumber || undefined,
          subject: input.subject,
          message: input.message,
        },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(ContactStatus),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.contact.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  archive: protectedProcedure
    .input(z.object({ id: z.string(), isArchived: z.boolean() }))
    .mutation(async ({ input }) => {
      return prisma.contact.update({
        where: { id: input.id },
        data: { isArchived: input.isArchived },
      });
    }),
});

