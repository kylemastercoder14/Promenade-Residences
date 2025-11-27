"use client";

import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { LandingFooter } from "@/components/landing/footer";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { ContactForm } from "@/features/contact/components/contact-form";

const contactChannels = [
  {
    title: "Resident Services",
    description: "Questions about dues, reservations, or digital access.",
    value: "+63 917 555 0192",
    icon: Phone,
  },
  {
    title: "Admin Office",
    description: "Permit requests, billing statements, and official letters.",
    value: "admin@promenade.ph",
    icon: Mail,
  },
  {
    title: "Guard House / Emergencies",
    description: "Security, access assistance, or urgent resident concerns.",
    value: "+63 927 889 4430",
    icon: Phone,
  },
];

const officeInfo = [
  {
    icon: MapPin,
    label: "Address",
    value: "Lot 12, The Promenade Residences, Dasmariñas, Cavite",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "Monday – Saturday | 8:00 AM - 6:00 PM",
  },
];

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-[#f6f5f2] text-[#1f2b1d]">
      <Navbar variant="community" />

      <section className="relative isolate overflow-hidden bg-linear-to-br from-[#1a3a26] via-[#285138] to-[#3d7b52] min-h-[47vh] text-white">
        <div className="mx-auto flex w-full max-w-6xl mt-36 flex-col gap-6 px-6 text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">
            Get in Touch
          </p>
          <h1 className="text-4xl font-serif uppercase tracking-wide sm:text-5xl">
            Contact The Promenade Residence
          </h1>
          <p className="text-sm text-white/80">
            Whether you need help with monthly dues, amenity bookings, or community support, the
            Promenade concierge team is ready to assist.
          </p>
          <div className="mt-4 grid gap-4 text-sm text-white/80 lg:grid-cols-2">
            {officeInfo.map((info) => (
              <div key={info.label} className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <info.icon className="size-5 text-white" />
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/70">{info.label}</p>
                  <p className="text-base font-medium text-white">{info.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#1d402a]">Talk with our team</h2>
          <p className="text-sm text-[#4c5b51]">
            Choose the channel that best matches your concern and we’ll respond as soon as possible.
          </p>
          <div className="grid gap-4">
            {contactChannels.map((channel) => (
              <div key={channel.title} className="rounded-2xl border border-[#e0e4da] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[#e6f0ea] p-3 text-[#1f5e38]">
                    <channel.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-[#6b766d]">{channel.title}</p>
                    <p className="text-lg font-semibold text-[#1f2b1d]">{channel.value}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[#4c5b51]">{channel.description}</p>
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#dfe3d9] bg-white">
            <Image
              src="/banner.png"
              alt="Promenade map"
              width={1200}
              height={600}
              className="h-64 w-full object-cover"
            />
            <div className="p-5">
              <p className="text-base font-semibold text-[#1d402a]">Visit the admin office</p>
              <p className="text-sm text-[#4c5b51]">
                Appointments are encouraged for document processing and special permits. Walk-ins are
                welcome during office hours.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-[#dfe3d9] bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1d402a]">
              Send us a message
            </p>
            <p className="mt-1 text-sm text-[#4c5b51]">
              Fill out the form and we’ll email you back within one business day.
            </p>
          </div>

          <ContactForm />

          <div className="overflow-hidden rounded-3xl border border-[#dfe3d9] shadow-sm">
            <iframe
              title="The Promenade Residence Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.2535482767503!2d120.96086537604803!3d14.329080886239872!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c690d6c2ad5f%3A0x4937b7c35b58d53c!2sDasmari%C3%B1as%2C%20Cavite!5e0!3m2!1sen!2sph!4v1732136400000!5m2!1sen!2sph"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-120 w-full border-0"
            />
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default ContactPage;

