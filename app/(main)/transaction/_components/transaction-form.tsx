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

type TransactionFormValues = z.input<typeof transactionSchema>;

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
  forceEdit?: boolean;
}

const AddTransactionForm = ({
  accounts = [],
  categories = [],
  initialData = null,
  forceEdit = false,
}: AddTransactionFormProps) => {
  const router = useRouter();
  const canUpdate = Boolean(initialData?.id);
  const isEditing = forceEdit || canUpdate;

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
  const resolvedDate =
    dateValue instanceof Date
      ? dateValue
      : typeof dateValue === "string" || typeof dateValue === "number"
        ? new Date(dateValue)
        : undefined;
  const isRecurring = watch("isRecurring");
  const categoryValue = watch("category");
  const accountValue = watch("accountId");
  const recurringInterval = watch("recurringInterval");

  const quickAmounts =
    type === "INCOME" ? [250, 500, 1000, 2500] : [25, 50, 100, 250];

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
    const parsedValues = transactionSchema.parse(values);
    if (canUpdate && initialData?.id) {
      await updateFn(initialData.id, parsedValues);
      return;
    }
    await createFn(parsedValues);
  };

  if (accounts.length === 0) {
    return (
      <div className="surface-panel animate-fade-in p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/70">
          <Loader2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          Create an account first
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You need at least one account before adding a transaction.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(handleSubmitForm)}
      className="animate-fade-in space-y-6"
    >
      <div className="surface-panel p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="section-kicker">Details</p>
          {isEditing && <span className="surface-chip">Editing</span>}
        </div>
        <div className="mt-1 flex flex-col gap-1">
          <h2 className="text-base font-semibold text-slate-900">
            Transaction basics
          </h2>
          <p className="text-xs text-muted-foreground">
            Capture the essentials and let Spendly handle the rest.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setValue("type", "EXPENSE", { shouldValidate: true })
                }
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                  type === "EXPENSE"
                    ? "border-rose-300 bg-rose-50 text-rose-700 shadow-sm ring-2 ring-rose-200"
                    : "border-border/60 bg-background/70 text-muted-foreground hover:bg-rose-50/50 hover:text-rose-600"
                )}
              >
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Expense
              </button>
              <button
                type="button"
                onClick={() =>
                  setValue("type", "INCOME", { shouldValidate: true })
                }
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                  type === "INCOME"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm ring-2 ring-emerald-200"
                    : "border-border/60 bg-background/70 text-muted-foreground hover:bg-emerald-50/50 hover:text-emerald-600"
                )}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Income
              </button>
            </div>
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
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((value) => {
                const currentAmount = watch("amount");
                const isActive = currentAmount === value.toString();
                return (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-7 rounded-full px-2.5 text-xs transition-all",
                      isActive &&
                        (type === "EXPENSE"
                          ? "border-rose-300 bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                          : "border-emerald-300 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200")
                    )}
                    onClick={() =>
                      setValue("amount", value.toString(), {
                        shouldValidate: true,
                      })
                    }
                  >
                    {CURRENCY_SYMBOL}
                    {value}
                  </Button>
                );
              })}
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <Input placeholder="Add a note" {...register("description")} />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
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
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-red-500">{errors.category.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-white/60 pt-4">
          <div className="flex flex-col gap-2">
            <p className="section-kicker">Schedule</p>
            <h2 className="text-base font-semibold">Timing & recurrence</h2>
            <p className="text-xs text-muted-foreground">
              Pick a date and let recurring expenses run automatically.
            </p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                    {resolvedDate ? format(resolvedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={resolvedDate}
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
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 p-3">
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
                    value={recurringInterval ?? ""}
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

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[140px] shadow-[0_18px_30px_-22px_rgba(15,23,42,0.55)] transition-all hover:scale-[1.02]"
          >
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
            <Button
              asChild
              variant="outline"
              className="transition-all hover:scale-[1.02]"
            >
              <Link href={`/account/${accountValue}`}>Cancel</Link>
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default AddTransactionForm;
