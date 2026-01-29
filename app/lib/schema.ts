import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.string().min(1, "Initial balance is required"),
  minBalance: z
    .string()
    .optional()
    .refine(
      (val) => val === undefined || val.trim() === "" || !isNaN(Number(val)),
      { message: "Enter a valid minimum balance" }
    )
    .refine(
      (val) => val === undefined || val.trim() === "" || Number(val) >= 0,
      { message: "Minimum balance cannot be negative" }
    ),
  isDefault: z.boolean().default(false),
});

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((val) => Number(val) > 0, {
        message: "Enter a valid amount",
      }),
    description: z.string().trim().min(1, "Description is required"),
    date: z.preprocess(
      (val) => {
        if (val instanceof Date) return val;
        if (typeof val === "string" || typeof val === "number") {
          return new Date(val);
        }
        return val;
      },
      z
        .date({ message: "Date is required" })
        .refine((val) => !isNaN(val.getTime()), { message: "Invalid date" })
    ),

    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transactions",
        path: ["recurringInterval"],
      });
    }
  });
