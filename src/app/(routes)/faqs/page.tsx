"use client";

import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";

const quickLinks = [
  { label: "Monthly Due", href: "#monthly-due" },
  { label: "Amenity Reservation", href: "#amenity-reservation" },
  { label: "Lot Availabilities", href: "#lot-availabilities" },
  { label: "Community Blog", href: "/community" },
];

const faqSections = [
  {
    title: "Account & Access",
    faqs: [
      {
        question: "How do I create a resident account?",
        answer:
          "Click the Get Started button and complete the multi-step registration. Provide your residency details, verify via email, and set your password to access community services.",
      },
      {
        question: "I forgot my password, what should I do?",
        answer:
          "Use the Forgot Password workflow on the sign-in page. Enter your registered email, provide the OTP sent to you, and create a new password.",
      },
      {
        question: "Can multiple family members share one account?",
        answer:
          "Each resident should maintain their own profile for proper scheduling, approvals, and notifications. Household members can be linked to the same property.",
      },
    ],
  },
  {
    title: "Payments & Reservations",
    faqs: [
      {
        question: "Where can I view my monthly dues?",
        answer:
          "Navigate to Transactions → Monthly Due to view statements, payment history, and available payment methods.",
      },
      {
        question: "How do I reserve an amenity?",
        answer:
          "Go to Transactions → Amenity Reservation. Choose the amenity, date, and time slot. A confirmation email will be sent once the request is approved.",
      },
      {
        question: "What if I need to cancel a reservation?",
        answer:
          "Visit your reservation details and click Cancel. Please ensure the cancellation is submitted at least 24 hours before the schedule.",
      },
    ],
  },
  {
    title: "Community Support",
    faqs: [
      {
        question: "Who do I contact for urgent concerns?",
        answer:
          "For urgent onsite concerns, call the guard house hotline listed in the Contact Us section. For digital support, use the chat assistance or email the property administrator.",
      },
      {
        question: "How do I stay updated with announcements?",
        answer:
          "Subscribe to our newsletter at the bottom of the landing page or visit the What’s New section for real-time updates.",
      },
      {
        question: "Can I suggest improvements to the portal?",
        answer:
          "Yes! Use the feedback form available under Help → Support. We review suggestions weekly with the management team.",
      },
    ],
  },
];

const Page = () => {
  return (
    <div className="min-h-screen bg-[#f6f5f2] text-[#1f2b1d]">
      <Navbar variant="community" />

      <section className="relative isolate overflow-hidden bg-linear-to-br from-[#1a3a26] via-[#285138] to-[#3d7b52] min-h-[43vh] text-white">
        <div className="mx-auto flex w-full max-w-6xl px-5 flex-col mt-36 gap-6 text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">
            Help Center
          </p>
          <h1 className="text-4xl font-serif uppercase tracking-wide sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-white/80">
            Need help with dues, amenity reservations, or account access? Browse the topics below or
            reach out to the Promenade support team any time.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 lg:justify-start">
            <Button variant="secondary" className="gap-2 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20">
              <MessageCircle className="size-4" />
              Chat with support
            </Button>
            <Button className="gap-2 rounded-full bg-white px-6 text-[#1a3a26] hover:bg-white/90">
              <Phone className="size-4" />
              Call hotline
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16 lg:flex-row">
        <div className="flex-1 rounded-3xl border border-[#dfe3d9] bg-white p-6 shadow-sm">
          {faqSections.map((section) => (
            <div key={section.title} className="mb-8 last:mb-0">
              <h2 className="text-lg font-semibold text-[#1d402a]">{section.title}</h2>
              <Accordion type="single" collapsible className="mt-4 space-y-3">
                {section.faqs.map((faq, index) => (
                  <AccordionItem
                    value={`${section.title}-${index}`}
                    key={faq.question}
                    className="rounded-2xl border border-[#e3e7de] px-4"
                  >
                    <AccordionTrigger className="text-left text-base font-semibold text-[#1f2b1d]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-[#4a5a4f]">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <aside className="w-full max-w-md space-y-6 rounded-3xl border border-[#dfe3d9] bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1d402a]">
              Quick Links
            </p>
            <div className="grid gap-2">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-2xl border border-[#e5e8e1] px-4 py-3 text-sm font-medium text-[#1f2b1d] transition hover:border-[#1f5e38] hover:text-[#1f5e38]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-2xl bg-[#f2f5f1] p-5 text-sm text-[#415046]">
            <p className="text-base font-semibold text-[#1d402a]">Still need assistance?</p>
            <p>
              Email <span className="font-medium text-[#1f5e38]">support@promenade.ph</span> or send
              us a ticket and we’ll get back within one business day.
            </p>
          </div>
        </aside>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Page;

