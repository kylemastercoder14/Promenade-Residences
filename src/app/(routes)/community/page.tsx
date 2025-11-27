"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LandingFooter } from "@/components/landing/footer";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { WhatsNewType, WhatsNewCategory } from "@prisma/client";

const tabs: { label: string; value: WhatsNewType | null }[] = [
  { label: "Blog", value: "BLOG" },
  { label: "News", value: "NEWS" },
  { label: "Go to Places", value: "GO_TO_PLACES" },
  { label: "Media Hub", value: "MEDIA_HUB" },
];

const categoryLabels: Record<WhatsNewCategory, string> = {
  INVESTMENT: "Investment",
  TRAVEL: "Travel",
  SHOPPING: "Shopping",
  FOOD: "Food",
  LIFESTYLE: "Lifestyle",
  TECHNOLOGY: "Technology",
  HEALTH: "Health & Wellness",
  EDUCATION: "Education",
  ENTERTAINMENT: "Entertainment",
  OTHER: "Other",
};

const CommunityPage = () => {
  const [selectedType, setSelectedType] = useState<WhatsNewType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<WhatsNewCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const trpc = useTRPC();

  // Fetch all published items
  const { data: allItems = [], isLoading } = useQuery(
    trpc.whatsNew.getPublished.queryOptions({ limit: 100 })
  );

  // Filter items
  const filteredItems = allItems.filter((item) => {
    if (selectedType && item.type !== selectedType) return false;
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !item.title.toLowerCase().includes(query) &&
        !item.description.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  });

  // Get featured items
  const featuredItems = filteredItems.filter((item) => item.isFeatured);

  // Get recent posts (latest 5)
  const recentPosts = allItems
    .slice(0, 5)
    .map((item) => item.title);

  // Get unique categories from items
  const categories = Array.from(
    new Set(
      allItems
        .map((item) => item.category)
        .filter((cat): cat is WhatsNewCategory => cat !== null)
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Get featured spotlight (first featured item or first item)
  const featuredSpotlight = featuredItems[0] || allItems[0];

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
              Community
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
            <button
              onClick={() => setSelectedType(null)}
              className={cn(
                "rounded-full border px-6 py-2 text-sm font-semibold uppercase tracking-wide transition",
                selectedType === null
                  ? "border-white bg-white text-[#1f5e38]"
                  : "border-white/50 bg-white/10 text-white hover:bg-white/20"
              )}
            >
              All
            </button>
            {tabs.map((tab) => (
              <button
                key={tab.value || "all"}
                onClick={() => setSelectedType(tab.value)}
                className={cn(
                  "rounded-full border px-6 py-2 text-sm font-semibold uppercase tracking-wide transition",
                  selectedType === tab.value
                    ? "border-white bg-white text-[#1f5e38]"
                    : "border-white/50 bg-white/10 text-white hover:bg-white/20"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-white py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 lg:grid-cols-[2.1fr_0.9fr]">
          <div>
            {isLoading ? (
              <div className="space-y-10">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-3xl border border-[#e1e3dc] bg-white shadow-sm animate-pulse"
                  >
                    <div className="h-72 w-full bg-gray-200" />
                    <div className="space-y-5 p-6">
                      <div className="h-6 w-24 bg-gray-200 rounded-full" />
                      <div className="space-y-3">
                        <div className="h-8 w-full bg-gray-200 rounded" />
                        <div className="h-4 w-full bg-gray-200 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedItems.length === 0 ? (
              <div className="py-12 text-center text-[#4a5a4f]">
                <p className="text-lg">No articles found</p>
                <p className="mt-2 text-sm">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-10">
                  {paginatedItems.map((article, index) => (
                    <article
                      key={article.id}
                      className="overflow-hidden rounded-3xl border border-[#e1e3dc] bg-white shadow-sm"
                    >
                      {article.imageUrl ? (
                        <div className="relative h-72 w-full">
                          <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 60vw"
                            priority={index === 0}
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="relative h-72 w-full bg-gradient-to-br from-[#e7f2ea] to-[#d4e6db]" />
                      )}
                      <div className="space-y-5 p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          {article.category && (
                            <span className="inline-flex rounded-full bg-[#e7f2ea] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2d6c41]">
                              {categoryLabels[article.category]}
                            </span>
                          )}
                          {article.isFeatured && (
                            <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-800">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="space-y-3 text-left">
                          <h2 className="text-2xl font-semibold text-[#1b2b1e]">
                            {article.title}
                          </h2>
                          <p className="text-sm leading-relaxed text-[#4e5c51] line-clamp-3">
                            {article.description}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm text-[#4a5a4f]">
                            <Calendar className="size-4" />
                            {format(new Date(article.createdAt), "MMMM d, yyyy")}
                          </div>
                          <Button
                            variant="ghost"
                            className="gap-2 rounded-full border border-[#1f5e38] px-5 text-[#1f5e38] hover:bg-[#1f5e38] hover:text-white"
                            asChild
                          >
                            <Link href={`/community/${article.id}`}>Read more</Link>
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex items-center gap-2 rounded-full border border-[#d3d6cf] bg-[#f8f8f4] px-3 py-1.5 text-sm font-medium text-[#1d2b1f]">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 rounded-full px-3 py-1 text-[#4a5a4f] transition hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="size-4" />
                        Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              "rounded-full px-3 py-1 transition",
                              currentPage === page
                                ? "bg-white text-[#1f5e38]"
                                : "text-[#4a5a4f] hover:bg-white"
                            )}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 rounded-full px-3 py-1 text-[#4a5a4f] transition hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
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
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-none px-0 text-sm text-[#1d2b1f] focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#d9ddd5] bg-[#fdfdfc] p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#1f5e38]">
                Categories
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[#4a5a4f]">
                <li
                  className={cn(
                    "flex items-center justify-between cursor-pointer transition",
                    selectedCategory === null && "text-[#1f5e38] font-semibold"
                  )}
                  onClick={() => {
                    setSelectedCategory(null);
                    setCurrentPage(1);
                  }}
                >
                  <span>All Categories</span>
                  <span className="text-[#b0b5ac]">›</span>
                </li>
                {categories.map((category) => (
                  <li
                    key={category}
                    className={cn(
                      "flex items-center justify-between cursor-pointer transition",
                      selectedCategory === category &&
                        "text-[#1f5e38] font-semibold"
                    )}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                    }}
                  >
                    <span>{categoryLabels[category]}</span>
                    <span className="text-[#b0b5ac]">›</span>
                  </li>
                ))}
              </ul>
            </div>

            {featuredSpotlight && (
              <div className="overflow-hidden rounded-2xl border border-[#d9ddd5] bg-white">
                {featuredSpotlight.imageUrl ? (
                  <div className="relative h-44 w-full">
                    <Image
                      src={featuredSpotlight.imageUrl}
                      alt={featuredSpotlight.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-xs uppercase tracking-[0.5em]">
                        Featured
                      </p>
                      <p className="mt-1 text-lg font-semibold line-clamp-2">
                        {featuredSpotlight.title}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-44 w-full bg-gradient-to-br from-[#1f5e38] to-[#17432a]">
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-xs uppercase tracking-[0.5em]">
                        Featured
                      </p>
                      <p className="mt-1 text-lg font-semibold line-clamp-2">
                        {featuredSpotlight.title}
                      </p>
                    </div>
                  </div>
                )}
                <div className="space-y-3 p-5">
                  <p className="text-sm text-[#4a5a4f] line-clamp-3">
                    {featuredSpotlight.description}
                  </p>
                  <Button
                    className="w-full rounded-full bg-[#1f5e38] text-white hover:bg-[#17432a]"
                    asChild
                  >
                    <Link href={`/community/${featuredSpotlight.id}`}>
                      Read more
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-[#d9ddd5] bg-[#fdfdfc] p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#1f5e38]">
                Recent Posts
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[#1f2d21]">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post, index) => {
                    const item = allItems[index];
                    return item ? (
                      <li key={item.id}>
                        <Link
                          href={`/community/${item.id}`}
                          className="transition hover:text-[#1f5e38] line-clamp-2"
                        >
                          {post}
                        </Link>
                      </li>
                    ) : null;
                  })
                ) : (
                  <li className="text-[#4a5a4f]">No recent posts</li>
                )}
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
