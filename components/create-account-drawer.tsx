"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from "@/app/lib/schema";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "./ui/drawer";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import useFetch from "@/hooks/use-fetch";
import { createAccount } from "@/actions/dashboard";
import { Loader2, Sparkles, Wallet, Landmark } from "lucide-react";
import { toast } from "sonner";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface CreateAccountDrawerProps {
  children: ReactNode;
}

const CreateAccountDrawer = ({ children }: CreateAccountDrawerProps) => {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      minBalance: "",
      isDefault: false,
    },
  });

  const nameValue = watch("name");
  const typeValue = watch("type");
  const balanceValue = watch("balance");
  const minBalanceValue = watch("minBalance");
  const isDefaultValue = watch("isDefault");

  const parsedBalance =
    typeof balanceValue === "number"
      ? balanceValue
      : parseFloat(balanceValue || "0");
  const parsedMinBalance =
    typeof minBalanceValue === "number"
      ? minBalanceValue
      : parseFloat(minBalanceValue || "0");
  const safeBalance = Number.isFinite(parsedBalance) ? parsedBalance : 0;
  const safeMinBalance = Number.isFinite(parsedMinBalance)
    ? parsedMinBalance
    : 0;

  const initials = useMemo(() => {
    if (!nameValue) return "AC";
    return nameValue
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [nameValue]);

  const minBalanceRatio =
    safeBalance > 0 ? Math.min((safeMinBalance / safeBalance) * 100, 100) : 0;
  const accentClass =
    typeValue === "SAVINGS"
      ? "from-emerald-500 via-teal-500 to-amber-400"
      : "from-sky-500 via-cyan-500 to-emerald-400";
  const typeLabel = typeValue === "SAVINGS" ? "Savings" : "Current";

  const {
    data: newAccount,
    error,
    fn: createAccountFn,
    loading: createAccountLoading,
  } = useFetch(createAccount);

  useEffect(() => {
    if (newAccount && !createAccountLoading) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [createAccountLoading, newAccount, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  const onSubmit = async (data: any) => {
    await createAccountFn(data);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="border-white/70 bg-white/85 backdrop-blur-xl shadow-[0_35px_90px_-60px_rgba(15,23,42,0.6)] data-[vaul-drawer-direction=bottom]:left-1/2 data-[vaul-drawer-direction=bottom]:right-auto data-[vaul-drawer-direction=bottom]:w-[min(760px,94vw)] data-[vaul-drawer-direction=bottom]:-translate-x-1/2 data-[vaul-drawer-direction=bottom]:rounded-3xl data-[vaul-drawer-direction=bottom]:border data-[vaul-drawer-direction=bottom]:mb-6">
        <DrawerHeader className="px-6 pt-6">
          <DrawerTitle className="text-slate-900">Create new account</DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground">
            Set up a new account with live preview and smart defaults.
          </DrawerDescription>
        </DrawerHeader>

        <div className="grid gap-6 px-6 pb-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Account name
              </label>
              <Input
                id="name"
                placeholder="e.g., Main Checking"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Account type
              </label>
              <Select
                onValueChange={(value) =>
                  setValue("type", value as "CURRENT" | "SAVINGS")
                }
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="balance" className="text-sm font-medium">
                Initial balance
              </label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("balance")}
              />
              {errors.balance && (
                <p className="text-sm text-red-500">{errors.balance.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="minBalance" className="text-sm font-medium">
                Minimum balance alert
              </label>
              <Input
                id="minBalance"
                type="number"
                step="0.01"
                placeholder="Optional"
                {...register("minBalance")}
              />
              {errors.minBalance && (
                <p className="text-sm text-red-500">
                  {errors.minBalance.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 p-3">
              <div>
                <label htmlFor="isDefault" className="text-sm font-medium">
                  Set as default
                </label>
                <p className="text-sm text-muted-foreground">
                  Default accounts are selected for new transactions.
                </p>
              </div>
              <Switch
                id="isDefault"
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                checked={watch("isDefault")}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="submit"
                className="flex-1"
                disabled={createAccountLoading}
              >
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>

          <div className="space-y-6">
            <div className="surface-panel p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="section-kicker">Live preview</p>
                  <h3 className="text-lg font-semibold">Account card</h3>
                </div>
                <Badge variant="outline" className="gap-2 border-emerald-200/70">
                  <Sparkles className="h-3 w-3 text-emerald-500" />
                  Live
                </Badge>
              </div>

              <div className="mt-5 rounded-2xl border border-border/60 bg-background/70 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                        accentClass
                      )}
                    >
                      {typeValue === "SAVINGS" ? (
                        <Landmark className="h-6 w-6" />
                      ) : (
                        <Wallet className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {nameValue || "New account"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {typeLabel} account
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {CURRENCY_SYMBOL}
                      {safeBalance.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="surface-chip">{typeLabel}</span>
                  {isDefaultValue && (
                    <span className="surface-chip">Default account</span>
                  )}
                  <span className="surface-chip">{initials}</span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Minimum balance alert</span>
                    <span>
                      {safeMinBalance > 0
                        ? `${CURRENCY_SYMBOL}${safeMinBalance.toFixed(2)}`
                        : "Not set"}
                    </span>
                  </div>
                  <Progress value={minBalanceRatio} />
                </div>
              </div>
            </div>

            <div className="surface-panel p-6">
              <p className="section-kicker">Smart setup</p>
              <h3 className="mt-2 text-lg font-semibold">Recommendations</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>Set a minimum balance for overdraft alerts.</li>
                <li>Mark this account as default for faster data entry.</li>
                <li>Add a clear name to keep statements organized.</li>
              </ul>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateAccountDrawer;
