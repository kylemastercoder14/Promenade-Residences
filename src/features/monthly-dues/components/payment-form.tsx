"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreatePayment, useCreateBatchPayment } from "../hooks/use-monthly-dues";
import ImageUpload from "@/components/image-upload";
import { X } from "lucide-react";
import { PaymentMethod, MonthlyDueStatus } from "@prisma/client";

const MONTHLY_DUE_AMOUNT = 750;

// Create a function to generate the schema with dynamic validation
const createPaymentFormSchema = (totalBalance: number) =>
  z
    .object({
      amountPaid: z
        .number()
        .min(0.01, "Amount must be greater than 0")
        .max(100000, "Amount is too large"),
      paymentMethod: z.enum(PaymentMethod).optional(),
      notes: z.string().optional(),
      attachment: z.string().optional(),
      applyAdvance: z.boolean(),
    })
    .refine(
      (data) => {
        const excessAmount = data.amountPaid > totalBalance ? data.amountPaid - totalBalance : 0;
        // If there's an excess amount, applyAdvance must be true
        if (excessAmount > 0) {
          return data.applyAdvance === true;
        }
        return true;
      },
      {
        message: "You must enable 'Apply Advance Payment' to submit an excess payment.",
        path: ["applyAdvance"], // This will show the error on the applyAdvance field
      }
    );

interface MonthData {
  month: number;
  monthName: string;
  requiredAmount: number;
  totalPaid: number;
  balance: number;
  advancePayment: number;
  isPaid: boolean;
  isOverdue: boolean;
  status?: MonthlyDueStatus | null;
}

interface PaymentFormProps {
  residentId: string;
  year: number;
  // Single month payment
  month?: number;
  monthData?: MonthData;
  // Multiple months payment
  months?: number[];
  monthsData?: MonthData[];
  onSuccess: () => void;
  onCancel: () => void;
  onPaymentMethodChange?: (method: string | null) => void;
}

