"use client";

import * as React from "react";
import {
  IconBuildingWarehouse,
  IconCalendar,
  IconCalendarClock,
  IconCar,
  IconDashboard,
  IconHistory,
  IconHome2,
  IconMap,
  IconNews,
  IconSettings,
  IconStars,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import type { Role } from "@prisma/client";

import { NavMain } from "@/components/layout/admin/nav-main";
import { NavSecondary } from "@/components/layout/admin/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ADMIN_FEATURE_ACCESS } from "@/lib/rbac";

type NavItem = {
  title: string;
  url: string;
  icon: Icon;
  roles?: Role[];
  submenu?: NavItem[];
};

const navMainItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: IconDashboard,
    roles: [...ADMIN_FEATURE_ACCESS.DASHBOARD],
  },
  {
    title: "Accounts",
    url: "/admin/accounts",
    icon: IconUsers,
    roles: [...ADMIN_FEATURE_ACCESS.ACCOUNTS],
  },
  {
    title: "Transactions",
    url: "#",
    icon: IconWallet,
    roles: [...ADMIN_FEATURE_ACCESS.TRANSACTIONS],
    submenu: [
      {
        title: "Monthly Due",
        url: "/admin/transactions/monthly-due",
        icon: IconCalendar,
        roles: [...ADMIN_FEATURE_ACCESS.TRANSACTIONS],
      },
      {
        title: "Amenity Reservation",
        url: "/admin/transactions/amenity-reservation",
        icon: IconBuildingWarehouse,
        roles: [...ADMIN_FEATURE_ACCESS.TRANSACTIONS],
      },
    ],
  },
  {
    title: "Residents",
    url: "/admin/residents",
    icon: IconHome2,
    roles: [...ADMIN_FEATURE_ACCESS.RESIDENTS],
  },
  {
    title: "Vehicle Registration",
    url: "/admin/vehicle-registrations",
    icon: IconCar,
    roles: [...ADMIN_FEATURE_ACCESS.VEHICLE_REGISTRATIONS],
  },
  {
    title: "Announcements",
    url: "/admin/announcements",
    icon: IconNews,
    roles: [...ADMIN_FEATURE_ACCESS.ANNOUNCEMENTS],
  },
  {
    title: "News & Events",
    url: "/admin/whats-new",
    icon: IconCalendarClock,
    roles: [...ADMIN_FEATURE_ACCESS.WHATS_NEW],
  },
  {
    title: "Maps",
    url: "/admin/maps",
    icon: IconMap,
    roles: [...ADMIN_FEATURE_ACCESS.MAPS],
  },
];

const navSecondaryItems: NavItem[] = [
  {
    title: "Settings",
    url: "/admin/settings",
    icon: IconSettings,
    roles: [...ADMIN_FEATURE_ACCESS.SETTINGS],
  },
  {
    title: "Feedback",
    url: "/admin/feedback",
    icon: IconStars,
    roles: [...ADMIN_FEATURE_ACCESS.FEEDBACK],
  },
  {
    title: "System Logs",
    url: "/admin/system-logs",
    icon: IconHistory,
    roles: [...ADMIN_FEATURE_ACCESS.SYSTEM_LOGS],
  },
];

const filterNavItems = (items: NavItem[], role: Role): NavItem[] =>
  items
    .map((item) => {
      const isAllowed =
        !item.roles || item.roles.length === 0 || item.roles.includes(role);
      const filteredSubmenu = item.submenu
        ? filterNavItems(item.submenu, role)
        : undefined;

      if (filteredSubmenu && filteredSubmenu.length > 0) {
        return { ...item, submenu: filteredSubmenu };
      }

      return isAllowed ? item : null;
    })
    .filter(Boolean) as NavItem[];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  role: Role;
};

export function AppSidebar({ role, ...props }: AppSidebarProps) {
  const mainNav = filterNavItems(navMainItems, role);
  const secondaryNav = filterNavItems(navSecondaryItems, role);

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
        <NavMain items={mainNav} />
        {secondaryNav.length > 0 && (
          <NavSecondary items={secondaryNav} className="mt-auto" />
        )}
      </SidebarContent>
    </Sidebar>
  );
}
