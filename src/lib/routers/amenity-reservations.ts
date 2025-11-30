import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { TRPCError } from "@trpc/server";
import {
  createSystemLog,
  LogAction,
  LogModule,
  createLogDescription,
} from "@/lib/system-log";

const amenityReservationSchema = z.object({
  id: z.string().optional(),
  userType: z.enum(["resident", "tenant", "visitor"]),
  userId: z.string().optional(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  amenity: z.enum(["COURT", "GAZEBO", "PARKING_AREA"]),
  date: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  numberOfGuests: z.number().min(1, "Number of guests is required"),
  purpose: z.string().optional(),
  paymentMethod: z.enum(["CASH", "GCASH", "MAYA", "OTHER_BANK"]).optional(),
  amountToPay: z.number().min(0),
  amountPaid: z.number().min(0),
  status: z.enum(["pending", "approved", "rejected", "cancelled"]).default("pending"),
  receiptUrl: z.string().optional(),
  proofOfPayment: z.string().optional(),
}).refine((data) => {
  // If payment method is not CASH, proof of payment is required
  if (data.paymentMethod && data.paymentMethod !== "CASH" && !data.proofOfPayment) {
    return false;
  }
  return true;
}, {
  message: "Proof of payment is required for non-cash payment methods",
  path: ["proofOfPayment"],
});

export const amenityReservationsRouter = createTRPCRouter({
  // Public endpoint to get the latest approved reservation (for homepage)
  getLatest: baseProcedure.query(async () => {
    const latestReservation = await prisma.amenityReservation.findFirst({
      where: {
        isArchived: false,
        status: "APPROVED",
        date: {
          gte: new Date(), // Only show upcoming reservations
        },
      },
      orderBy: {
        date: "asc", // Get the nearest upcoming reservation
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return latestReservation;
  }),

  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(({ input }) => {
      return prisma.amenityReservation.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        includeArchived: z.boolean().default(false),
      }).optional()
    )
    .query(({ input }) => {
      return prisma.amenityReservation.findMany({
        where: {
          isArchived: input?.includeArchived ? undefined : false,
        },
        orderBy: {
          date: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),
  getByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        amenity: z.enum(["COURT", "GAZEBO", "PARKING_AREA"]).optional(),
      })
    )
    .query(({ input }) => {
      return prisma.amenityReservation.findMany({
        where: {
          date: {
            gte: input.startDate,
            lte: input.endDate,
          },
          ...(input.amenity && {
            amenity: input.amenity
          }),
          status: {
            not: "CANCELLED",
          },
          isArchived: false,
        },
        orderBy: {
          date: "asc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),
  createReservation: protectedProcedure
    .input(amenityReservationSchema.omit({ id: true }))
    .mutation(async ({ input, ctx }) => {
      // Calculate amount based on amenity type and duration
      let calculatedAmount = 0;
      const start = new Date(`2000-01-01T${input.startTime}`);
      const end = new Date(`2000-01-01T${input.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      if (input.amenity === "GAZEBO") {
        // 60 pesos for 3 hours
        calculatedAmount = 60;
      } else if (input.amenity === "COURT") {
        // 100 pesos per hour
        calculatedAmount = hours * 100;
      } else if (input.amenity === "PARKING_AREA") {
        // 800 pesos per month if standard rate, 1000 pesos per event (15 hours max)
        if (hours <= 15) {
          calculatedAmount = 1000;
        } else {
          calculatedAmount = 800; // Monthly rate
        }
      }

      const userTypeMap: Record<string, "RESIDENT" | "TENANT" | "VISITOR"> = {
        "resident": "RESIDENT",
        "tenant": "TENANT",
        "visitor": "VISITOR",
      };

      const statusMap: Record<string, "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"> = {
        "pending": "PENDING",
        "approved": "APPROVED",
        "rejected": "REJECTED",
        "cancelled": "CANCELLED",
      };

      // Check for overlapping reservations for the same amenity/date
      // Only check APPROVED and PENDING statuses (REJECTED and CANCELLED don't block bookings)
      // Normalize date to start of day for comparison (UTC)
      const inputDate = new Date(input.date);
      inputDate.setUTCHours(0, 0, 0, 0);
      const nextDay = new Date(inputDate);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      const sameDayReservations = await prisma.amenityReservation.findMany({
        where: {
          amenity: input.amenity,
          date: {
            gte: inputDate,
            lt: nextDay,
          },
          isArchived: false,
          status: {
            in: ["APPROVED", "PENDING"],
          },
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          fullName: true,
          status: true,
        },
      });

      const newStart = new Date(`2000-01-01T${input.startTime}`);
      const newEnd = new Date(`2000-01-01T${input.endTime}`);

      const hasOverlap = sameDayReservations.some((r) => {
        const existingStart = new Date(`2000-01-01T${r.startTime}`);
        const existingEnd = new Date(`2000-01-01T${r.endTime}`);

        // Check for exact match (same start and end time)
        const isExactMatch =
          r.startTime === input.startTime &&
          r.endTime === input.endTime;

        // Check for time overlap: two time ranges overlap if one starts before the other ends
        // and vice versa. Using <= to catch exact matches at boundaries.
        const hasTimeOverlap = existingStart <= newEnd && newStart <= existingEnd;

        return isExactMatch || hasTimeOverlap;
      });

      if (hasOverlap) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This amenity is already reserved for the selected time slot.",
        });
      }

      // Normalize date to start of day for storage (UTC)
      const normalizedDate = new Date(input.date);
      normalizedDate.setUTCHours(0, 0, 0, 0);

      const reservation = await prisma.amenityReservation.create({
        data: {
          userType: userTypeMap[input.userType],
          userId: input.userId || null,
          fullName: input.fullName,
          email: input.email && input.email !== "" ? input.email : null,
          amenity: input.amenity,
          date: normalizedDate,
          startTime: input.startTime,
          endTime: input.endTime,
          numberOfGuests: input.numberOfGuests,
          purpose: input.purpose,
          paymentMethod: input.paymentMethod ? input.paymentMethod as "CASH" | "GCASH" | "MAYA" | "OTHER_BANK" : null,
          amountToPay: calculatedAmount,
          amountPaid: input.amountPaid,
          status: statusMap[input.status],
          receiptUrl: input.receiptUrl,
          proofOfPayment: input.proofOfPayment,
        },
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.CREATE,
        module: LogModule.AMENITY_RESERVATIONS,
        entityId: reservation.id,
        entityType: "AmenityReservation",
        description: createLogDescription(
          LogAction.CREATE,
          "Amenity Reservation",
          `${input.fullName} - ${input.amenity}`,
          `${input.startTime} - ${input.endTime} on ${input.date.toLocaleDateString()}`
        ),
        metadata: {
          amenity: input.amenity,
          status: reservation.status,
          amountToPay: calculatedAmount,
        },
      });

      return reservation;
    }),
  createWalkIn: protectedProcedure
    .input(amenityReservationSchema.omit({ id: true, receiptUrl: true }))
    .mutation(async ({ input, ctx }) => {
      // Calculate amount
      let calculatedAmount = 0;
      const start = new Date(`2000-01-01T${input.startTime}`);
      const end = new Date(`2000-01-01T${input.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      if (input.amenity === "GAZEBO") {
        calculatedAmount = 60;
      } else if (input.amenity === "COURT") {
        calculatedAmount = hours * 100;
      } else if (input.amenity === "PARKING_AREA") {
        calculatedAmount = hours <= 15 ? 1000 : 800;
      }

      // Check for overlapping reservations for the same amenity/date (including walk-ins)
      // Only check APPROVED and PENDING statuses (REJECTED and CANCELLED don't block bookings)
      // Normalize date to start of day for comparison (UTC)
      const inputDate = new Date(input.date);
      inputDate.setUTCHours(0, 0, 0, 0);
      const nextDay = new Date(inputDate);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      const sameDayReservations = await prisma.amenityReservation.findMany({
        where: {
          amenity: input.amenity,
          date: {
            gte: inputDate,
            lt: nextDay,
          },
          isArchived: false,
          status: {
            in: ["APPROVED", "PENDING"],
          },
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          fullName: true,
          status: true,
        },
      });

      const newStart = new Date(`2000-01-01T${input.startTime}`);
      const newEnd = new Date(`2000-01-01T${input.endTime}`);

      const hasOverlap = sameDayReservations.some((r) => {
        const existingStart = new Date(`2000-01-01T${r.startTime}`);
        const existingEnd = new Date(`2000-01-01T${r.endTime}`);

        // Check for exact match (same start and end time)
        const isExactMatch =
          r.startTime === input.startTime &&
          r.endTime === input.endTime;

        // Check for time overlap: two time ranges overlap if one starts before the other ends
        // and vice versa. Using <= to catch exact matches at boundaries.
        const hasTimeOverlap = existingStart <= newEnd && newStart <= existingEnd;

        return isExactMatch || hasTimeOverlap;
      });

      if (hasOverlap) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This amenity is already reserved for the selected time slot.",
        });
      }

      const userTypeMap: Record<string, "RESIDENT" | "TENANT" | "VISITOR"> = {
        "resident": "RESIDENT",
        "tenant": "TENANT",
        "visitor": "VISITOR",
      };

      // Normalize date to start of day for storage (UTC)
      const normalizedDate = new Date(input.date);
      normalizedDate.setUTCHours(0, 0, 0, 0);

      // For walk-in: status = Approved, amountPaid = amountToPay, generate receipt
      const reservation = await prisma.amenityReservation.create({
        data: {
          userType: userTypeMap[input.userType],
          userId: input.userId || null,
          fullName: input.fullName,
          email: input.email && input.email !== "" ? input.email : null,
          amenity: input.amenity,
          date: normalizedDate,
          startTime: input.startTime,
          endTime: input.endTime,
          numberOfGuests: input.numberOfGuests,
          purpose: input.purpose,
          paymentMethod: input.paymentMethod ? input.paymentMethod as "CASH" | "GCASH" | "MAYA" | "OTHER_BANK" : null,
          amountToPay: calculatedAmount,
          amountPaid: calculatedAmount, // Auto-set to amountToPay
          status: "APPROVED", // Auto-approved
          receiptUrl: null, // TODO: Generate receipt and upload
          proofOfPayment: input.proofOfPayment,
        },
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.CREATE,
        module: LogModule.AMENITY_RESERVATIONS,
        entityId: reservation.id,
        entityType: "AmenityReservation",
        description: createLogDescription(
          LogAction.CREATE,
          "Walk-in Amenity Reservation",
          `${input.fullName} - ${input.amenity}`,
          `Walk-in payment: ₱${calculatedAmount}`
        ),
        metadata: {
          amenity: input.amenity,
          isWalkIn: true,
          amountPaid: calculatedAmount,
        },
      });

      return reservation;
    }),
  updateReservation: protectedProcedure
    .input(amenityReservationSchema)
    .mutation(async ({ input, ctx }) => {
      if (!input.id) {
        throw new Error("Reservation ID is required for update");
      }

      const oldReservation = await prisma.amenityReservation.findUnique({
        where: { id: input.id },
      });

      if (!oldReservation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reservation not found",
        });
      }

      const userTypeMap: Record<string, "RESIDENT" | "TENANT" | "VISITOR"> = {
        "resident": "RESIDENT",
        "tenant": "TENANT",
        "visitor": "VISITOR",
      };

      const statusMap: Record<string, "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"> = {
        "pending": "PENDING",
        "approved": "APPROVED",
        "rejected": "REJECTED",
        "cancelled": "CANCELLED",
      };

      // Check for overlapping reservations when updating (excluding current)
      // Only check APPROVED and PENDING statuses (REJECTED and CANCELLED don't block bookings)
      // Normalize date to start of day for comparison (UTC)
      const inputDate = new Date(input.date);
      inputDate.setUTCHours(0, 0, 0, 0);
      const nextDay = new Date(inputDate);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      const sameDayReservations = await prisma.amenityReservation.findMany({
        where: {
          amenity: input.amenity,
          date: {
            gte: inputDate,
            lt: nextDay,
          },
          isArchived: false,
          status: {
            in: ["APPROVED", "PENDING"],
          },
          NOT: {
            id: input.id,
          },
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          fullName: true,
          status: true,
        },
      });

      const newStart = new Date(`2000-01-01T${input.startTime}`);
      const newEnd = new Date(`2000-01-01T${input.endTime}`);

      const hasOverlap = sameDayReservations.some((r) => {
        const existingStart = new Date(`2000-01-01T${r.startTime}`);
        const existingEnd = new Date(`2000-01-01T${r.endTime}`);

        // Check for exact match (same start and end time)
        const isExactMatch =
          r.startTime === input.startTime &&
          r.endTime === input.endTime;

        // Check for time overlap: two time ranges overlap if one starts before the other ends
        // and vice versa. Using <= to catch exact matches at boundaries.
        const hasTimeOverlap = existingStart <= newEnd && newStart <= existingEnd;

        return isExactMatch || hasTimeOverlap;
      });

      if (hasOverlap) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This amenity is already reserved for the selected time slot.",
        });
      }

      // Normalize date to start of day for storage (UTC)
      const normalizedDate = new Date(input.date);
      normalizedDate.setUTCHours(0, 0, 0, 0);

      const result = await prisma.amenityReservation.update({
        where: {
          id: input.id,
        },
        data: {
          userType: userTypeMap[input.userType],
          userId: input.userId || null,
          fullName: input.fullName,
          email: input.email && input.email !== "" ? input.email : null,
          amenity: input.amenity,
          date: normalizedDate,
          startTime: input.startTime,
          endTime: input.endTime,
          numberOfGuests: input.numberOfGuests,
          purpose: input.purpose,
          paymentMethod: input.paymentMethod ? input.paymentMethod as "CASH" | "GCASH" | "MAYA" | "OTHER_BANK" : null,
          amountToPay: input.amountToPay,
          amountPaid: input.amountPaid,
          status: statusMap[input.status],
          receiptUrl: input.receiptUrl,
          proofOfPayment: input.proofOfPayment,
        },
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.UPDATE,
        module: LogModule.AMENITY_RESERVATIONS,
        entityId: result.id,
        entityType: "AmenityReservation",
        description: createLogDescription(
          LogAction.UPDATE,
          "Amenity Reservation",
          `${result.fullName} - ${result.amenity}`
        ),
      });

      return result;
    }),
  deleteReservation: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const reservation = await prisma.amenityReservation.findUnique({
        where: { id: input.id },
      });
      const result = await prisma.amenityReservation.delete({
        where: {
          id: input.id,
        },
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.DELETE,
        module: LogModule.AMENITY_RESERVATIONS,
        entityId: input.id,
        entityType: "AmenityReservation",
        description: createLogDescription(
          LogAction.DELETE,
          "Amenity Reservation",
          reservation ? `${reservation.fullName} - ${reservation.amenity}` : input.id
        ),
      });

      return result;
    }),
  archiveReservation: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isArchived: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const reservation = await prisma.amenityReservation.findUnique({
        where: { id: input.id },
      });
      const result = await prisma.amenityReservation.update({
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
        module: LogModule.AMENITY_RESERVATIONS,
        entityId: input.id,
        entityType: "AmenityReservation",
        description: createLogDescription(
          input.isArchived ? LogAction.ARCHIVE : LogAction.RETRIEVE,
          "Amenity Reservation",
          reservation ? `${reservation.fullName} - ${reservation.amenity}` : input.id
        ),
      });

      return result;
    }),
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]),
        rejectionRemarks: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      return prisma.amenityReservation.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
          rejectionRemarks: input.status === "REJECTED" ? input.rejectionRemarks : null,
        },
      });
    }),
});

