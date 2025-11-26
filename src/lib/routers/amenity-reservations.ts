import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { createSystemLog, LogAction, LogModule, createLogDescription } from "@/lib/system-log";

const amenityReservationSchema = z.object({
  id: z.string().optional(),
  userType: z.enum(["resident", "tenant", "visitor"]),
  userId: z.string().optional(),
  fullName: z.string().min(1, "Full name is required"),
  amenity: z.enum(["COURT", "GAZEBO", "PARKING_AREA"]),
  date: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  numberOfGuests: z.number().min(1, "Number of guests is required"),
  purpose: z.string().optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  amountToPay: z.number().min(0),
  amountPaid: z.number().min(0),
  status: z.enum(["pending", "approved", "rejected", "cancelled"]).default("pending"),
  paymentStatus: z.enum(["pending", "paid", "refunded"]).default("pending"),
  receiptUrl: z.string().optional(),
});

export const amenityReservationsRouter = createTRPCRouter({
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

      const paymentStatusMap: Record<string, "PENDING" | "PAID" | "REFUNDED"> = {
        "pending": "PENDING",
        "paid": "PAID",
        "refunded": "REFUNDED",
      };

      const reservation = await prisma.amenityReservation.create({
        data: {
          userType: userTypeMap[input.userType],
          userId: input.userId || null,
          fullName: input.fullName,
          amenity: input.amenity,
          date: input.date,
          startTime: input.startTime,
          endTime: input.endTime,
          numberOfGuests: input.numberOfGuests,
          purpose: input.purpose,
          paymentMethod: input.paymentMethod,
          amountToPay: calculatedAmount,
          amountPaid: input.amountPaid,
          status: statusMap[input.status],
          paymentStatus: paymentStatusMap[input.paymentStatus],
          receiptUrl: input.receiptUrl,
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

      const userTypeMap: Record<string, "RESIDENT" | "TENANT" | "VISITOR"> = {
        "resident": "RESIDENT",
        "tenant": "TENANT",
        "visitor": "VISITOR",
      };

      // For walk-in: status = Approved, amountPaid = amountToPay, generate receipt
      const reservation = await prisma.amenityReservation.create({
        data: {
          userType: userTypeMap[input.userType],
          userId: input.userId || null,
          fullName: input.fullName,
          amenity: input.amenity,
          date: input.date,
          startTime: input.startTime,
          endTime: input.endTime,
          numberOfGuests: input.numberOfGuests,
          purpose: input.purpose,
          paymentMethod: input.paymentMethod,
          amountToPay: calculatedAmount,
          amountPaid: calculatedAmount, // Auto-set to amountToPay
          status: "APPROVED", // Auto-approved
          paymentStatus: "PAID", // Auto-paid
          receiptUrl: null, // TODO: Generate receipt and upload
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

      const paymentStatusMap: Record<string, "PENDING" | "PAID" | "REFUNDED"> = {
        "pending": "PENDING",
        "paid": "PAID",
        "refunded": "REFUNDED",
      };

      const result = await prisma.amenityReservation.update({
        where: {
          id: input.id,
        },
        data: {
          userType: userTypeMap[input.userType],
          userId: input.userId || null,
          fullName: input.fullName,
          amenity: input.amenity,
          date: input.date,
          startTime: input.startTime,
          endTime: input.endTime,
          numberOfGuests: input.numberOfGuests,
          purpose: input.purpose,
          paymentMethod: input.paymentMethod,
          amountToPay: input.amountToPay,
          amountPaid: input.amountPaid,
          status: statusMap[input.status],
          paymentStatus: paymentStatusMap[input.paymentStatus],
          receiptUrl: input.receiptUrl,
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
      })
    )
    .mutation(({ input }) => {
      return prisma.amenityReservation.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
        },
      });
    }),
  updatePaymentStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        paymentStatus: z.enum(["PENDING", "PAID", "REFUNDED"]),
        amountPaid: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      return prisma.amenityReservation.update({
        where: {
          id: input.id,
        },
        data: {
          paymentStatus: input.paymentStatus,
          ...(input.amountPaid !== undefined && { amountPaid: input.amountPaid }),
        },
      });
    }),
});

