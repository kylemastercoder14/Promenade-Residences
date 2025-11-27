"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const billingCards = [
  {
    title: "Register your Vehicle?",
    description: "Easily update plate numbers, decals, and parking access.",
    cta: "Get Started",
    link: "/vehicle-registration",
    icon: <Image src="/icons/car.png" alt="Car" width={100} height={100} />,
  },
  {
    title: "Pay your monthly dues?",
    description: "Settle association fees or track outstanding balances.",
    cta: "Get Started",
    link: "/monthly-due",
    icon: <Image src="/icons/house.png" alt="House" width={65} height={65} />,
  },
];

export const BillingAndDiscovery = () => {
  const router = useRouter();
  return (
    <section className="w-full bg-[#f7f4ef] py-16 text-[#1c2b1f]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#327248]">
            It&apos;s Billing Time!
          </p>
          <h2 className="mt-3 text-3xl font-semibold uppercase">Stay on top of your community tasks</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            Manage resident requirements without the paperwork. Register vehicles, pay dues, and stay
            compliant with just a few clicks.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {billingCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col justify-between rounded-3xl border border-[#e7dfd2] bg-white p-6 shadow-lg shadow-black/5"
            >
              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-semibold">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <Button onClick={() => router.push(card.link)} className="gap-2 rounded-full bg-[#327248] px-5 text-white hover:bg-[#28583b]">
                  {card.cta}
                  <ArrowRight className="size-4" />
                </Button>
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-4xl bg-[url('/hero.png')] bg-cover bg-center">
          <div className="rounded-4xl bg-[#102317]/80 p-10 text-white">
            <p className="text-sm uppercase tracking-[0.5em] text-white/70">Discover</p>
            <h3 className="mt-3 text-3xl font-semibold leading-snug">
              Discover a place you&apos;ll love
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              Browse available properties, explore amenities, and see what makes The Promenade
              Residence the ideal community for families and investors.
            </p>
            <Button onClick={() => router.push("/lot-availabilities")} className="mt-6 rounded-full bg-white px-6 text-[#1c2b1f] hover:bg-white/90">
              Buy Properties
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

