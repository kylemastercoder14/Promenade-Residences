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

const formSchema = z.object({
  email: z.email(),
});

export const ForgotPasswordForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: "/admin/reset-password",
    });

    if (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } else {
      toast.success(
        "If an account with that email exists, a reset link has been sent."
      );
      form.reset();
    }
  };

  const isPending = form.formState.isSubmitting;

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
                  disabled={isPending}
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
        <Button
          disabled={isPending}
          variant="primary"
          type="submit"
          className="mt-2 w-full"
        >
          Send Reset Link
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
