"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  parse,
  isValid,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCY_SYMBOL } from "@/lib/constants";

interface Transaction {
  id: string;
  amount: number;
  date: string;
  type: "INCOME" | "EXPENSE";
}

interface AccountChartProps {
  transactions: Transaction[];
}

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
} as const;

export function AccountChart({ transactions }: AccountChartProps) {
  const [dateRange, setDateRange] = useState<keyof typeof DATE_RANGES>("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    const filtered = transactions.filter((transaction) => {
      const date = new Date(transaction.date);
      return date >= startDate && date <= endOfDay(now);
    });

    const grouped = filtered.reduce<
      Record<string, { date: string; income: number; expense: number }>
    >((acc, transaction) => {
      const formattedDate = format(new Date(transaction.date), "MMM dd");
      if (!acc[formattedDate]) {
        acc[formattedDate] = { date: formattedDate, income: 0, expense: 0 };
      }
      if (transaction.type === "INCOME") {
        acc[formattedDate].income += transaction.amount;
      } else {
        acc[formattedDate].expense += transaction.amount;
      }
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => {
      const dateA = parse(a.date, "MMM dd", new Date());
      const dateB = parse(b.date, "MMM dd", new Date());
      if (!isValid(dateA) || !isValid(dateB)) return 0;
      return dateA.getTime() - dateB.getTime();
    });
  }, [transactions, dateRange]);

  const totals = useMemo(
    () =>
      filteredData.reduce(
        (acc, curr) => ({
          income: acc.income + curr.income,
          expense: acc.expense + curr.expense,
        }),
        { income: 0, expense: 0 }
      ),
    [filteredData]
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <p className="section-kicker">Transaction overview</p>
          <CardTitle className="mt-2 text-lg font-semibold">
            Income vs expenses
          </CardTitle>
        </div>

        <Select
          value={dateRange}
          onValueChange={(value) =>
            setDateRange(value as keyof typeof DATE_RANGES)
          }
        >
          <SelectTrigger className="w-[150px] border-border/60 bg-background/70">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        <div className="mb-6 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/70 px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
              Total income
            </p>
            <p className="mt-2 text-lg font-semibold text-emerald-700">
              {CURRENCY_SYMBOL}
              {totals.income.toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl border border-orange-200/70 bg-orange-50/70 px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-700">
              Total expenses
            </p>
            <p className="mt-2 text-lg font-semibold text-orange-700">
              {CURRENCY_SYMBOL}
              {totals.expense.toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Net
            </p>
            <p
              className={`mt-2 text-lg font-semibold ${
                totals.income - totals.expense >= 0
                  ? "text-emerald-700"
                  : "text-rose-600"
              }`}
            >
              {CURRENCY_SYMBOL}
              {(totals.income - totals.expense).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8" }}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8" }}
                tickFormatter={(value) => `${CURRENCY_SYMBOL}${value}`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${CURRENCY_SYMBOL}${value.toFixed(2)}`,
                  undefined,
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ color: "#64748b", fontSize: 12 }}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="url(#incomeFill)"
                radius={[10, 10, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="url(#expenseFill)"
                radius={[10, 10, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
