import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";

export const messagesRouter = createTRPCRouter({
  getRecent: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(50).default(10),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const limit = input?.limit || 10;

      // Get recent feedback entries (these serve as contact messages)
      const recentFeedback = await prisma.feedback.findMany({
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          OR: [
            { contactEmail: { not: null } },
            { contactNumber: { not: null } },
          ],
        },
        select: {
          id: true,
          residentName: true,
          contactEmail: true,
          contactNumber: true,
          subject: true,
          message: true,
          category: true,
          status: true,
          createdAt: true,
        },
      });

      // Get recent contact entries
      const recentContacts = await prisma.contact.findMany({
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        where: {
          isArchived: false,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true,
        },
      });

      // Combine and sort by timestamp
      const allMessages = [
        ...recentFeedback.map((feedback) => ({
          id: feedback.id,
          name: feedback.residentName,
          email: feedback.contactEmail || undefined,
          phone: feedback.contactNumber || undefined,
          subject: feedback.subject,
          message: feedback.message.substring(0, 100) + (feedback.message.length > 100 ? "..." : ""),
          category: feedback.category,
          status: feedback.status,
          timestamp: feedback.createdAt,
          type: "feedback" as const,
        })),
        ...recentContacts.map((contact) => ({
          id: contact.id,
          name: contact.fullName,
          email: contact.email,
          phone: contact.phoneNumber || undefined,
          subject: contact.subject,
          message: contact.message.substring(0, 100) + (contact.message.length > 100 ? "..." : ""),
          category: null,
          status: contact.status,
          timestamp: contact.createdAt,
          type: "contact" as const,
        })),
      ]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);

      return allMessages;
    }),

  getUnreadCount: protectedProcedure.query(async () => {
    // Count unread feedback (NEW status)
    const unreadFeedback = await prisma.feedback.count({
      where: {
        status: "NEW",
        OR: [
          { contactEmail: { not: null } },
          { contactNumber: { not: null } },
        ],
      },
    });

    // Count unread contacts (NEW status)
    const unreadContacts = await prisma.contact.count({
      where: {
        status: "NEW",
        isArchived: false,
      },
    });

    return unreadFeedback + unreadContacts;
  }),
});

