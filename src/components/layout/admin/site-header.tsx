"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { User } from "../../../generated/prisma/client";

// Map route segments to readable names
const routeNameMap: Record<string, string> = {
  dashboard: "Dashboard",
  accounts: "Accounts",
  transactions: "Transactions",
  "monthly-due": "Monthly Due",
  "amenity-reservation": "Amenity Reservation",
  "lot-availabilities": "Lot Availabilities",
  announcements: "Announcements",
  maps: "Maps",
  settings: "Settings",
  feedback: "Feedback",
  "system-logs": "System Logs",
};

function generateBreadcrumbs(pathname: string) {
  // Remove /admin prefix and split into segments
  const segments = pathname
    .replace(/^\/admin\/?/, "")
    .split("/")
    .filter(Boolean);

  if (
    segments.length === 0 ||
    (segments.length === 1 && segments[0] === "dashboard")
  ) {
    return [{ label: "Dashboard", href: "/admin/dashboard" }];
  }

  const breadcrumbs = [{ label: "Dashboard", href: "/admin/dashboard" }];

  let currentPath = "/admin";

  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label =
      routeNameMap[segment] ||
      segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  });

  return breadcrumbs;
}

export function SiteHeader({ user }: { user: User }) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, crumbIndex) => {
              const isLast = crumbIndex === breadcrumbs.length - 1;

              return (
                <div key={crumb.href} className="flex items-center gap-1.5">
                  {crumbIndex > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-base font-medium">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                </span>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="px-2 py-1.5">
                Notifications
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-start justify-between">
                    <p className="text-sm font-medium">New payment received</p>
                    <span className="text-xs text-muted-foreground">
                      2m ago
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Monthly due payment from Unit 101
                  </p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-start justify-between">
                    <p className="text-sm font-medium">
                      Amenity reservation approved
                    </p>
                    <span className="text-xs text-muted-foreground">
                      1h ago
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Clubhouse reservation for John Doe has been approved
                  </p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-start justify-between">
                    <p className="text-sm font-medium">
                      System maintenance scheduled
                    </p>
                    <span className="text-xs text-muted-foreground">
                      3h ago
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Scheduled maintenance on March 15, 2024
                  </p>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/notifications"
                  className="w-full text-center"
                >
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Messages Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">Messages</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="px-2 py-1.5">
                Contact Messages
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-start justify-between">
                    <p className="text-sm font-medium">Sarah Johnson</p>
                    <span className="text-xs text-muted-foreground">
                      5m ago
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    sarah.johnson@email.com
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Interested in lot availability for Unit 205...
                  </p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-start justify-between">
                    <p className="text-sm font-medium">Michael Chen</p>
                    <span className="text-xs text-muted-foreground">
                      1h ago
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    michael.chen@email.com
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Question about amenity reservation process...
                  </p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-start justify-between">
                    <p className="text-sm font-medium">Emily Rodriguez</p>
                    <span className="text-xs text-muted-foreground">
                      2h ago
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    emily.rodriguez@email.com
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inquiry about monthly dues payment options...
                  </p>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/messages" className="w-full text-center">
                  View all messages
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <NavUser user={user} />
        </div>
      </div>
    </header>
  );
}
