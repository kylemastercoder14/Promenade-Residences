"use client";

import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { ArrowLeft, EyeIcon, EyeOffIcon, RefreshCcwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Role } from "@/generated/prisma/enums";
import { generatePassword } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ImageUpload from "@/components/image-upload";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useUpdateAccount, useUpdateRole } from "@/features/accounts/hooks/use-accounts";
import { User } from "@/lib/auth";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().optional(),
  image: z.string().optional(),
  role: z.enum(Role),
});

export const AccountForm = ({ initialData }: { initialData: User | null }) => {
  const router = useRouter();
  const updateRole = useUpdateRole();
  const updateAccount = useUpdateAccount();
  const title = initialData
    ? `Edit Account: ${initialData.email}`
    : "Create New Account";
  const description = initialData
    ? "Edit an existing account."
    : "Create a new account.";
  const action = initialData ? "Save changes" : "Create account";

  const [isVisible, setIsVisible] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData ? initialData.name : "",
      email: initialData ? initialData.email : "",
      password: "",
      image: initialData ? (initialData.image ?? "") : "",
      role: initialData ? (initialData.role as Role) : Role.USER,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (initialData) {
      updateAccount.mutate(
        {
          ...data,
          id: initialData.id,
        },
        {
          onSuccess: () => {
            toast.success("Account updated successfully");
            router.push("/admin/accounts");
          },
          onError: (error) => {
            toast.error(`Failed to update account: ${error.message}`);
          },
        }
      );
    } else {
      await authClient.signUp.email(
        {
          name: data.name,
          image: data.image,
          email: data.email,
          password: data.password || "",
        },
        {
          onSuccess: (ctx) => {
            const newUserId = ctx.data.user.id;
            updateRole.mutate(
              {
                id: newUserId,
                role: data.role,
              },
              {
                onSuccess: () => {
                  router.push("/admin/accounts");
                },
                onError: (error) => {
                  toast.error(`Failed to update role: ${error.message}`);
                },
              }
            );
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        }
      );
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div>
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} variant="outline" size="icon">
          <ArrowLeft className="size-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <Heading title={title} description={description} />
      </div>
      <div className="mt-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. Juan Dela Cruz"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      disabled={isSubmitting}
                      placeholder="e.g. juan.delacruz@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!initialData && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex relative rounded-md shadow-xs">
                        <Input
                          type={isVisible ? "text" : "password"}
                          placeholder="Enter password"
                          {...field}
                          disabled={isSubmitting}
                          className="-me-px rounded-r-none shadow-none"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() =>
                            setIsVisible((prevState) => !prevState)
                          }
                          className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-44 rounded-l-none hover:bg-transparent"
                        >
                          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                          <span className="sr-only">
                            {isVisible ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          // size="sm"
                          type="button"
                          onClick={() => {
                            const newPass = generatePassword();
                            form.setValue("password", newPass, {
                              shouldValidate: true,
                            });
                          }}
                          className="rounded-l-none"
                        >
                          Generate Password
                          <RefreshCcwIcon className="size-4" />
                          <span className="sr-only">Generate</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Role <span className="text-destructive">*</span>
                  </FormLabel>

                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid lg:grid-cols-4 grid-cols-1 gap-3"
                    >
                      {[
                        {
                          value: Role.SUPERADMIN,
                          title: "Super Admin",
                          description: "Full control over the entire system.",
                        },
                        {
                          value: Role.ADMIN,
                          title: "Admin",
                          description: "Can manage accounts and operations.",
                        },
                        {
                          value: Role.ACCOUNTING,
                          title: "Accounting",
                          description:
                            "Handles transactions and collections records.",
                        },
                        {
                          value: Role.USER,
                          title: "User",
                          description: "Standard resident access.",
                        },
                      ].map((item) => {
                        const isSelected = field.value === item.value;

                        return (
                          <label
                            key={item.value}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                              isSelected
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem
                              value={item.value}
                              className="mt-1"
                            />

                            <div>
                              <p className="font-semibold">{item.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Profile Image{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      imageCount={1}
                      maxSize={2}
                      onImageUpload={(url) => field.onChange(url)}
                      defaultValue={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {action}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
