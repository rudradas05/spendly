import { getAccountWithTransactions } from "@/actions/account";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import TransactionTable from "../_components/transaction-table";
import { BarLoader } from "react-spinners";
import { AccountChart } from "../_components/account-chart";
import {
  ArrowDownRight,
  ArrowUpRight,
  Repeat,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AccountsPageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const AccountsPage = async ({ params }: AccountsPageProps) => {
  noStore();
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id;
  if (!id) {
    notFound();
  }
  const accountData = await getAccountWithTransactions(id);
  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;
  const totalIncome = transactions.reduce((sum, transaction) => {
    return transaction.type === "INCOME"
      ? sum + Number(transaction.amount)
      : sum;
  }, 0);
  const totalExpense = transactions.reduce((sum, transaction) => {
    return transaction.type === "EXPENSE"
      ? sum + Number(transaction.amount)
      : sum;
  }, 0);
  const net = totalIncome - totalExpense;
  const isPositiveNet = net >= 0;
  const recurringCount = transactions.filter(
    (transaction) => transaction.isRecurring,
  ).length;
  const minBalanceValue =
    typeof account.minBalance === "number" && !Number.isNaN(account.minBalance)
      ? account.minBalance
      : 0;
  const currentBalance = parseFloat(account.balance.toString());
  const isLowBalance = minBalanceValue > 0 && currentBalance < minBalanceValue;

  return (
    <div className="space-y-8 px-5 pb-16">
      {/* Header Section */}
      <section className="animate-fade-in surface-panel p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="section-kicker">Account overview</p>
            <h1 className="mt-1 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
              {account.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="surface-chip">
                {account.type.charAt(0) + account.type.slice(1).toLowerCase()}
              </span>
              {account.isDefault && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-600">
                  Default
                </span>
              )}
              {isLowBalance && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1 text-xs font-medium text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  Low balance
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="shadow-lg transition-all hover:scale-[1.02]"
            >
              <Link href="/transaction/create">
                <Plus className="mr-2 h-4 w-4" /> Add Transaction
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="transition-all hover:scale-[1.02]"
            >
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="surface-panel px-6 py-5 text-left transition-all hover:shadow-md">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Current balance
            </p>
            <div
              className={`mt-2 text-2xl font-semibold tabular-nums ${isLowBalance ? "text-amber-600" : "text-slate-900"}`}
            >
              {CURRENCY_SYMBOL}
              {currentBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {minBalanceValue > 0
                ? `Min alert: ${CURRENCY_SYMBOL}${minBalanceValue.toFixed(2)}`
                : "Min alert: Not set"}
            </p>
            <p className="text-xs text-muted-foreground">
              {account._count.transactions} total transactions
            </p>
          </div>
          <div className="surface-panel px-6 py-5 transition-all hover:shadow-md">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Monthly net
            </p>
            <div
              className={`mt-2 flex items-center gap-2 text-2xl font-semibold tabular-nums ${
                isPositiveNet ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {isPositiveNet ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {isPositiveNet ? "+" : ""}
              {CURRENCY_SYMBOL}
              {net.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Income minus expenses
            </p>
          </div>
          <div className="surface-panel px-6 py-5 transition-all hover:shadow-md">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Recurring
            </p>
            <div className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
              <Repeat className="h-5 w-5 text-amber-500" />
              {recurringCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Active recurring payments
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="surface-panel group p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-center gap-3 text-emerald-600">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 transition-transform group-hover:scale-105">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <p className="text-xs uppercase tracking-[0.3em]">Total Income</p>
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-900">
            +{CURRENCY_SYMBOL}
            {totalIncome.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="surface-panel group p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-center gap-3 text-rose-500">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 transition-transform group-hover:scale-105">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <p className="text-xs uppercase tracking-[0.3em]">Total Expenses</p>
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-900">
            -{CURRENCY_SYMBOL}
            {totalExpense.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="surface-panel group p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${isPositiveNet ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
            >
              {isPositiveNet ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-600">
              Net Balance
            </p>
          </div>
          <p
            className={`mt-3 text-2xl font-semibold tabular-nums ${isPositiveNet ? "text-emerald-600" : "text-rose-600"}`}
          >
            {isPositiveNet ? "+" : ""}
            {CURRENCY_SYMBOL}
            {net.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="surface-panel group p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-center gap-3 text-amber-600">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 transition-transform group-hover:scale-105">
              <Repeat className="h-5 w-5" />
            </div>
            <p className="text-xs uppercase tracking-[0.3em]">Recurring</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {recurringCount}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              active
            </span>
          </p>
        </div>
      </div>

      {/* Charts */}
      <Suspense
        fallback={<BarLoader className="mt-4" width="100%" color="#10b981" />}
      >
        <AccountChart
          key={`chart-${id}`}
          transactions={transactions.map((t) => ({
            ...t,
            date: t.date instanceof Date ? t.date.toISOString() : t.date,
          }))}
        />
      </Suspense>

      {/* Transactions Table */}
      <Suspense
        fallback={<BarLoader className="mt-4" width="100%" color="#10b981" />}
      >
        <TransactionTable key={`table-${id}`} transactions={transactions} />
      </Suspense>
    </div>
  );
};

export default AccountsPage;
