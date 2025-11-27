"use client";

import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HouseholdMemberForm } from "@/features/household/components/household-member-form";
import { HouseholdMembersTable } from "@/features/household/components/household-members-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Page = () => {
  return (
    <div className="min-h-screen bg-[#f2f4f1] text-[#1b261b]">
      <Navbar variant="community" />
      <div className="container mx-auto px-4 pt-40 pb-16">
        <div className="max-w-5xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Household Members</CardTitle>
              <CardDescription>
                Manage your household members. Add family members and view all registered members in your household.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="members" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="members">Family Members</TabsTrigger>
                  <TabsTrigger value="add">Add Member</TabsTrigger>
                </TabsList>
                <TabsContent value="members" className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Registered Household Members</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        All family members registered under your household.
                      </p>
                    </div>
                    <HouseholdMembersTable />
                  </div>
                </TabsContent>
                <TabsContent value="add" className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Add New Household Member</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Register a family member to your household. They will be linked to your property and can access community services.
                      </p>
                    </div>
                    <HouseholdMemberForm />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
};

export default Page;

