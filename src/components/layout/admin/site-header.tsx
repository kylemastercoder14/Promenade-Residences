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
import { User } from '@/lib/auth';
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

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

function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function SiteHeader({ user }: { user: User }) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);
  const trpc = useTRPC();

  // Fetch notifications
  const { data: notifications = [] } = useQuery(
    trpc.notifications.getRecent.queryOptions({ limit: 5 })
  );

  // Fetch unread notification count
  const { data: unreadNotificationCount = 0 } = useQuery(
    trpc.notifications.getUnreadCount.queryOptions()
  );

  // Fetch messages
  const { data: messages = [] } = useQuery(
    trpc.messages.getRecent.queryOptions({ limit: 5 })
  );

  // Fetch unread message count
  const { data: unreadMessageCount = 0 } = useQuery(
    trpc.messages.getUnreadCount.queryOptions()
  );

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
                {unreadNotificationCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[400px] overflow-x-hidden">
              <DropdownMenuLabel className="px-2 py-1.5">
                Notifications
                {unreadNotificationCount > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({unreadNotificationCount} new)
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[450px] overflow-y-auto overflow-x-hidden">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div key={notification.id}>
                      {index > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem asChild>
                        <Link
                          href={notification.link}
                          className="flex flex-col items-start gap-1 p-3 w-full min-w-0"
                        >
                          <div className="flex w-full items-start justify-between gap-2 min-w-0">
                            <p className="text-sm font-medium wrap-break-word min-w-0 flex-1">
                              {notification.title}
                            </p>
                            <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground wrap-break-word w-full">
                            {notification.description}
                          </p>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  ))
                )}
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
                {unreadMessageCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                  </span>
                )}
                <span className="sr-only">Messages</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[400px] overflow-x-hidden">
              <DropdownMenuLabel className="px-2 py-1.5">
                Contact Messages
                {unreadMessageCount > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({unreadMessageCount} new)
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[450px] overflow-y-auto overflow-x-hidden">
                {messages.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No messages
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isContact = message.type === "contact";
                    const linkHref = isContact
                      ? `/admin/contact/${message.id}`
                      : `/admin/feedback`;

                    return (
                      <div key={message.id}>
                        {index > 0 && <DropdownMenuSeparator />}
                        <DropdownMenuItem asChild>
                          <Link
                            href={linkHref}
                            className="flex flex-col items-start gap-1 p-3 w-full min-w-0"
                          >
                            <div className="flex w-full items-start justify-between gap-2 min-w-0">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <p className="text-sm font-medium wrap-break-word min-w-0 flex-1">{message.name}</p>
                                {isContact && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">
                                    Contact
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                                {formatTimeAgo(message.timestamp)}
                              </span>
                            </div>
                            {message.subject && (
                              <p className="text-xs font-semibold text-foreground wrap-break-word w-full">
                                {message.subject}
                              </p>
                            )}
                            {message.email && (
                              <p className="text-xs text-muted-foreground break-all w-full">
                                {message.email}
                              </p>
                            )}
                            {message.phone && (
                              <p className="text-xs text-muted-foreground break-all w-full">
                                {message.phone}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1 wrap-break-word w-full">
                              {message.message}
                            </p>
                          </Link>
                        </DropdownMenuItem>
                      </div>
                    );
                  })
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/contact" className="w-full text-center">
                  View all contact messages
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/feedback" className="w-full text-center">
                  View all feedback
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
