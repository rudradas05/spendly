import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface InsightsPanelProps {
  expenseChange: number | null;
  savingsRate: number | null;
  topCategory: string | null;
}

const InsightsPanel = ({
  expenseChange,
  savingsRate,
  topCategory,
}: InsightsPanelProps) => {
  const trendUp = expenseChange !== null && expenseChange > 0;
  const trendText =
    expenseChange === null
      ? "No prior data yet"
      : `${Math.abs(expenseChange).toFixed(1)}% ${
          trendUp ? "higher" : "lower"
        } than last month`;

  return (
    <div className="rounded-2xl border bg-white/70 p-6 shadow-sm backdrop-blur">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Insights
      </p>
      <h3 className="text-lg font-semibold mt-2">Financial Health</h3>

      <div className="mt-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            {trendUp ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Monthly spending trend</p>
            <p className="text-xs text-muted-foreground">{trendText}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Top expense category</p>
            <p className="text-xs text-muted-foreground">
              {topCategory ?? "No expenses yet"}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Savings rate</span>
            <span>
              {savingsRate !== null ? `${savingsRate.toFixed(0)}%` : "N/A"}
            </span>
          </div>
          <Progress value={savingsRate ?? 0} />
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
