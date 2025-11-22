"use client";

import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import Image from "next/image";

const steps = ["person", "amenity", "summary"] as const;
type Step = (typeof steps)[number];

const summaryReservation = {
  guest: {
    type: "Resident",
    name: "Juan Dela Cruz",
    email: "juandc@example.com",
    contact: "+63 917 555 0123",
  },
  amenity: {
    type: "Clubhouse",
    date: "June 10, 2025",
    time: "3:00 PM - 7:00 PM",
    guests: 25,
    total: "₱3,000",
    paid: "₱1,500",
    method: "GCash",
  },
  reference: "LAV-002374",
};

const LotAvailabilitiesPage = () => {
  const [step, setStep] = useState<Step>("person");
  const [personType, setPersonType] = useState("resident");

  return (
    <div className="min-h-screen bg-[#f6f5f2] text-[#1a2c1f]">
      <Navbar variant="community" />

      <div className="pt-36 pb-10">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="rounded-[32px] bg-white p-8 shadow-lg">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#1f5c34]">
                    Amenities Reservation
                  </p>
                  <h1 className="text-3xl font-serif uppercase text-[#111]">
                    Fill out reservation details
                  </h1>
                </div>

                <div className="rounded-full bg-[#dfe7dd] p-1">
                  <div
                    className={cn(
                      "rounded-full py-1 text-center text-xs font-semibold uppercase tracking-[0.4em] text-white transition-all",
                      step === "person"
                        ? "w-1/3 bg-[#1f5c34]"
                        : step === "amenity"
                        ? "w-2/3 bg-[#1f5c34]"
                        : "w-full bg-[#1f5c34]"
                    )}
                  >
                    {step === "person"
                      ? "Step 1 of 3"
                      : step === "amenity"
                      ? "Step 2 of 3"
                      : "Step 3 of 3"}
                  </div>
                </div>

                {step === "person" && (
                  <form className="space-y-5">
                    <RadioGroup
                      value={personType}
                      onValueChange={setPersonType}
                      className="mt-4 grid gap-3 md:grid-cols-2"
                    >
                      {[
                        {
                          value: "resident",
                          title: "Resident",
                          desc: "Registered homeowner or tenant with verified account.",
                        },
                        {
                          value: "visitor",
                          title: "Visitor",
                          desc: "Guests requiring temporary amenity access.",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={cn(
                            "flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 transition",
                            personType === option.value
                              ? "border-[#1f5c34] bg-[#e5f2ea]"
                              : "border-[#e5e8df] hover:border-[#1f5c34]/50"
                          )}
                        >
                          <RadioGroupItem
                            value={option.value}
                            className="mt-1"
                          />
                          <div>
                            <p className="font-semibold text-[#1f2b1d]">
                              {option.title}
                            </p>
                            <p className="text-sm text-[#5b665c]">
                              {option.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          First Name
                        </Label>
                        <Input
                          placeholder="Juan"
                          className="mt-1 bg-[#f5f8f3]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Middle Name
                        </Label>
                        <Input
                          placeholder="Santos"
                          className="mt-1 bg-[#f5f8f3]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Last Name
                        </Label>
                        <Input
                          placeholder="Dela Cruz"
                          className="mt-1 bg-[#f5f8f3]"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Email Address
                        </Label>
                        <Input
                          placeholder="yourname@email.com"
                          className="mt-1 bg-[#f5f8f3]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Contact Number
                        </Label>
                        <Input
                          placeholder="+63 917 555 0123"
                          className="mt-1 bg-[#f5f8f3]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        className="rounded-full bg-[#1f5c34] px-8 text-white hover:bg-[#174128]"
                        onClick={() => setStep("amenity")}
                        type="button"
                      >
                        Next
                      </Button>
                    </div>
                  </form>
                )}

                {step === "amenity" && (
                  <form className="space-y-4">
                    <p className="text-sm font-semibold uppercase text-[#1f5c34]">
                      Amenity Details
                    </p>
                    <div className="mt-2 grid gap-3 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Type of Amenity
                        </Label>
                        <Select>
                          <SelectTrigger className="mt-1 w-full bg-[#f5f8f3]">
                            <SelectValue placeholder="Choose amenity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parking">
                              Parking Area
                            </SelectItem>
                            <SelectItem value="clubhouse">Clubhouse</SelectItem>
                            <SelectItem value="basketball">
                              Basketball Court
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Reservation Start Date
                        </Label>
                        <Input
                          type="datetime-local"
                          className="mt-1 bg-[#f5f8f3]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Reservation End Date
                        </Label>
                        <Input
                          type="datetime-local"
                          className="mt-1 bg-[#f5f8f3]"
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Number of Guests
                        </Label>
                        <Input
                          type="number"
                          placeholder="0"
                          className="mt-1 bg-[#f5f8f3]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Total Amount
                        </Label>
                        <Input
                          placeholder="₱0.00"
                          className="mt-1 bg-[#f5f8f3]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Amount Paid
                        </Label>
                        <Input
                          placeholder="₱0.00"
                          className="mt-1 bg-[#f5f8f3]"
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Payment Method
                        </Label>
                        <Select>
                          <SelectTrigger className="mt-1 w-full bg-[#f5f8f3]">
                            <SelectValue placeholder="Select method" />
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
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Proof of Payment
                        </Label>
                        <Input type="file" className="mt-1" />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        className="rounded-full px-6"
                        onClick={() => setStep("person")}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        className="rounded-full bg-[#1f5c34] px-8 text-white hover:bg-[#174128]"
                        onClick={() => setStep("summary")}
                      >
                        Next
                      </Button>
                    </div>
                  </form>
                )}

                {step === "summary" && (
                  <div className="space-y-6">
                    <div className="rounded-[24px] border border-[#e3e9df] bg-white shadow-sm">
                      <div className="flex flex-col gap-6 p-6 lg:flex-row">
                        <div className="flex-1 space-y-2">
                          <p className="text-base font-semibold uppercase text-[#6b766d]">
                            Guest Information
                          </p>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-[#6b766d]">Type:</span>{" "}
                              <span className="font-semibold">
                                {summaryReservation.guest.type}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766д]">Name:</span>{" "}
                              <span className="font-semibold">
                                {summaryReservation.guest.name}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Email:</span>{" "}
                              <span className="font-semibold">
                                {summaryReservation.guest.email}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Contact:</span>{" "}
                              <span className="font-semibold">
                                {summaryReservation.guest.contact}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex-1 space-y-2">
                          <p className="text-base font-semibold uppercase text-[#6b766d]">
                            Amenity Details
                          </p>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-[#6b766d]">Amenity:</span>{" "}
                              <span className="font-semibold">
                                {summaryReservation.amenity.type}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Date:</span>{" "}
                              <span className="font-semibold">
                                {summaryReservation.amenity.date}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Time:</span>{" "}
                              <span className="font-semibold">
                                {summaryReservation.amenity.time}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Guests:</span>{" "}
                              <span className="font-semibold">
                                {summaryReservation.amenity.guests}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">
                                Total / Paid:
                              </span>{" "}
                              <span className="font-semibold">
                                {summaryReservation.amenity.total} /{" "}
                                {summaryReservation.amenity.paid}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Method:</span>{" "}
                              <span className="font-semibold">
                                {summaryReservation.amenity.method}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-4">
                      <span className="rounded-full bg-[#e4efe7] px-4 py-2 text-sm font-semibold text-[#1f5c34]">
                        Reference: {summaryReservation.reference}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="rounded-full px-6"
                          onClick={() => setStep("amenity")}
                        >
                          Back
                        </Button>
                        <Button className="rounded-full bg-[#1f5c34] px-8 text-white hover:bg-[#174128]">
                          Confirm Reservation
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <aside className="relative h-full w-full overflow-hidden rounded-[24px]">
                <Image
                  src="/amenity.png"
                  alt="Amenity Reservation Details"
                  fill
                  className="object-cover"
                />
              </aside>
            </div>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default LotAvailabilitiesPage;
