"use client";

import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useCreateFeedback } from "../hooks/use-feedback";
import { authClient } from "@/lib/auth-client";

const FEEDBACK_CATEGORIES = [
  "GENERAL",
  "AMENITIES",
  "SECURITY",
  "BILLING",
  "EVENT",
  "SUGGESTION",
  "OTHER",
] as const;

type FeedbackCategoryValue = (typeof FEEDBACK_CATEGORIES)[number];

const feedbackSchema = z.object({
  residentName: z.string().min(2, "Your name is required"),
  contactEmail: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  // Require PH-format number: +63 followed by exactly 10 digits (e.g., +639152479693)
  contactNumber: z
    .string()
    .regex(/^\+63\d{10}$/, "Contact number must be in the format +63XXXXXXXXXX (10 digits after +63)"),
  subject: z.string().min(5, "Subject is required").max(120),
  category: z.enum(FEEDBACK_CATEGORIES),
  message: z.string().min(20, "Please provide more details").max(1500),
  allowFollowUp: z.boolean(),
  rating: z.number().min(1).max(5).optional(),
});

const categoryOptions: Array<{ label: string; value: FeedbackCategoryValue }> = [
  { label: "General Feedback", value: "GENERAL" },
  { label: "Amenities & Facilities", value: "AMENITIES" },
  { label: "Security & Safety", value: "SECURITY" },
  { label: "Billing & Payments", value: "BILLING" },
  { label: "Events & Activities", value: "EVENT" },
  { label: "Suggestions & Ideas", value: "SUGGESTION" },
  { label: "Other Concerns", value: "OTHER" },
];

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface ResidentFeedbackFormProps {
  onSuccess?: () => void;
  variant?: "default" | "modal";
}

export const ResidentFeedbackForm = ({ onSuccess, variant = "default" }: ResidentFeedbackFormProps) => {
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver<FeedbackFormValues, Record<string, unknown>, FeedbackFormValues>(feedbackSchema),
    defaultValues: {
      residentName: "",
      contactEmail: "",
      // Start with PH country code; user will fill the remaining 10 digits
      contactNumber: "+63",
      subject: "",
      category: "GENERAL" as FeedbackCategoryValue,
      rating: undefined,
      message: "",
      allowFollowUp: true,
    },
  });

  const createFeedback = useCreateFeedback();

  // If the user is logged in, auto-fill basic identity fields so they don't have to re-type them.
  useEffect(() => {
    let isMounted = true;

    const hydrateFromSession = async () => {
      try {
        const session = await authClient.getSession();
        const user = session?.data?.user;
        if (!user || !isMounted) return;

        const currentValues = form.getValues();

        form.reset({
          ...currentValues,
          residentName: currentValues.residentName || user.name || "",
          contactEmail: currentValues.contactEmail || user.email || "",
        });
      } catch (err) {
        // Silent fail – feedback form should still work for guests.
        console.error("Failed to hydrate feedback form from session", err);
      }
    };

    void hydrateFromSession();

    return () => {
      isMounted = false;
    };
  }, [form]);

  const onSubmit: SubmitHandler<FeedbackFormValues> = async (values) => {
    try {
      await createFeedback.mutateAsync({
        ...values,
        contactEmail: values.contactEmail || undefined,
        contactNumber: values.contactNumber || undefined,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to submit feedback", error);
    }
  };

  const isSubmitting = createFeedback.isPending || form.formState.isSubmitting;

  return (
    <div>
      {variant === "default" && (
        <div className="mb-6 space-y-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1d402a]">
            Share your thoughts
          </p>
          <p className="text-sm text-[#4c5b51]">
            Tell us how we can improve the Promenade experience.
          </p>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="residentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Full Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Juan Dela Cruz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 items-start md:grid-cols-2">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@email.com" {...field} />
                  </FormControl>
                  <FormDescription>We will send updates here if needed.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+639XXXXXXXXX"
                      value={field.value}
                      onChange={(event) => {
                        // Always enforce "+63" prefix and allow only 10 numeric digits after it
                        const raw = event.target.value;
                        // Strip everything except digits
                        let digits = raw.replace(/\D/g, "");

                        // Ensure we start with country code 63
                        if (digits.startsWith("0")) {
                          // Convert local 0XXXXXXXXXX into 63XXXXXXXXXX
                          digits = "63" + digits.slice(1);
                        } else if (!digits.startsWith("63")) {
                          digits = "63" + digits;
                        }

                        // Extract the 10 subscriber digits after "63"
                        const subscriber = digits.slice(2, 12); // max 10 digits

                        const formatted = "+63" + subscriber;
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Format: <span className="font-mono">+63</span> followed by 10 digits (e.g. <span className="font-mono">+639152479693</span>).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Subject <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Short summary of your feedback" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2 items-start">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall experience (1-5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      placeholder="5"
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value ? Number(event.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>Optional quick rating.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Detailed feedback <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea rows={6} placeholder="Share the details of your experience..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowFollowUp"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-dashed border-[#dfe3d9] bg-[#f7faf7] p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Allow our admin team to reach out if needed</FormLabel>
                    <FormDescription>
                      We will only contact you for clarifications related to this submission.
                    </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gap-2 rounded-full bg-[#1f5e38] text-white hover:bg-[#17432a]"
          >
            {isSubmitting ? "Sending..." : "Submit feedback"}
          </Button>
        </form>
      </Form>
    </div>
  );
};


