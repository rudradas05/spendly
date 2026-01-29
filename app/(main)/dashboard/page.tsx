import { getDashboardOverview, getUserAccounts } from "@/actions/dashboard";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Plus } from "lucide-react";
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

  return (
    <div className="space-y-12 px-5 pb-16">
      <section className="surface-panel overflow-hidden border-transparent bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_55%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.92))] p-8 text-white md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">
              Dashboard overview
            </p>
            <h1 className="font-display text-4xl font-semibold sm:text-5xl">
              Your money, in motion
            </h1>
            <p className="mt-3 max-w-lg text-sm text-slate-200">
              Track balances, monitor budgets, and stay ahead with insights
              tailored to your spending behavior.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-200">
              <span className="surface-chip border-white/20 bg-white/10 text-slate-100">
                Accounts: {totals.totalAccounts}
              </span>
              <span className="surface-chip border-white/20 bg-white/10 text-slate-100">
                Budget cadence: monthly
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-white text-slate-900 hover:bg-slate-100">
              <Link href="/transaction/create">Add Transaction</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/15"
            >
              <Link href={primaryAccountHref}>
                View account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg backdrop-blur">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">
              Total Balance
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {CURRENCY_SYMBOL}
              {totals.totalBalance.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg backdrop-blur">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">
              Income (MTD)
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {CURRENCY_SYMBOL}
              {totals.monthIncome.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg backdrop-blur">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">
              Expenses (MTD)
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {CURRENCY_SYMBOL}
              {totals.monthExpense.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg backdrop-blur">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">
              Net (MTD)
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {CURRENCY_SYMBOL}
              {totals.net.toFixed(2)}
            </p>
          </div>
        </div>
      </section>

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

      <section id="accounts" className="space-y-4 scroll-mt-28">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">Accounts</h2>
            <p className="text-sm text-muted-foreground">
              Manage balances and defaults across your accounts.
            </p>
          </div>
        </div>

        {accounts.length === 0 && (
          <div className="surface-panel p-6 text-sm text-muted-foreground">
            Create your first account to start tracking transactions.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer>
            <Card className="cursor-pointer border-dashed border-emerald-200/70 bg-white/60 transition-all hover:-translate-y-1 hover:shadow-xl">
              <CardContent className="flex h-full flex-col items-center justify-center pt-5 text-muted-foreground">
                <Plus className="mb-2 h-10 w-10" />
                <p>Add New Account</p>
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
