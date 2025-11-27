"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentForm } from "@/features/monthly-dues/components/payment-form";

const MONTHLY_DUE_AMOUNT = 750;

export const MonthlyDueRestrictionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<{ user?: { role?: string } } | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        setSession(sessionData?.data || null);
        setIsChecking(false);
      } catch {
        setIsChecking(false);
      }
    };
    checkSession();
  }, []);

  // Get current user's resident data (household head)
  // Only query if user is logged in and is a USER role
  const shouldFetchResident = !!session?.user && session.user.role === "USER";
  const residentQueryOptions = trpc.auth.getMyResident.queryOptions();
  // Type assertion needed because tRPC queryOptions() doesn't support adding 'enabled' via spread
  const residentQuery = useQuery({
    ...residentQueryOptions,
    enabled: shouldFetchResident,
  } as Parameters<typeof useQuery>[0]);
  type ResidentData = { id: string; mapId: string | null; typeOfResidency: string; block: string | null; lot: string | null; street: string | null };
  const myResident: ResidentData | undefined = residentQuery.data as ResidentData | undefined;
  const isLoadingResident = residentQuery.isLoading;

  // Get monthly dues data
  // Only query if we have a resident ID
  const shouldFetchDues = !!myResident?.id;
  const duesQueryOptions = trpc.monthlyDues.getByResident.queryOptions({
    residentId: myResident?.id || "",
    year: currentYear,
  });
  // Type assertion needed because tRPC queryOptions() doesn't support adding 'enabled' via spread
  const duesQuery = useQuery({
    ...duesQueryOptions,
    enabled: shouldFetchDues,
  } as Parameters<typeof useQuery>[0]);
  type MonthlyDuesData = {
    resident: unknown;
    year: number;
    months: Array<{
      month: number;
      monthName: string;
      requiredAmount: number;
      totalPaid: number;
      balance: number;
      advancePayment: number;
      isPaid: boolean;
      isOverdue: boolean;
      status?: string | null;
    }>;
    totalBalance: number;
    totalAdvance: number;
    overdueMonths: number;
    shouldArchive: boolean;
  };
  const monthlyDuesData = duesQuery.data as MonthlyDuesData | undefined;
  const isLoadingDues = duesQuery.isLoading;

  // Calculate balance with carry-forward logic
  const monthsWithCarryForward = useMemo(() => {
    if (!monthlyDuesData?.months) return [];

    let previousMonthBalance = 0;

    return monthlyDuesData.months.map((monthData) => {
      const totalRequired = MONTHLY_DUE_AMOUNT + previousMonthBalance;
      const monthBalance = Math.max(0, totalRequired - monthData.totalPaid);
      previousMonthBalance = monthBalance;

      return {
        ...monthData,
        monthBalance,
        totalRequired,
      };
    });
  }, [monthlyDuesData]);

  // Check if user has 5+ consecutive unpaid months
  // Check the 5 months before the current month (e.g., if current is November, check June-October)
  const hasUnpaidMonths = useMemo(() => {
    if (!monthsWithCarryForward.length || !myResident) return false;

    // Count consecutive unpaid months going backwards from the month before current
    let consecutiveUnpaid = 0;

    // Start from the month before current and go backwards
    // We need to check 5 consecutive months before current month
    for (let i = currentMonth - 1; i >= 1 && consecutiveUnpaid < 5; i--) {
      const monthData = monthsWithCarryForward.find((m) => m.month === i);

      // If month doesn't exist or has balance > 0, it's unpaid
      if (!monthData || monthData.monthBalance > 0) {
        consecutiveUnpaid++;
      } else {
        // If we find a paid month, break the consecutive count
        break;
      }
    }

    // Check if we have 5 or more consecutive unpaid months
    return consecutiveUnpaid >= 5;
  }, [monthsWithCarryForward, currentMonth, myResident]);

  // Open modal if user has 5+ unpaid months, close if condition is no longer met
  useEffect(() => {
    if (!isChecking && !isLoadingResident && !isLoadingDues) {
      if (hasUnpaidMonths) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }
  }, [isChecking, isLoadingResident, isLoadingDues, hasUnpaidMonths]);

  // Handle payment success - refresh data and check again
  const handlePaymentSuccess = async () => {
    if (!myResident?.id) return;

    // Invalidate and refetch monthly dues data
    await queryClient.invalidateQueries(
      trpc.monthlyDues.getByResident.queryOptions({
        residentId: myResident.id,
        year: currentYear,
      })
    );

    // Wait a bit for data to refresh, then check if modal should close
    setTimeout(() => {
      // The hasUnpaidMonths will automatically update based on new data
      // If it's now false, the modal will close
    }, 1500);
  };

  // Get unpaid months for the payment form
  const unpaidMonths = useMemo(() => {
    if (!monthsWithCarryForward.length) return [];

    // Get all unpaid months up to current month
    const unpaid: number[] = [];
    for (let i = 1; i <= currentMonth; i++) {
      const monthData = monthsWithCarryForward.find((m) => m.month === i);
      if (!monthData || monthData.monthBalance > 0) {
        unpaid.push(i);
      }
    }
    return unpaid;
  }, [monthsWithCarryForward, currentMonth]);

  // Calculate months data for payment form
  const monthsDataForPayment = useMemo(() => {
    if (!monthsWithCarryForward.length) return [];

    const sortedMonths = unpaidMonths
      .map((month) => monthsWithCarryForward.find((m) => m.month === month))
      .filter(Boolean)
      .sort((a, b) => (a?.month || 0) - (b?.month || 0));

    let previousBalance = 0;
    const firstMonthNum = sortedMonths[0]?.month || 1;
    if (firstMonthNum > 1) {
      const beforeFirst = monthsWithCarryForward.find(
        (m) => m.month === firstMonthNum - 1
      );
      previousBalance = beforeFirst?.monthBalance || 0;
    }

    return sortedMonths.map((m) => {
      if (!m) return null;
      const incrementalBalance = m.monthBalance - previousBalance;
      previousBalance = m.monthBalance;

      return {
        month: m.month,
        monthName: m.monthName,
        requiredAmount: MONTHLY_DUE_AMOUNT,
        totalPaid: m.totalPaid,
        balance: Math.max(0, incrementalBalance),
        advancePayment: m.advancePayment,
        isPaid: m.isPaid,
        isOverdue: m.isOverdue,
        status: m.status ?? null,
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  }, [monthsWithCarryForward, unpaidMonths]);

  // Don't show modal if still checking or loading
  if (isChecking || isLoadingResident || isLoadingDues || !myResident) {
    return null;
  }

  // Don't show modal if user doesn't have 5+ unpaid months
  if (!hasUnpaidMonths) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-4xl! max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-destructive">
            Payment Required
          </DialogTitle>
          <DialogDescription className="text-base">
            You have 5 or more consecutive unpaid months. Please settle your
            monthly dues balance to continue using the system.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {myResident && unpaidMonths.length > 0 && (
            <PaymentForm
              residentId={myResident.id}
              months={unpaidMonths}
              year={currentYear}
              monthsData={monthsDataForPayment}
              onSuccess={handlePaymentSuccess}
              onCancel={() => {}} // Disable cancel
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

