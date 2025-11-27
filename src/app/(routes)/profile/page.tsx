"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, User, Lock, Save, Camera, X } from "lucide-react";
import ImageUpload from "@/components/image-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const Page = () => {
  const trpc = useTRPC();
  const [user, setUser] = useState<{ id: string; name: string | null; email: string; image: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");

  const updateProfileMutation = useMutation(
    trpc.auth.updateProfile.mutationOptions({
      onSuccess: async (data) => {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          image: data.image,
        });
        setProfileImage(data.image || "");
        profileForm.reset({
          name: data.name || "",
          email: data.email,
        });
        // Refresh session to get updated user data
        await authClient.getSession();
        toast.success("Profile updated successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update profile");
      },
    })
  );

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          const userData = {
            id: session.data.user.id,
            name: session.data.user.name ?? null,
            email: session.data.user.email,
            image: session.data.user.image ?? null,
          };
          setUser(userData);
          setProfileImage(userData.image || "");
          profileForm.reset({
            name: userData.name || "",
            email: userData.email,
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load profile information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [profileForm]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    updateProfileMutation.mutate({
      name: data.name,
      email: data.email,
      image: profileImage || undefined,
    });
  };

  const handleImageUpload = (url: string | string[]) => {
    const imageUrl = Array.isArray(url) ? url[0] : url;
    setProfileImage(imageUrl);
    // Auto-save image when uploaded
    updateProfileMutation.mutate({
      image: imageUrl || undefined,
    });
  };

  const handleRemoveImage = () => {
    setProfileImage("");
    // Auto-save when image is removed
    updateProfileMutation.mutate({
      image: "",
    });
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setIsChangingPassword(true);
    try {
      // Better Auth changePassword requires current password
      const result = await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (result?.error) {
        toast.error(result.error.message || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("An error occurred while changing password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f8f2] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1f5c34]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f8f2]">
        <Navbar variant="community" />
        <div className="pt-36 pb-10">
          <div className="mx-auto w-full max-w-4xl px-6">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-destructive">Please sign in to view your profile.</p>
              </CardContent>
            </Card>
          </div>
        </div>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8f2] text-[#1a2c1f]">
      <Navbar variant="community" />

      <div className="pt-36 pb-10">
        <div className="mx-auto w-full max-w-4xl px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-serif uppercase text-[#1a2c1f] mb-2">
              Account Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your account information and security settings
            </p>
          </div>

          <div className="grid gap-6">
            {/* Profile Information Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-[#1f5c34]" />
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profileImage || user.image || ""} alt={user.name || ""} />
                      <AvatarFallback className="bg-[#1f5c34] text-white text-xl">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {profileImage && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                        title="Remove profile picture"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{user.name || "No name set"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <Label className="text-sm font-medium mb-2 block">Profile Picture</Label>
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    defaultValue={profileImage}
                    imageCount={1}
                    maxSize={5}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload a profile picture (max 5MB). Supported formats: PNG, JPG, JPEG, SVG, WEBP, AVIF, GIF
                  </p>
                </div>

                <Separator className="my-6" />

                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Your email address is used for account verification and notifications.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={updateProfileMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-[#1f5c34]" />
                  <div>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your current password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your new password"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 8 characters long.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm your new password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isChangingPassword}
                      className="w-full sm:w-auto"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default Page;

