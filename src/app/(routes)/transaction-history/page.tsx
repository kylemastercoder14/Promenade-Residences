"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Card, CardContent } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Calendar, Car, Building2, Filter, WalletIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TransactionType = "MONTHLY_DUE" | "AMENITY_RESERVATION" | "VEHICLE_REGISTRATION" | "ALL";

const transactionTypeLabels: Record<TransactionType, string> = {
  ALL: "All Transactions",
  MONTHLY_DUE: "Monthly Due",
  AMENITY_RESERVATION: "Amenity Reservation",
  VEHICLE_REGISTRATION: "Vehicle Registration",
};

const transactionIcons: Record<TransactionType, typeof Calendar> = {
  ALL: Calendar,
  MONTHLY_DUE: WalletIcon,
  AMENITY_RESERVATION: Building2,
  VEHICLE_REGISTRATION: Car,
};

const statusColors: Record<string, string> = {
  PAID: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  REGISTERED: "bg-purple-100 text-purple-800",
};

const Page = () => {
  const trpc = useTRPC();
  const [filterType, setFilterType] = useState<TransactionType>("ALL");

  const transactionsQuery = useQuery(trpc.auth.getMyTransactions.queryOptions());

  const filteredTransactions = transactionsQuery.data?.filter((transaction) => {
    if (filterType === "ALL") return true;
    return transaction.type === filterType;
  }) || [];

  if (transactionsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f8f2] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1f5c34]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8f2] text-[#1a2c1f]">
      <Navbar variant="community" />

      <div className="pt-36 pb-10">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-serif uppercase text-[#1a2c1f] mb-2">
              Transaction History
            </h1>
            <p className="text-sm text-muted-foreground">
              View all your transactions including payments, reservations, and registrations
            </p>
          </div>

          {/* Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-[#1f5c34]" />
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Filter by Type</label>
                  <Select
                    value={filterType}
                    onValueChange={(value) => setFilterType(value as TransactionType)}
                  >
                    <SelectTrigger className="w-full sm:w-[300px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(transactionTypeLabels).map(([value, label]) => {
                        const Icon = transactionIcons[value as TransactionType];
                        return (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No transactions found</p>
                <p className="text-sm text-muted-foreground">
                  {filterType === "ALL"
                    ? "You don't have any transactions yet."
                    : `You don't have any ${transactionTypeLabels[filterType].toLowerCase()} transactions.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => {
                const Icon = transactionIcons[transaction.type];
                const status = transaction.status || "N/A";
                const statusColor = statusColors[status] || "bg-gray-100 text-gray-800";

                return (
                  <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="rounded-full bg-[#1f5c34]/10 p-3">
                            <Icon className="h-5 w-5 text-[#1f5c34]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{transaction.description}</h3>
                              <Badge className={cn("text-xs", statusColor)}>
                                {status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(transaction.date), "MMM dd, yyyy 'at' hh:mm a")}
                              </div>
                              {transaction.amount !== undefined && (
                                <div className="flex items-center gap-1">
                                  <WalletIcon className="h-4 w-4" />
                                  ₱{transaction.amount.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </div>
                              )}
                            </div>
                            {/* Additional metadata */}
                            {transaction.metadata && (
                              <div className="mt-3 text-xs text-muted-foreground space-y-1">
                                {transaction.type === "AMENITY_RESERVATION" && (
                                  <>
                                    {transaction.metadata.date && (
                                      <p>
                                        Reservation Date:{" "}
                                        {format(
                                          new Date(transaction.metadata.date as string),
                                          "MMM dd, yyyy"
                                        )}
                                      </p>
                                    )}
                                    {transaction.metadata.startTime && transaction.metadata.endTime && (
                                      <p>
                                        Time: {String(transaction.metadata.startTime ?? "")} - {String(transaction.metadata.endTime ?? "")}
                                      </p>
                                    )}
                                  </>
                                )}
                                {transaction.type === "MONTHLY_DUE" && (
                                  <>
                                    {transaction.metadata.paymentMethod && (
                                      <p>
                                        Payment Method: {String(transaction.metadata.paymentMethod)}
                                      </p>
                                    )}
                                    {transaction.metadata.proofOfPayment && (
                                      <p>
                                        <a
                                          href={String(transaction.metadata.proofOfPayment)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[#1f5c34] hover:underline"
                                        >
                                          View Proof of Payment
                                        </a>
                                      </p>
                                    )}
                                    {transaction.metadata.notes && (
                                      <p>
                                        Notes: {String(transaction.metadata.notes)}
                                      </p>
                                    )}
                                  </>
                                )}
                                {transaction.type === "VEHICLE_REGISTRATION" && transaction.metadata.vehicleType ? (
                                  <p>
                                    Type: {String(transaction.metadata.vehicleType)}
                                  </p>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default Page;

