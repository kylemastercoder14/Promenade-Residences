"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useState } from "react";

const generalSettingsSchema = z.object({
  monthlyDueAmount: z.number().min(0, "Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  paymentMethods: z.object({
    cash: z.boolean(),
    gcash: z.boolean(),
    maya: z.boolean(),
    otherBank: z.boolean(),
  }),
  autoArchiveEnabled: z.boolean(),
  autoArchiveMonths: z.number().min(1).max(12),
});

type GeneralSettingsForm = z.infer<typeof generalSettingsSchema>;

export const GeneralSettings = () => {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<GeneralSettingsForm>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      monthlyDueAmount: 750,
      currency: "PHP",
      paymentMethods: {
        cash: true,
        gcash: true,
        maya: true,
        otherBank: true,
      },
      autoArchiveEnabled: true,
      autoArchiveMonths: 6,
    },
  });

  const onSubmit = async (data: GeneralSettingsForm) => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("General settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Monthly Due Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Due Settings</CardTitle>
            <CardDescription>
              Configure the monthly due amount and currency settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="monthlyDueAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Monthly Due Amount{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="750.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    The fixed monthly due amount for each household.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Enable or disable payment methods available for residents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="paymentMethods.cash"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Cash</FormLabel>
                    <FormDescription>
                      Allow residents to pay using cash.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethods.gcash"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>GCash</FormLabel>
                    <FormDescription>
                      Allow residents to pay using GCash.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethods.maya"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Maya</FormLabel>
                    <FormDescription>
                      Allow residents to pay using Maya.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethods.otherBank"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Other Bank</FormLabel>
                    <FormDescription>
                      Allow residents to pay using other bank transfers.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Auto-Archive Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Auto-Archive Settings</CardTitle>
            <CardDescription>
              Configure automatic archiving of households with overdue payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="autoArchiveEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable Auto-Archive</FormLabel>
                    <FormDescription>
                      Automatically archive households that exceed the overdue
                      threshold.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("autoArchiveEnabled") && (
              <FormField
                control={form.control}
                name="autoArchiveMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Overdue Months Threshold{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        placeholder="6"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Number of overdue months before a household is
                      automatically archived.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
