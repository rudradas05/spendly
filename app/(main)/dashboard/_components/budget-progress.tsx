"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";
import { CURRENCY_SYMBOL } from "@/lib/constants";

interface BudgetProgressProps {
  initialBudget: {
    amount: number;
  } | null;
  currentExpenses: number;
}

export function BudgetProgress({
  initialBudget,
  currentExpenses,
}: BudgetProgressProps) {
  const [isEditing, setIsEditing] = useState(false);
  const initialBudgetValue = initialBudget?.amount?.toString() || "";
  const [newBudget, setNewBudget] = useState(initialBudgetValue);

  const { loading: isLoading, fn: updateBudgetFn } = useFetch(updateBudget);

  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const result = await updateBudgetFn(amount);
    if (result?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
    } else if (result) {
      toast.error(result.error || "Failed to update budget");
    }
  };

  const handleCancel = () => {
    setNewBudget(initialBudgetValue);
    setIsEditing(false);
  };

  const progressColor =
    percentUsed >= 90
      ? "bg-rose-500"
      : percentUsed >= 75
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.2),_transparent_55%)]" />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Monthly budget
          </CardTitle>
          <div className="mt-1 flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32"
                  placeholder="Enter amount"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 text-emerald-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription>
                  {initialBudget
                    ? `${CURRENCY_SYMBOL}${currentExpenses.toFixed(
                        2
                      )} of ${CURRENCY_SYMBOL}${initialBudget.amount.toFixed(
                        2
                      )} spent across all accounts`
                    : "No budget set"}
                </CardDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setNewBudget(initialBudgetValue);
                    setIsEditing(true);
                  }}
                  className="h-6 w-6"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {initialBudget && (
          <div className="space-y-2">
            <Progress value={percentUsed} extraStyles={progressColor} />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Used</span>
              <span className="font-medium text-slate-700">
                {percentUsed.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
