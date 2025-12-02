import { createTRPCRouter, baseProcedure, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { ResidencyType, Sex } from "@prisma/client";
import { authClient } from "../auth-client";

const signUpSchema = z.object({
  residencyType: z.enum(["RESIDENT", "TENANT"]),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  sex: z.enum(["MALE", "FEMALE", "PREFER_NOT_TO_SAY"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  block: z.string().min(1, "Block is required"),
  lot: z.string().optional(),
  street: z.string().min(1, "Street is required"),
  email: z.string().email("Invalid email address"),
  contactNumber: z.string().min(1, "Contact number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const authRouter = createTRPCRouter({
  checkApprovalStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.auth.user.id },
      select: { isApproved: true },
    });
    return { isApproved: user?.isApproved ?? false };
  }),
  signUp: baseProcedure.input(signUpSchema).mutation(async ({ input }) => {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "An account with this email already exists.",
      });
    }

    // Find or create map based on block, lot, and street
    let map = await prisma.maps.findFirst({
      where: {
        blockNo: input.block,
        lotNo: input.lot || null,
        street: input.street,
      },
    });

    if (!map) {
      // Create a new map entry if it doesn't exist
      map = await prisma.maps.create({
        data: {
          blockNo: input.block,
          lotNo: input.lot || null,
          street: input.street,
          lotSize: 0, // Default values, can be updated later
          houseType: "Unknown",
          minPrice: 0,
          maxPrice: 0,
          paymentMethod: "Cash",
          attachmentUrl: "",
          availability: "Occupied", // Newly created lot is immediately occupied by this resident
        },
      });
    } else if (map.availability.toLowerCase() === "available") {
      // When a resident signs up on an existing available lot, mark it as occupied
      map = await prisma.maps.update({
        where: { id: map.id },
        data: { availability: "Occupied" },
      });
    }

    // Use Better Auth's server API to create user and account
    // Create user first
    const fullName = `${input.firstName} ${input.lastName}`.trim();

    await authClient.signUp.email({
      email: input.email,
      password: input.password,
      name: fullName,
    });

    // Update user to set isApproved: false (requires admin approval)
    const createdUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (createdUser) {
      await prisma.user.update({
        where: { id: createdUser.id },
        data: { isApproved: false },
      });
    }

    // Create resident record
    const resident = await prisma.resident.create({
      data: {
        typeOfResidency: input.residencyType as ResidencyType,
        firstName: input.firstName,
        middleName: input.middleName || null,
        lastName: input.lastName,
        suffix: input.suffix || null,
        sex: input.sex as Sex,
        dateOfBirth: new Date(input.dateOfBirth),
        contactNumber: input.contactNumber,
        emailAddress: input.email,
        isHead: true, // Sign-up users are always head of household
        mapId: map.id,
      },
    });

    return {
      resident,
      map,
    };
  }),

  // Check if user profile is complete
  checkProfileComplete: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id;
    const userEmail = ctx.auth.user.email;

    // Check if resident record exists
    const resident = await prisma.resident.findFirst({
      where: {
        emailAddress: userEmail,
      },
      include: {
        map: true,
      },
    });

    if (!resident) {
      return {
        isComplete: false,
        missingFields: [
          "typeOfResidency",
          "firstName",
          "lastName",
          "sex",
          "dateOfBirth",
          "contactNumber",
          "block",
          "lot",
          "street",
        ],
        resident: null,
      };
    }

    // Check for missing required fields
    const missingFields: string[] = [];
    if (!resident.typeOfResidency) missingFields.push("typeOfResidency");
    if (!resident.firstName) missingFields.push("firstName");
    if (!resident.lastName) missingFields.push("lastName");
    if (!resident.sex) missingFields.push("sex");
    if (!resident.dateOfBirth) missingFields.push("dateOfBirth");
    if (!resident.contactNumber) missingFields.push("contactNumber");
    if (!resident.map) {
      missingFields.push("block", "lot", "street");
    } else {
      if (!resident.map.blockNo) missingFields.push("block");
      if (!resident.map.street) missingFields.push("street");
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      resident: {
        id: resident.id,
        typeOfResidency: resident.typeOfResidency,
        firstName: resident.firstName,
        middleName: resident.middleName,
        lastName: resident.lastName,
        suffix: resident.suffix,
        sex: resident.sex,
        dateOfBirth: resident.dateOfBirth,
        contactNumber: resident.contactNumber,
        emailAddress: resident.emailAddress,
        block: resident.map?.blockNo || null,
        lot: resident.map?.lotNo || null,
        street: resident.map?.street || null,
      },
    };
  }),

  // Complete profile with missing fields
  completeProfile: protectedProcedure
    .input(
      z.object({
        residencyType: z.enum(["RESIDENT", "TENANT"]),
        firstName: z.string().min(1, "First name is required"),
        middleName: z.string().optional(),
        lastName: z.string().min(1, "Last name is required"),
        suffix: z.string().optional(),
        sex: z.enum(["MALE", "FEMALE", "PREFER_NOT_TO_SAY"]),
        dateOfBirth: z.string().min(1, "Date of birth is required"),
        block: z.string().min(1, "Block is required"),
        lot: z.string().optional(),
        street: z.string().min(1, "Street is required"),
        contactNumber: z.string().min(1, "Contact number is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;
      const userEmail = ctx.auth.user.email;

      // Find or create map based on block, lot, and street
      let map = await prisma.maps.findFirst({
        where: {
          blockNo: input.block,
          lotNo: input.lot || null,
          street: input.street,
        },
      });

      if (!map) {
        map = await prisma.maps.create({
          data: {
            blockNo: input.block,
            lotNo: input.lot || null,
            street: input.street,
            lotSize: 0,
            houseType: "Unknown",
            minPrice: 0,
            maxPrice: 0,
            paymentMethod: "Cash",
            attachmentUrl: "",
            availability: "Occupied",
          },
        });
      } else if (map.availability.toLowerCase() === "available") {
        // Completing profile on an existing available lot should also mark it as occupied
        map = await prisma.maps.update({
          where: { id: map.id },
          data: { availability: "Occupied" },
        });
      }

      // Check if resident exists
      const existingResident = await prisma.resident.findFirst({
        where: {
          emailAddress: userEmail,
        },
      });

      if (existingResident) {
        // Update existing resident
        const resident = await prisma.resident.update({
          where: { id: existingResident.id },
          data: {
            typeOfResidency: input.residencyType as ResidencyType,
            firstName: input.firstName,
            middleName: input.middleName || null,
            lastName: input.lastName,
            suffix: input.suffix || null,
            sex: input.sex as Sex,
            dateOfBirth: new Date(input.dateOfBirth),
            contactNumber: input.contactNumber,
            emailAddress: userEmail,
            isHead: true,
            mapId: map.id,
          },
        });

        return { resident, map };
      } else {
        // Create new resident
        const resident = await prisma.resident.create({
          data: {
            typeOfResidency: input.residencyType as ResidencyType,
            firstName: input.firstName,
            middleName: input.middleName || null,
            lastName: input.lastName,
            suffix: input.suffix || null,
            sex: input.sex as Sex,
            dateOfBirth: new Date(input.dateOfBirth),
            contactNumber: input.contactNumber,
            emailAddress: userEmail,
            isHead: true,
            mapId: map.id,
          },
        });

        return { resident, map };
      }
    }),

  // Get current user's resident info (for household head)
  getMyResident: protectedProcedure.query(async ({ ctx }) => {
    const userEmail = ctx.auth.user.email;

    const resident = await prisma.resident.findFirst({
      where: {
        emailAddress: userEmail,
        isHead: true, // Only household heads can add members
      },
      include: {
        map: true,
      },
    });

    if (!resident) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Household head record not found. Please complete your profile first.",
      });
    }

    return {
      id: resident.id,
      mapId: resident.mapId,
      typeOfResidency: resident.typeOfResidency,
      block: resident.map?.blockNo || null,
      lot: resident.map?.lotNo || null,
      street: resident.map?.street || null,
    };
  }),

  // Add household member (non-head resident)
  addHouseholdMember: protectedProcedure
    .input(
      z.object({
        typeOfResidency: z.enum(["RESIDENT", "TENANT"]),
        firstName: z.string().min(1, "First name is required"),
        middleName: z.string().optional(),
        lastName: z.string().min(1, "Last name is required"),
        suffix: z.string().optional(),
        sex: z.enum(["MALE", "FEMALE", "PREFER_NOT_TO_SAY"]),
        dateOfBirth: z.string().min(1, "Date of birth is required"),
        contactNumber: z.string().min(1, "Contact number is required"),
        emailAddress: z.string().email().optional().or(z.literal("")),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userEmail = ctx.auth.user.email;

      // Get current user's resident record (household head)
      const headResident = await prisma.resident.findFirst({
        where: {
          emailAddress: userEmail,
          isHead: true,
        },
        include: {
          map: true,
        },
      });

      if (!headResident || !headResident.mapId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Household head record not found. Please complete your profile first.",
        });
      }

      // Create household member (not head, same mapId)
      const member = await prisma.resident.create({
        data: {
          typeOfResidency: input.typeOfResidency as ResidencyType,
          firstName: input.firstName,
          middleName: input.middleName || null,
          lastName: input.lastName,
          suffix: input.suffix || null,
          sex: input.sex as Sex,
          dateOfBirth: new Date(input.dateOfBirth),
          contactNumber: input.contactNumber,
          emailAddress: input.emailAddress === "" ? null : input.emailAddress,
          isHead: false, // Household member, not head
          mapId: headResident.mapId, // Same household/property
        },
        include: {
          map: {
            select: {
              id: true,
              blockNo: true,
              lotNo: true,
              street: true,
            },
          },
        },
      });

      return member;
    }),

  // Get all household members (same mapId as head)
  getHouseholdMembers: protectedProcedure.query(async ({ ctx }) => {
    const userEmail = ctx.auth.user.email;

    // Get current user's resident record (household head)
    const headResident = await prisma.resident.findFirst({
      where: {
        emailAddress: userEmail,
        isHead: true,
      },
    });

    if (!headResident || !headResident.mapId) {
      return [];
    }

    // Get all residents with the same mapId (household members)
    const members = await prisma.resident.findMany({
      where: {
        mapId: headResident.mapId,
        isArchived: false,
      },
      include: {
        map: {
          select: {
            id: true,
            blockNo: true,
            lotNo: true,
            street: true,
          },
        },
      },
      orderBy: [
        { isHead: "desc" }, // Head first
        { createdAt: "asc" }, // Then by creation date
      ],
    });

    return members;
  }),

  // Update user profile (name, email, image)
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").optional(),
        email: z.string().email("Invalid email address").optional(),
        image: z.string().url("Invalid image URL").optional().or(z.literal("")),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;
      const updateData: { name?: string; email?: string; image?: string | null } = {};

      if (input.name !== undefined) {
        updateData.name = input.name;
      }

      if (input.email !== undefined) {
        // Check if email is already taken by another user
        const existingUser = await prisma.user.findFirst({
          where: {
            email: input.email,
            id: { not: userId },
          },
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An account with this email already exists.",
          });
        }

        updateData.email = input.email;
      }

      if (input.image !== undefined) {
        updateData.image = input.image || null;
      }

      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });

      return updatedUser;
    }),

  // Get all transactions for the logged-in user
  getMyTransactions: protectedProcedure.query(async ({ ctx }) => {
    const userEmail = ctx.auth.user.email;
    const userId = ctx.auth.user.id;

    // Get current user's resident record (household head)
    const headResident = await prisma.resident.findFirst({
      where: {
        emailAddress: userEmail,
        isHead: true,
      },
    });

    const transactions: Array<{
      id: string;
      type: "MONTHLY_DUE" | "AMENITY_RESERVATION" | "VEHICLE_REGISTRATION";
      date: Date;
      amount?: number;
      status?: string;
      description: string;
      metadata?: Record<string, unknown>;
    }> = [];

    // Get monthly dues payment transactions (individual transactions, not monthly summaries)
    if (headResident) {
      const paymentTransactions = await prisma.paymentTransaction.findMany({
        where: {
          residentId: headResident.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          monthlyDue: {
            select: {
              month: true,
              year: true,
            },
          },
          resident: {
            select: {
              firstName: true,
              middleName: true,
              lastName: true,
              suffix: true,
            },
          },
        },
      });

      for (const transaction of paymentTransactions) {
        const monthNames = [
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
        const month = transaction.monthlyDue?.month;
        const year = transaction.monthlyDue?.year;
        const monthName = month ? monthNames[month - 1] : "Unknown";

        transactions.push({
          id: transaction.id,
          type: "MONTHLY_DUE",
          date: transaction.createdAt,
          amount: transaction.amount,
          status: transaction.status || "PENDING",
          description: month && year
            ? `Monthly Due Payment - ${monthName} ${year}`
            : "Monthly Due Payment",
          metadata: {
            month: month,
            year: year,
            paymentMethod: transaction.paymentMethod,
            proofOfPayment: transaction.proofOfPayment,
            notes: transaction.notes,
            residentId: transaction.residentId,
          },
        });
      }
    }

    // Get amenity reservations
    // Include reservations by userId OR by email (for residents/tenants) OR by email (for visitors)
    // Include all statuses including PENDING
    const amenityReservations = await prisma.amenityReservation.findMany({
      where: {
        OR: [
          { userId: userId },
          ...(userEmail ? [{ email: userEmail }] : []),
          // Also check if user is a resident and match by their email
          ...(headResident?.emailAddress
            ? [{ email: headResident.emailAddress }]
            : []),
        ],
        isArchived: false,
        // Include all statuses - no status filter to show pending reservations
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    for (const reservation of amenityReservations) {
      const amenityLabels: Record<string, string> = {
        COURT: "Court",
        GAZEBO: "Gazebo",
        PARKING_AREA: "Parking Area",
      };

      // Use status directly (paymentStatus was removed)
      const displayStatus: string = reservation.status;

      transactions.push({
        id: reservation.id,
        type: "AMENITY_RESERVATION",
        date: reservation.createdAt,
        amount: reservation.amountPaid || reservation.amountToPay,
        status: displayStatus,
        description: `Amenity Reservation - ${amenityLabels[reservation.amenity] || reservation.amenity}`,
        metadata: {
          amenity: reservation.amenity,
          date: reservation.date,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          fullName: reservation.fullName,
          reservationStatus: reservation.status,
          rejectionRemarks: reservation.rejectionRemarks,
          paymentMethod: reservation.paymentMethod,
          proofOfPayment: reservation.proofOfPayment,
        },
      });
    }

    // Get vehicle registrations
    if (headResident && headResident.mapId) {
      const householdMembers = await prisma.resident.findMany({
        where: {
          mapId: headResident.mapId,
          isArchived: false,
        },
        select: {
          id: true,
        },
      });

      const memberIds = householdMembers.map((m) => m.id);

      const vehicles = await prisma.vehicleRegistration.findMany({
        where: {
          residentId: {
            in: memberIds,
          },
          isArchived: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          resident: {
            select: {
              firstName: true,
              middleName: true,
              lastName: true,
              suffix: true,
            },
          },
        },
      });

      for (const vehicle of vehicles) {
        transactions.push({
          id: vehicle.id,
          type: "VEHICLE_REGISTRATION",
          date: vehicle.createdAt,
          status: "REGISTERED",
          description: `Vehicle Registration - ${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})`,
          metadata: {
            brand: vehicle.brand,
            model: vehicle.model,
            plateNumber: vehicle.plateNumber,
            vehicleType: vehicle.vehicleType,
            residentId: vehicle.residentId,
          },
        });
      }
    }

    // Sort all transactions by date (newest first)
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    return transactions;
  }),
});
