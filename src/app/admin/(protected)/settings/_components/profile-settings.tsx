"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import AvatarUpload from "@/components/avatar-upload";
import { useCurrentUser, useUpdateProfile } from "@/features/settings/hooks/use-settings";
import { Loading } from "@/components/loading";

const profileSettingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  image: z.string().optional(),
});

type ProfileSettingsForm = z.infer<typeof profileSettingsSchema>;

export const ProfileSettings = () => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileSettingsForm>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      image: "",
    },
  });

  // Load current user data into form
  useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: "",
        image: currentUser.image || "",
      });
    }
  }, [currentUser, form]);

  if (isLoading) {
    return <Loading message="Loading profile..." />;
  }

  const onSubmit = async (data: ProfileSettingsForm) => {
    try {
      await updateProfile.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        image: data.image,
      });
    } catch (error) {
      // Error is handled by the mutation
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and profile picture.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Profile Picture <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <AvatarUpload
                      value={field.value}
                      onChange={field.onChange}
                      name={form.watch("name")}
                      disabled={updateProfile.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a circular profile picture (max 5MB). Recommended: 200x200px.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your full name as it appears in the system.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email Address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your email address for login and notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone Number <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+63 917 123 4567" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your contact number for SMS notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

