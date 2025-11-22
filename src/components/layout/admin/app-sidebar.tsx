"use client";

import * as React from "react";
import {
  IconBuildingWarehouse,
  IconCalendar,
  IconDashboard,
  IconHistory,
  IconMap,
  IconMapPin,
  IconNews,
  IconSettings,
  IconStars,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";

import { NavMain } from "@/components/layout/admin/nav-main";
import { NavSecondary } from "@/components/layout/admin/nav-secondary";import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Logo } from "@/components/logo";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Accounts",
      url: "/admin/accounts",
      icon: IconUsers,
    },
    {
      title: "Transactions",
      url: "#",
      icon: IconWallet,
      submenu: [
        {
          title: "Monthly Due",
          url: "/admin/transactions/monthly-due",
          icon: IconCalendar,
        },
        {
          title: "Amenity Reservation",
          url: "/admin/transactions/amenity-reservation",
          icon: IconBuildingWarehouse,
        },
        {
          title: "Lot Availabilities",
          url: "/admin/transactions/lot-availabilities",
          icon: IconMapPin,
        },
      ],
    },
    {
      title: "Announcements",
      url: "#",
      icon: IconNews,
    },
    {
      title: "Maps",
      url: "#",
      icon: IconMap,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Feedback",
      url: "#",
      icon: IconStars,
    },
    {
      title: "System Logs",
      url: "#",
      icon: IconHistory,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="gap-x-2 h-12 px-4">
              <Link href="/workflows" prefetch>
                <Logo className="size-14 object-contain" />
                <span className="font-semibold text-sm">
                  Promenade Residences
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
