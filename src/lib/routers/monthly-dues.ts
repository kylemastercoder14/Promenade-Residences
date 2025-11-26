import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { createSystemLog, LogAction, LogModule, createLogDescription } from "@/lib/system-log";

const MONTHLY_DUE_AMOUNT = 750;

const monthlyDueSchema = z.object({
  id: z.string().optional(),
  residentId: z.string().min(1, "Resident is required"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(3000),
  amountPaid: z.number().min(0, "Amount paid must be positive"),
  paymentMethod: z.enum(["CASH", "GCASH", "MAYA", "OTHER_BANK"]).optional(),
  notes: z.string().optional(),
  attachment: z.string().optional(),
});

export const monthlyDuesRouter = createTRPCRouter({
  // Get all monthly dues for a specific resident with balance calculations
  getByResident: protectedProcedure
    .input(
      z.object({
        residentId: z.string(),
        year: z.number().int().optional(), // If not provided, use current year
      })
    )
    .query(async ({ input }) => {
      const currentYear = input.year || new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      // Get all payments for this resident in the specified year
      const payments = await prisma.monthlyDue.findMany({
        where: {
          residentId: input.residentId,
          year: currentYear,
        },
        orderBy: [
          { month: "asc" },
          { createdAt: "asc" },
        ],
        include: {
          resident: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              suffix: true,
              isArchived: true,
            },
          },
        },
      });

      // Generate all 12 months with balance calculations
      const months = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthPayments = payments.filter((p) => p.month === month);
        const totalPaid = monthPayments.reduce((sum, p) => sum + p.amountPaid, 0);
        const balance = MONTHLY_DUE_AMOUNT - totalPaid;
        const isPaid = balance <= 0;
        const isOverdue = !isPaid && month < currentMonth;
        const isCurrentMonth = month === currentMonth;
        const isFutureMonth = month > currentMonth;

        return {
          month,
          year: currentYear,
          monthName: new Date(currentYear, month - 1, 1).toLocaleString("default", {
            month: "long",
          }),
          requiredAmount: MONTHLY_DUE_AMOUNT,
          totalPaid,
          balance: Math.max(0, balance), // Don't show negative balance (advance payment)
          advancePayment: Math.max(0, -balance), // Negative balance = advance
          isPaid,
          isOverdue,
          isCurrentMonth,
          isFutureMonth,
          payments: monthPayments,
        };
      });

      // Fetch the household head separately to ensure we always have resident data
      const resident = await prisma.resident.findUnique({
        where: { id: input.residentId },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          suffix: true,
          typeOfResidency: true,
          isArchived: true,
          isHead: true,
          map: {
            select: {
              blockNo: true,
              lotNo: true,
              street: true,
            },
          },
        },
      });

      if (!resident) {
        throw new Error("Household head not found");
      }

      if (!resident.isHead) {
        throw new Error("Monthly dues can only be viewed for household heads");
      }

      // Calculate total balance
      const totalBalance = months.reduce((sum, m) => sum + m.balance, 0);
      const totalAdvance = months.reduce((sum, m) => sum + m.advancePayment, 0);

      // Count overdue months
      const overdueMonths = months.filter((m) => m.isOverdue).length;

      // Check if resident should be auto-archived (6+ months overdue)
      const shouldArchive = overdueMonths >= 6;

      return {
        resident,
        year: currentYear,
        months,
        totalBalance,
        totalAdvance,
        overdueMonths,
        shouldArchive,
      };
    }),

  // Get all residents with their monthly due summary
  getResidentsSummary: protectedProcedure
    .input(
      z.object({
        year: z.number().int().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const currentYear = input?.year || new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      // Get all active household heads (monthly dues are per household)
      const residents = await prisma.resident.findMany({
        where: {
          isArchived: false,
          isHead: true, // Only show household heads
        },
        include: {
          monthlyDues: {
            where: {
              year: currentYear,
            },
          },
          map: {
            select: {
              blockNo: true,
              lotNo: true,
              street: true,
            },
          },
        },
        orderBy: [
          { lastName: "asc" },
          { firstName: "asc" },
        ],
      });

      // Calculate summary for each resident
      const residentsWithSummary = residents.map((resident) => {
        const months = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const monthPayments = resident.monthlyDues.filter((p) => p.month === month);
          const totalPaid = monthPayments.reduce((sum, p) => sum + p.amountPaid, 0);
          const balance = MONTHLY_DUE_AMOUNT - totalPaid;
          const isPaid = balance <= 0;
          const isOverdue = !isPaid && month < currentMonth;

          return {
            month,
            balance: Math.max(0, balance),
            isPaid,
            isOverdue,
          };
        });

        const totalBalance = months.reduce((sum, m) => sum + m.balance, 0);
        const overdueMonths = months.filter((m) => m.isOverdue).length;
        const shouldArchive = overdueMonths >= 6;

        return {
          id: resident.id,
          firstName: resident.firstName,
          middleName: resident.middleName,
          lastName: resident.lastName,
          suffix: resident.suffix,
          typeOfResidency: resident.typeOfResidency,
          map: resident.map
            ? {
                blockNo: resident.map.blockNo,
                lotNo: resident.map.lotNo,
                street: resident.map.street,
              }
            : null,
          totalBalance,
          overdueMonths,
          shouldArchive,
        };
      });

      return residentsWithSummary;
    }),

  // Create or update payment
  createPayment: protectedProcedure
    .input(
      monthlyDueSchema.omit({ id: true }).extend({
        applyAdvance: z.boolean().default(false), // If true, apply excess to next month
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { applyAdvance, ...paymentData } = input;

      // Get existing payment for this month/year
      const existing = await prisma.monthlyDue.findFirst({
        where: {
          residentId: input.residentId,
          month: input.month,
          year: input.year,
        },
      });

      let result;
      if (existing) {
        // Update existing payment
        result = await prisma.monthlyDue.update({
          where: { id: existing.id },
          data: {
            amountPaid: existing.amountPaid + paymentData.amountPaid,
            paymentMethod: paymentData.paymentMethod,
            notes: paymentData.notes || existing.notes,
            attachment: paymentData.attachment || existing.attachment,
          },
        });
      } else {
        // Create new payment
        result = await prisma.monthlyDue.create({
          data: paymentData,
        });
      }

      // Handle advance payment if enabled
      if (applyAdvance) {
        const monthPayments = await prisma.monthlyDue.findMany({
          where: {
            residentId: input.residentId,
            month: input.month,
            year: input.year,
          },
        });

        const totalPaid = monthPayments.reduce((sum, p) => sum + p.amountPaid, 0);
        const excess = totalPaid - MONTHLY_DUE_AMOUNT;

        if (excess > 0) {
          // Apply excess to next month
          let nextMonth = input.month + 1;
          let nextYear = input.year;

          if (nextMonth > 12) {
            nextMonth = 1;
            nextYear += 1;
          }

          const nextMonthPayment = await prisma.monthlyDue.findFirst({
            where: {
              residentId: input.residentId,
              month: nextMonth,
              year: nextYear,
            },
          });

          if (nextMonthPayment) {
            await prisma.monthlyDue.update({
              where: { id: nextMonthPayment.id },
              data: {
                amountPaid: nextMonthPayment.amountPaid + excess,
              },
            });
          } else {
            await prisma.monthlyDue.create({
              data: {
                residentId: input.residentId,
                month: nextMonth,
                year: nextYear,
                amountPaid: excess,
                paymentMethod: input.paymentMethod,
                notes: `Advance payment from ${new Date(input.year, input.month - 1, 1).toLocaleString("default", { month: "long" })} ${input.year}`,
              },
            });
          }
        }
      }

      // Check if resident should be auto-archived (6+ months overdue)
      // Only check after payment is processed to ensure accurate count
      // Skip auto-archive check if this is part of a batch payment (will be checked separately)
      const skipAutoArchive = (input as any).skipAutoArchive === true;

      if (!skipAutoArchive) {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        // Re-fetch all payments after the current payment is saved
        const allPayments = await prisma.monthlyDue.findMany({
          where: {
            residentId: input.residentId,
            year: currentYear,
          },
        });

        // Count overdue months (months before current month that are not fully paid)
        const overdueCount = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          // Only check months before the current month
          if (month >= currentMonth) return false;
          const monthPayments = allPayments.filter((p) => p.month === month);
          const totalPaid = monthPayments.reduce((sum, p) => sum + p.amountPaid, 0);
          // Month is overdue if total paid is less than required amount
          return totalPaid < MONTHLY_DUE_AMOUNT;
        }).filter(Boolean).length;

        // Only auto-archive if 6 or more months are overdue
        if (overdueCount >= 6) {
          await prisma.resident.update({
            where: { id: input.residentId },
            data: { isArchived: true },
          });
        } else {
          // If they were previously archived but now have less than 6 months overdue, unarchive them
          const resident = await prisma.resident.findUnique({
            where: { id: input.residentId },
            select: { isArchived: true },
          });
          if (resident?.isArchived && overdueCount < 6) {
            await prisma.resident.update({
              where: { id: input.residentId },
              data: { isArchived: false },
            });
          }
        }
      }

      // Log the payment
      const resident = await prisma.resident.findUnique({
        where: { id: input.residentId },
        select: { firstName: true, lastName: true },
      });
      const monthName = new Date(input.year, input.month - 1, 1).toLocaleString("default", { month: "long" });
      const residentName = resident ? `${resident.firstName} ${resident.lastName}` : input.residentId;

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: existing ? LogAction.PAYMENT_UPDATE : LogAction.PAYMENT_CREATE,
        module: LogModule.MONTHLY_DUES,
        entityId: result.id,
        entityType: "MonthlyDue",
        description: createLogDescription(
          existing ? LogAction.PAYMENT_UPDATE : LogAction.PAYMENT_CREATE,
          "Monthly Due Payment",
          `${residentName} - ${monthName} ${input.year}`,
          `Amount: ₱${result.amountPaid.toFixed(2)}`
        ),
        metadata: {
          residentId: input.residentId,
          month: input.month,
          year: input.year,
          amountPaid: result.amountPaid,
          paymentMethod: result.paymentMethod,
        },
      });

      return result;
    }),

  // Batch payment for multiple months
  createBatchPayment: protectedProcedure
    .input(
      z.object({
        residentId: z.string().min(1, "Resident is required"),
        year: z.number().int().min(2000).max(3000),
        payments: z.array(
          z.object({
            month: z.number().int().min(1).max(12),
            amountPaid: z.number().min(0.01, "Amount must be greater than 0"),
          })
        ),
        paymentMethod: z.enum(["CASH", "GCASH", "MAYA", "OTHER_BANK"]).optional(),
        notes: z.string().optional(),
        attachment: z.string().optional(),
        applyAdvance: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { payments, ...commonData } = input;
      const results = [];

      // Process each payment
      for (const payment of payments) {
        const existing = await prisma.monthlyDue.findFirst({
          where: {
            residentId: input.residentId,
            month: payment.month,
            year: input.year,
          },
        });

        let result;
        if (existing) {
          result = await prisma.monthlyDue.update({
            where: { id: existing.id },
            data: {
              amountPaid: existing.amountPaid + payment.amountPaid,
              paymentMethod: commonData.paymentMethod,
              notes: commonData.notes || existing.notes,
              attachment: commonData.attachment || existing.attachment,
            },
          });
        } else {
          result = await prisma.monthlyDue.create({
            data: {
              residentId: input.residentId,
              month: payment.month,
              year: input.year,
              amountPaid: payment.amountPaid,
              paymentMethod: commonData.paymentMethod,
              notes: commonData.notes,
              attachment: commonData.attachment,
            },
          });
        }
        results.push(result);
      }

      // Handle advance payment if enabled
      if (input.applyAdvance) {
        // Calculate total excess across all paid months
        let totalExcess = 0;
        for (const payment of payments) {
          const monthPayments = await prisma.monthlyDue.findMany({
            where: {
              residentId: input.residentId,
              month: payment.month,
              year: input.year,
            },
          });
          const totalPaid = monthPayments.reduce((sum, p) => sum + p.amountPaid, 0);
          const excess = totalPaid - MONTHLY_DUE_AMOUNT;
          if (excess > 0) totalExcess += excess;
        }

        if (totalExcess > 0) {
          // Find the last month paid and apply excess to next month
          const lastMonth = Math.max(...payments.map((p) => p.month));
          let nextMonth = lastMonth + 1;
          let nextYear = input.year;

          if (nextMonth > 12) {
            nextMonth = 1;
            nextYear += 1;
          }

          const nextMonthPayment = await prisma.monthlyDue.findFirst({
            where: {
              residentId: input.residentId,
              month: nextMonth,
              year: nextYear,
            },
          });

          if (nextMonthPayment) {
            await prisma.monthlyDue.update({
              where: { id: nextMonthPayment.id },
              data: {
                amountPaid: nextMonthPayment.amountPaid + totalExcess,
              },
            });
          } else {
            await prisma.monthlyDue.create({
              data: {
                residentId: input.residentId,
                month: nextMonth,
                year: nextYear,
                amountPaid: totalExcess,
                paymentMethod: input.paymentMethod,
                notes: `Advance payment from batch payment (${payments.length} months)`,
              },
            });
          }
        }
      }

      // Check auto-archive status once after all payments are processed
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const allPayments = await prisma.monthlyDue.findMany({
        where: {
          residentId: input.residentId,
          year: currentYear,
        },
      });

      const overdueCount = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        if (month >= currentMonth) return false;
        const monthPayments = allPayments.filter((p) => p.month === month);
        const totalPaid = monthPayments.reduce((sum, p) => sum + p.amountPaid, 0);
        return totalPaid < MONTHLY_DUE_AMOUNT;
      }).filter(Boolean).length;

      if (overdueCount >= 6) {
        await prisma.resident.update({
          where: { id: input.residentId },
          data: { isArchived: true },
        });
      } else {
        const resident = await prisma.resident.findUnique({
          where: { id: input.residentId },
          select: { isArchived: true },
        });
        if (resident?.isArchived && overdueCount < 6) {
          await prisma.resident.update({
            where: { id: input.residentId },
            data: { isArchived: false },
          });
        }
      }

      // Log the batch payment
      const resident = await prisma.resident.findUnique({
        where: { id: input.residentId },
        select: { firstName: true, lastName: true },
      });
      const residentName = resident ? `${resident.firstName} ${resident.lastName}` : input.residentId;
      const totalAmount = results.reduce((sum, r) => sum + r.amountPaid, 0);
      const monthsList = payments.map(p => {
        const monthName = new Date(input.year, p.month - 1, 1).toLocaleString("default", { month: "short" });
        return monthName;
      }).join(", ");

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.PAYMENT_CREATE,
        module: LogModule.MONTHLY_DUES,
        entityId: input.residentId,
        entityType: "MonthlyDue",
        description: createLogDescription(
          LogAction.PAYMENT_CREATE,
          "Batch Monthly Due Payment",
          `${residentName} - ${monthsList} ${input.year}`,
          `Total: ₱${totalAmount.toFixed(2)} (${payments.length} months)`
        ),
        metadata: {
          residentId: input.residentId,
          year: input.year,
          months: payments.map(p => p.month),
          totalAmount,
          paymentCount: payments.length,
        },
      });

      return results;
    }),

  // Delete a payment (for corrections)
  deletePayment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const payment = await prisma.monthlyDue.findUnique({
        where: { id: input.id },
        include: {
          resident: {
            select: { firstName: true, lastName: true },
          },
        },
      });

      const result = await prisma.monthlyDue.delete({
        where: { id: input.id },
      });

      if (payment) {
        const monthName = new Date(payment.year, payment.month - 1, 1).toLocaleString("default", { month: "long" });
        const residentName = payment.resident
          ? `${payment.resident.firstName} ${payment.resident.lastName}`
          : payment.residentId;

        await createSystemLog({
          userId: ctx.auth.user.id,
          action: LogAction.PAYMENT_DELETE,
          module: LogModule.MONTHLY_DUES,
          entityId: input.id,
          entityType: "MonthlyDue",
          description: createLogDescription(
            LogAction.PAYMENT_DELETE,
            "Monthly Due Payment",
            `${residentName} - ${monthName} ${payment.year}`,
            `Amount: ₱${payment.amountPaid.toFixed(2)}`
          ),
          metadata: {
            residentId: payment.residentId,
            month: payment.month,
            year: payment.year,
            amountPaid: payment.amountPaid,
          },
        });
      }

      return result;
    }),
});

