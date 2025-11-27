"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useGetHouseholdMembers } from "../hooks/use-household";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import type { Resident, Maps } from "@prisma/client";

type ResidentWithMap = Resident & {
  map?: Pick<Maps, "id" | "blockNo" | "lotNo" | "street"> | null;
};

const getResidencyTypeLabel = (type: string) => {
  switch (type) {
    case "RESIDENT":
      return "Resident";
    case "TENANT":
      return "Tenant";
    default:
      return type;
  }
};

const getSexLabel = (sex: string) => {
  switch (sex) {
    case "MALE":
      return "Male";
    case "FEMALE":
      return "Female";
    case "PREFER_NOT_TO_SAY":
      return "Prefer not to say";
    default:
      return sex;
  }
};

const getFullName = (resident: ResidentWithMap) => {
  const parts = [
    resident.firstName,
    resident.middleName,
    resident.lastName,
    resident.suffix,
  ].filter(Boolean);
  return parts.join(" ");
};

const calculateAge = (dateOfBirth: Date) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : 0;
};

export const HouseholdMembersTable = () => {
  const { data: members = [], isLoading } = useGetHouseholdMembers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No household members registered yet. Add a family member using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Sex</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Contact Number</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const fullName = getFullName(member);
            const age = calculateAge(member.dateOfBirth);

            return (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {fullName}
                    {member.isHead && (
                      <Badge variant="outline" className="text-xs">
                        Head
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {getResidencyTypeLabel(member.typeOfResidency)}
                  </Badge>
                </TableCell>
                <TableCell>{getSexLabel(member.sex)}</TableCell>
                <TableCell>{age} years</TableCell>
                <TableCell>
                  {format(new Date(member.dateOfBirth), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>{member.contactNumber}</TableCell>
                <TableCell className="text-muted-foreground">
                  {member.emailAddress || "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

