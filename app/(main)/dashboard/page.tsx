import { getDashboardOverview, getUserAccounts } from "@/actions/dashboard";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
} from "lucide-react";
import AccountCard from "./_components/account-card";
import { getCurrentBudget } from "@/actions/budget";
import { BudgetProgress } from "./_components/budget-progress";
import Link from "next/link";
import CashflowChart from "./_components/cashflow-chart";
import CategoryBreakdown from "./_components/category-breakdown";
import InsightsPanel from "./_components/insights-panel";
import RecentTransactions from "./_components/recent-transactions";
import { CURRENCY_SYMBOL } from "@/lib/constants";

export default async function DashboardPage() {
  const accounts = (await getUserAccounts()) ?? [];
  const overview = await getDashboardOverview();

  const defaultAccount =
    accounts?.find((account) => account.isDefault) ?? accounts?.[0] ?? null;
  const budgetData = await getCurrentBudget();

  const { totals, cashflow, categories, insights, recent } = overview;
  const primaryAccountHref = defaultAccount ? "/account" : "/dashboard";
  const isPositiveNet = totals.net >= 0;

  return (
    <div className="space-y-10 px-5 pb-16">
      {/* Hero Section */}
      <section className="animate-fade-in surface-panel overflow-hidden border-transparent bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_55%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_55%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(15,23,42,0.92))] p-8 text-white md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/90">
              Dashboard overview
            </p>
            <h1 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">
              Your money, in motion
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-300">
              Track balances, monitor budgets, and stay ahead with insights
              tailored to your spending behavior.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-slate-100 backdrop-blur-sm">
                <Wallet className="h-3.5 w-3.5" />
                {totals.totalAccounts}{" "}
                {totals.totalAccounts === 1 ? "Account" : "Accounts"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-slate-100 backdrop-blur-sm">
                <PiggyBank className="h-3.5 w-3.5" />
                Monthly budget
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-white text-slate-900 shadow-lg transition-all hover:scale-[1.02] hover:bg-slate-100"
            >
              <Link href="/transaction/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <Link href={primaryAccountHref}>
                View account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="group rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg backdrop-blur-sm transition-all hover:bg-white/15">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/90">
                Total Balance
              </p>
              <Wallet className="h-4 w-4 text-emerald-400/70" />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">
              {CURRENCY_SYMBOL}
              {totals.totalBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="group rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg backdrop-blur-sm transition-all hover:bg-white/15">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/90">
                Income (MTD)
              </p>
              <TrendingUp className="h-4 w-4 text-emerald-400/70" />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums text-emerald-300">
              +{CURRENCY_SYMBOL}
              {totals.monthIncome.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="group rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg backdrop-blur-sm transition-all hover:bg-white/15">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/90">
                Expenses (MTD)
              </p>
              <TrendingDown className="h-4 w-4 text-rose-400/70" />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums text-rose-300">
              -{CURRENCY_SYMBOL}
              {totals.monthExpense.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="group rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg backdrop-blur-sm transition-all hover:bg-white/15">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/90">
                Net (MTD)
              </p>
              {isPositiveNet ? (
                <TrendingUp className="h-4 w-4 text-emerald-400/70" />
              ) : (
                <TrendingDown className="h-4 w-4 text-rose-400/70" />
              )}
            </div>
            <p
              className={`mt-3 text-2xl font-semibold tabular-nums ${isPositiveNet ? "text-emerald-300" : "text-rose-300"}`}
            >
              {isPositiveNet ? "+" : ""}
              {CURRENCY_SYMBOL}
              {totals.net.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Charts and Insights Section */}
      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <CashflowChart data={cashflow} />
          <RecentTransactions transactions={recent} />
        </div>
        <div className="space-y-6">
          {accounts.length > 0 && (
            <BudgetProgress
              initialBudget={budgetData?.budget || null}
              currentExpenses={budgetData?.currentExpenses || 0}
            />
          )}
          <CategoryBreakdown data={categories} />
          <InsightsPanel
            expenseChange={insights.expenseChange}
            savingsRate={insights.savingsRate}
            topCategory={insights.topCategory}
          />
        </div>
      </section>

      {/* Accounts Section */}
      <section id="accounts" className="space-y-5 scroll-mt-28">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-900">
              Accounts
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage balances and defaults across your accounts.
            </p>
          </div>
        </div>

        {accounts.length === 0 && (
          <div className="surface-panel p-8 text-center">
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              Create your first account to start tracking transactions.
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer>
            <Card className="group cursor-pointer border-2 border-dashed border-emerald-200/70 bg-white/60 transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl">
              <CardContent className="flex h-full min-h-40 flex-col items-center justify-center pt-5 text-muted-foreground transition-colors group-hover:text-emerald-600">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200/60 bg-emerald-50/70 transition-all group-hover:scale-105 group-hover:bg-emerald-100">
                  <Plus className="h-7 w-7 text-emerald-600" />
                </div>
                <p className="font-medium">Add New Account</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Create a checking or savings account
                </p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>
          {accounts.length > 0 &&
            accounts?.map((account) => {
              return <AccountCard key={account.id} account={account} />;
            })}
        </div>
      </section>
    </div>
  );
}
