"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { defaultCategories } from "@/data/categories";

const SEED_TRANSACTIONS = [
  { type: "INCOME" as const, amount: 50000, description: "Monthly Salary", category: "salary", daysAgo: 1, isRecurring: true, recurringInterval: "MONTHLY" as const },
  { type: "EXPENSE" as const, amount: 12000, description: "Rent Payment", category: "housing", daysAgo: 2, isRecurring: true, recurringInterval: "MONTHLY" as const },
  { type: "EXPENSE" as const, amount: 3200, description: "Grocery Shopping", category: "groceries", daysAgo: 3, isRecurring: false },
  { type: "EXPENSE" as const, amount: 800, description: "Electricity Bill", category: "utilities", daysAgo: 5, isRecurring: true, recurringInterval: "MONTHLY" as const },
  { type: "EXPENSE" as const, amount: 1500, description: "Dinner with friends", category: "food", daysAgo: 6, isRecurring: false },
  { type: "INCOME" as const, amount: 8000, description: "Freelance project", category: "freelance", daysAgo: 8, isRecurring: false },
  { type: "EXPENSE" as const, amount: 2400, description: "Metro & Cab rides", category: "transportation", daysAgo: 10, isRecurring: false },
  { type: "EXPENSE" as const, amount: 999, description: "Netflix + Spotify", category: "entertainment", daysAgo: 12, isRecurring: true, recurringInterval: "MONTHLY" as const },
  { type: "EXPENSE" as const, amount: 4500, description: "New clothes", category: "shopping", daysAgo: 14, isRecurring: false },
  { type: "EXPENSE" as const, amount: 600, description: "Doctor visit", category: "healthcare", daysAgo: 16, isRecurring: false },
];

export async function seedTransactions() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const defaultAccount = await db.account.findFirst({
      where: { userId: user.id, isDefault: true },
    });
    if (!defaultAccount) throw new Error("No default account found. Please create an account first.");

    const validCategoryIds = new Set(defaultCategories.map((c) => c.id));
    const invalidCategories = SEED_TRANSACTIONS.filter((t) => !validCategoryIds.has(t.category));
    if (invalidCategories.length > 0)
      throw new Error(`Invalid categories: ${invalidCategories.map((t) => t.category).join(", ")}`);

    let balanceDelta = 0;
    const transactions = SEED_TRANSACTIONS.map((t) => {
      const date = new Date();
      date.setDate(date.getDate() - t.daysAgo);
      balanceDelta += t.type === "INCOME" ? t.amount : -t.amount;
      return {
        type: t.type,
        amount: t.amount,
        description: t.description,
        category: t.category,
        date,
        accountId: defaultAccount.id,
        userId: user.id,
        isRecurring: t.isRecurring,
        recurringInterval: t.isRecurring ? (t as { recurringInterval: "MONTHLY" }).recurringInterval ?? null : null,
      };
    });

    await db.$transaction(async (tx) => {
      await tx.transaction.createMany({ data: transactions });
      await tx.account.update({
        where: { id: defaultAccount.id },
        data: { balance: { increment: balanceDelta } },
      });
    });

    return { success: true, message: `Seeded ${transactions.length} transactions successfully.` };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return { success: false, error: message };
  }
}