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

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ResetPasswordForm = ({ token }: { token: string }) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } else {
      toast.success(
        "Your password has been reset successfully. You can now log in with your new password."
      );
      setTimeout(() => {
        router.push("/admin/login");
      }, 3000);
    }
  };

  const isPending = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="">
                New Password <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="New Password"
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
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="">
                Confirm Password <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={isPending}
          variant="primary"
          type="submit"
          className="mt-2 w-full"
        >
          Reset Password
        </Button>

        <p className="text-sm text-center mt-2">
          Remember your password?{" "}
          <Link
            href="/admin/login"
            className="text-primary hover:underline font-medium"
          >
            Log In
          </Link>
        </p>
      </form>
    </Form>
  );
};
