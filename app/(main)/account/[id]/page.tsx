import { getAccountWithTransactions } from "@/actions/account";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import TransactionTable from "../_components/transaction-table";
import { BarLoader } from "react-spinners";
import { AccountChart } from "../_components/account-chart";
import { ArrowDownRight, ArrowUpRight, Repeat, Plus } from "lucide-react";
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
  const recurringCount = transactions.filter(
    (transaction) => transaction.isRecurring
  ).length;
  const minBalanceValue =
    typeof account.minBalance === "number" && !Number.isNaN(account.minBalance)
      ? account.minBalance
      : 0;

  return (
    <div className="space-y-8 px-5 pb-16">
      <section className="surface-panel p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="section-kicker">Account overview</p>
            <h1 className="font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
              {account.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {account.type.charAt(0) + account.type.slice(1).toLowerCase()} account
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/transaction/create">
                <Plus className="mr-2 h-4 w-4" /> Add Transaction
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="surface-panel px-6 py-4 text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Current balance
            </p>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {CURRENCY_SYMBOL}
              {parseFloat(account.balance.toString()).toFixed(2)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {minBalanceValue > 0
                ? `Min balance alert: ${CURRENCY_SYMBOL}${minBalanceValue.toFixed(
                    2
                  )}`
                : "Min balance alert: Not set"}
            </p>
            <p className="text-xs text-muted-foreground">
              {account._count.transactions} total transactions
            </p>
          </div>
          <div className="surface-panel px-6 py-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Monthly net
            </p>
            <div
              className={`mt-2 text-2xl font-semibold ${
                net >= 0 ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {CURRENCY_SYMBOL}
              {net.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Income minus expenses.
            </p>
          </div>
          <div className="surface-panel px-6 py-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Recurring
            </p>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {recurringCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Active recurring payments.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="surface-panel p-5">
          <div className="flex items-center gap-3 text-emerald-600">
            <ArrowUpRight className="h-5 w-5" />
            <p className="text-xs uppercase tracking-[0.3em]">Income</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {CURRENCY_SYMBOL}
            {totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="surface-panel p-5">
          <div className="flex items-center gap-3 text-rose-500">
            <ArrowDownRight className="h-5 w-5" />
            <p className="text-xs uppercase tracking-[0.3em]">Expense</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {CURRENCY_SYMBOL}
            {totalExpense.toFixed(2)}
          </p>
        </div>
        <div className="surface-panel p-5">
          <div className="flex items-center gap-3 text-slate-600">
            <p className="text-xs uppercase tracking-[0.3em]">Net</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {CURRENCY_SYMBOL}
            {net.toFixed(2)}
          </p>
        </div>
        <div className="surface-panel p-5">
          <div className="flex items-center gap-3 text-amber-600">
            <Repeat className="h-5 w-5" />
            <p className="text-xs uppercase tracking-[0.3em]">Recurring</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {recurringCount}
          </p>
        </div>
      </div>

      <Suspense
        fallback={<BarLoader className="mt-4" width="100%" color="#14b8a6" />}
      >
        <AccountChart
          key={`chart-${id}`}
          transactions={transactions.map((t) => ({
            ...t,
            date: t.date instanceof Date ? t.date.toISOString() : t.date,
          }))}
        />
      </Suspense>

      <Suspense
        fallback={<BarLoader className="mt-4" width="100%" color="#14b8a6" />}
      >
        <TransactionTable key={`table-${id}`} transactions={transactions} />
      </Suspense>
    </div>
  );
};

export default AccountsPage;
