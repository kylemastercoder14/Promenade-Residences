"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Role } from "@prisma/client";
import { authClient } from "@/lib/auth-client";

const footerLinks = [
  {
    title: "General",
    items: [
      { label: "Monthly Due", href: "/monthly-due" },
      { label: "Amenity Reservation", href: "/amenities-reservation" },
      { label: "Lot Availabilities", href: "/lot-availabilities" },
    ],
  },
  {
    title: "Help",
    items: [
      { label: "FAQs", href: "/faqs" },
	  { label: "About", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Terms & Condition",
    items: [
      { label: "HOA Contract", href: "/hoa-contract" },
      { label: "General Policy", href: "/general-policy" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
];

const socials = [
  { icon: <Image src="/icons/facebook_logo.png" alt="Facebook" width={10} height={10} className='object-contain' />, href: "https://facebook.com" },
  { icon: <Image src="/icons/x_logo.png" alt="X" width={16} height={16} className='object-contain' />, href: "https://twitter.com" },
  { icon: <Image src="/icons/instagram_logo.png" alt="Instagram" width={16} height={16} className='object-contain' />, href: "https://instagram.com" },
  { icon: <Image src="/icons/linkedin_logo.png" alt="Linkedin" width={16} height={16} className='object-contain' />, href: "https://linkedin.com" },
];

export const LandingFooter = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const router = useRouter();

  // Check if user is an admin
  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const session = await authClient.getSession();
        const userRole = session?.data?.user?.role as Role | undefined;
        if (
          userRole === Role.ADMIN ||
          userRole === Role.SUPERADMIN ||
          userRole === Role.ACCOUNTING
        ) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
      } finally {
        setIsCheckingRole(false);
      }
    };

    checkAdminRole();
  }, []);

  return (
    <footer className="bg-[#111111] text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
          <Logo className="h-10 w-auto text-white" />

          <div className="flex items-center gap-6 text-sm text-white/80">
            <span>Follow us</span>
            <div className="flex gap-4">
              {socials.map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  className="flex items-center justify-center"
                  aria-label={`Follow us on ${social.href}`}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Promenade Residence
            </p>
            <p className="text-sm text-white/60">
              Promenade Residence is a community of residents who are committed to living in a safe, secure, and friendly environment.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/70">
                {section.title}
              </p>
              <ul className="space-y-2 text-sm text-white/65">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="transition hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            Copyright © {new Date().getFullYear()} The Promenade Residence
          </p>
          {!isCheckingRole && isAdmin && (
            <Button
              onClick={() => router.push("/admin/dashboard")}
              className="bg-[#327248] text-white hover:bg-[#28603c] rounded-full px-4 py-2 gap-2"
              size="sm"
            >
              <Shield className="h-4 w-4" />
              Admin Dashboard
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
};

