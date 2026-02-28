import { inngest } from "./client";
import { db } from "../prisma";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";

type ClerkUserUpdatedEvent = {
  name: "clerk/user.updated";
  data: {
    id: string;
    email_addresses: {
      email_address: string;
      verification?: { status?: string };
    }[];
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
};

type ClerkUserDeletedEvent = {
  name: "clerk/user.deleted";
  data: {
    id: string;
  };
};

export const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-update" },
  { event: "clerk/user.updated" },
  async ({ event }: { event: ClerkUserUpdatedEvent }) => {
    const { data } = event;

    const email = data.email_addresses?.[0]?.email_address || "";
    const name = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();
    const imageUrl = data.image_url || "";

    await db.user.upsert({
      where: { clerkUserId: data.id },
      update: { email, name, imageUrl },
      create: { clerkUserId: data.id, email, name, imageUrl },
    });

    console.log(`Synced Clerk user update for ${data.id}`);
  },
);

export const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-delete" },
  { event: "clerk/user.deleted" },
  async ({ event }: { event: ClerkUserDeletedEvent }) => {
    const { data } = event;

    try {
      await db.user.delete({
        where: { clerkUserId: data.id },
      });
      console.log(`Deleted user for Clerk ID: ${data.id}`);
    } catch (error: unknown) {
      const errorWithCode =
        typeof error === "object" && error !== null && "code" in error
          ? (error as { code?: string; message?: string })
          : undefined;
      const message =
        error instanceof Error
          ? error.message
          : (errorWithCode?.message ?? "Unknown error");

      if (errorWithCode?.code === "P2025") {
        console.warn(`User already deleted for Clerk ID: ${data.id}`);
      } else {
        console.error("Error deleting user:", message);
      }
    }
  },
);

export const checkBudgetAlerts = inngest.createFunction(
  {
    id: "check-budget-alerts",
    name: "Check Budget Alerts",
  },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budgets", async () => {
      return await db.budget.findMany({
        include: {
          user: true,
        },
      });
    });

    for (const budget of budgets) {
      await step.run(`check-budget-${budget.id}`, async () => {
        const currentDate = new Date();

        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
        );
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
        );

        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            type: "EXPENSE",
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = expenses._sum.amount
          ? expenses._sum.amount.toNumber()
          : 0;
        const budgetAmount = Number(budget.amount);
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        if (
          percentageUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          await sendEmail({
            to: budget.user.email,
            subject: "Monthly Budget Alert",
            react: EmailTemplate({
              userName: budget.user.email,
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount,
                totalExpenses,
                accountName: "All accounts",
                dashboardUrl: "https://spendly-omega.vercel.app/dashboard",
              },
            }),
          });

          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      });
    }
  },
);

function isNewMonth(lastAlertDate: Date, currentDate: Date) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

// Monthly report email function - runs at 9 AM on the 1st of each month
export const sendMonthlyReports = inngest.createFunction(
  {
    id: "send-monthly-reports",
    name: "Send Monthly Reports",
  },
  { cron: "0 9 1 * *" },
  async ({ step }) => {
    // Fetch all users
    const users = await step.run("fetch-all-users", async () => {
      return await db.user.findMany();
    });

    for (const user of users) {
      await step.run(`process-user-${user.id}`, async () => {
        // Calculate previous month date range
        const now = new Date();
        const prevMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        );
        const prevMonthEnd = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999,
        );

        // For comparison: previous-previous month
        const prevPrevMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 2,
          1,
        );
        const prevPrevMonthEnd = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          0,
          23,
          59,
          59,
          999,
        );

        // Get month name
        const monthName = prevMonthStart.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

        // Query all transactions for the previous month
        const transactions = await db.transaction.findMany({
          where: {
            userId: user.id,
            date: {
              gte: prevMonthStart,
              lte: prevMonthEnd,
            },
          },
        });

        // Skip users with no transactions
        if (transactions.length === 0) {
          console.log(
            `No transactions for user ${user.id} in ${monthName}, skipping`,
          );
          return;
        }

        // Calculate totals
        let totalIncome = 0;
        let totalExpenses = 0;
        const categoryMap = new Map<string, number>();
        let biggestExpense: {
          description: string | null;
          amount: number;
          category: string;
          date: Date;
        } | null = null;

        for (const tx of transactions) {
          const amount = tx.amount.toNumber();
          if (tx.type === "INCOME") {
            totalIncome += amount;
          } else {
            totalExpenses += amount;
            categoryMap.set(
              tx.category,
              (categoryMap.get(tx.category) || 0) + amount,
            );

            if (!biggestExpense || amount > biggestExpense.amount) {
              biggestExpense = {
                description: tx.description,
                amount,
                category: tx.category,
                date: tx.date,
              };
            }
          }
        }

        const net = totalIncome - totalExpenses;
        const savingsRate =
          totalIncome > 0
            ? ((totalIncome - totalExpenses) / totalIncome) * 100
            : 0;

        // Group expenses by category, sort descending, take top 5
        const topCategories = Array.from(categoryMap.entries())
          .map(([name, amount]) => ({
            name,
            amount,
            percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        // Get previous-previous month expenses for comparison
        const prevPrevTransactions = await db.transaction.aggregate({
          where: {
            userId: user.id,
            type: "EXPENSE",
            date: {
              gte: prevPrevMonthStart,
              lte: prevPrevMonthEnd,
            },
          },
          _sum: { amount: true },
        });
        const prevPrevExpenses =
          prevPrevTransactions._sum.amount?.toNumber() || 0;

        // Generate insights
        const insights: string[] = [];

        // Savings rate insight
        if (savingsRate >= 20) {
          insights.push(
            `You saved ${savingsRate.toFixed(0)}% of your income — great discipline.`,
          );
        } else if (savingsRate > 0) {
          insights.push(
            `You saved ${savingsRate.toFixed(0)}% this month. Aim for 20% next month.`,
          );
        } else {
          insights.push(
            "Your expenses exceeded income this month. Review your top categories.",
          );
        }

        // Top category insight
        if (topCategories.length > 0 && topCategories[0].percentage > 40) {
          insights.push(
            `Your biggest spend category was ${topCategories[0].name} at ${topCategories[0].percentage.toFixed(0)}% of total expenses.`,
          );
        }

        // Month-over-month comparison
        if (prevPrevExpenses > 0) {
          const changePercent =
            ((totalExpenses - prevPrevExpenses) / prevPrevExpenses) * 100;
          if (changePercent < 0) {
            insights.push(
              `Your spending was ${Math.abs(changePercent).toFixed(0)}% lower than the month before.`,
            );
          } else if (changePercent > 0) {
            insights.push(
              `Your spending was ${changePercent.toFixed(0)}% higher than the month before.`,
            );
          }
        }

        // Send the email
        await sendEmail({
          to: user.email,
          subject: `Your ${monthName} Financial Report`,
          react: EmailTemplate({
            userName: user.name || user.email,
            type: "monthly-report",
            data: {
              month: monthName,
              stats: {
                totalIncome,
                totalExpenses,
                net,
                savingsRate,
              },
              topCategories,
              biggestTransaction: biggestExpense,
              insights,
            },
          }),
        });

        console.log(`Sent monthly report to ${user.email} for ${monthName}`);
      });
    }
  },
);
