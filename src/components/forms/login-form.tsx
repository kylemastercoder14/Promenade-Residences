"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Role } from "@prisma/client";
import { useTRPC } from "@/trpc/client";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Helper function to determine redirect URL based on user role
const getRedirectUrl = (role: string | undefined): string => {
  if (!role) return "/";

  switch (role) {
    case Role.SUPERADMIN:
    case Role.ADMIN:
    case Role.ACCOUNTING:
      return "/admin/dashboard";
    case Role.USER:
    default:
      return "/"; // Homepage for regular users/residents
  }
};

export const LoginForm = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const { email, password } = data;
    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      });

      if (result?.error) {
        toast.error(result.error.message || "Invalid credentials. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Wait a bit for session to be set, then get user role
      await new Promise((resolve) => setTimeout(resolve, 100));

      const session = await authClient.getSession();
      const userRole = session?.data?.user?.role as string | undefined;

      // Check if user is approved (for regular users only, admins are auto-approved)
      if (userRole === Role.USER) {
        try {
          // Check approval status using TRPC
          const approvalStatus = await trpc.auth.checkApprovalStatus.query();

          if (!approvalStatus.isApproved) {
            toast.error("Your account is pending approval. Please wait for an administrator to approve your account.");
            setIsSubmitting(false);
            // Sign out the user
            await authClient.signOut();
            return;
          }
        } catch (error) {
          // If check fails, allow login but will be checked in protected routes
          console.error("Error checking approval status:", error);
        }
      }

      const redirectUrl = getRedirectUrl(userRole);

      toast.success("Welcome back!");

      // Use window.location for a full page reload to ensure session is properly set
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="">
                Email Address <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="">
                Password <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Password"
                  className="w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <Link prefetch href="/forgot-password" className="text-sm underline text-muted-foreground hover:text-foreground">
            Forgot Password?
          </Link>
        </div>
        <Button
          variant="primary"
          type="submit"
          className="mt-2 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Continue with Email"}
        </Button>
      </form>
    </Form>
  );
};
