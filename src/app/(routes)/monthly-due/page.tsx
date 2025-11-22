"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const balanceOverview = [
  { month: "JAN", paid: "₱0.00", balance: "₱0.00" },
  { month: "FEB", paid: "₱0.00", balance: "₱0.00" },
  { month: "MAR", paid: "₱0.00", balance: "₱0.00" },
  { month: "APR", paid: "₱0.00", balance: "₱0.00" },
  { month: "MAY", paid: "₱0.00", balance: "₱0.00" },
  { month: "JUN", paid: "₱0.00", balance: "₱0.00" },
  { month: "JUL", paid: "₱0.00", balance: "₱0.00" },
  { month: "AUG", paid: "₱0.00", balance: "₱0.00" },
  { month: "SEP", paid: "₱0.00", balance: "₱0.00" },
  { month: "OCT", paid: "₱0.00", balance: "₱0.00" },
  { month: "NOV", paid: "₱0.00", balance: "₱0.00" },
  { month: "DEC", paid: "₱0.00", balance: "₱0.00" },
];

const summaryData = {
  personal: {
    fullName: "Mary Jane R. Doe",
    address: "Block 25 Lot 40 Maagap St.",
    phone: "092933949993",
    email: "maryjanedoe@gmail.com",
    residency: "Owner",
  },
  payment: {
    billingPeriod: "1 Month",
    forMonth: "FEB 2025",
    amountPaid: "₱1,000",
    method: "GCash",
  },
  reference: "012875973491",
};

const Page = () => {
  const [step, setStep] = useState<"form" | "summary">("form");

  return (
    <div className="min-h-screen bg-[#f5f8f2] text-[#1a2c1f]">
      <Navbar variant="community" />

      <div className="pt-36 pb-10">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="rounded-[32px] bg-white p-8 shadow-lg">
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

                {step === "form" ? (
                  <form className="space-y-5">
                    <div>
                      <Label className="text-sm font-semibold text-[#1a2c1f]">
                        Balance
                      </Label>
                      <Input
                        value="₱0.00"
                        readOnly
                        className="mt-1 bg-[#f6f8f5]"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Amount Paid <span className="text-[#cf4a3f]">*</span>
                        </Label>
                        <Input placeholder="Enter amount" />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Payment Method{" "}
                          <span className="text-[#cf4a3f]">*</span>
                        </Label>
                        <Select>
                          <SelectTrigger className="mt-1 w-full">
                            <SelectValue placeholder="Choose a Method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gcash">GCash</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="onsite">
                              Onsite Payment
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-[#1a2c1f]">
                        Proof of Payment{" "}
                        <span className="text-[#cf4a3f]">*</span>
                      </Label>
                      <Input type="file" className="mt-1" />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-[#1a2c1f]">
                        Note (optional)
                      </Label>
                      <Textarea
                        placeholder="Optional note or details"
                        rows={4}
                        className="mt-1"
                      />
                    </div>

                    <div className="rounded-2xl border border-[#e3e9df] bg-[#f9fbf7] p-4">
                      <p className="text-base font-semibold text-[#1f5c34]">
                        Agreement and Confirmation
                      </p>
                      <p className="text-xs text-[#6b7c6f]">
                        Please read and confirm the following before proceeding.
                      </p>

                      <div className="mt-3 space-y-2 text-sm text-[#1d2f22]">
                        <label className="flex items-start gap-3">
                          <Checkbox />
                          <span>
                            I acknowledge the rules and regulations of monthly
                            due.
                          </span>
                        </label>
                        <label className="flex items-start gap-3">
                          <Checkbox />
                          <span>
                            I agree to be responsible for any damages of my
                            payment.
                          </span>
                        </label>
                        <label className="flex items-start gap-3">
                          <Checkbox />
                          <span>
                            I consent to the processing of my data under the
                            Data Privacy Act.
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                      <Button variant="outline" className="rounded-full px-6">
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setStep("summary")}
                        className="rounded-full bg-[#1f5c34] px-8 text-white hover:bg-[#174128]"
                      >
                        Next
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-[24px] border border-[#e3e9df] bg-white shadow-sm">
                      <div className="flex flex-col gap-6 p-6 lg:flex-row">
                        <div className="flex-1 space-y-2">
                          <p className="text-base font-semibold uppercase text-[#6b766d]">
                            Personal Information
                          </p>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-[#6b766d]">Full Name:</span>{" "}
                              <span className="font-semibold">
                                {summaryData.personal.fullName}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Address:</span>{" "}
                              <span className="font-semibold">
                                {summaryData.personal.address}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Phone:</span>{" "}
                              <span className="font-semibold">
                                {summaryData.personal.phone}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Email:</span>{" "}
                              <span className="font-semibold">
                                {summaryData.personal.email}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Residency:</span>{" "}
                              <span className="font-semibold">
                                {summaryData.personal.residency}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex-1 space-y-2">
                          <p className="text-base font-semibold uppercase text-[#6b766d]">
                            Payment Details
                          </p>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-[#6b766d]">
                                Billing Period:
                              </span>{" "}
                              <span className="font-semibold">
                                {summaryData.payment.billingPeriod}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">
                                For Month of:
                              </span>{" "}
                              <span className="font-semibold">
                                {summaryData.payment.forMonth}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">
                                Amount Paid:
                              </span>{" "}
                              <span className="font-semibold">
                                {summaryData.payment.amountPaid}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">
                                Payment Method:
                              </span>{" "}
                              <span className="font-semibold">
                                {summaryData.payment.method}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="rounded-full bg-[#e4efe7] px-4 py-2 font-semibold text-[#1f5c34]">
                        Ref No. {summaryData.reference}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="rounded-full px-6"
                          onClick={() => setStep("form")}
                        >
                          Back
                        </Button>
                        <Button className="rounded-full bg-[#1f5c34] px-8 text-white hover:bg-[#174128]">
                          Pay
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-[28px] bg-linear-to-b from-[#10382a] to-[#1c5d44] p-6 text-white shadow-lg">
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
                  <div className="mt-4 divide-y divide-white/10 text-sm">
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
                    <span className="text-center">₱0.00</span>
                    <span className="text-right">₱0.00</span>
                  </div>
                </div>
                <p className="mt-6 text-center text-xs text-white/70">
                  Need help? Contact support
                </p>
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
