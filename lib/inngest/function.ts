import { inngest } from "./client";
import { db } from "../prisma";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";
import { getMonthRangeInIST } from "../utils/dateRange";

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

    console.log(`✅ Synced Clerk user update for ${data.id}`);
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
      console.log(`🗑️ Deleted user for Clerk ID: ${data.id}`);
    } catch (error: any) {
      if (error.code === "P2025") {
        console.warn(`⚠️ User already deleted for Clerk ID: ${data.id}`);
      } else {
        console.error("❌ Error deleting user:", error.message);
      }
    }
  }
);

// export const checkBudgetAlerts = inngest.createFunction(
//   { name: "Check Budget Alerts" },
//   { cron: "0 */6 * * *" },
//   async ({ step }) => {
//     const budgets = await step.run("fetch-budget", async () => {
//       return await db.budget.findMany({
//         include: {
//           user: {
//             include: {
//               accounts: {
//                 where: {
//                   isDefault: true,
//                 },
//               },
//             },
//           },
//         },
//       });
//     });

//     for (const budget of budgets) {
//       const defaultAccount = budget.user.accounts[0];
//       if (!defaultAccount) continue;
//       await step.run(`check-budget-${budget.id}`, async () => {
//         const startDate = new Date();
//         startDate.setDate(1);

//         const expenses = await db.transaction.aggregate({
//           where: {
//             userId: budget.userId,
//             accountId : defaultAccount.id,
//             type: "EXPENSE",
//             date:{
//               gte: startDate,
//             }
//           },
//           _sum:{
//             amount:true,
//           }
//         });

//         const totalExpenses = expenses._sum.amount?.toNumber() ||0;
//         const budgetAmount = budget.amount;
//         const percentageUsed = (totalExpenses/ budgetAmount)*100;

//         if(percentageUsed>=80 && (budget.lastAlertSent|| isNewMonth(new Date(budget.lastAlertSent), new Date()))){
//           await db.budget.update({
//             where:{id:budget.id},
//             data: {lastAlertSent: new Date()}
//           })
//         }
//       });
//     }
//   }
// );

// function isNewMonth(lastAlertDate, currentDate){
//   return (
//     lastAlertDate.getMonth()! == currentDate.getMonth()||
//     lastAlertDate.getFullYear()!== currentDate.getFullYear()
//   )
// }

export const checkBudgetAlerts = inngest.createFunction(
  {
    id: "check-budget-alerts", // ✅ required
    name: "Check Budget Alerts",
  },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    // ✅ Fetch budgets with related data
    const budgets = await step.run("fetch-budgets", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: { isDefault: true },
              },
            },
          },
        },
      });
    });

    // ✅ Loop through budgets
    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      const { startOfMonth, endOfMonth } = getMonthRangeInIST();

      await step.run(`check-budget-${budget.id}`, async () => {
        // const currentDate = new Date();

        // const startOfMonth = new Date(
        //   currentDate.getFullYear(),
        //   currentDate.getMonth(),
        //   1
        // );
        // const endOfMonth = new Date(
        //   currentDate.getFullYear(),
        //   currentDate.getMonth() + 1,
        //   0
        // );

        // ✅ Aggregate total expenses this month
        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: {
              // gte: startDate,
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
        const budgetAmount = Number(budget.amount); // ✅ convert to number if Prisma Decimal
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        // ✅ Check if alert should be sent
        if (
          percentageUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          // send email
          // await sendEmail({
          //   to: budget.user.email,
          //   subject: `Budget Alert for ${defaultAccount.name}`,
          //   react: EmailTemplate({
          //     userName: budget.user.email,
          //     type: "budget-alert",
          //     data: {
          //       percentageUsed,
          //       budgetAmount,
          //       totalExpenses,
          //       accountName: defaultAccount.name,
          //     },
          //   }),
          // });

          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: budget.user.email,
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount,
                totalExpenses,
                accountName: defaultAccount.name,
                dashboardUrl: `https://spendly-omega.vercel.app/dashboard`, // ✅ dynamic
              },
            }),
          });

          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });

          // Optionally send an alert here (email, push, etc.)
        }
      });
    }
  }
);

// ✅ Helper function with proper typing
function isNewMonth(lastAlertDate: Date, currentDate: Date) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}
