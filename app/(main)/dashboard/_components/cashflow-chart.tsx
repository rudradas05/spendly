"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CURRENCY_SYMBOL } from "@/lib/constants";

type CashflowPoint = {
  month: string;
  income: number;
  expense: number;
  net: number;
};

interface CashflowChartProps {
  data: CashflowPoint[];
}

const formatCurrency = (value: number) =>
  `${CURRENCY_SYMBOL}${value.toFixed(0)}`;

const CashflowChart = ({ data }: CashflowChartProps) => {
  if (!data.length) {
    return (
      <div className="rounded-2xl border bg-white/70 p-6 text-sm text-muted-foreground shadow-sm backdrop-blur">
        Add transactions to see your cashflow trend.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Cashflow
          </p>
          <h3 className="text-lg font-semibold">Income vs Expenses</h3>
        </div>
        <div className="text-xs text-muted-foreground">Last 6 months</div>
      </div>

      <div className="mt-6 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(Number(value))}
              width={72}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#0f766e"
              fill="url(#incomeGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ea580c"
              fill="url(#expenseGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashflowChart;
