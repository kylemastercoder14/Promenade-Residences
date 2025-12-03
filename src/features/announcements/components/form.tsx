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
  useCreateAnnouncement,
  useUpdateAnnouncement,
} from "@/features/announcements/hooks/use-announcements";
import { Announcement } from "@prisma/client";
import { format } from "date-fns";
import ImageUpload from "@/components/image-upload";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(["IMPORTANT", "EMERGENCY", "UTILITIES", "OTHER"]),
  isForAll: z.boolean(),
  description: z.string().min(1, "Description is required"),
  attachment: z.string().optional(),
  schedule: z.date().optional(),
  isPin: z.boolean(),
  publication: z.enum(["PUBLISHED", "DRAFT"]),
});

export const AnnouncementForm = ({
  initialData,
  canPublish,
}: {
  initialData: Announcement | null;
  canPublish: boolean;
}) => {
  const router = useRouter();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const isEditMode = !!initialData;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      category: (initialData?.category ?? "IMPORTANT") as
        | "IMPORTANT"
        | "EMERGENCY"
        | "UTILITIES"
        | "OTHER",
      isForAll: initialData?.isForAll ?? true,
      description: initialData?.description ?? "",
      attachment: initialData?.attachment ?? undefined,
      schedule: initialData?.schedule
        ? new Date(initialData.schedule)
        : undefined,
      isPin: initialData?.isPin ?? false,
      publication: (initialData?.publication ?? "DRAFT") as
        | "PUBLISHED"
        | "DRAFT",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        ...data,
        publication: canPublish ? data.publication : "DRAFT",
      };

      if (!canPublish && data.publication === "PUBLISHED") {
        toast.info("Only the superadmin can publish announcements. Saved as draft for approval.");
      }

      if (isEditMode && initialData) {
        await updateAnnouncement.mutateAsync({
          id: initialData.id,
          ...payload,
        });
      } else {
        await createAnnouncement.mutateAsync(payload);
      }
      router.push("/admin/announcements");
    } catch (error) {
      console.error("Error saving announcement:", error);
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
          title={isEditMode ? "Edit Announcement" : "Create Announcement"}
          description={
            isEditMode
              ? "Update announcement details"
              : "Create a new announcement"
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
                     <Input placeholder="Enter announcement title" {...field} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                 control={form.control}
                 name="category"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>
                       Category <span className="text-destructive">*</span>
                     </FormLabel>
                     <Select
                       onValueChange={field.onChange}
                       defaultValue={field.value}
                     >
                       <FormControl>
                         <SelectTrigger className="w-full">
                           <SelectValue placeholder="Select category" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         <SelectItem value="IMPORTANT">Important</SelectItem>
                         <SelectItem value="EMERGENCY">Emergency</SelectItem>
                         <SelectItem value="UTILITIES">Utilities</SelectItem>
                         <SelectItem value="OTHER">Other</SelectItem>
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                 )}
               />

              {canPublish ? (
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormItem>
                  <FormLabel>
                    Publication Status
                  </FormLabel>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Draft (Admin submissions require superadmin approval to publish)
                    </p>
                  </div>
                </FormItem>
              )}
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
                       placeholder="Enter announcement description"
                       className="min-h-[200px]"
                       {...field}
                     />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />

             <FormField
               control={form.control}
               name="schedule"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>
                     Schedule <span className="text-muted-foreground">(optional)</span>
                   </FormLabel>
                   <FormControl>
                     <Input
                       type="datetime-local"
                       value={
                         field.value
                           ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                           : ""
                       }
                       onChange={(e) => {
                         const value = e.target.value;
                         field.onChange(value ? new Date(value) : undefined);
                       }}
                     />
                   </FormControl>
                   <FormDescription>
                     Optional scheduled date and time for the announcement
                   </FormDescription>
                   <FormMessage />
                 </FormItem>
               )}
             />

            <FormField
              control={form.control}
              name="attachment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Attachment <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      imageCount={1}
                      maxSize={2}
                      onImageUpload={(url) => field.onChange(url)}
                      defaultValue={field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload image, document, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="isForAll"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>For All Users</FormLabel>
                      <FormDescription>
                        If checked, this announcement will be visible to all
                        users
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Pin Announcement</FormLabel>
                      <FormDescription>
                        Pinned announcements appear at the top of the list
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              {!canPublish && !isEditMode && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    form.setValue("publication", "DRAFT");
                    form.handleSubmit(onSubmit)();
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit for Approval"}
                </Button>
              )}
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isEditMode ? "Save Changes" : canPublish ? "Create Announcement" : "Save as Draft"}
              </Button>
              {canPublish && initialData && initialData.publication === "DRAFT" && (
                <Button
                  type="button"
                  variant="default"
                  onClick={async () => {
                    try {
                      form.setValue("publication", "PUBLISHED");
                      await onSubmit(form.getValues());
                    } catch (error) {
                      console.error("Error publishing announcement:", error);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Publishing..." : "Approve & Publish"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
