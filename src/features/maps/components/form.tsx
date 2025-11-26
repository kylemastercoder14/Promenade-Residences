"use client";

import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/image-upload";
import { Maps } from "@/generated/prisma/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMap } from '@/features/maps/hooks/use-maps';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  isAmenity: z.boolean(),
  blockNo: z.string().min(1, "Block number is required"),
  lotNo: z.string().optional(),
  street: z.string().min(1, "Street is required"),
  lotSize: z.number().min(1, "Lot size must be greater than 0"),
  houseType: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  paymentMethod: z.string().optional(),
  attachmentUrl: z.string().min(1, "Attachment URL is required"),
  availability: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  // If not amenity, houseType, minPrice, maxPrice, paymentMethod, and availability are required
  if (!data.isAmenity) {
    if (!data.houseType || data.houseType === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "House type is required",
        path: ["houseType"],
      });
    }
    if (data.minPrice === undefined || data.minPrice === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum price is required",
        path: ["minPrice"],
      });
    }
    if (data.maxPrice === undefined || data.maxPrice === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum price is required",
        path: ["maxPrice"],
      });
    }
    if (!data.paymentMethod || data.paymentMethod === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Payment method is required",
        path: ["paymentMethod"],
      });
    }
    if (!data.availability || data.availability === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Availability is required",
        path: ["availability"],
      });
    }
  }
});

export const MapForm = ({ initialData }: { initialData: Maps | null }) => {
  const router = useRouter();
  const createMap = useCreateMap();
  const title = initialData
    ? `Edit Lot: ${initialData.lotNo}`
    : "Create New Lot";
  const description = initialData
    ? "Edit an existing lot."
    : "Create a new lot.";
  const action = initialData ? "Save changes" : "Create lot";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isAmenity: initialData?.availability?.toLowerCase() === "amenity" || false,
      lotNo: initialData?.lotNo || "",
      blockNo: initialData?.blockNo || "",
      street: initialData?.street || "",
      lotSize: initialData?.lotSize || 0,
      houseType: initialData?.houseType || "",
      minPrice: initialData?.minPrice || undefined,
      maxPrice: initialData?.maxPrice || undefined,
      paymentMethod: initialData?.paymentMethod || "",
      attachmentUrl: initialData?.attachmentUrl || "",
      availability: initialData?.availability || "",
      notes: initialData?.notes || "",
    },
  });

  const isAmenity = useWatch({
    control: form.control,
    name: "isAmenity",
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const submitData = {
      blockNo: data.blockNo,
      street: data.street,
      lotSize: data.lotSize,
      attachmentUrl: data.attachmentUrl,
      notes: data.notes || "",
      availability: data.isAmenity ? "Amenity" : (data.availability || ""),
      lotNo: data.isAmenity ? undefined : (data.lotNo ? data.lotNo : undefined),
      houseType: data.isAmenity ? "" : (data.houseType || ""),
      minPrice: data.isAmenity ? 0 : (data.minPrice || 0),
      maxPrice: data.isAmenity ? 0 : (data.maxPrice || 0),
      paymentMethod: data.isAmenity ? "" : (data.paymentMethod || ""),
    };

    if (initialData) {
      console.log("Update");
    } else {
      createMap.mutate(
        submitData,
        {
          onSuccess: () => {
            toast.success("Lot created successfully");
            router.push("/admin/maps");
          },
          onError: (error) => {
            toast.error(`Failed to create lot: ${error.message}`);
          },
        }
      );
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
        <Heading title={title} description={description} />
      </div>
      <div className="mt-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Is Amenity Checkbox */}
            <FormField
              control={form.control}
              name="isAmenity"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        // Clear amenity-specific fields when unchecked
                        if (!checked) {
                          form.setValue("availability", "");
                        } else {
                          form.setValue("availability", "Amenity");
                          form.setValue("lotNo", "");
                          form.setValue("houseType", "");
                          form.setValue("minPrice", 0);
                          form.setValue("maxPrice", 0);
                          form.setValue("paymentMethod", "");
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      This is an amenity
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Check this if you&apos;re adding an amenity (e.g., Basketball Court, Swimming Pool)
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="grid lg:grid-cols-2 items-start grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="blockNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Block Number <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="e.g. 1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lotNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Lot Number{" "}
                      {isAmenity ? (
                        <span className="text-muted-foreground">(not required for amenities)</span>
                      ) : (
                        <span className="text-muted-foreground">(optional)</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting || isAmenity}
                        placeholder={isAmenity ? "Not required for amenities" : "e.g. 10"}
                        {...field}
                        value={isAmenity ? "" : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                    {isAmenity && (
                      <p className="text-xs text-muted-foreground">
                        Amenities like &quot;Basketball Court&quot; don&apos;t require a lot number. Use the Street field for the amenity name.
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isAmenity ? "Name" : "Street"} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder={isAmenity ? "e.g. Basketball Court" : "e.g. Main Street"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="lotSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Lot Size (sqm) <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isSubmitting}
                        placeholder="e.g. 100"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isAmenity && (
                <FormField
                  control={form.control}
                  name="houseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        House Type <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSubmitting}
                          placeholder="e.g. Studio"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {!isAmenity && (
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="minPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Minimum Price (₱)
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isSubmitting}
                          placeholder="e.g. 500000"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Maximum Price (₱)
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isSubmitting}
                          placeholder="e.g. 1000000"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {!isAmenity && (
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Payment Method <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isSubmitting}
                          placeholder="e.g. Gcash"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Availability/Purpose{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="For rent">For Rent</SelectItem>
                          <SelectItem value="Occupied">Occupied</SelectItem>
                          <SelectItem value="For sale">For Sale</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="Additional notes about the lot"
                      {...field}
                    />
                  </FormControl>
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
                    Attachment <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      imageCount={1}
                      maxSize={2}
                      onImageUpload={(url) => field.onChange(url)}
                      defaultValue={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {action}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
