"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { transactionSchema } from "@/app/lib/schema";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/data/categories";

const RECURRING_INTERVALS = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
] as const;

type TransactionFormValues = z.infer<typeof transactionSchema>;

type AccountOption = {
  id: string;
  name: string;
  type: "CURRENT" | "SAVINGS";
  isDefault?: boolean;
};

interface TransactionFormData {
  id?: string;
  type: "INCOME" | "EXPENSE";
  amount: number | string;
  description?: string | null;
  accountId: string;
  category: string;
  date: Date | string;
  isRecurring: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
}

interface AddTransactionFormProps {
  accounts: AccountOption[];
  categories: Category[];
  initialData?: TransactionFormData | null;
}

const AddTransactionForm = ({
  accounts = [],
  categories = [],
  initialData = null,
}: AddTransactionFormProps) => {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  const defaultAccountId = useMemo(() => {
    if (initialData?.accountId) return initialData.accountId;
    return (
      accounts.find((account) => account.isDefault)?.id ?? accounts[0]?.id ?? ""
    );
  }, [accounts, initialData?.accountId]);

  const baseDate = useMemo(() => {
    if (initialData?.date) return new Date(initialData.date);
    return new Date();
  }, [initialData?.date]);

  const defaultType = initialData?.type ?? "EXPENSE";
  const defaultCategory = useMemo(() => {
    if (initialData?.category) return initialData.category;
    const match = categories.find((category) => category.type === defaultType);
    return match?.id ?? "";
  }, [categories, defaultType, initialData?.category]);

  const formDefaults = useMemo(
    () => ({
      type: defaultType,
      amount: initialData?.amount ? String(initialData.amount) : "",
      description: initialData?.description ?? "",
      accountId: defaultAccountId,
      category: defaultCategory,
      date: baseDate,
      isRecurring: initialData?.isRecurring ?? false,
      recurringInterval: initialData?.recurringInterval ?? undefined,
    }),
    [
      baseDate,
      defaultAccountId,
      defaultCategory,
      defaultType,
      initialData?.amount,
      initialData?.description,
      initialData?.isRecurring,
      initialData?.recurringInterval,
    ],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: formDefaults,
  });

  useEffect(() => {
    reset(formDefaults);
  }, [formDefaults, reset]);

  const type = watch("type");
  const dateValue = watch("date");
  const isRecurring = watch("isRecurring");
  const categoryValue = watch("category");
  const accountValue = watch("accountId");

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  );

  useEffect(() => {
    if (
      availableCategories.length > 0 &&
      !availableCategories.some((category) => category.id === categoryValue)
    ) {
      setValue("category", availableCategories[0]?.id ?? "", {
        shouldValidate: true,
      });
    }
  }, [availableCategories, categoryValue, setValue]);

  useEffect(() => {
    if (!isRecurring) {
      setValue("recurringInterval", undefined, { shouldValidate: true });
    }
  }, [isRecurring, setValue]);

  const {
    loading: createLoading,
    fn: createFn,
    data: createResult,
  } = useFetch(createTransaction);

  const {
    loading: updateLoading,
    fn: updateFn,
    data: updateResult,
  } = useFetch(updateTransaction);

  const isSubmitting = createLoading || updateLoading;

  useEffect(() => {
    if (createResult?.success) {
      toast.success("Transaction added successfully");
      router.push("/dashboard");
      router.refresh();
    }
  }, [createResult, router]);

  useEffect(() => {
    if (updateResult?.success) {
      toast.success("Transaction updated successfully");
      if (accountValue) {
        router.push(`/account/${accountValue}`);
        router.refresh();
      }
    }
  }, [accountValue, router, updateResult]);

  const handleSubmitForm = async (values: TransactionFormValues) => {
    if (isEditing && initialData?.id) {
      await updateFn(initialData.id, values);
      return;
    }
    await createFn(values);
  };

  if (accounts.length === 0) {
    return (
      <div className="rounded-2xl border bg-white/70 p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Create an account first
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You need at least one account before adding a transaction.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
      <div className="rounded-2xl border bg-white/70 p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select
              value={type}
              onValueChange={(value) =>
                setValue("type", value as TransactionFormValues["type"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {CURRENCY_SYMBOL}
              </span>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="pl-8"
                {...register("amount")}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <Input placeholder="Add a note" {...register("description")} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account</label>
            <Select
              value={accountValue ?? ""}
              onValueChange={(value) =>
                setValue("accountId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-xs text-red-500">{errors.accountId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={categoryValue ?? ""}
              onValueChange={(value) =>
                setValue("category", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateValue && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateValue instanceof Date
                    ? format(dateValue, "PPP")
                    : dateValue
                      ? format(new Date(dateValue), "PPP")
                      : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    dateValue instanceof Date
                      ? dateValue
                      : dateValue
                        ? new Date(dateValue)
                        : undefined
                  }
                  onSelect={(value) => {
                    if (value) {
                      setValue("date", value, { shouldValidate: true });
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Recurring transaction</p>
                <p className="text-xs text-muted-foreground">
                  Set a schedule for repeating transactions.
                </p>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={(checked) =>
                  setValue("isRecurring", checked, { shouldValidate: true })
                }
              />
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Interval</label>
                <Select
                  value={watch("recurringInterval") ?? ""}
                  onValueChange={(value) =>
                    setValue(
                      "recurringInterval",
                      value as TransactionFormValues["recurringInterval"],
                      {
                        shouldValidate: true,
                      },
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRING_INTERVALS.map((interval) => (
                      <SelectItem key={interval.value} value={interval.value}>
                        {interval.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.recurringInterval && (
                  <p className="text-xs text-red-500">
                    {errors.recurringInterval.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update Transaction"
          ) : (
            "Add Transaction"
          )}
        </Button>

        {isEditing && accountValue && (
          <Button asChild variant="outline">
            <Link href={`/account/${accountValue}`}>Cancel</Link>
          </Button>
        )}
      </div>
    </form>
  );
};

export default AddTransactionForm;
