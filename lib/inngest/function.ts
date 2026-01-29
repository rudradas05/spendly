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
  }
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
          : errorWithCode?.message ?? "Unknown error";

      if (errorWithCode?.code === "P2025") {
        console.warn(`User already deleted for Clerk ID: ${data.id}`);
      } else {
        console.error("Error deleting user:", message);
      }
    }
  }
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
          1
        );
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
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
  }
);

function isNewMonth(lastAlertDate: Date, currentDate: Date) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}
