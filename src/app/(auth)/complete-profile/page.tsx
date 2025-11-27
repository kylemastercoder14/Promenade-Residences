"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileCompletionForm } from "@/features/auth/components/profile-completion-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useTRPC } from '@/trpc/client';
import { useQuery } from "@tanstack/react-query";

const Page = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.auth.checkProfileComplete.queryOptions());

  useEffect(() => {
    if (data?.isComplete) {
      // Profile is already complete, redirect to home
      router.push("/");
    }
  }, [data, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data?.isComplete) {
    return null; // Will redirect
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide the following information to complete your profile and access all features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileCompletionForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;

