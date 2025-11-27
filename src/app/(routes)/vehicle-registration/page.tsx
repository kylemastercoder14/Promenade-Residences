"use client";

import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiStepVehicleForm } from "@/features/vehicle-registrations/components/multi-step-vehicle-form";
import { VehiclesTable } from "@/features/vehicle-registrations/components/vehicles-table";

const VehicleRegistrationPage = () => {
  return (
    <div className="min-h-screen bg-[#f2f4f1] text-[#1b261b]">
      <Navbar variant="community" />
      <div className="pt-36 pb-10">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="rounded-4xl bg-white p-8 shadow-lg">
            <Tabs defaultValue="vehicles" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>
                <TabsTrigger value="add">Register Vehicle</TabsTrigger>
              </TabsList>
              <TabsContent value="vehicles" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Registered Vehicles</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      All vehicles registered under your household.
                    </p>
                  </div>
                  <VehiclesTable />
                </div>
              </TabsContent>
              <TabsContent value="add" className="mt-0">
                <MultiStepVehicleForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
};

export default VehicleRegistrationPage;
