"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type DecimalLike = { toNumber: () => number };

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

const serializeAmount = <
  T extends Record<string, unknown> & {
    amount?: DecimalLike | number | null;
  },
>(
  obj: T,
) => ({
  ...obj,
  amount:
    obj.amount && typeof obj.amount === "object" && "toNumber" in obj.amount
      ? obj.amount.toNumber()
      : (obj.amount ?? null),
});

type TransactionInput = {
  type: "INCOME" | "EXPENSE";
  amount: string | number;
  description: string;
  date: Date | string;
  accountId: string;
  category: string;
  isRecurring: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
};

export async function createTransaction(data: TransactionInput) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findFirst({
      where: { id: data.accountId, userId: user.id },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    const amount = Number(data.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!data.description?.trim()) {
      throw new Error("Description is required");
    }

    const date = data.date instanceof Date ? data.date : new Date(data.date);
    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }

    // Calculate balance change
    const balanceChange = data.type === "EXPENSE" ? -amount : amount;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          type: data.type,
          amount,
          description: data.description,
          date,
          category: data.category,
          accountId: data.accountId,
          isRecurring: data.isRecurring,
          recurringInterval: data.isRecurring ? data.recurringInterval : null,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: balanceChange } },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getTransaction(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findFirst({
    where: { id, userId: user.id },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id: string, data: TransactionInput) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const existing = await db.transaction.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      throw new Error("Transaction not found");
    }

    const targetAccount = await db.account.findFirst({
      where: { id: data.accountId, userId: user.id },
    });

    if (!targetAccount) {
      throw new Error("Account not found");
    }

    const amount = Number(data.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount");
    }

    if (!data.description?.trim()) {
      throw new Error("Description is required");
    }

    const date = data.date instanceof Date ? data.date : new Date(data.date);
    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }

    const oldAmount = existing.amount?.toNumber
      ? existing.amount.toNumber()
      : Number(existing.amount);
    const oldEffect = existing.type === "EXPENSE" ? -oldAmount : oldAmount;
    const newEffect = data.type === "EXPENSE" ? -amount : amount;

    const updated = await db.$transaction(async (tx) => {
      const updatedTransaction = await tx.transaction.update({
        where: { id: existing.id },
        data: {
          type: data.type,
          amount,
          description: data.description,
          date,
          category: data.category,
          accountId: data.accountId,
          isRecurring: data.isRecurring,
          recurringInterval: data.isRecurring ? data.recurringInterval : null,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(date, data.recurringInterval)
              : null,
        },
      });

      if (existing.accountId === data.accountId) {
        const delta = newEffect - oldEffect;
        if (delta !== 0) {
          await tx.account.update({
            where: { id: data.accountId },
            data: { balance: { increment: delta } },
          });
        }
      } else {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: -oldEffect } },
        });
        await tx.account.update({
          where: { id: data.accountId },
          data: { balance: { increment: newEffect } },
        });
      }

      return updatedTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${existing.accountId}`);
    if (existing.accountId !== data.accountId) {
      revalidatePath(`/account/${data.accountId}`);
    }

    return { success: true, data: serializeAmount(updated) };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

function calculateNextRecurringDate(
  startDate: Date | string,
  interval: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}
