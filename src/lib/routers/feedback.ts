import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { FeedbackCategory, FeedbackStatus } from "@prisma/client";

const feedbackCreateSchema = z.object({
  residentName: z.string().min(2, "Name is required"),
  contactEmail: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  contactNumber: z
    .string()
    .min(7, "Contact number must be at least 7 digits")
    .max(20, "Contact number is too long")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(5, "Subject is required").max(120),
  message: z.string().min(20, "Message is too short").max(1500),
  category: z.nativeEnum(FeedbackCategory),
  rating: z.number().int().min(1).max(5).optional(),
  allowFollowUp: z.boolean().default(true),
  residentId: z.string().optional(),
});

export const feedbackRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z
        .object({
          status: z.nativeEnum(FeedbackStatus).optional(),
          category: z.nativeEnum(FeedbackCategory).optional(),
        })
        .optional()
    )
    .query(({ input }) => {
      return prisma.feedback.findMany({
        where: {
          ...(input?.status ? { status: input.status } : {}),
          ...(input?.category ? { category: input.category } : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          resident: true,
        },
      });
    }),
  create: baseProcedure
    .input(feedbackCreateSchema)
    .mutation(async ({ input }) => {
      return prisma.feedback.create({
        data: {
          residentName: input.residentName,
          contactEmail: input.contactEmail || undefined,
          contactNumber: input.contactNumber || undefined,
          subject: input.subject,
          message: input.message,
          category: input.category,
          rating: input.rating,
          allowFollowUp: input.allowFollowUp,
          residentId: input.residentId,
        },
      });
    }),
});
