"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { Facebook, Instagram, Linkedin, Twitter, XIcon } from "lucide-react";
import Image from 'next/image';

const footerLinks = [
  {
    title: "General",
    items: [
      { label: "Monthly Due", href: "#monthly-due" },
      { label: "Amenity Reservation", href: "#amenity-reservation" },
      { label: "Lot Availabilities", href: "#lot-availabilities" },
      { label: "Feedback", href: "/feedback" },
    ],
  },
  {
    title: "Help",
    items: [
      { label: "FAQs", href: "#faqs" },
	  { label: "About", href: "#about" },
      { label: "Contact Us", href: "#contact-us" },
    ],
  },
  {
    title: "Terms & Condition",
    items: [
      { label: "HOA Contract", href: "#hoa" },
      { label: "General Policy", href: "#policy" },
      { label: "Privacy Policy", href: "#privacy" },
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

        <div className="border-t border-white/10 pt-6 text-sm text-white/50">
          Copyright © {new Date().getFullYear()} The Promenade Residence
        </div>
      </div>
    </footer>
  );
};

