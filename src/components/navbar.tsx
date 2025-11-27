"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, LogOut, Settings, History, Car, UserPlus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const navLinks = [
  { label: "What’s New", href: "/community" },
  { label: "Announcement", href: "/announcement" },
  { label: "Contact Us", href: "/contact" },
];

const transactionLinks = [
  { label: "Monthly Due", href: "/monthly-due" },
  { label: "Transaction History", href: "/transaction-history" },
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
  const [user, setUser] = useState<{ id: string; name: string | null; email: string; image: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setUser({
            id: session.data.user.id,
            name: session.data.user.name ?? null,
            email: session.data.user.email,
            image: session.data.user.image ?? null,
          });
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setUser(null);
            router.push("/");
            toast.success("Logged out successfully");
          },
          onError: ({ error }) => {
            toast.error(error.message || "Error logging out");
          },
        },
      });
    } catch {
      toast.error("An error occurred while logging out");
    }
  };

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

        {!isLoading && (
          <>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "hidden lg:flex items-center gap-2 rounded-full border border-white/30 px-3 py-2 text-white/90 transition hover:border-white hover:text-white data-[state=open]:bg-white/10",
                      variant === "community" && "border-white/40"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || ""} alt={user.name || ""} />
                      <AvatarFallback className="bg-white/20 text-white text-xs">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-56 border border-white/20 bg-white/95 text-foreground backdrop-blur"
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-3 px-2 py-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || ""} alt={user.name || ""} />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {user.name || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/transaction-history" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Transaction History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/vehicle-registration" className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Vehicle Registration
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/household-members" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add Household Member
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => router.push("/sign-in")} className={cn("hidden lg:inline-flex", buttonStyles[variant])}>
                Get Started
              </Button>
            )}
          </>
        )}
      </div>
    </header>
  );
};

