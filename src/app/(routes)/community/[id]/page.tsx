"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowLeft, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LandingFooter } from "@/components/landing/footer";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { WhatsNewCategory } from "@prisma/client";

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

const typeLabels: Record<string, string> = {
  BLOG: "Blog",
  NEWS: "News",
  GO_TO_PLACES: "Go to Places",
  MEDIA_HUB: "Media Hub",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const CommunityDetailPage = ({ params }: PageProps) => {
  const { id } = use(params);
  const trpc = useTRPC();

  const { data: item, isLoading, error } = useQuery(
    trpc.whatsNew.getPublishedOne.queryOptions({ id })
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f4f1]">
        <Navbar variant="community" />
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-64 bg-gray-200 rounded" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
              </div>
            </div>
          </div>
        </div>
        <LandingFooter />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#f4f4f1]">
        <Navbar variant="community" />
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-semibold text-[#1d2b1f] mb-4">
              Article Not Found
            </h1>
            <p className="text-[#4a5a4f] mb-6">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild variant="outline">
              <Link href="/community">Back to Community</Link>
            </Button>
          </div>
        </div>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f1] text-[#1d2b1f]">
      <Navbar variant="community" />

      {/* Hero Image */}
      {item.imageUrl && (
        <div className="relative h-[50vh] w-full overflow-hidden">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/50 to-black" />
        </div>
      )}

      <section className="bg-white py-12">
        <div className="mx-auto w-full max-w-4xl px-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6 gap-2 text-[#4a5a4f] hover:text-[#1f5e38]"
            asChild
          >
            <Link href="/community">
              <ArrowLeft className="size-4" />
              Back to Community
            </Link>
          </Button>

          {/* Article Header */}
          <header className="mb-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {item.category && (
                <span className="inline-flex rounded-full bg-[#e7f2ea] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2d6c41]">
                  {categoryLabels[item.category]}
                </span>
              )}
              <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800">
                {typeLabels[item.type]}
              </span>
              {item.isFeatured && (
                <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-800">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-4xl font-serif font-semibold leading-tight text-[#1b2b1e] sm:text-5xl">
              {item.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-[#4a5a4f]">
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                <span>
                  {format(new Date(item.createdAt), "MMMM d, yyyy")}
                </span>
              </div>
              {item.updatedAt !== item.createdAt && (
                <span className="text-xs">
                  Updated: {format(new Date(item.updatedAt), "MMMM d, yyyy")}
                </span>
              )}
            </div>
          </header>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none">
            {/* Description */}
            <div className="mb-8 rounded-lg bg-[#f7f7f3] border border-[#e1e3dc] p-6">
              <p className="text-lg leading-relaxed text-[#4e5c51]">
                {item.description}
              </p>
            </div>

            {/* Full Content (Rich Text) */}
            {item.content && (
              <div
                className="prose prose-lg max-w-none prose-headings:text-[#1b2b1e] prose-p:text-[#4e5c51] prose-strong:text-[#1b2b1e] prose-a:text-[#1f5e38] prose-a:no-underline hover:prose-a:underline prose-ul:text-[#4e5c51] prose-ol:text-[#4e5c51] prose-blockquote:border-l-[#1f5e38] prose-blockquote:text-[#4e5c51]"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            )}

            {/* Attachment */}
            {item.attachmentUrl && (
              <div className="mt-8 rounded-lg border border-[#e1e3dc] bg-[#f7f7f3] p-6">
                <h3 className="text-lg font-semibold text-[#1b2b1e] mb-3">
                  Attachment
                </h3>
                <Button
                  variant="outline"
                  className="gap-2"
                  asChild
                >
                  <a
                    href={item.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    View Attachment
                  </a>
                </Button>
              </div>
            )}
          </article>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between border-t border-[#e1e3dc] pt-8">
            <Button
              variant="ghost"
              className="gap-2 text-[#4a5a4f] hover:text-[#1f5e38]"
              asChild
            >
              <Link href="/community">
                <ArrowLeft className="size-4" />
                Back to Community
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default CommunityDetailPage;

