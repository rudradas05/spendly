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
      <div className="surface-panel p-6 text-sm text-muted-foreground">
        Spend in a few categories to unlock insights.
      </div>
    );
  }

  return (
    <div className="surface-panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-kicker">Categories</p>
          <h3 className="text-lg font-semibold">Expense breakdown</h3>
        </div>
        <div className="text-xs text-muted-foreground">
          {CURRENCY_SYMBOL}
          {total.toFixed(0)}
        </div>
      </div>

      <div className="mt-6 grid items-center gap-4 lg:grid-cols-[180px_1fr]">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                innerRadius={55}
                outerRadius={80}
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
