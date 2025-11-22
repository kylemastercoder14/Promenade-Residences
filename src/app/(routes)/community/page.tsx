"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LandingFooter } from "@/components/landing/footer";

const tabs = ["Blog", "News", "Go to Places", "Media Hub"];

const articles = [
  {
    id: 1,
    title: "Celebrating the Pride of Dasmariñas: Everything You Need to Know",
    excerpt:
      "Learn more about the colors, culture, and energy behind the biggest community showcase. Discover routes, activities, and preparation tips for residents and guests.",
    date: "November 26, 2024",
    image: "/auth-slider/1.png",
    tag: "Festivals",
  },
  {
    id: 2,
    title: "Hot Weather Essential Safety Tips: How to Protect Pets This Summer",
    excerpt:
      "Summer is fun, but keeping our furry friends safe is a priority. Explore veterinarian-backed reminders on hydration, walking schedules, and backyard safety.",
    date: "May 05, 2024",
    image: "/auth-slider/2.png",
    tag: "Community Care",
  },
];

const categories = [
  "All Blogs",
  "Current Events",
  "News",
  "Homecoming",
  "Investment",
  "Travel",
  "Health & Wellness",
  "Shopping",
  "Food",
];

const recentPosts = [
  "What to Expect at Pahiyas Festival 2025",
  "The Benefits of Living in Camella in Iloilo",
  "TikTok Made Me Buy It: Viral Upgrades for Your Home",
  "Why Live in Camella Monticello?",
  "Inspiring Landscaping Ideas for Your Outdoor Space",
];

const featuredSpotlight = {
  title: "Featured Community",
  description:
    "Explore high-rise living with greener spaces at Bel-Air Residences.",
  cta: "Book a tour",
  image: "/auth-slider/3.png",
};

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f4f1] text-[#1d2b1f]">
      <Navbar variant="community" />

      {/* Hero */}
      <div className="relative isolate min-h-[40vh] w-full overflow-hidden">
        <Image
          src="/banner.png"
          alt="Community banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/50 to-black" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center gap-6 px-6 pt-36 pb-16 text-center text-white">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.5em] text-white/70">
              Blog
            </p>
            <h1 className="mt-3 text-4xl font-serif uppercase tracking-wide text-white sm:text-5xl">
              Community Stories & Guides
            </h1>
            <p className="mx-auto mt-3 max-w-3xl text-sm text-white/80">
              Discover deep dives on culture, property, and lifestyle topics
              curated for Promenade residents. Browse per category or stay
              updated on seasonal happenings.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                className={cn(
                  "rounded-full border px-6 py-2 text-sm font-semibold uppercase tracking-wide transition",
                  index === 0
                    ? "border-white bg-white text-[#1f5e38]"
                    : "border-white/50 bg-white/10 text-white hover:bg-white/20"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-white py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 lg:grid-cols-[2.1fr_0.9fr]">
          <div>
            <div className="space-y-10">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="overflow-hidden rounded-3xl border border-[#e1e3dc] bg-white shadow-sm"
                >
                  <div className="relative h-72 w-full">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 60vw"
                      priority={article.id === 1}
                    />
                  </div>
                  <div className="space-y-5 p-6">
                    <span className="inline-flex rounded-full bg-[#e7f2ea] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2d6c41]">
                      {article.tag}
                    </span>
                    <div className="space-y-3 text-left">
                      <h2 className="text-2xl font-semibold text-[#1b2b1e]">
                        {article.title}
                      </h2>
                      <p className="text-sm leading-relaxed text-[#4e5c51]">
                        {article.excerpt}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-[#4a5a4f]">
                        <Calendar className="size-4" />
                        {article.date}
                      </div>
                      <Button
                        variant="ghost"
                        className="gap-2 rounded-full border border-[#1f5e38] px-5 text-[#1f5e38] hover:bg-[#1f5e38] hover:text-white"
                      >
                        Read more
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2 rounded-full border border-[#d3d6cf] bg-[#f8f8f4] px-3 py-1.5 text-sm font-medium text-[#1d2b1f]">
                <button className="flex items-center gap-1 rounded-full px-3 py-1 text-[#4a5a4f] transition hover:bg-white">
                  <ChevronLeft className="size-4" />
                  Prev
                </button>
                <span className="rounded-full bg-white px-3 py-1 text-[#1f5e38]">
                  1
                </span>
                <button className="flex items-center gap-1 rounded-full px-3 py-1 text-[#4a5a4f] transition hover:bg-white">
                  Next
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="rounded-2xl border border-[#d9ddd5] bg-[#f7f7f3] p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#1f5e38]">
                Search
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-full border border-[#d3d6cf] bg-white px-3">
                <Search className="size-4 text-[#6b776d]" />
                <Input
                  placeholder="Search articles"
                  className="border-none px-0 text-sm text-[#1d2b1f] focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#d9ddd5] bg-[#fdfdfc] p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#1f5e38]">
                Categories
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[#4a5a4f]">
                {categories.map((category) => (
                  <li
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <span>{category}</span>
                    <span className="text-[#b0b5ac]">›</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#d9ddd5] bg-white">
              <div className="relative h-44 w-full">
                <Image
                  src={featuredSpotlight.image}
                  alt={featuredSpotlight.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.5em]">Featured</p>
                  <p className="mt-1 text-lg font-semibold">
                    {featuredSpotlight.title}
                  </p>
                </div>
              </div>
              <div className="space-y-3 p-5">
                <p className="text-sm text-[#4a5a4f]">
                  {featuredSpotlight.description}
                </p>
                <Button className="w-full rounded-full bg-[#1f5e38] text-white hover:bg-[#17432a]">
                  {featuredSpotlight.cta}
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d9ddd5] bg-[#fdfdfc] p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#1f5e38]">
                Recent Posts
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[#1f2d21]">
                {recentPosts.map((post) => (
                  <li key={post}>
                    <Link href="#" className="transition hover:text-[#1f5e38]">
                      {post}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default CommunityPage;
