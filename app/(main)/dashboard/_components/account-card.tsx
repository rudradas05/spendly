"use client";

import { updateDefaultAccount } from "@/actions/account";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/use-fetch";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import { cn } from "@/lib/utils";

type DecimalLike = { toNumber: () => number };

interface AccountCardProps {
  account: {
    id: string;
    name: string;
    type: "CURRENT" | "SAVINGS";
    balance: number | string | DecimalLike;
    minBalance?: number | string | DecimalLike | null;
    isDefault: boolean;
  };
}

const AccountCard = ({ account }: AccountCardProps) => {
  const { name, type, balance, id, isDefault, minBalance } = account;
  const toNumber = (
    value: number | string | DecimalLike | null | undefined,
  ): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "object" && "toNumber" in value) {
      return value.toNumber();
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const balanceValue = toNumber(balance);
  const minBalanceValue = minBalance ? toNumber(minBalance) : 0;
  const minBalanceLabel =
    minBalanceValue > 0
      ? `${CURRENCY_SYMBOL}${minBalanceValue.toFixed(2)}`
      : "Not set";
  const minBalanceDotClass =
    minBalanceValue && minBalanceValue > 0 ? "bg-emerald-400" : "bg-slate-300";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const { loading: updateDefaultLoading, fn: updateDefaultFn } =
    useFetch(updateDefaultAccount);

  const handleDefaultChange = async (checked: boolean) => {
    if (!checked || isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }
    const result = await updateDefaultFn(id);
    if (result?.success) {
      toast.success("Default account updated successfully");
    } else if (result) {
      toast.error(result.error || "Failed to update default account.");
    }
  };

  return (
    <Card className="group relative overflow-hidden border border-white/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-800/80 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_35px_90px_-60px_rgba(15,23,42,0.65)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_55%)] opacity-80" />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <Link
          href={`/account/${id}`}
          className="flex flex-1 items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/70 dark:bg-slate-700/70 dark:border-slate-600/60 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
            {initials || "AC"}
          </div>
          <div>
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              {name}
            </CardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.26em] text-slate-400">
              <span className="rounded-full border border-white/60 bg-white/70 dark:bg-slate-700/70 dark:border-slate-600/60 px-2 py-1 text-[0.55rem] font-semibold text-slate-500 dark:text-slate-400">
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </span>
              {isDefault && (
                <span className="rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2 py-1 text-[0.55rem] font-semibold text-emerald-600">
                  Default
                </span>
              )}
            </div>
          </div>
        </Link>

        {updateDefaultLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Switch
            className="cursor-pointer"
            checked={isDefault}
            onCheckedChange={handleDefaultChange}
            disabled={updateDefaultLoading}
          />
        )}
      </CardHeader>

      <Link href={`/account/${id}`}>
        <CardContent className="relative pt-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Available balance
          </p>
          <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {CURRENCY_SYMBOL}
            {balanceValue.toFixed(2)}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <span
                className={cn("h-1.5 w-1.5 rounded-full", minBalanceDotClass)}
              />
              Min balance
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {minBalanceLabel}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default AccountCard;
