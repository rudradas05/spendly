"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { serializeDecimal, getErrorMessage } from "@/lib/serialize";

export async function updateDefaultAccount(accountId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const existingAccount = await db.account.findFirst({
      where: { id: accountId, userId: user.id },
    });
    if (!existingAccount) throw new Error("Account not found");

    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    const account = await db.account.update({
      where: { id: accountId },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeDecimal(account) };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getAccountWithTransactions(accountId: string) {
  noStore();
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const account = await db.account.findFirst({
    where: { id: accountId, userId: user.id },
    include: {
      transactions: { orderBy: { date: "desc" } },
      _count: { select: { transactions: true } },
    },
  });

  if (!account) return null;
  return {
    ...serializeDecimal(account),
    transactions: account.transactions.map(serializeDecimal),
  };
}

export async function bulkDeleteTransactions(transactionIds: string[]) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const transactions = await db.transaction.findMany({
      where: { id: { in: transactionIds }, userId: user.id },
    });

    if (transactions.length === 0)
      return { success: false, message: "No transactions found" };

    const accountBalanceChanges: Record<string, number> = transactions.reduce(
      (acc, t) => {
        const amount = t.amount?.toNumber?.() ?? Number(t.amount);
        const change = t.type === "EXPENSE" ? amount : -amount;
        acc[t.accountId] = (acc[t.accountId] || 0) + change;
        return acc;
      },
      {} as Record<string, number>
    );

    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: { id: { in: transactionIds }, userId: user.id },
      });
      for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: balanceChange } },
        });
      }
    });

    Object.keys(accountBalanceChanges).forEach((id) => revalidatePath(`/account/${id}`));
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("bulkDeleteTransactions error:", message);
    return { success: false, message };
  }
}

interface UpdateAccountInput {
  name?: string;
  type?: "CURRENT" | "SAVINGS";
  minBalance?: string;
}

export async function updateAccount(accountId: string, data: UpdateAccountInput) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const existing = await db.account.findFirst({
      where: { id: accountId, userId: user.id },
    });
    if (!existing) throw new Error("Account not found");

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.minBalance !== undefined) {
      const minBal = parseFloat(data.minBalance);
      if (Number.isNaN(minBal) || minBal < 0) throw new Error("Invalid minimum balance");
      updateData.minBalance = minBal;
    }

    const account = await db.account.update({ where: { id: accountId }, data: updateData });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${accountId}`);
    return { success: true, data: serializeDecimal(account) };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deleteAccount(accountId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const account = await db.account.findFirst({ where: { id: accountId, userId: user.id } });
    if (!account) throw new Error("Account not found");

    await db.account.delete({ where: { id: accountId } });

    if (account.isDefault) {
      const nextAccount = await db.account.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });
      if (nextAccount) {
        await db.account.update({ where: { id: nextAccount.id }, data: { isDefault: true } });
      }
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function exportTransactionsCSV(accountId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    const account = await db.account.findFirst({
      where: { id: accountId, userId: user.id },
      include: { transactions: { orderBy: { date: "desc" } } },
    });
    if (!account) throw new Error("Account not found");

    const header = "Date,Description,Category,Type,Amount,Status";
    const rows = account.transactions.map((t) => {
      const date = new Date(t.date).toISOString().split("T")[0];
      const desc = (t.description ?? "").replace(/,/g, ";");
      const amount =
        t.amount && typeof t.amount === "object" && "toNumber" in t.amount
          ? (t.amount as { toNumber: () => number }).toNumber()
          : Number(t.amount);
      return `${date},"${desc}",${t.category},${t.type},${amount.toFixed(2)},${t.status}`;
    });

    const csv = [header, ...rows].join("\n");
    return { success: true, data: csv, accountName: account.name };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}