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
import {
  MoreVertical,
  Edit,
  Archive,
  ArchiveRestore,
  Search,
  Pin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSuspenseAnnouncements } from "@/features/announcements/hooks/use-announcements";
import { useArchiveAnnouncement } from "@/features/announcements/hooks/use-announcements";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { AnnouncementCategory, PublicationStatus } from "@prisma/client";

const getCategoryColor = (category: AnnouncementCategory) => {
  switch (category) {
    case "IMPORTANT":
      return "bg-yellow-500";
    case "EMERGENCY":
      return "bg-red-500";
    case "UTILITIES":
      return "bg-blue-500";
    case "OTHER":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

const getCategoryLabel = (category: AnnouncementCategory) => {
  switch (category) {
    case "IMPORTANT":
      return "Important";
    case "EMERGENCY":
      return "Emergency";
    case "UTILITIES":
      return "Utilities";
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

type AnnouncementCardProps = {
  announcement: any;
  onArchive: (id: string, isArchived: boolean) => void;
};

const AnnouncementCard = ({
  announcement,
  onArchive,
}: AnnouncementCardProps) => {
  const router = useRouter();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const archiveMutation = useArchiveAnnouncement();

  const handleArchive = () => {
    archiveMutation.mutate({
      id: announcement.id,
      isArchived: !announcement.isArchived,
    });
    setArchiveOpen(false);
  };

  return (
    <>
      <Card className={cn(announcement.isPin && "border-yellow-500 border-2")}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {announcement.isPin && (
                  <Pin className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                )}
                <CardTitle className="text-lg">{announcement.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={cn(
                    "text-xs",
                    getCategoryColor(announcement.category)
                  )}
                >
                  {getCategoryLabel(announcement.category)}
                </Badge>
                <Badge
                  className={cn(
                    "text-xs",
                    getPublicationColor(announcement.publication)
                  )}
                >
                  {announcement.publication}
                </Badge>
                {announcement.isForAll && (
                  <Badge variant="outline" className="text-xs">
                    For All
                  </Badge>
                )}
                {announcement.schedule && (
                  <Badge variant="outline" className="text-xs">
                    {format(
                      new Date(announcement.schedule),
                      "MMM d, yyyy HH:mm"
                    )}
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
                    router.push(`/admin/announcements/${announcement.id}`)
                  }
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
                  {announcement.isArchived ? (
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
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {announcement.description}
          </p>
          {announcement.attachment && (
            <div className="mb-4">
              <a
                href={announcement.attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View Attachment
              </a>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Created: {format(new Date(announcement.createdAt), "MMM d, yyyy")}
            {announcement.updatedAt !== announcement.createdAt && (
              <span className="ml-2">
                • Updated:{" "}
                {format(new Date(announcement.updatedAt), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {announcement.isArchived
                ? "Retrieve Announcement?"
                : "Archive Announcement?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {announcement.isArchived
                ? "This will restore the announcement and make it visible again."
                : "This will archive the announcement. It will be hidden from the main view but can be retrieved later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              {announcement.isArchived ? "Retrieve" : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const Client = () => {
  const [filters, setFilters] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    search: parseAsString,
    category: parseAsString,
    publication: parseAsString,
    includeArchived: parseAsString,
  });

  const { data } = useSuspenseAnnouncements({
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    category: filters.category as any,
    publication: filters.publication as any,
    includeArchived: filters.includeArchived === "true",
  });

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  const handleSearch = (value: string) => {
    setFilters({ search: value || null, page: 1 });
  };

  const handleCategoryChange = (value: string) => {
    setFilters({ category: value === "all" ? null : value, page: 1 });
  };

  const handlePublicationChange = (value: string) => {
    setFilters({ publication: value === "all" ? null : value, page: 1 });
  };

  const handleArchiveToggle = (value: boolean) => {
    setFilters({ includeArchived: value ? "true" : null, page: 1 });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search announcements..."
              value={filters.search || ""}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={filters.category || "all"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="IMPORTANT">Important</SelectItem>
              <SelectItem value="EMERGENCY">Emergency</SelectItem>
              <SelectItem value="UTILITIES">Utilities</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Publication Status</Label>
          <Select
            value={filters.publication || "all"}
            onValueChange={handlePublicationChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>View</Label>
          <Select
            value={filters.includeArchived === "true" ? "archived" : "active"}
            onValueChange={(value) => handleArchiveToggle(value === "archived")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {data.data.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center py-8">
              No announcements found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onArchive={(id, isArchived) => {
                  // Handled in component
                }}
              />
            ))}
          </div>

          {data.pagination.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (filters.page > 1) {
                        handlePageChange(filters.page - 1);
                      }
                    }}
                    className={cn(
                      filters.page === 1 && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>

                {Array.from(
                  { length: data.pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => {
                  if (
                    page === 1 ||
                    page === data.pagination.totalPages ||
                    (page >= filters.page - 1 && page <= filters.page + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          isActive={filters.page === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    page === filters.page - 2 ||
                    page === filters.page + 2
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (filters.page < data.pagination.totalPages) {
                        handlePageChange(filters.page + 1);
                      }
                    }}
                    className={cn(
                      filters.page === data.pagination.totalPages &&
                        "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};
