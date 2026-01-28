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
    <div className="space-y-10 px-5">
      <section className="rounded-3xl border bg-[radial-gradient(circle_at_top,_#0f172a,_#111827,_#0b1120)] p-8 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
              Dashboard Overview
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-3">
              Your money, in motion
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-lg">
              Track balances, monitor budgets, and stay ahead with insights
              tailored to your spending behavior.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-slate-600/60 px-3 py-1">
                Accounts: {totals.totalAccounts}
              </span>
              <span className="rounded-full border border-slate-600/60 px-3 py-1">
                Budget cadence: monthly
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-white text-slate-900 hover:bg-slate-100"
            >
              <Link href="/transaction/create">Add Transaction</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-slate-600 text-black hover:bg-slate-800 hover:text-white"
            >
              <Link href={primaryAccountHref}>
                View account <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
              Total Balance
            </p>
            <p className="text-2xl font-semibold mt-2">
              {CURRENCY_SYMBOL}
              {totals.totalBalance.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
              Income (MTD)
            </p>
            <p className="text-2xl font-semibold mt-2">
              {CURRENCY_SYMBOL}
              {totals.monthIncome.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
              Expenses (MTD)
            </p>
            <p className="text-2xl font-semibold mt-2">
              {CURRENCY_SYMBOL}
              {totals.monthExpense.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
              Net (MTD)
            </p>
            <p className="text-2xl font-semibold mt-2">
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">Accounts</h2>
            <p className="text-sm text-muted-foreground">
              Manage balances and defaults across your accounts.
            </p>
          </div>
        </div>

        {accounts.length === 0 && (
          <div className="rounded-xl border bg-muted/40 p-6 text-sm text-muted-foreground">
            Create your first account to start tracking transactions.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
                <Plus className="h-10 w-10 mb-2" />
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