export const PaymentForm = ({
  residentId,
  year,
  month,
  monthData,
  months,
  monthsData,
  onSuccess,
  onCancel,
  onPaymentMethodChange,
}: PaymentFormProps) => {
  const createPayment = useCreatePayment();
  const createBatchPayment = useCreateBatchPayment();
  const isMultiMonth = months && monthsData && months.length > 0;

  // Calculate totals for multiple months
  const totalBalance = isMultiMonth
    ? monthsData.reduce((sum, m) => sum + m.balance, 0)
    : monthData?.balance || 0;

  // Create schema with totalBalance for validation
  const paymentFormSchema = createPaymentFormSchema(totalBalance);

  const form = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amountPaid: totalBalance > 0 ? totalBalance : 0,
      paymentMethod: undefined,
      notes: undefined,
      attachment: undefined,
      applyAdvance: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof paymentFormSchema>) => {
    try {
      if (isMultiMonth && months && monthsData) {
        // Use batch payment for multiple months
        const totalAmount = data.amountPaid;
        const totalBalance = monthsData.reduce((sum, m) => sum + m.balance, 0);
        let remainingAmount = totalAmount;

        // Prepare payments array - pay each month fully first
        const payments = [];
        for (const monthData of monthsData) {
          if (remainingAmount <= 0) break;

          const amountToPay = Math.min(monthData.balance, remainingAmount);
          if (amountToPay > 0) {
            payments.push({
              month: monthData.month,
              amountPaid: amountToPay,
            });
            remainingAmount -= amountToPay;
          }
        }

        // Use batch payment mutation
        await createBatchPayment.mutateAsync({
          residentId,
          year,
          payments,
          paymentMethod: data.paymentMethod,
          notes: data.notes ? `${data.notes} (Multi-month payment)` : "Multi-month payment",
          attachment: data.attachment,
          applyAdvance: data.applyAdvance && remainingAmount > 0,
        });
      } else if (month && monthData) {
        // Single month payment
        await createPayment.mutateAsync({
          residentId,
          month,
          year,
          amountPaid: data.amountPaid,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          attachment: data.attachment,
          applyAdvance: data.applyAdvance,
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const amountPaid = form.watch("amountPaid");
  const applyAdvance = form.watch("applyAdvance");

  // Calculate if this is a full payment
  const isFullPayment = amountPaid >= totalBalance && totalBalance > 0;
  const excessAmount = amountPaid > totalBalance ? amountPaid - totalBalance : 0;

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {isMultiMonth
              ? `Record Payment - ${monthsData?.length || 0} Month${(monthsData?.length || 0) > 1 ? "s" : ""} ${year}`
              : `Record Payment - ${monthData?.monthName || ""} ${year}`}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-md border border-dashed border-muted-foreground/30 bg-muted/40 p-3 text-sm text-muted-foreground">
          Submitted payments are marked as pending until the accounting team reviews and approves them.
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Payment Summary */}
            {isMultiMonth && monthsData ? (
              <div className="p-3 bg-muted rounded-md space-y-2 text-sm">
                <div className="font-semibold mb-2">Selected Months:</div>
                {monthsData.map((m) => (
                  <div key={m.month} className="flex justify-between items-center border-b pb-1">
                    <span className="text-muted-foreground">{m.monthName}:</span>
                    <span className="font-semibold text-destructive">
                      ₱{m.balance.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total Balance:</span>
                  <span className="text-destructive">₱{totalBalance.toFixed(2)}</span>
                </div>
                {excessAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Excess Amount:</span>
                    <span className="font-semibold">₱{excessAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            ) : monthData ? (
              <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Required Amount:</span>
                  <span className="font-semibold">₱{monthData.requiredAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid:</span>
                  <span>₱{monthData.totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining Balance:</span>
                  <span className="font-semibold text-destructive">
                    ₱{monthData.balance.toFixed(2)}
                  </span>
                </div>
                {monthData.status && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Status:</span>
                    <span className="font-semibold capitalize">{monthData.status.toLowerCase()}</span>
                  </div>
                )}
                {excessAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Excess Amount:</span>
                    <span className="font-semibold">₱{excessAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            ) : null}

            <FormField
              control={form.control}
              name="amountPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Amount Paid <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Enter amount"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    {isFullPayment && totalBalance > 0
                      ? isMultiMonth
                        ? `This will fully pay all ${monthsData?.length || 0} selected months.`
                        : "This will fully pay the remaining balance."
                      : excessAmount > 0
                        ? `This payment exceeds the balance by ₱${excessAmount.toFixed(2)}. You must enable 'Apply Advance Payment' to submit this excess amount.`
                        : isMultiMonth
                          ? `Enter the total payment amount for ${monthsData?.length || 0} months.`
                          : "Enter the payment amount."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Payment Method{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const method = value === "none" ? undefined : (value as "CASH" | "GCASH" | "MAYA" | "OTHER_BANK");
                      field.onChange(method);
                      // Notify parent component of payment method change
                      if (onPaymentMethodChange) {
                        onPaymentMethodChange(method || null);
                      }
                    }}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="GCASH">GCash</SelectItem>
                      <SelectItem value="MAYA">Maya</SelectItem>
                      <SelectItem value="OTHER_BANK">Other Bank</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {excessAmount > 0 && (
              <FormField
                control={form.control}
                name="applyAdvance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Apply Advance Payment <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormDescription>
                        You must enable this option to apply the excess amount (₱{excessAmount.toFixed(2)}) to next month&apos;s payment
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes/Remarks{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes or remarks..."
                      {...field}
                    />
                  </FormControl>
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
                    Proof of Payment{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      imageCount={1}
                      maxSize={5}
                      onImageUpload={(url) =>
                        field.onChange(typeof url === "string" ? url : url[0])
                      }
                      defaultValue={field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload proof of payment (receipt, screenshot, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

