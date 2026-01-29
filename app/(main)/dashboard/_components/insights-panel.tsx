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
    <div className="surface-panel p-6">
      <p className="section-kicker">Insights</p>
      <h3 className="mt-2 text-lg font-semibold">Financial health</h3>

      <div className="mt-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
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
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
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
