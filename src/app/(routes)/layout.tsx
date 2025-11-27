"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { FeedbackModal } from "@/components/feedback-modal";
import { MonthlyDueRestrictionModal } from "@/components/monthly-due-restriction-modal";
import { Loader2 } from "lucide-react";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/faqs",
  "/community",
  "/announcement",
  "/general-policy",
  "/hoa-contract",
  "/privacy-policy",
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/community/");

        if (!session?.data?.user && !isPublicRoute) {
          // Redirect to sign-in if not authenticated and not on a public route
          router.push("/sign-in");
          return;
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/community/");
        if (!isPublicRoute) {
          router.push("/sign-in");
          return;
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading state while checking authentication for protected routes
  if (isChecking) {
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/community/");
    if (!isPublicRoute) {
      return (
        <div className="min-h-screen bg-[#f5f8f2] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1f5c34]" />
        </div>
      );
    }
  }

  return (
    <div>
      {children}
      <FeedbackModal />
      <MonthlyDueRestrictionModal />
    </div>
  );
};

export default Layout;
