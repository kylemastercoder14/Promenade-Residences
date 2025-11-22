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
import { cn } from "@/lib/utils";
import Image from "next/image";

const summaryVehicle = {
  vehicle: {
    model: "Toyota Fortuner",
    year: "2022",
    color: "Pearl White",
    plate: "ABC 1234",
    type: "SUV",
    chassis: "JTNBJ38F5J3012345",
    engine: "1GD-FTV",
  },
  driver: {
    firstName: "Juan",
    middle: "Santos",
    lastName: "Dela Cruz",
    licenseNo: "N01-34-567890",
    expiry: "May 18, 2026",
    relationship: "Owner",
  },
  reference: "VR-2025-00148",
};

const steps = ["vehicle", "driver", "summary"] as const;
type Step = (typeof steps)[number];

const VehicleRegistrationPage = () => {
  const [step, setStep] = useState<Step>("vehicle");

  return (
    <div className="min-h-screen bg-[#f2f4f1] text-[#1b261b]">
      <Navbar variant="community" />

      <div className="pt-36 pb-10">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="rounded-[32px] bg-white p-8 shadow-lg">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-serif uppercase text-[#111]">
                    Vehicle Registration Form
                  </h1>
                  <p className="text-sm text-[#4b554c]">
                    Provide accurate vehicle and driver information for access
                    sticker processing. This form is available only to
                    authenticated residents.
                  </p>
                </div>

                <div className="rounded-full bg-[#dfe7dd] p-1">
                  <div
                    className={cn(
                      "rounded-full py-1 text-center text-xs font-semibold uppercase tracking-[0.5em] text-white transition-all",
                      step === "vehicle"
                        ? "w-1/3 bg-[#1f5c34]"
                        : step === "driver"
                        ? "w-2/3 bg-[#1f5c34]"
                        : "w-full bg-[#1f5c34]"
                    )}
                  >
                    {step === "summary"
                      ? "Step 3 of 3"
                      : step === "driver"
                      ? "Step 2 of 3"
                      : "Step 1 of 3"}
                  </div>
                </div>

                {step === "vehicle" && (
                  <form className="space-y-5">
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Brand
                        </Label>
                        <Input
                          placeholder="Brand (e.g. HONDA)"
                          className="mt-1 bg-[#f6f8f5]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Model
                        </Label>
                        <Input
                          placeholder="Model (e.g. CIVIC)"
                          className="mt-1 bg-[#f6f8f5]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Year of Manufacture
                        </Label>
                        <Input
                          placeholder="Year (e.g. 2024)"
                          className="mt-1 bg-[#f6f8f5]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Color
                        </Label>
                        <Input
                          placeholder="Color (e.g. Pearl White)"
                          className="mt-1 bg-[#f6f8f5]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Plate Number
                        </Label>
                        <Input
                          placeholder="Plate Number (e.g. ABC 1234)"
                          className="mt-1 bg-[#f6f8f5]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Vehicle Type
                        </Label>
                        <Select>
                          <SelectTrigger className="mt-1 w-full bg-[#f6f8f5]">
                            <SelectValue placeholder="Vehicle Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="car">Car</SelectItem>
                            <SelectItem value="truck">Truck</SelectItem>
                            <SelectItem value="motorcycle">
                              Motorcycle
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Chassis Number
                        </Label>
                        <Input
                          placeholder="Chassis Number (e.g. 1GD-FTV)"
                          className="mt-1 bg-[#f6f8f5]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Engine Number
                        </Label>
                        <Input
                          placeholder="Engine Number (e.g. 1GD-FTV)"
                          className="mt-1 bg-[#f6f8f5]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        className="rounded-full bg-[#1f5c34] px-8 text-white hover:bg-[#174128]"
                        onClick={() => setStep("driver")}
                      >
                        Next
                      </Button>
                    </div>
                  </form>
                )}

                {step === "driver" && (
                  <form className="space-y-5">
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          First Name
                        </Label>
                        <Input
                          placeholder="First Name"
                          className="mt-1 bg-[#f6f8f5]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Middle Name
                        </Label>
                        <Input
                          placeholder="Middle Name"
                          className="mt-1 bg-[#f6f8f5]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Surname
                        </Label>
                        <Input
                          placeholder="Surname"
                          className="mt-1 bg-[#f6f8f5]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          License Number
                        </Label>
                        <Input
                          placeholder="License Number"
                          className="mt-1 bg-[#f6f8f5]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Expiry Date
                        </Label>
                        <Input
                          type="date"
                          placeholder="Expiry Date"
                          className="mt-1 bg-[#f6f8f5]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Relationship to Vehicle
                        </Label>
                        <Select>
                          <SelectTrigger className="mt-1 w-full bg-[#f6f8f5]">
                            <SelectValue placeholder="Relationship to Vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="family">
                              Family Member
                            </SelectItem>
                            <SelectItem value="driver">
                              Company Driver
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Official Receipt
                        </Label>
                        <Input type="file" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-[#1a2c1f]">
                          Certificate of Registration
                        </Label>
                        <Input type="file" className="mt-1" />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        className="rounded-full px-6"
                        onClick={() => setStep("vehicle")}
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
                            Vehicle Information
                          </p>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-[#6b766d]">
                                Model / Year:
                              </span>{" "}
                              <span className="font-semibold">
                                {summaryVehicle.vehicle.model}
                              </span>{" "}
                              <span className="text-[#6b766d]">
                                {summaryVehicle.vehicle.year}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Color:</span>{" "}
                              <span className="font-semibold">
                                {summaryVehicle.vehicle.color}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Plate:</span>{" "}
                              <span className="font-semibold">
                                {summaryVehicle.vehicle.plate}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Type:</span>{" "}
                              <span className="font-semibold">
                                {summaryVehicle.vehicle.type}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Chassis:</span>{" "}
                              <span className="font-semibold">
                                {summaryVehicle.vehicle.chassis}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Engine:</span>{" "}
                              <span className="font-semibold">
                                {summaryVehicle.vehicle.engine}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex-1 space-y-2">
                          <p className="text-base font-semibold uppercase text-[#6b766d]">
                            Driver Information
                          </p>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-[#6b766d]">Driver:</span>{" "}
                              <span className="font-semibold">
                                {summaryVehicle.driver.firstName}{" "}
                                {summaryVehicle.driver.middle}{" "}
                                {summaryVehicle.driver.lastName}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">
                                License No.:
                              </span>{" "}
                              <span className="font-semibold">
                                {summaryVehicle.driver.licenseNo}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">Expiry:</span>{" "}
                              <span className="font-semibold">
                                {summaryVehicle.driver.expiry}
                              </span>
                            </p>
                            <p>
                              <span className="text-[#6b766d]">
                                Relationship:
                              </span>{" "}
                              <span className="font-semibold">
                                {summaryVehicle.driver.relationship}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <span className="rounded-full bg-[#e4efe7] px-4 py-2 text-sm font-semibold text-[#1f5c34]">
                        Reference: {summaryVehicle.reference}
                      </span>
                      <Button
                        variant="outline"
                        className="rounded-full px-6"
                        onClick={() => setStep("driver")}
                      >
                        Back
                      </Button>
                      <Button className="rounded-full bg-[#1f5c34] px-8 text-white hover:bg-[#174128]">
                        Confirm Registration
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <aside className="rounded-[28px] bg-[#0d0d0d] p-6 text-white">
                <div className="relative h-full w-full overflow-hidden rounded-[24px]">
                  <Image
                    src="/faq-vehicle.png"
                    alt="Vehicle Registration FAQ"
                    fill
                    className="object-cover"
                  />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default VehicleRegistrationPage;
