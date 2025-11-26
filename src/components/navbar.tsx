"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

const navLinks = [
  { label: "What’s New", href: "/community" },
  { label: "Announcement", href: "#announcements" },
  { label: "Contact Us", href: "/contact" },
  { label: "Feedback", href: "#feedback" },
];

const transactionLinks = [
  { label: "Monthly Due", href: "/monthly-due" },
  { label: "Amenity Reservation", href: "/amenities-reservation" },
  { label: "Lot Availabilities", href: "/lot-availabilities" },
];

type NavbarVariant = "hero" | "community";

const containerStyles: Record<NavbarVariant, string> = {
  hero:
    "rounded-full border border-white/30 bg-[#101c14]/85 text-white shadow-2xl shadow-black/20 backdrop-blur",
  community:
    "rounded-[999px] border border-[#2c864c]/60 bg-gradient-to-r from-[#1b5b37] via-[#2f7a4f] to-[#4ca968] text-white shadow-lg",
};

const buttonStyles: Record<NavbarVariant, string> = {
  hero: "rounded-full bg-[#327248] px-6 text-white hover:bg-[#28603c]",
  community: "rounded-full bg-white/90 px-6 text-[#1d3725] hover:bg-white",
};

export const Navbar = ({ variant = "hero" }: { variant?: NavbarVariant }) => {
  const router = useRouter();
  return (
    <header className="fixed inset-x-0 top-4 z-50">
      <div
        className={cn(
          "mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6",
          containerStyles[variant],
        )}
      >
        <Link href="/" className="flex items-center gap-3 text-white">
          <Logo className="h-12 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-white/90 lg:flex">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="transition hover:text-white">
              {link.label}
            </a>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white/90 transition hover:border-white hover:text-white data-[state=open]:bg-white/10">
              Transactions
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-48 border border-white/20 bg-white/95 text-foreground backdrop-blur"
            >
              {transactionLinks.map((link) => (
                <DropdownMenuItem
                  key={link.label}
                  asChild
                  className="cursor-pointer px-3 py-2 text-sm font-medium text-foreground"
                >
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <Button onClick={() => router.push("/sign-in")} className={cn("hidden lg:inline-flex", buttonStyles[variant])}>
          Get Started
        </Button>
      </div>
    </header>
  );
};

