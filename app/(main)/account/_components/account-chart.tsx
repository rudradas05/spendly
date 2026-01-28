// "use client";

// import { useState, useMemo } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   format,
//   subDays,
//   startOfDay,
//   endOfDay,
//   parse,
//   isValid,
// } from "date-fns";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// interface Transaction {
//   id: string;
//   amount: number;
//   date: string;
//   type: "INCOME" | "EXPENSE";
// }

// interface AccountChartProps {
//   transactions: Transaction[];
// }

// const DATE_RANGES = {
//   "7D": { label: "Last 7 Days", days: 7 },
//   "1M": { label: "Last Month", days: 30 },
//   "3M": { label: "Last 3 Months", days: 90 },
//   "6M": { label: "Last 6 Months", days: 180 },
//   ALL: { label: "All Time", days: null },
// } as const;

// export function AccountChart({ transactions }: AccountChartProps) {
//   const [dateRange, setDateRange] = useState<keyof typeof DATE_RANGES>("1M");

//   const filteredData = useMemo(() => {
//     const range = DATE_RANGES[dateRange];
//     const now = new Date();
//     const startDate = range.days
//       ? startOfDay(subDays(now, range.days))
//       : startOfDay(new Date(0));

//     // Filter transactions within range
//     const filtered = transactions.filter((t) => {
//       const date = new Date(t.date);
//       return date >= startDate && date <= endOfDay(now);
//     });

//     // Group transactions by formatted date
//     const grouped = filtered.reduce<
//       Record<string, { date: string; income: number; expense: number }>
//     >((acc, transaction) => {
//       const formattedDate = format(new Date(transaction.date), "MMM dd");
//       if (!acc[formattedDate]) {
//         acc[formattedDate] = { date: formattedDate, income: 0, expense: 0 };
//       }
//       if (transaction.type === "INCOME") {
//         acc[formattedDate].income += transaction.amount;
//       } else {
//         acc[formattedDate].expense += transaction.amount;
//       }
//       return acc;
//     }, {});

//     // Convert to array & sort chronologically
//     return Object.values(grouped).sort((a, b) => {
//       const dateA = parse(a.date, "MMM dd", new Date());
//       const dateB = parse(b.date, "MMM dd", new Date());
//       if (!isValid(dateA) || !isValid(dateB)) return 0;
//       return dateA.getTime() - dateB.getTime();
//     });
//   }, [transactions, dateRange]);

//   // Calculate totals
//   const totals = useMemo(
//     () =>
//       filteredData.reduce(
//         (acc, curr) => ({
//           income: acc.income + curr.income,
//           expense: acc.expense + curr.expense,
//         }),
//         { income: 0, expense: 0 }
//       ),
//     [filteredData]
//   );

//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
//         <CardTitle className="text-base font-normal">
//           Transaction Overview
//         </CardTitle>
//         <Select value={dateRange} onValueChange={setDateRange}>
//           <SelectTrigger className="w-[140px]">
//             <SelectValue placeholder="Select range" />
//           </SelectTrigger>
//           <SelectContent>
//             {Object.entries(DATE_RANGES).map(([key, { label }]) => (
//               <SelectItem key={key} value={key}>
//                 {label}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </CardHeader>

//       <CardContent>
//         {/* Totals Summary */}
//         <div className="flex justify-around mb-6 text-sm">
//           <div className="text-center">
//             <p className="text-muted-foreground">Total Income</p>
//             <p className="text-lg font-bold text-green-500">
//               ${totals.income.toFixed(2)}
//             </p>
//           </div>
//           <div className="text-center">
//             <p className="text-muted-foreground">Total Expenses</p>
//             <p className="text-lg font-bold text-red-500">
//               ${totals.expense.toFixed(2)}
//             </p>
//           </div>
//           <div className="text-center">
//             <p className="text-muted-foreground">Net</p>
//             <p
//               className={`text-lg font-bold ${
//                 totals.income - totals.expense >= 0
//                   ? "text-green-500"
//                   : "text-red-500"
//               }`}
//             >
//               ${(totals.income - totals.expense).toFixed(2)}
//             </p>
//           </div>
//         </div>

//         {/* Chart Section */}
//         <div className="h-[300px]">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart
//               data={filteredData}
//               margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" vertical={false} />
//               <XAxis
//                 dataKey="date"
//                 fontSize={12}
//                 tickLine={false}
//                 axisLine={false}
//               />
//               <YAxis
//                 fontSize={12}
//                 tickLine={false}
//                 axisLine={false}
//                 tickFormatter={(value) => `$${value}`}
//               />
//               <Tooltip
//                 formatter={(value: number) => [`$${value}`, undefined]}
//                 contentStyle={{
//                   backgroundColor: "hsl(var(--popover))",
//                   border: "1px solid hsl(var(--border))",
//                   borderRadius: "var(--radius)",
//                 }}
//               />
//               <Legend />
//               <Bar
//                 dataKey="income"
//                 name="Income"
//                 fill="#22c55e"
//                 radius={[4, 4, 0, 0]}
//               />
//               <Bar
//                 dataKey="expense"
//                 name="Expense"
//                 fill="#ef4444"
//                 radius={[4, 4, 0, 0]}
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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

// Define the transaction type
interface Transaction {
  id: string;
  amount: number;
  date: string;
  type: "INCOME" | "EXPENSE";
}

// Define the component props
interface AccountChartProps {
  transactions: Transaction[];
}

// Define all possible date ranges
const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
} as const;

export function AccountChart({ transactions }: AccountChartProps) {
  const [dateRange, setDateRange] = useState<keyof typeof DATE_RANGES>("1M");

  // Filter and group data by date
  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    // Filter transactions within range
    const filtered = transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= startDate && date <= endOfDay(now);
    });

    // Group transactions by formatted date
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

    // Convert grouped data into a sorted array
    return Object.values(grouped).sort((a, b) => {
      const dateA = parse(a.date, "MMM dd", new Date());
      const dateB = parse(b.date, "MMM dd", new Date());
      if (!isValid(dateA) || !isValid(dateB)) return 0;
      return dateA.getTime() - dateB.getTime();
    });
  }, [transactions, dateRange]);

  // Compute totals for the selected period
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
    <Card className="rounded-2xl border bg-white/70 shadow-sm backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Transaction overview
          </p>
          <CardTitle className="text-lg font-semibold mt-2">
            Income vs expenses
          </CardTitle>
        </div>

        <Select
          value={dateRange}
          onValueChange={(value) =>
            setDateRange(value as keyof typeof DATE_RANGES)
          }
        >
          <SelectTrigger className="w-[150px] bg-white/80 border-slate-200">
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
        <div className="grid gap-3 sm:grid-cols-3 mb-6 text-sm">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
              Total income
            </p>
            <p className="mt-2 text-lg font-semibold text-emerald-700">
              {CURRENCY_SYMBOL}
              {totals.income.toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl border border-orange-100 bg-orange-50/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-700">
              Total expenses
            </p>
            <p className="mt-2 text-lg font-semibold text-orange-700">
              {CURRENCY_SYMBOL}
              {totals.expense.toFixed(2)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3">
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
