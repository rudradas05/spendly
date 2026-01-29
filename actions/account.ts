"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

type DecimalLike = { toNumber: () => number };
type SerializableAmounts = {
  balance?: DecimalLike | number | null;
  amount?: DecimalLike | number | null;
  minBalance?: DecimalLike | number | null;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

const serializeTransaction = <
  T extends Record<string, unknown> & SerializableAmounts,
>(
  obj: T
) => {
  const serialized = {
    ...obj,
  } as T & { balance?: number | null; amount?: number | null };

  if (obj.balance !== undefined) {
    serialized.balance =
      obj.balance && typeof obj.balance === "object" && "toNumber" in obj.balance
        ? obj.balance.toNumber()
        : (obj.balance ?? null);
  }
  if (obj.amount !== undefined) {
    serialized.amount =
      obj.amount && typeof obj.amount === "object" && "toNumber" in obj.amount
        ? obj.amount.toNumber()
        : (obj.amount ?? null);
  }
  if (obj.minBalance !== undefined) {
    serialized.minBalance =
      obj.minBalance &&
      typeof obj.minBalance === "object" &&
      "toNumber" in obj.minBalance
        ? obj.minBalance.toNumber()
        : (obj.minBalance ?? null);
  }
  return serialized;
};

export async function updateDefaultAccount(accountId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const existingAccount = await db.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
      },
    });
    if (!existingAccount) {
      throw new Error("Account not found");
    }

    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    const account = await db.account.update({
      where: {
        id: accountId,
      },
      data: {
        isDefault: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getAccountWithTransactions(accountId: string) {
  noStore();
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  const account = await db.account.findFirst({
    where: { id: accountId, userId: user.id },
    include: {
      transactions: {
        orderBy: {
          date: "desc",
        },
      },
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  if (!account) return null;
  return {
    ...serializeTransaction(account),
    transactions: account.transactions.map(serializeTransaction),
  };
}

export async function bulkDeleteTransactions(transactionIds: string[]) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    if (transactions.length === 0) {
      return { success: false, message: "No transactions found" };
    }

    const accountBalanceChanges: Record<string, number> = transactions.reduce(
      (acc, transaction) => {
        const amount =
          transaction.amount?.toNumber?.() ?? Number(transaction.amount);
        const change =
          transaction.type === "EXPENSE" ? amount : -amount;

        acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;

        return acc;
      },
      {} as Record<string, number>
    );

    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    Object.keys(accountBalanceChanges).forEach((accountId) => {
      revalidatePath(`/account/${accountId}`);
    });
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("bulkDeleteTransactions error:", message);
    return { success: false, message };
  }
}
