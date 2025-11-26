"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useSuspenseResidentMonthlyDues } from "../hooks/use-monthly-dues";
import { PaymentForm } from "./payment-form";
import { format } from "date-fns";

interface ResidentMonthlyDuesProps {
  residentId: string;
  year?: number;
}

export const ResidentMonthlyDues = ({
  residentId,
  year,
}: ResidentMonthlyDuesProps) => {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<Set<number>>(new Set());
  const { data, isLoading, error } = useSuspenseResidentMonthlyDues(residentId, year);

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
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedMonths.size > 0
                  ? `${selectedMonths.size} month${selectedMonths.size > 1 ? "s" : ""} selected - Total: ₱${totalSelectedBalance.toFixed(2)}`
                  : "Click on months to select them for payment, or click the checkbox"}
              </div>
              {selectedMonths.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMonths(new Set())}
                >
                  Clear Selection
                </Button>
              )}
            </div>

            {/* Months Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {data.months.map((monthData) => {
                const isSelected = selectedMonths.has(monthData.month);
                const canSelect = monthData.balance > 0;

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
                        <div className="flex items-center gap-1">
                          {monthData.isPaid && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                          {monthData.isOverdue && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
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
                      <div className="mt-2 pt-2 border-t text-xs">
                        <div className="text-muted-foreground mb-1">Payments:</div>
                        {monthData.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex justify-between items-center mb-1"
                          >
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
                        ))}
                      </div>
                    )}
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

