"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { PaymentForm } from "@/features/monthly-dues/components/payment-form";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const MONTHLY_DUE_AMOUNT = 750;

const MONTH_NAMES = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const Page = () => {
  const [step, setStep] = useState<"form" | "summary">("form");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set());
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [rangeEnd, setRangeEnd] = useState<number | null>(null);
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);

  const trpc = useTRPC();
  const currentYear = new Date().getFullYear();

  // Get current user's resident data (household head)
  const { data: myResident, isLoading: isLoadingResident } = useQuery(
    trpc.auth.getMyResident.queryOptions()
  );

  // Get monthly dues data
  const { data: monthlyDuesData, isLoading: isLoadingDues } = useQuery(
    trpc.monthlyDues.getByResident.queryOptions({
      residentId: myResident?.id || "",
      year: currentYear,
    })
  );

  // Calculate balance with carry-forward logic
  // If past month not paid, add to current month
  const monthsWithCarryForward = useMemo(() => {
    if (!monthlyDuesData?.months) return [];

    let previousMonthBalance = 0;

    return monthlyDuesData.months.map((monthData) => {
      // Current month's required amount (750) + previous month's unpaid balance
      const totalRequired = MONTHLY_DUE_AMOUNT + previousMonthBalance;

      // Subtract what was paid this month
      const monthBalance = Math.max(0, totalRequired - monthData.totalPaid);

      // Update previousMonthBalance for next iteration
      previousMonthBalance = monthBalance;

      return {
        ...monthData,
        monthBalance, // The actual balance that needs to be paid for this month (includes carry-forward)
        totalRequired, // Total required including carry-forward
      };
    });
  }, [monthlyDuesData]);

  // Calculate total balance (only the last month's balance, which includes all carry-forward)
  // This represents the total amount needed to pay everything up to the current month
  const totalBalance = useMemo(() => {
    if (monthsWithCarryForward.length === 0) return 0;
    // The last month's balance includes all previous unpaid months
    const lastMonth = monthsWithCarryForward[monthsWithCarryForward.length - 1];
    return lastMonth.monthBalance;
  }, [monthsWithCarryForward]);

  // Prepare balance overview for sidebar
  const balanceOverview = useMemo(() => {
    return MONTH_NAMES.map((monthName, index) => {
      const month = index + 1;
      const monthData = monthsWithCarryForward.find((m) => m.month === month);

      if (!monthData) {
        return {
          month: monthName,
          paid: "₱0.00",
          balance: "₱0.00",
        };
      }

      return {
        month: monthName,
        paid: `₱${monthData.totalPaid.toFixed(2)}`,
        balance: `₱${monthData.monthBalance.toFixed(2)}`,
      };
    });
  }, [monthsWithCarryForward]);

  // Calculate totals for balance overview
  const totalPaid = useMemo(() => {
    return monthsWithCarryForward.reduce((sum, m) => sum + m.totalPaid, 0);
  }, [monthsWithCarryForward]);

  // Get selected months data
  const selectedMonthsData = monthsWithCarryForward.filter((m) =>
    selectedMonths.has(m.month)
  );

  // Calculate total balance for selected months correctly
  // The issue: each month's balance includes carry-forward from previous months
  // So we can't just sum them - we need to calculate the incremental amount for each month
  const totalSelectedBalance = useMemo(() => {
    if (selectedMonthsData.length === 0) return 0;

    // Sort months by number
    const sortedMonths = [...selectedMonthsData].sort(
      (a, b) => a.month - b.month
    );

    // Calculate the balance before the first selected month
    let previousBalance = 0;
    const firstMonthNum = sortedMonths[0].month;
    if (firstMonthNum > 1) {
      const beforeFirst = monthsWithCarryForward.find(
        (m) => m.month === firstMonthNum - 1
      );
      previousBalance = beforeFirst?.monthBalance || 0;
    }

    // For each selected month, calculate the incremental amount due
    // This is: current month's balance - previous month's balance
    let total = 0;
    for (const monthData of sortedMonths) {
      // The amount due for this specific month = this month's balance - previous month's balance
      const monthDue = monthData.monthBalance - previousBalance;
      total += monthDue;
      previousBalance = monthData.monthBalance;
    }

    return total;
  }, [selectedMonthsData, monthsWithCarryForward]);

  // Handle payment success
  const handlePaymentSuccess = () => {
    setStep("form");
    setSelectedMonth(null);
    setSelectedMonths(new Set());
    setSelectedPaymentMethod(null);
  };

  // Toggle month selection
  const toggleMonthSelection = (month: number, hasBalance: boolean) => {
    if (!hasBalance) return;

    setSelectedMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(month)) {
        newSet.delete(month);
      } else {
        newSet.add(month);
      }
      return newSet;
    });
  };

  // Apply range selection
  const applyRangeSelection = () => {
    if (!rangeStart || !rangeEnd) return;

    const start = Math.min(rangeStart, rangeEnd);
    const end = Math.max(rangeStart, rangeEnd);

    const newSelected = new Set<number>();
    for (let month = start; month <= end; month++) {
      const monthData = monthsWithCarryForward.find((m) => m.month === month);
      if (monthData && monthData.monthBalance > 0) {
        newSelected.add(month);
      }
    }

    setSelectedMonths(newSelected);
    setRangeStart(null);
    setRangeEnd(null);
    setShowRangeSelector(false);
  };

  // Clear range selection
  const clearRangeSelection = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setShowRangeSelector(false);
  };

  if (isLoadingResident || isLoadingDues) {
    return (
      <div className="min-h-screen bg-[#f5f8f2] text-[#1a2c1f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1f5c34]" />
      </div>
    );
  }

  // Get resident data from monthly dues (which includes full resident info)
  const resident = monthlyDuesData?.resident;

  if (!myResident || !resident) {
    if (isLoadingResident || isLoadingDues) {
      return (
        <div className="min-h-screen bg-[#f5f8f2] text-[#1a2c1f] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1f5c34]" />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#f5f8f2] text-[#1a2c1f]">
        <Navbar variant="community" />
        <div className="pt-36 pb-10">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="rounded-4xl bg-white p-8 shadow-lg text-center">
              <p className="text-destructive">
                You must be a household head to view monthly dues.
              </p>
            </div>
          </div>
        </div>
        <LandingFooter />
      </div>
    );
  }

  const fullName = [
    resident.firstName,
    resident.middleName,
    resident.lastName,
    resident.suffix,
  ]
    .filter(Boolean)
    .join(" ");

  const address = resident.map
    ? `Block ${resident.map.blockNo}${resident.map.lotNo ? `, Lot ${resident.map.lotNo}` : ""}${resident.map.street ? `, ${resident.map.street}` : ""}`
    : "No address assigned";

  const residencyType =
    resident.typeOfResidency === "RESIDENT" ? "Owner" : "Tenant";

  return (
    <div className="min-h-screen bg-[#f5f8f2] text-[#1a2c1f]">
      <Navbar variant="community" />

      <div className="pt-36 pb-10">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="rounded-4xl bg-white p-8 shadow-lg">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#1f5c34]">
                    Monthly Due Payment
                  </p>
                  <h1 className="text-3xl font-serif uppercase text-[#1a2c1f]">
                    Fill out payment details
                  </h1>
                </div>

                <div className="rounded-full bg-[#dfe7dd] p-1">
                  <div
                    className={cn(
                      "rounded-full py-1 text-center text-xs font-semibold uppercase tracking-wide text-white transition-all",
                      step === "form"
                        ? "w-1/2 bg-[#1f5c34]"
                        : "w-full bg-[#1f5c34]"
                    )}
                  >
                    {step === "form" ? "Step 1 of 2" : "Step 2 of 2"}
                  </div>
                </div>

                {/* Payment Form */}
                {step === "form" && (
                  <div className="space-y-5">
                    {/* Show payment form if months are selected */}
                    {selectedMonths.size > 0 ? (
                      <PaymentForm
                        residentId={myResident.id}
                        months={Array.from(selectedMonths)}
                        year={currentYear}
                        monthsData={(() => {
                          // Calculate incremental balance for each selected month
                          const sortedMonths = [...selectedMonthsData].sort(
                            (a, b) => a.month - b.month
                          );
                          let previousBalance = 0;
                          const firstMonthNum = sortedMonths[0].month;
                          if (firstMonthNum > 1) {
                            const beforeFirst = monthsWithCarryForward.find(
                              (m) => m.month === firstMonthNum - 1
                            );
                            previousBalance = beforeFirst?.monthBalance || 0;
                          }

                          return sortedMonths.map((m) => {
                            // Calculate incremental amount for this month
                            const incrementalBalance =
                              m.monthBalance - previousBalance;
                            previousBalance = m.monthBalance;

                            return {
                              month: m.month,
                              monthName: m.monthName,
                              requiredAmount: MONTHLY_DUE_AMOUNT, // Fixed 750 per month
                              totalPaid: m.totalPaid,
                              balance: Math.max(0, incrementalBalance), // Incremental balance, not cumulative
                              advancePayment: m.advancePayment,
                              isPaid: m.isPaid,
                              isOverdue: m.isOverdue,
                            };
                          });
                        })()}
                        onSuccess={handlePaymentSuccess}
                        onCancel={() => setSelectedMonths(new Set())}
                      />
                    ) : selectedMonth !== null ? (
                      <PaymentForm
                        residentId={myResident.id}
                        month={selectedMonth}
                        year={currentYear}
                        monthData={
                          monthsWithCarryForward.find(
                            (m) => m.month === selectedMonth
                          ) && {
                            month: selectedMonth,
                            monthName:
                              monthsWithCarryForward.find(
                                (m) => m.month === selectedMonth
                              )?.monthName || "",
                            requiredAmount:
                              monthsWithCarryForward.find(
                                (m) => m.month === selectedMonth
                              )?.requiredAmount || 0,
                            totalPaid:
                              monthsWithCarryForward.find(
                                (m) => m.month === selectedMonth
                              )?.totalPaid || 0,
                            balance:
                              monthsWithCarryForward.find(
                                (m) => m.month === selectedMonth
                              )?.monthBalance || 0,
                            advancePayment:
                              monthsWithCarryForward.find(
                                (m) => m.month === selectedMonth
                              )?.advancePayment || 0,
                            isPaid:
                              monthsWithCarryForward.find(
                                (m) => m.month === selectedMonth
                              )?.isPaid || false,
                            isOverdue:
                              monthsWithCarryForward.find(
                                (m) => m.month === selectedMonth
                              )?.isOverdue || false,
                          }
                        }
                        onSuccess={handlePaymentSuccess}
                        onCancel={() => setSelectedMonth(null)}
                        onPaymentMethodChange={setSelectedPaymentMethod}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-[#1a2c1f]">
                            Total Balance
                          </Label>
                          <Input
                            value={`₱${totalBalance.toFixed(2)}`}
                            readOnly
                            className="mt-1 bg-[#f6f8f5]"
                          />
                        </div>

                        <div className="text-sm text-muted-foreground mb-4">
                          <p className="mb-2">
                            Select a month below to make a payment, or select
                            multiple months for batch payment.
                          </p>
                          <p className="mb-3">
                            Note: Unpaid past months are automatically added to
                            the current month&apos;s balance.
                          </p>

                          {/* Range Selector */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setShowRangeSelector(!showRangeSelector)
                              }
                              className="text-xs"
                            >
                              {showRangeSelector
                                ? "Cancel Range"
                                : "Select Range"}
                            </Button>

                            {showRangeSelector && (
                              <div className="flex items-center gap-2">
                                <Select
                                  value={rangeStart?.toString() || ""}
                                  onValueChange={(value) =>
                                    setRangeStart(parseInt(value))
                                  }
                                >
                                  <SelectTrigger className="w-[120px] h-8 text-xs">
                                    <SelectValue placeholder="From" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {monthsWithCarryForward
                                      .filter((m) => m.monthBalance > 0)
                                      .map((m) => (
                                        <SelectItem
                                          key={m.month}
                                          value={m.month.toString()}
                                        >
                                          {m.monthName}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <span className="text-xs">to</span>
                                <Select
                                  value={rangeEnd?.toString() || ""}
                                  onValueChange={(value) =>
                                    setRangeEnd(parseInt(value))
                                  }
                                >
                                  <SelectTrigger className="w-[120px] h-8 text-xs">
                                    <SelectValue placeholder="To" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {monthsWithCarryForward
                                      .filter((m) => m.monthBalance > 0)
                                      .map((m) => (
                                        <SelectItem
                                          key={m.month}
                                          value={m.month.toString()}
                                        >
                                          {m.monthName}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="primary"
                                  onClick={applyRangeSelection}
                                  disabled={!rangeStart || !rangeEnd}
                                  className="h-8 text-xs"
                                >
                                  Apply
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={clearRangeSelection}
                                  className="h-8 text-xs"
                                >
                                  Clear
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Months Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                          {monthsWithCarryForward.map((monthData) => {
                            const hasBalance = monthData.monthBalance > 0;
                            const isSelected = selectedMonths.has(
                              monthData.month
                            );

                            return (
                              <div
                                key={monthData.month}
                                className={cn(
                                  "rounded-lg border p-3 cursor-pointer transition-colors",
                                  isSelected
                                    ? "ring-2 ring-[#1f5c34] bg-[#e5f2ea]"
                                    : hasBalance
                                      ? "border-[#cf4a3f] hover:border-[#1f5c34]"
                                      : "border-green-500 bg-green-50"
                                )}
                                onClick={() => {
                                  if (hasBalance) {
                                    toggleMonthSelection(
                                      monthData.month,
                                      hasBalance
                                    );
                                  } else {
                                    setSelectedMonth(monthData.month);
                                  }
                                }}
                              >
                                <div className="text-sm font-semibold">
                                  {monthData.monthName}
                                </div>
                                <div className="text-xs mt-1 space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Required:
                                    </span>
                                    <span>
                                      ₱{monthData.requiredAmount.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Paid:
                                    </span>
                                    <span>
                                      ₱{monthData.totalPaid.toFixed(2)}
                                    </span>
                                  </div>
                                  {hasBalance && (
                                    <div className="flex justify-between text-destructive font-semibold">
                                      <span>Balance:</span>
                                      <span>
                                        ₱{monthData.monthBalance.toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {selectedMonths.size > 0 && (
                          <div className="mt-4 p-3 bg-[#e5f2ea] rounded-lg">
                            <div className="text-sm font-semibold text-[#1f5c34] mb-2">
                              Selected: {selectedMonths.size} month
                              {selectedMonths.size > 1 ? "s" : ""} - Total: ₱
                              {totalSelectedBalance.toFixed(2)}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedMonths(new Set())}
                            >
                              Clear Selection
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Summary Step - This can be removed or kept for review */}
                {step === "summary" && (
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-[#e3e9df] bg-white shadow-sm">
                      <div className="flex flex-col gap-6 p-6 lg:flex-row">
                        <div className="flex-1 space-y-2">
                          <p className="text-base font-semibold uppercase text-[#6b766d]">
                            Personal Information
                          </p>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-[#6b766d]">Full Name:</span>{" "}
                              <span className="font-semibold">{fullName}</span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Address:</span>{" "}
                              <span className="font-semibold">{address}</span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Residency:</span>{" "}
                              <span className="font-semibold">
                                {residencyType}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Balance Overview Sidebar */}
              <div className="rounded-[28px] bg-linear-to-b from-[#10382a] to-[#1c5d44] p-5 text-white shadow-lg">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.5em] text-white/60">
                    Balance Overview
                  </p>
                  <p className="text-lg font-semibold">
                    Monthly payments track records
                  </p>
                </div>
                <div className="mt-6 rounded-2xl bg-black/30 p-4">
                  <div className="grid grid-cols-3 text-xs font-semibold uppercase tracking-wide text-white/70">
                    <span>Month</span>
                    <span className="text-center">Amount Paid</span>
                    <span className="text-right">Balance</span>
                  </div>
                  <div className="mt-4 divide-y divide-white/10 text-sm max-h-[450px] overflow-y-auto">
                    {balanceOverview.map((item) => (
                      <div
                        key={item.month}
                        className="grid grid-cols-3 py-2 text-white/90"
                      >
                        <span>{item.month}</span>
                        <span className="text-center">{item.paid}</span>
                        <span className="text-right">{item.balance}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-white/20 pt-3 grid grid-cols-3 text-sm font-semibold">
                    <span>Total</span>
                    <span className="text-center">₱{totalPaid.toFixed(2)}</span>
                    <span className="text-right">
                      ₱{totalBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="mt-6 text-center text-xs text-white/70">
                  Need help? Contact support
                </p>

                <div className="mt-6 pt-6 mx-auto flex items-center justify-center border-t border-white/20">
                  <Image
                    src="/gcash.jpg"
                    alt="GCash QR Code"
                    width={200}
                    height={200}
                    className="rounded-lg mb-3"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                {/* Payment Method QR Code / Account Number */}
                {selectedPaymentMethod && selectedPaymentMethod !== "CASH" && (
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wide text-white/80 mb-3">
                        {selectedPaymentMethod === "GCASH" &&
                          "GCash Payment Details"}
                        {selectedPaymentMethod === "OTHER_BANK" &&
                          "Bank Transfer Details"}
                        {selectedPaymentMethod === "MAYA" &&
                          "Maya Payment Details"}
                      </p>
                      <div className="bg-white/10 rounded-lg p-4 flex flex-col items-center">
                        {selectedPaymentMethod === "GCASH" && <></>}
                        {selectedPaymentMethod === "OTHER_BANK" && (
                          <>
                            <Image
                              src="/payment-methods/bank-qr.png"
                              alt="Bank Transfer QR Code"
                              width={200}
                              height={200}
                              className="rounded-lg mb-3"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <p className="text-xs text-white/90 font-semibold mb-1">
                              Bank Account Details
                            </p>
                            <div className="text-xs text-white/90 space-y-1">
                              <p className="font-mono">
                                Account Number: 1234 5678 9012
                              </p>
                              <p>Bank: BDO (Banco de Oro)</p>
                              <p>Account Name: Promenade Residence HOA</p>
                            </div>
                          </>
                        )}
                        {selectedPaymentMethod === "MAYA" && (
                          <>
                            <Image
                              src="/payment-methods/maya-qr.png"
                              alt="Maya QR Code"
                              width={200}
                              height={200}
                              className="rounded-lg mb-3"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <p className="text-xs text-white/90 font-semibold mb-1">
                              Maya Account Number
                            </p>
                            <p className="text-sm text-white font-mono">
                              0912 345 6789
                            </p>
                            <p className="text-xs text-white/70 mt-2">
                              Account Name: Promenade Residence HOA
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {selectedPaymentMethod === "CASH" && (
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wide text-white/80 mb-3">
                        Cash Payment
                      </p>
                      <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-xs text-white/90">
                          Please proceed to the admin office to make your cash
                          payment.
                        </p>
                        <p className="text-xs text-white/70 mt-2">
                          Office Hours: Monday - Friday, 9:00 AM - 5:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default Page;
