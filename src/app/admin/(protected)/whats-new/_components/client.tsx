/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  MoreVertical,
  Edit,
  Archive,
  ArchiveRestore,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useSuspenseWhatsNew,
  useArchiveWhatsNew,
} from "@/features/whats-new/hooks/use-whats-new";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { WhatsNewType, PublicationStatus } from "@prisma/client";

const getTypeColor = (type: WhatsNewType) => {
  switch (type) {
    case "BLOG":
      return "bg-blue-500";
    case "NEWS":
      return "bg-green-500";
    case "GO_TO_PLACES":
      return "bg-purple-500";
    case "MEDIA_HUB":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

const getTypeLabel = (type: WhatsNewType) => {
  switch (type) {
    case "BLOG":
      return "Blog";
    case "NEWS":
      return "News";
    case "GO_TO_PLACES":
      return "Go to Places";
    case "MEDIA_HUB":
      return "Media Hub";
    default:
      return type;
  }
};

const getCategoryColor = (category: string | null) => {
  if (!category) return "bg-gray-500";
  switch (category) {
    case "INVESTMENT":
      return "bg-green-500";
    case "TRAVEL":
      return "bg-blue-500";
    case "SHOPPING":
      return "bg-pink-500";
    case "FOOD":
      return "bg-orange-500";
    case "LIFESTYLE":
      return "bg-purple-500";
    case "TECHNOLOGY":
      return "bg-cyan-500";
    case "HEALTH":
      return "bg-red-500";
    case "EDUCATION":
      return "bg-indigo-500";
    case "ENTERTAINMENT":
      return "bg-yellow-500";
    case "OTHER":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

const getCategoryLabel = (category: string | null) => {
  if (!category) return "No Category";
  switch (category) {
    case "INVESTMENT":
      return "Investment";
    case "TRAVEL":
      return "Travel";
    case "SHOPPING":
      return "Shopping";
    case "FOOD":
      return "Food";
    case "LIFESTYLE":
      return "Lifestyle";
    case "TECHNOLOGY":
      return "Technology";
    case "HEALTH":
      return "Health";
    case "EDUCATION":
      return "Education";
    case "ENTERTAINMENT":
      return "Entertainment";
    case "OTHER":
      return "Other";
    default:
      return category;
  }
};

const getPublicationColor = (publication: PublicationStatus) => {
  switch (publication) {
    case "PUBLISHED":
      return "bg-green-500";
    case "DRAFT":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

type WhatsNewCardProps = {
  item: any;
  onArchive: (id: string, isArchived: boolean) => void;
};

const WhatsNewCard = ({ item, onArchive }: WhatsNewCardProps) => {
  const router = useRouter();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const archiveMutation = useArchiveWhatsNew();

  const handleArchive = () => {
    archiveMutation.mutate({
      id: item.id,
      isArchived: !item.isArchived,
    });
    setArchiveOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <Badge
                  className={cn("text-xs", getTypeColor(item.type))}
                >
                  {getTypeLabel(item.type)}
                </Badge>
                {item.category && (
                  <Badge
                    className={cn("text-xs", getCategoryColor(item.category))}
                  >
                    {getCategoryLabel(item.category)}
                  </Badge>
                )}
                <Badge
                  className={cn(
                    "text-xs",
                    getPublicationColor(item.publication)
                  )}
                >
                  {item.publication}
                </Badge>
                {item.isFeatured && (
                  <Badge className="text-xs bg-yellow-500">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/admin/whats-new/${item.id}`)
                  }
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
                  {item.isArchived ? (
                    <>
                      <ArchiveRestore className="h-4 w-4" />
                      Retrieve
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4" />
                      Archive
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "grid gap-4",
            item.imageUrl ? "grid-cols-[200px_1fr]" : "grid-cols-1"
          )}>
            {item.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-border shrink-0">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={200}
                  height={150}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {item.description}
              </p>
              {item.attachmentUrl && (
                <div className="mb-4">
                  <a
                    href={item.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Attachment
                  </a>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Created: {format(new Date(item.createdAt), "MMM d, yyyy")}
                {item.updatedAt !== item.createdAt && (
                  <span className="ml-2">
                    • Updated: {format(new Date(item.updatedAt), "MMM d, yyyy")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {item.isArchived
                ? "Retrieve What's New Item?"
                : "Archive What's New Item?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {item.isArchived
                ? "This will restore the item and make it visible again."
                : "This will archive the item. It will be hidden from the main view but can be retrieved later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              {item.isArchived ? "Retrieve" : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const Client = () => {
  const router = useRouter();
  const [searchParams, setSearchParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    type: parseAsString,
    category: parseAsString,
    publication: parseAsString,
    search: parseAsString,
    includeArchived: parseAsString,
  });

  const { data } = useSuspenseWhatsNew({
    page: searchParams.page,
    limit: searchParams.limit,
    search: searchParams.search || undefined,
    type: searchParams.type as any,
    category: searchParams.category as any,
    publication: searchParams.publication as any,
    includeArchived: searchParams.includeArchived === "yes",
  });
  const archiveMutation = useArchiveWhatsNew();

  const handleArchive = (id: string, isArchived: boolean) => {
    archiveMutation.mutate({ id, isArchived });
  };

  const filteredData = data.data.filter((item: any) => {
    if (searchParams.search) {
      const searchLower = searchParams.search.toLowerCase();
      if (
        !item.title.toLowerCase().includes(searchLower) &&
        !item.description.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-8"
                  value={searchParams.search || ""}
                  onChange={(e) =>
                    setSearchParams({ search: e.target.value || null, page: 1 })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={searchParams.type || "all"}
                onValueChange={(value) =>
                  setSearchParams({
                    type: value === "all" ? null : value,
                    page: 1,
                  })
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="BLOG">Blog</SelectItem>
                  <SelectItem value="NEWS">News</SelectItem>
                  <SelectItem value="GO_TO_PLACES">Go to Places</SelectItem>
                  <SelectItem value="MEDIA_HUB">Media Hub</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Publication Status</Label>
              <Select
                value={searchParams.publication || "all"}
                onValueChange={(value) =>
                  setSearchParams({
                    publication: value === "all" ? null : value,
                    page: 1,
                  })
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Show Archived</Label>
              <Select
                value={searchParams.includeArchived || "no"}
                onValueChange={(value) =>
                  setSearchParams({
                    includeArchived: value === "yes" ? "yes" : null,
                    page: 1,
                  })
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-4">
        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No items found
            </CardContent>
          </Card>
        ) : (
          filteredData.map((item: any) => (
            <WhatsNewCard
              key={item.id}
              item={item}
              onArchive={handleArchive}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (data.pagination.page > 1) {
                    setSearchParams({ page: data.pagination.page - 1 });
                  }
                }}
                className={
                  data.pagination.page === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSearchParams({ page });
                    }}
                    isActive={page === data.pagination.page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (data.pagination.page < data.pagination.totalPages) {
                    setSearchParams({ page: data.pagination.page + 1 });
                  }
                }}
                className={
                  data.pagination.page === data.pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

