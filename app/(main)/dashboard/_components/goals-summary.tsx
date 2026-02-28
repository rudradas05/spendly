"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GoalCard } from "@/components/goal-card";
import { CreateGoalDrawer } from "@/components/create-goal-drawer";
import { getGoalsSummary } from "@/actions/goals";
import { CURRENCY_SYMBOL } from "@/lib/constants";

type GoalData = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date | null;
  color: string;
  icon: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
};

export function GoalsSummary() {
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [totalActive, setTotalActive] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGoals() {
      const result = await getGoalsSummary();
      if (result.success && result.data) {
        setGoals(result.data.goals as GoalData[]);
        setTotalActive(result.data.totalActive);
        setTotalCompleted(result.data.totalCompleted);
      }
      setLoading(false);
    }
    fetchGoals();
  }, []);

  if (loading) {
    return (
      <div className="surface-panel p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="surface-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-500" />
          <h3 className="font-semibold">Savings Goals</h3>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/goals" className="text-xs">
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="py-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
            <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm text-muted-foreground">No active goals yet</p>
          <div className="mt-3">
            <CreateGoalDrawer
              trigger={
                <Button variant="outline" size="sm">
                  Create your first goal
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} compact />
          ))}

          {totalActive > 3 && (
            <p className="text-center text-xs text-muted-foreground">
              +{totalActive - 3} more {totalActive - 3 === 1 ? "goal" : "goals"}
            </p>
          )}

          <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground dark:border-slate-700">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {totalActive} active
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              {totalCompleted} completed
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
