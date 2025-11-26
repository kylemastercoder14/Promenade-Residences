import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import { sendMail } from "./email";
import { ForgotPasswordEmailHTML } from "@/components/email-template/forgot-password";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    async sendResetPassword({ user, url }) {
      const htmlContent = await ForgotPasswordEmailHTML({
        userFirstname: user.name || "User",
        resetPasswordLink: url,
      });

      await sendMail(
        user.email,
        "Reset your password",
        `Click the following link to reset your password: ${url}`,
        htmlContent
      );
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
      isArchived: {
        type: "boolean",
        input: false,
        default: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
