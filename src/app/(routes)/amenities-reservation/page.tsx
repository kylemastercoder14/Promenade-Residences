"use client";

import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { ResidentReservationForm } from "@/features/amenity-reservations/components/resident-reservation-form";

const LotAvailabilitiesPage = () => {
  return (
    <div className="min-h-screen bg-[#f6f5f2] text-[#1a2c1f]">
      <Navbar variant="community" />

      <div className="pt-36 pb-10">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="rounded-4xl bg-white p-8 shadow-lg space-y-8">
            <ResidentReservationForm />
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default LotAvailabilitiesPage;
