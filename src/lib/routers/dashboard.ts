import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";

export const dashboardRouter = createTRPCRouter({
  getStatistics: protectedProcedure.query(async () => {
    try {
    // Get total accounts (users)
    const totalAccounts = await prisma.user.count({
      where: {
        isArchived: false,
      },
    });

    // Get accounts by role
    const accountsByRole = await prisma.user.groupBy({
      by: ["role"],
      where: {
        isArchived: false,
      },
      _count: {
        role: true,
      },
    });

    // Get total residents
    const totalResidents = await prisma.resident.count({
      where: {
        isArchived: false,
      },
    });

    // Get residents by type
    const residentsByType = await prisma.resident.groupBy({
      by: ["typeOfResidency"],
      where: {
        isArchived: false,
      },
      _count: {
        typeOfResidency: true,
      },
    });

    // Get registered vehicles
    const totalVehicles = await prisma.vehicleRegistration.count({
      where: {
        isArchived: false,
      },
    });

    // Get vehicles by type
    const vehiclesByType = await prisma.vehicleRegistration.groupBy({
      by: ["vehicleType"],
      where: {
        isArchived: false,
      },
      _count: {
        vehicleType: true,
      },
    });

    // Get monthly dues statistics for current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const monthlyDuesThisMonth = await prisma.monthlyDue.findMany({
      where: {
        month: currentMonth,
        year: currentYear,
      },
    });

    const totalMonthlyDues = monthlyDuesThisMonth.length;
    const approvedMonthlyDues = monthlyDuesThisMonth.filter(
      (due) => due.status === "APPROVED"
    ).length;
    const pendingMonthlyDues = totalMonthlyDues - approvedMonthlyDues;

    // Get all monthly dues for current year for revenue calculation (to match collection chart)
    const monthlyDuesThisYear = await prisma.monthlyDue.findMany({
      where: {
        year: currentYear,
        status: "APPROVED",
      },
    });

    // Get available lots (maps)
    const totalLots = await prisma.maps.count();
    // Try to count available lots (case-insensitive check)
    const allLots = await prisma.maps.findMany({
      select: {
        availability: true,
      },
    });
    const availableLots = allLots.filter(
      (lot) => lot.availability && lot.availability.toUpperCase().includes("AVAILABLE")
    ).length;
    const ownedLots = Math.max(0, totalLots - availableLots);

    // Get amenity reservations statistics
    const totalReservations = await prisma.amenityReservation.count({
      where: {
        isArchived: false,
      },
    });

    const reservationsByStatus = await prisma.amenityReservation.groupBy({
      by: ["status"],
      where: {
        isArchived: false,
      },
      _count: {
        status: true,
      },
    });

    // Get recent transactions (last 5)
    const recentMonthlyDues = await prisma.monthlyDue.findMany({
      take: 5,
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
    });

    const recentReservations = await prisma.amenityReservation.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        isArchived: false,
      },
    });

    // Get feedback statistics
    const totalFeedback = await prisma.feedback.count();
    const feedbackByStatus = await prisma.feedback.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    // Calculate total revenue from monthly dues (current year to match collection chart)
    const monthlyDuesRevenue = monthlyDuesThisYear.reduce(
      (sum, due) => sum + due.amountPaid,
      0
    );

    // Calculate total revenue from amenity reservations (paid)
    const reservationsRevenue = await prisma.amenityReservation.aggregate({
      where: {
        isArchived: false,
        status: "APPROVED",
        paymentStatus: "PAID",
      },
      _sum: {
        amountPaid: true,
      },
    });

    return {
      accounts: {
        total: totalAccounts,
        byRole: accountsByRole.reduce(
          (acc, item) => {
            acc[item.role] = item._count.role;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      residents: {
        total: totalResidents,
        byType: residentsByType.reduce(
          (acc, item) => {
            acc[item.typeOfResidency] = item._count.typeOfResidency;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      vehicles: {
        total: totalVehicles,
        byType: vehiclesByType.reduce(
          (acc, item) => {
            acc[item.vehicleType] = item._count.vehicleType;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      monthlyDues: {
        total: totalMonthlyDues,
        paid: approvedMonthlyDues,
        pending: pendingMonthlyDues,
        revenue: monthlyDuesRevenue,
      },
      lots: {
        total: totalLots,
        available: availableLots,
        owned: ownedLots,
      },
      reservations: {
        total: totalReservations,
        byStatus: reservationsByStatus.reduce(
          (acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          },
          {} as Record<string, number>
        ),
        revenue: reservationsRevenue._sum.amountPaid || 0,
      },
      feedback: {
        total: totalFeedback,
        byStatus: feedbackByStatus.reduce(
          (acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      recentMonthlyDues,
      recentReservations,
    };
    } catch (error) {
      console.error("Dashboard statistics error:", error);
      throw error;
    }
  }),

  getCollectionData: protectedProcedure
    .input(
      z.object({
        year: z.number().int().min(2000).max(3000),
      })
    )
    .query(async ({ input }) => {
      const monthlyDues = await prisma.monthlyDue.findMany({
        where: {
          year: input.year,
        },
      });

      const reservations = await prisma.amenityReservation.findMany({
        where: {
          isArchived: false,
          paymentStatus: "PAID",
          date: {
            gte: new Date(input.year, 0, 1),
            lt: new Date(input.year + 1, 0, 1),
          },
        },
      });

      // Group by month
      const monthlyData: Record<number, number> = {};
      for (let month = 1; month <= 12; month++) {
        monthlyData[month] = 0;
      }

      // Add monthly dues revenue
      monthlyDues.forEach((due) => {
        monthlyData[due.month] = (monthlyData[due.month] || 0) + due.amountPaid;
      });

      // Add reservation revenue
      reservations.forEach((reservation) => {
        const month = new Date(reservation.date).getMonth() + 1;
        monthlyData[month] =
          (monthlyData[month] || 0) + reservation.amountPaid;
      });

      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      return months.map((month, index) => ({
        month,
        collection: monthlyData[index + 1] || 0,
      }));
    }),
});

