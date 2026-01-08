"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Heading from "@/components/heading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCreateWhatsNew,
  useUpdateWhatsNew,
} from "@/features/whats-new/hooks/use-whats-new";
import { WhatsNew } from "@prisma/client";
import ImageUpload from "@/components/image-upload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["BLOG", "NEWS", "GO_TO_PLACES", "MEDIA_HUB"]),
  category: z
    .enum([
      "INVESTMENT",
      "TRAVEL",
      "SHOPPING",
      "FOOD",
      "LIFESTYLE",
      "TECHNOLOGY",
      "HEALTH",
      "EDUCATION",
      "ENTERTAINMENT",
      "OTHER",
    ])
    .nullable()
    .optional(),
  content: z.string().optional(),
  imageUrl: z.string().optional(),
  attachmentUrl: z.string().optional(),
  publication: z.enum(["PUBLISHED", "DRAFT"]),
  isFeatured: z.boolean(),
});

export const WhatsNewForm = ({
  initialData,
  canPublish,
}: {
  initialData: WhatsNew | null;
  canPublish: boolean;
}) => {
  const router = useRouter();
  const createWhatsNew = useCreateWhatsNew();
  const updateWhatsNew = useUpdateWhatsNew();
  const isEditMode = !!initialData;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      type: (initialData?.type ?? "BLOG") as
        | "BLOG"
        | "NEWS"
        | "GO_TO_PLACES"
        | "MEDIA_HUB",
      category: (initialData?.category ?? null) as
        | "INVESTMENT"
        | "TRAVEL"
        | "SHOPPING"
        | "FOOD"
        | "LIFESTYLE"
        | "TECHNOLOGY"
        | "HEALTH"
        | "EDUCATION"
        | "ENTERTAINMENT"
        | "OTHER"
        | null,
      content: initialData?.content ?? "",
      imageUrl: initialData?.imageUrl ?? undefined,
      attachmentUrl: initialData?.attachmentUrl ?? undefined,
      publication: (initialData?.publication ?? "DRAFT") as
        | "PUBLISHED"
        | "DRAFT",
      isFeatured: initialData?.isFeatured ?? false,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        ...data,
        publication: canPublish ? data.publication : "DRAFT",
      };

      if (!canPublish && data.publication === "PUBLISHED") {
        toast.info("Only the superadmin can publish News & Events. Saved as draft for approval.");
      }

      if (isEditMode && initialData) {
        await updateWhatsNew.mutateAsync({
          id: initialData.id,
          ...payload,
        });
      } else {
        await createWhatsNew.mutateAsync(payload);
      }
      router.push("/admin/whats-new");
    } catch (error) {
      console.error("Error saving What's New item:", error);
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div>
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} variant="outline" size="icon">
          <ArrowLeft className="size-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <Heading
          title={isEditMode ? "Edit What's New" : "Create What's New"}
          description={
            isEditMode
              ? "Update What's New item details"
              : "Create a new What's New item"
          }
        />
      </div>
      <div className="mt-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Type <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BLOG">Blog</SelectItem>
                        <SelectItem value="NEWS">News</SelectItem>
                        <SelectItem value="GO_TO_PLACES">Go to Places</SelectItem>
                        <SelectItem value="MEDIA_HUB">Media Hub</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Category <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? null : value)
                      }
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="INVESTMENT">Investment</SelectItem>
                        <SelectItem value="TRAVEL">Travel</SelectItem>
                        <SelectItem value="SHOPPING">Shopping</SelectItem>
                        <SelectItem value="FOOD">Food</SelectItem>
                        <SelectItem value="LIFESTYLE">Lifestyle</SelectItem>
                        <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                        <SelectItem value="HEALTH">Health</SelectItem>
                        <SelectItem value="EDUCATION">Education</SelectItem>
                        <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="publication"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Publication Status <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED" disabled={!canPublish}>
                          Published { !canPublish ? " (Superadmin only)" : "" }
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {!canPublish && (
                      <FormDescription>
                        Admin submissions remain draft until a superadmin approves them.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Content <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <RichTextEditor
                      content={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Enter full content (for detailed view)..."
                    />
                  </FormControl>
                  <FormDescription>
                    Optional rich text content that will be shown in the detailed view
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured</FormLabel>
                    <FormDescription>
                      Featured items will be highlighted and prioritized in listings
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Image <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      imageCount={1}
                      maxSize={5}
                      onImageUpload={(url) => field.onChange(url)}
                      defaultValue={field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload an image for this item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attachmentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Attachment URL <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter attachment URL"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL to external attachment (document, video, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isEditMode ? "Save Changes" : "Create Item"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

