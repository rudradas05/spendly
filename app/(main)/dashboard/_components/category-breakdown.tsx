"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CURRENCY_SYMBOL } from "@/lib/constants";

type CategoryPoint = {
  id: string;
  name: string;
  amount: number;
  color: string;
};

interface CategoryBreakdownProps {
  data: CategoryPoint[];
}

const CategoryBreakdown = ({ data }: CategoryBreakdownProps) => {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (!data.length) {
    return (
      <div className="rounded-2xl border bg-white/70 p-6 text-sm text-muted-foreground shadow-sm backdrop-blur">
        Spend in a few categories to unlock insights.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Categories
          </p>
          <h3 className="text-lg font-semibold">Expense Breakdown</h3>
        </div>
        <div className="text-xs text-muted-foreground">
          {CURRENCY_SYMBOL}
          {total.toFixed(0)}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[160px_1fr] items-center">
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
              >
                {data.map((item) => (
                  <Cell key={item.id} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  `${CURRENCY_SYMBOL}${value.toFixed(2)}`
                }
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {data.map((item) => {
            const percentage = total > 0 ? (item.amount / total) * 100 : 0;
            return (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {percentage.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBreakdown;
