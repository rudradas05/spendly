import { getAccountWithTransactions } from "@/actions/account";
import NotFound from "@/app/not-found";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import { Suspense } from "react";
import TransactionTable from "../_components/transaction-table";
import { BarLoader } from "react-spinners";
import { AccountChart } from "../_components/account-chart";


interface AccountsPageProps {
  params: Promise<{ id: string }>;
}

// ✅ apply the type to your component
const AccountsPage = async ({ params }: AccountsPageProps) => {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);
  if (!accountData) {
    NotFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5 ">
      <div className="flex gap-4 items-center justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold  gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            {CURRENCY_SYMBOL}
            {parseFloat(account.balance).toFixed(2)}
          </div>

          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>
      {/* Chart Section */}

      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* Transactions Table */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
};

export default AccountsPage;
