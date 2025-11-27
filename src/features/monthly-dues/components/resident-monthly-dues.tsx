"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useSuspenseResidentMonthlyDues, useUpdateMonthlyDueStatus } from "../hooks/use-monthly-dues";
import { PaymentForm } from "./payment-form";
import { format } from "date-fns";
import { MonthlyDueStatus } from "@prisma/client";
import { toast } from "sonner";

interface ResidentMonthlyDuesProps {
  residentId: string;
  year?: number;
  canApprove?: boolean;
}

export const ResidentMonthlyDues = ({
  residentId,
  year,
  canApprove = false,
}: ResidentMonthlyDuesProps) => {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set());
  const { data, isLoading, error } = useSuspenseResidentMonthlyDues(residentId, year);
  const updateStatusMutation = useUpdateMonthlyDueStatus();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log(`ResidentMonthlyDues - residentId: ${residentId}, year: ${year}`);
    console.log(`ResidentMonthlyDues - isLoading: ${isLoading}, error:`, error);
    console.log(`ResidentMonthlyDues - data:`, data);
  }, [residentId, year, isLoading, error, data]);

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">Loading monthly dues...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-sm text-destructive">
            Error loading monthly dues: {error?.message || "Unknown error"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const resident = data.resident;
  if (!resident) {
    console.warn(`ResidentMonthlyDues - No resident data for ID: ${residentId}`);
    return null;
  }

  const fullName = [
    resident.firstName,
    resident.middleName,
    resident.lastName,
    resident.suffix,
  ]
    .filter(Boolean)
    .join(" ");

  // Get household address from map
  const householdAddress = resident.map
    ? `Block ${resident.map.blockNo}${resident.map.lotNo ? `, Lot ${resident.map.lotNo}` : ""}${resident.map.street ? `, ${resident.map.street}` : ""}`
    : "No address assigned";

  const handlePaymentSuccess = () => {
    setSelectedMonth(null);
    setSelectedMonths(new Set());
  };

  const toggleMonthSelection = (month: number, hasBalance: boolean) => {
    if (!hasBalance) return; // Only allow selecting months with balance

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

  const selectedMonthsData = data.months.filter((m) => selectedMonths.has(m.month));
  const totalSelectedBalance = selectedMonthsData.reduce((sum, m) => sum + m.balance, 0);

  const statusClasses: Record<MonthlyDueStatus, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  const handleStatusChange = async (paymentId: string, status: MonthlyDueStatus) => {
    setUpdatingId(paymentId);
    try {
      await updateStatusMutation.mutateAsync({ id: paymentId, status });
    } finally {
      setUpdatingId(null);
    }
  };

  const formatCurrency = (value: number) =>
    `₱${value.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const openPrintWindow = (content: string) => {
    const printWindow = window.open("", "_blank", "width=720,height=900");
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to print the receipt.");
      return;
    }
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };

  const buildReceiptHeader = (title: string) => `
    <div style="text-align:center; margin-bottom:24px;">
      <h1 style="margin:0;font-size:22px;">Promenade Residences</h1>
      <p style="margin:4px 0;font-size:12px;">Official Monthly Due Receipt</p>
      <h2 style="margin:12px 0 0;font-size:18px;">${title}</h2>
    </div>`;

  const buildHouseholdDetails = () => `
    <div style="margin-bottom:16px;font-size:12px;line-height:1.5;">
      <strong>Household Head:</strong> ${fullName}<br/>
      <strong>Address:</strong> ${householdAddress}<br/>
      <strong>Residency Type:</strong> ${
        resident.typeOfResidency === "RESIDENT" ? "Owner" : "Tenant"
      }
    </div>`;

  const handlePrintSingleReceipt = (monthData: (typeof data.months)[number]) => {
    const payments = monthData.payments;
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
    const title = `${monthData.monthName} ${data.year}`;
    const rows = payments.length
      ? payments
          .map(
            (payment) => `
              <tr>
                <td style="padding:6px;border-bottom:1px solid #eee;">${format(
                  new Date(payment.createdAt),
                  "PP"
                )}</td>
                <td style="padding:6px;border-bottom:1px solid #eee;">${
                  payment.paymentMethod?.replace("_", " ") || "N/A"
                }</td>
                <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(
                  payment.amountPaid
                )}</td>
              </tr>`
          )
          .join("")
      : `<tr>
          <td colspan="3" style="padding:6px;border-bottom:1px solid #eee;">No payments recorded</td>
        </tr>`;

    const receiptBody = `
      ${buildReceiptHeader(title)}
      ${buildHouseholdDetails()}
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;">
        <thead>
          <tr>
            <th style="text-align:left;border-bottom:1px solid #999;padding:6px;">Date</th>
            <th style="text-align:left;border-bottom:1px solid #999;padding:6px;">Payment Method</th>
            <th style="text-align:right;border-bottom:1px solid #999;padding:6px;">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="font-size:12px;margin-bottom:4px;">
        <strong>Required Amount:</strong> ${formatCurrency(monthData.requiredAmount)}
      </div>
      <div style="font-size:12px;margin-bottom:4px;">
        <strong>Total Paid:</strong> ${formatCurrency(totalPaid)}
      </div>
      <div style="font-size:12px;margin-bottom:16px;">
        <strong>Status:</strong> ${(monthData.status ?? "PENDING").toString()}
      </div>
      <p style="font-size:11px;color:#555;margin-top:24px;">
        This is a system-generated receipt. For any questions, contact the accounting office.
      </p>
    `;

    openPrintWindow(`<html><body style="font-family:Arial,sans-serif;padding:32px;">${receiptBody}</body></html>`);
  };

  const handlePrintSummaryReceipt = () => {
    const sorted = [...selectedMonthsData].sort((a, b) => a.month - b.month);
    if (!sorted.length) return;
    const totalPaid = sorted.reduce(
      (sum, month) =>
        sum +
        month.payments.reduce((monthSum, payment) => monthSum + payment.amountPaid, 0),
      0
    );

  const rows = sorted
      .map((month) => {
        const monthTotal = month.payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
        return `
          <tr>
            <td style="padding:6px;border-bottom:1px solid #eee;">${month.monthName}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(
              month.requiredAmount
            )}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(
              monthTotal
            )}</td>
            <td style="padding:6px;border-bottom:1px solid #eee;">${month.status ?? "PENDING"}</td>
          </tr>`;
      })
      .join("");

    const title = `${sorted[0].monthName} - ${sorted[sorted.length - 1].monthName} ${data.year} Summary`;
    const receiptBody = `
      ${buildReceiptHeader(title)}
      ${buildHouseholdDetails()}
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;">
        <thead>
          <tr>
            <th style="text-align:left;border-bottom:1px solid #999;padding:6px;">Month</th>
            <th style="text-align:right;border-bottom:1px solid #999;padding:6px;">Required</th>
            <th style="text-align:right;border-bottom:1px solid #999;padding:6px;">Paid</th>
            <th style="text-align:left;border-bottom:1px solid #999;padding:6px;">Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="font-size:12px;margin-bottom:4px;">
        <strong>Total Paid:</strong> ${formatCurrency(totalPaid)}
      </div>
      <p style="font-size:11px;color:#555;margin-top:24px;">
        This is a system-generated summary receipt. For official records, please coordinate with accounting.
      </p>
    `;

    openPrintWindow(`<html><body style="font-family:Arial,sans-serif;padding:32px;">${receiptBody}</body></html>`);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="mb-4">
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  {open ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <div className="text-left">
                  <div className="font-semibold">{fullName} (Household Head)</div>
                  <div className="text-sm text-muted-foreground">
                    {householdAddress}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {resident.typeOfResidency === "RESIDENT" ? "Resident" : "Tenant"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {data.overdueMonths >= 2 && data.overdueMonths < 6 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {data.overdueMonths} months overdue
                  </Badge>
                )}
                {data.shouldArchive && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Auto-archive (6+ months)
                  </Badge>
                )}
                {data.totalBalance > 0 && (
                  <Badge variant="outline" className="font-semibold">
                    Balance: ₱{data.totalBalance.toFixed(2)}
                  </Badge>
                )}
                {data.totalBalance === 0 && data.overdueMonths === 0 && (
                  <Badge variant="default" className="bg-green-600 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Paid
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            {/* Reminder for overdue months */}
            {data.overdueMonths >= 2 && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    This household has a balance left for {data.overdueMonths} month
                    {data.overdueMonths > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}

            {/* Selection Mode Toggle */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedMonths.size > 0
                  ? `${selectedMonths.size} month${selectedMonths.size > 1 ? "s" : ""} selected - Total: ₱${totalSelectedBalance.toFixed(2)}`
                  : "Click on months to select them for payment, or click the checkbox"}
              </div>
              {selectedMonths.size > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMonths(new Set())}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePrintSummaryReceipt}
                  >
                    <Printer className="mr-1 h-4 w-4" />
                    Print summary receipt
                  </Button>
                </div>
              )}
            </div>

            {/* Months Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {data.months.map((monthData) => {
                const isSelected = selectedMonths.has(monthData.month);
                const canSelect = monthData.balance > 0;
                const latestPayment = monthData.payments[monthData.payments.length - 1];
                const status = monthData.status as MonthlyDueStatus | null;

                return (
                  <Card
                    key={monthData.month}
                    className={`transition-colors ${
                      isSelected
                        ? "ring-2 ring-primary bg-primary/5"
                        : selectedMonth === monthData.month
                          ? "ring-2 ring-primary"
                          : monthData.isOverdue
                            ? "border-destructive"
                            : monthData.isPaid
                              ? "border-green-500"
                              : ""
                    } ${canSelect ? "cursor-pointer" : ""}`}
                    onClick={() => {
                      if (canSelect) {
                        toggleMonthSelection(monthData.month, canSelect);
                      } else {
                        setSelectedMonth(monthData.month);
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {canSelect && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleMonthSelection(monthData.month, canSelect)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          <div className="font-semibold text-sm">
                            {monthData.monthName}
                          </div>
                        </div>
                        {status && (
                          <Badge
                            className={`text-xs capitalize ${
                              statusClasses[status] || ""
                            }`}
                          >
                            {status.toLowerCase()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {monthData.isPaid && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                        {monthData.isOverdue && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Required:</span>
                        <span>₱{monthData.requiredAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paid:</span>
                        <span>₱{monthData.totalPaid.toFixed(2)}</span>
                      </div>
                      {monthData.balance > 0 && (
                        <div className="flex justify-between text-destructive font-semibold">
                          <span>Balance:</span>
                          <span>₱{monthData.balance.toFixed(2)}</span>
                        </div>
                      )}
                      {monthData.advancePayment > 0 && (
                        <div className="flex justify-between text-green-600 font-semibold">
                          <span>Advance:</span>
                          <span>₱{monthData.advancePayment.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    {monthData.payments.length > 0 && (
                      <div className="mt-2 pt-2 border-t text-xs space-y-2">
                        <div className="text-muted-foreground">Payments:</div>
                        {monthData.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex flex-col gap-0.5 border border-muted/60 rounded-md p-2"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">
                                  ₱{payment.amountPaid.toFixed(2)}
                                </span>
                                {payment.paymentMethod && (
                                  <span className="text-muted-foreground ml-1">
                                    ({payment.paymentMethod.replace("_", " ")})
                                  </span>
                                )}
                              </div>
                              <span className="text-muted-foreground">
                                {format(new Date(payment.createdAt), "MMM d")}
                              </span>
                            </div>
                            {payment.attachment ? (
                              <a
                                href={payment.attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-[11px] font-semibold hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View proof of payment
                              </a>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                No proof of payment uploaded
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintSingleReceipt(monthData);
                        }}
                      >
                        <Printer className="mr-1 h-4 w-4" />
                        Print receipt
                      </Button>
                      {canApprove && latestPayment && (
                        <>
                            {status === MonthlyDueStatus.PENDING && (
                              <>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(latestPayment.id, MonthlyDueStatus.APPROVED);
                                  }}
                                  disabled={updatingId === latestPayment.id}
                                >
                                  {updatingId === latestPayment.id ? "Approving..." : "Approve"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(latestPayment.id, MonthlyDueStatus.REJECTED);
                                  }}
                                  disabled={updatingId === latestPayment.id}
                                >
                                  {updatingId === latestPayment.id ? "Updating..." : "Reject"}
                                </Button>
                              </>
                            )}
                            {status === MonthlyDueStatus.REJECTED && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(latestPayment.id, MonthlyDueStatus.PENDING);
                                }}
                                disabled={updatingId === latestPayment.id}
                              >
                                {updatingId === latestPayment.id ? "Updating..." : "Mark Pending"}
                              </Button>
                            )}
                            {status === MonthlyDueStatus.APPROVED && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(latestPayment.id, MonthlyDueStatus.PENDING);
                                }}
                                disabled={updatingId === latestPayment.id}
                              >
                                {updatingId === latestPayment.id ? "Updating..." : "Reopen"}
                              </Button>
                            )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
              })}
            </div>

            {/* Multi-Month Payment Form */}
            {selectedMonths.size > 0 && (
              <PaymentForm
                residentId={residentId}
                months={Array.from(selectedMonths)}
                year={data.year}
                monthsData={selectedMonthsData}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setSelectedMonths(new Set())}
              />
            )}

            {/* Single Month Payment Form */}
            {selectedMonth !== null && selectedMonths.size === 0 && (
              <PaymentForm
                residentId={residentId}
                month={selectedMonth}
                year={data.year}
                monthData={data.months.find((m) => m.month === selectedMonth)!}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setSelectedMonth(null)}
              />
            )}

            {/* Footer - Total Amount */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Amount to Pay:</span>
                <span className="text-lg text-destructive">
                  ₱{data.totalBalance.toFixed(2)}
                </span>
              </div>
              {data.totalAdvance > 0 && (
                <div className="flex justify-between items-center mt-2 text-green-600">
                  <span>Total Advance Payment:</span>
                  <span className="text-lg">₱{data.totalAdvance.toFixed(2)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

