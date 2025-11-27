import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useSignUp = () => {
  const trpc = useTRPC();
  const router = useRouter();

  return useMutation(
    trpc.auth.signUp.mutationOptions({
      onSuccess: () => {
        // Clear stored form data
        if (typeof window !== "undefined") {
          localStorage.removeItem("signupFormData");
        }
        toast.success("Account created successfully! Please sign in.");
        router.push("/sign-in");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create account. Please try again.");
      },
    })
  );
};

