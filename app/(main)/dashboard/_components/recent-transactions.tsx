import Link from "next/link";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type RecentTransaction = {
  id: string;
  description: string | null;
  category: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: Date;
  accountName: string;
};

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  return (
    <div className="rounded-2xl border bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Activity
          </p>
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/transaction/create">Add</Link>
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No transactions yet. Add one to start tracking.
          </p>
        ) : (
          transactions.map((transaction) => {
            const isExpense = transaction.type === "EXPENSE";
            const amount = `${isExpense ? "-" : "+"}${CURRENCY_SYMBOL}${transaction.amount.toFixed(
              2
            )}`;

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-xl border border-transparent bg-slate-50/70 px-4 py-3 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      isExpense
                        ? "bg-rose-100 text-rose-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {isExpense ? (
                      <ArrowDownRight className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {transaction.description || transaction.category}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(transaction.date), "PP")}</span>
                      <span className="text-slate-400">&middot;</span>
                      <span>{transaction.accountName}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      isExpense ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {amount}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {transaction.category}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
