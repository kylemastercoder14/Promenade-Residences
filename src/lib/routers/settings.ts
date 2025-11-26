/* eslint-disable @typescript-eslint/no-require-imports */
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  createSystemLog,
  LogAction,
  LogModule,
  createLogDescription,
} from "@/lib/system-log";

export const settingsRouter = createTRPCRouter({
  // Get current user profile
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  // Update current user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        phone: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;

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
          message: "Email is already taken by another user",
        });
      }

      const oldUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          email: input.email,
          image: input.image,
        },
      });

      await createSystemLog({
        userId: ctx.auth.user.id,
        action: LogAction.PROFILE_UPDATE,
        module: LogModule.SETTINGS,
        entityId: userId,
        entityType: "User",
        description: createLogDescription(
          LogAction.PROFILE_UPDATE,
          "Profile",
          input.email
        ),
        metadata: {
          nameChanged: oldUser?.name !== input.name,
          emailChanged: oldUser?.email !== input.email,
        },
      });

      return updatedUser;
    }),

  // Change password
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
          .string()
          .min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;
      const userEmail = ctx.auth.user.email;

      // Verify current password by attempting to sign in
      try {
        const signInResult = await auth.api.signInEmail({
          body: {
            email: userEmail,
            password: input.currentPassword,
          },
          headers: await headers(),
        });

        if (!signInResult || !signInResult.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Current password is incorrect",
          });
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      // Get the user's account to update password
      const account = await prisma.account.findFirst({
        where: {
          userId: userId,
          providerId: "credential",
        },
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      // Update password - better-auth uses bcrypt for password hashing
      try {
        // Import bcrypt to hash the new password (better-auth uses bcrypt)
        const bcrypt = require("bcryptjs");
        const hashedPassword = await bcrypt.hash(input.newPassword, 10);

        await prisma.account.update({
          where: { id: account.id },
          data: {
            password: hashedPassword,
          },
        });

        await createSystemLog({
          userId: ctx.auth.user.id,
          action: LogAction.PASSWORD_CHANGE,
          module: LogModule.SETTINGS,
          entityId: userId,
          entityType: "User",
          description: createLogDescription(
            LogAction.PASSWORD_CHANGE,
            "Password",
            userEmail
          ),
        });

        return { success: true };
      } catch (error) {
        console.error("Password change error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to change password",
        });
      }
    }),

  // Get active sessions
  getActiveSessions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id;
    const currentSessionId = ctx.auth.session.id;

    // Get all active sessions for the user
    const sessions = await prisma.session.findMany({
      where: {
        userId: userId,
        expiresAt: {
          gt: new Date(), // Only active sessions
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Parse user agent and device info
    const parseUserAgent = (userAgent: string | null) => {
      if (!userAgent) {
        return { device: "Unknown", browser: "Unknown" };
      }

      // Parse browser
      let browser = "Unknown";
      if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
        browser = "Chrome";
      } else if (userAgent.includes("Firefox")) {
        browser = "Firefox";
      } else if (
        userAgent.includes("Safari") &&
        !userAgent.includes("Chrome")
      ) {
        browser = "Safari";
      } else if (userAgent.includes("Edg")) {
        browser = "Edge";
      } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
        browser = "Opera";
      }

      // Parse device/OS
      let device = "Unknown";
      if (userAgent.includes("Windows")) {
        device = "Windows";
      } else if (userAgent.includes("Mac")) {
        device = "macOS";
      } else if (userAgent.includes("Linux")) {
        device = "Linux";
      } else if (userAgent.includes("Android")) {
        device = "Android";
      } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
        device = "iOS";
      }

      return { device, browser };
    };

    return sessions.map((session) => {
      const { device, browser } = parseUserAgent(session.userAgent);
      return {
        id: session.id,
        device,
        browser,
        location: session.ipAddress || "Unknown",
        lastActive: session.updatedAt,
        isCurrent: session.id === currentSessionId,
      };
    });
  }),
});
