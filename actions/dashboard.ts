"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { categoryColors, defaultCategories } from "@/data/categories";
import { serializeDecimal, toNumber, getErrorMessage } from "@/lib/serialize";

interface CreateAccountInput {
  name: string;
  type: "CURRENT" | "SAVINGS";
  balance: string;
  minBalance?: string;
  isDefault: boolean;
}

export async function createAccount(data: CreateAccountInput) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const balanceFloat = parseFloat(data.balance);
    if (Number.isNaN(balanceFloat)) throw new Error("Invalid balance amount");

    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const minBalanceFloat =
      data.minBalance && data.minBalance.trim() !== ""
        ? parseFloat(data.minBalance)
        : 0;
    if (Number.isNaN(minBalanceFloat) || minBalanceFloat < 0)
      throw new Error("Invalid minimum balance amount");

    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        minBalance: minBalanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeDecimal(account) };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getUserAccounts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { transactions: true } } },
  });

  return accounts.map(serializeDecimal);
}

type CashflowPoint = {
  month: string;
  income: number;
  expense: number;
  net: number;
};
type RecentTransaction = {
  id: string;
  description: string | null;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: Date;
  accountName: string;
};

export async function getDashboardOverview() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const accounts = await db.account.findMany({
      where: { userId: user.id },
      select: { balance: true },
    });

    const totalBalance = accounts.reduce(
      (sum, a) => sum + toNumber(a.balance),
      0,
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const monthTransactions = await db.transaction.findMany({
      where: { userId: user.id, date: { gte: startOfMonth, lte: endOfMonth } },
      select: { amount: true, type: true, category: true },
    });

    let monthIncome = 0;
    let monthExpense = 0;
    const categoryMap = new Map<string, number>();

    monthTransactions.forEach((t) => {
      const amount = toNumber(t.amount);
      if (t.type === "INCOME") {
        monthIncome += amount;
      } else {
        monthExpense += amount;
        categoryMap.set(
          t.category,
          (categoryMap.get(t.category) || 0) + amount,
        );
      }
    });

    const net = monthIncome - monthExpense;
    const categoryIndex = new Map(defaultCategories.map((c) => [c.id, c]));

    const breakdown = Array.from(categoryMap.entries())
      .map(([id, amount]) => ({
        id,
        name: categoryIndex.get(id)?.name ?? id,
        amount,
        color: categoryColors[id] ?? "#94a3b8",
      }))
      .sort((a, b) => b.amount - a.amount);

    const topBreakdown = breakdown.slice(0, 5);
    const remainder = breakdown
      .slice(5)
      .reduce((sum, item) => sum + item.amount, 0);
    if (remainder > 0)
      topBreakdown.push({
        id: "other",
        name: "Other",
        amount: remainder,
        color: "#CBD5F5",
      });

    const trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const trendTransactions = await db.transaction.findMany({
      where: { userId: user.id, date: { gte: trendStart, lte: endOfMonth } },
      select: { amount: true, type: true, date: true },
    });

    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: format(date, "MMM"),
      };
    });

    const monthlyCashflow: CashflowPoint[] = months.map((m) => ({
      month: m.label,
      income: 0,
      expense: 0,
      net: 0,
    }));

    trendTransactions.forEach((t) => {
      const key = `${t.date.getFullYear()}-${t.date.getMonth()}`;
      const index = months.findIndex((m) => m.key === key);
      if (index === -1) return;
      const amount = toNumber(t.amount);
      if (t.type === "INCOME") monthlyCashflow[index].income += amount;
      else monthlyCashflow[index].expense += amount;
    });

    monthlyCashflow.forEach((p) => {
      p.net = p.income - p.expense;
    });

    const currentMonthExpense =
      monthlyCashflow[monthlyCashflow.length - 1]?.expense ?? 0;
    const previousMonthExpense =
      monthlyCashflow[monthlyCashflow.length - 2]?.expense ?? 0;
    const expenseChange =
      previousMonthExpense > 0
        ? ((currentMonthExpense - previousMonthExpense) /
            previousMonthExpense) *
          100
        : null;

    const savingsRate =
      monthIncome > 0
        ? Math.min(100, Math.max(0, (net / monthIncome) * 100))
        : null;

    const recentTransactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: [{ createdAt: "desc" }],
      take: 8,
      select: {
        id: true,
        description: true,
        amount: true,
        type: true,
        category: true,
        date: true,
        account: { select: { name: true } },
      },
    });

    const recent: RecentTransaction[] = recentTransactions.map((t) => ({
      id: t.id,
      description: t.description,
      category: t.category,
      type: t.type,
      amount: toNumber(t.amount),
      date: t.date,
      accountName: t.account.name,
    }));

    return {
      totals: {
        totalBalance,
        monthIncome,
        monthExpense,
        net,
        totalAccounts: accounts.length,
      },
      cashflow: monthlyCashflow,
      categories: topBreakdown,
      insights: {
        expenseChange,
        savingsRate,
        topCategory: topBreakdown[0]?.name ?? null,
      },
      recent,
    };
  } catch (error: unknown) {
    console.error("[getDashboardOverview]", getErrorMessage(error));
    return {
      totals: {
        totalBalance: 0,
        monthIncome: 0,
        monthExpense: 0,
        net: 0,
        totalAccounts: 0,
      },
      cashflow: [],
      categories: [],
      insights: { expenseChange: null, savingsRate: null, topCategory: null },
      recent: [],
    };
  }
}
