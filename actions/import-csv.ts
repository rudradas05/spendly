"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/lib/serialize";
import { defaultCategories } from "@/data/categories";
import { parseCSV } from "@/lib/csv";

// Parse date from various formats
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try ISO format first
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) return isoDate;

  // Try dd/mm/yyyy
  const ddmmyyyy = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }

  // Try mm/dd/yyyy
  const mmddyyyy = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mmddyyyy) {
    const [, month, day, year] = mmddyyyy;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}

// Parse amount from string
function parseAmount(amountStr: string): number | null {
  if (!amountStr) return null;

  // Remove currency symbols and commas
  const cleaned = amountStr
    .replace(/[₹$€£¥,]/g, "")
    .replace(/\s/g, "")
    .trim();

  const amount = parseFloat(cleaned);
  if (isNaN(amount)) return null;

  return amount;
}

// Match category name to default categories
function matchCategory(categoryStr: string): string {
  if (!categoryStr) return "other-expense";

  const normalized = categoryStr.toLowerCase().trim();

  // Try exact match first
  const exact = defaultCategories.find(
    (c) => c.id === normalized || c.name.toLowerCase() === normalized,
  );
  if (exact) return exact.id;

  // Try partial match
  const partial = defaultCategories.find(
    (c) =>
      c.name.toLowerCase().includes(normalized) ||
      normalized.includes(c.name.toLowerCase()),
  );
  if (partial) return partial.id;

  return "other-expense";
}

type ColumnMapping = {
  date: number;
  description: number;
  amount: number;
  type?: number;
  category?: number;
};

type ImportTransactionsInput = {
  accountId: string;
  csvContent: string;
  columnMapping: ColumnMapping;
  hasHeader: boolean;
  fileName: string;
};

type ImportResult = {
  success: boolean;
  imported: number;
  skipped: number;
  errors: number;
  importLogId?: string;
  error?: string;
};

export async function importTransactions({
  accountId,
  csvContent,
  columnMapping,
  hasHeader,
  fileName,
}: ImportTransactionsInput): Promise<ImportResult> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    // Verify account ownership
    const account = await db.account.findFirst({
      where: { id: accountId, userId: user.id },
    });
    if (!account) throw new Error("Account not found");

    // Parse CSV
    const rows = parseCSV(csvContent);
    if (rows.length === 0) throw new Error("No data found in CSV");

    // Skip header row if needed
    const dataRows = hasHeader ? rows.slice(1) : rows;
    const totalRows = dataRows.length;

    // Process rows
    const validTransactions: {
      type: "INCOME" | "EXPENSE";
      amount: number;
      description: string;
      date: Date;
      category: string;
      accountId: string;
      userId: string;
    }[] = [];
    let skipped = 0;
    let errors = 0;

    for (const row of dataRows) {
      try {
        // Get values from mapped columns
        const dateStr = row[columnMapping.date] || "";
        const descriptionStr = row[columnMapping.description] || "";
        const amountStr = row[columnMapping.amount] || "";
        const typeStr =
          columnMapping.type !== undefined
            ? row[columnMapping.type]
            : undefined;
        const categoryStr =
          columnMapping.category !== undefined
            ? row[columnMapping.category]
            : undefined;

        // Parse date
        const date = parseDate(dateStr);
        if (!date) {
          errors++;
          continue;
        }

        // Parse amount
        const rawAmount = parseAmount(amountStr);
        if (rawAmount === null || rawAmount === 0) {
          errors++;
          continue;
        }

        // Determine transaction type
        let type: "INCOME" | "EXPENSE";
        if (typeStr) {
          const normalizedType = typeStr.toLowerCase().trim();
          type =
            normalizedType === "income" ||
            normalizedType === "credit" ||
            normalizedType === "cr"
              ? "INCOME"
              : "EXPENSE";
        } else {
          // Negative amount = expense, positive = income
          type = rawAmount < 0 ? "EXPENSE" : "INCOME";
        }

        const amount = Math.abs(rawAmount);

        // Get category
        const category = categoryStr
          ? matchCategory(categoryStr)
          : type === "INCOME"
            ? "other-income"
            : "other-expense";

        // Skip if description is empty
        if (!descriptionStr.trim()) {
          skipped++;
          continue;
        }

        validTransactions.push({
          type,
          amount,
          description: descriptionStr.trim(),
          date,
          category,
          accountId,
          userId: user.id,
        });
      } catch {
        errors++;
      }
    }

    if (validTransactions.length === 0) {
      return {
        success: false,
        imported: 0,
        skipped,
        errors,
        error: "No valid transactions found in CSV",
      };
    }

    // Calculate balance change
    const incomeSum = validTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenseSum = validTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);
    const balanceChange = incomeSum - expenseSum;

    // Execute in transaction
    const result = await db.$transaction(async (tx) => {
      // Create transactions
      await tx.transaction.createMany({
        data: validTransactions,
        skipDuplicates: true,
      });

      // Update account balance
      await tx.account.update({
        where: { id: accountId },
        data: { balance: { increment: balanceChange } },
      });

      // Create import log
      const importLog = await tx.importLog.create({
        data: {
          userId: user.id,
          accountId,
          fileName,
          totalRows,
          imported: validTransactions.length,
          skipped,
          errors,
        },
      });

      return importLog;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${accountId}`);

    return {
      success: true,
      imported: validTransactions.length,
      skipped,
      errors,
      importLogId: result.id,
    };
  } catch (error: unknown) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: 0,
      error: getErrorMessage(error),
    };
  }
}
