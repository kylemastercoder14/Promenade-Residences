import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";

export const notificationsRouter = createTRPCRouter({
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

      // Get recent monthly dues payments
      const recentPayments = await prisma.monthlyDue.findMany({
        take: Math.ceil(limit / 3),
        orderBy: {
          createdAt: "desc",
        },
        include: {
          resident: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        where: {
          amountPaid: {
            gt: 0,
          },
        },
      });

      // Get recent amenity reservation status changes (approved/rejected)
      const recentReservations = await prisma.amenityReservation.findMany({
        take: Math.ceil(limit / 3),
        orderBy: {
          updatedAt: "desc",
        },
        where: {
          isArchived: false,
          status: {
            in: ["APPROVED", "REJECTED"],
          },
        },
      });

      // Get new feedback submissions
      const newFeedback = await prisma.feedback.findMany({
        take: Math.ceil(limit / 3),
        orderBy: {
          createdAt: "desc",
        },
        where: {
          status: "NEW",
        },
      });

      // Transform to notification format
      const notifications = [];

      // Add payment notifications
      for (const payment of recentPayments) {
        const residentName = payment.resident
          ? `${payment.resident.firstName} ${payment.resident.lastName}`
          : "Unknown Resident";
        notifications.push({
          id: `payment-${payment.id}`,
          type: "payment" as const,
          title: "New payment received",
          description: `Monthly due payment from ${residentName}`,
          timestamp: payment.createdAt,
          link: `/admin/transactions/monthly-due`,
        });
      }

      // Add reservation notifications
      for (const reservation of recentReservations) {
        const statusText =
          reservation.status === "APPROVED" ? "approved" : "rejected";
        notifications.push({
          id: `reservation-${reservation.id}`,
          type: "reservation" as const,
          title: `Amenity reservation ${statusText}`,
          description: `${reservation.fullName}'s ${reservation.amenity.toLowerCase()} reservation has been ${statusText}`,
          timestamp: reservation.updatedAt,
          link: `/admin/transactions/amenity-reservation`,
        });
      }

      // Add feedback notifications
      for (const feedback of newFeedback) {
        notifications.push({
          id: `feedback-${feedback.id}`,
          type: "feedback" as const,
          title: "New feedback submitted",
          description: `${feedback.residentName}: ${feedback.subject}`,
          timestamp: feedback.createdAt,
          link: `/admin/feedback`,
        });
      }

      // Sort by timestamp (most recent first) and limit
      return notifications
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    }),

  getUnreadCount: protectedProcedure.query(async () => {
    // Count new feedback
    const newFeedbackCount = await prisma.feedback.count({
      where: {
        status: "NEW",
      },
    });

    // Count recent payments (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recentPaymentsCount = await prisma.monthlyDue.count({
      where: {
        createdAt: {
          gte: yesterday,
        },
        amountPaid: {
          gt: 0,
        },
      },
    });

    // Count recent reservation updates (last 24 hours)
    const recentReservationsCount = await prisma.amenityReservation.count({
      where: {
        updatedAt: {
          gte: yesterday,
        },
        isArchived: false,
        status: {
          in: ["APPROVED", "REJECTED"],
        },
      },
    });

    return newFeedbackCount + recentPaymentsCount + recentReservationsCount;
  }),
});

