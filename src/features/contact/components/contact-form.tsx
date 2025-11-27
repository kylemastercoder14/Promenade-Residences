"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateContact } from "../hooks/use-contact";
import { Send } from "lucide-react";
import { toast } from "sonner";

const contactSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .min(7, "Contact number must be at least 7 digits")
    .max(20, "Contact number is too long")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(5, "Subject is required").max(200),
  message: z.string().min(20, "Message is too short (minimum 20 characters)").max(2000),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export const ContactForm = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      subject: "",
      message: "",
    },
  });

  const createContact = useCreateContact();

  const onSubmit: SubmitHandler<ContactFormValues> = async (values) => {
    try {
      await createContact.mutateAsync({
        ...values,
        phoneNumber: values.phoneNumber || undefined,
      });
      form.reset();
      toast.success("Your message has been sent successfully! We'll get back to you soon.");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to submit contact form", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const isSubmitting = createContact.isPending || form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number <span className="text-muted-foreground">(optional)</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter your phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Enter subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="How can we help?"
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full gap-2 rounded-full bg-[#1f5e38] text-white hover:bg-[#17432a]"
        >
          <Send className="size-4" />
          {isSubmitting ? "Sending..." : "Submit inquiry"}
        </Button>
      </form>
    </Form>
  );
};

