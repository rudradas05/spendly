import { Suspense } from "react";
import { Target, TrendingUp } from "lucide-react";
import { getUserGoals } from "@/actions/goals";
import { CreateGoalDrawer } from "@/components/create-goal-drawer";
import { GoalCard } from "@/components/goal-card";
import { Skeleton } from "@/components/ui/skeleton";

// Type for GoalCard to ensure proper typing
type GoalCardGoal = {
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

export default async function GoalsPage() {
  const result = await getUserGoals();
  const goals: GoalCardGoal[] = result.success
    ? (result.data as GoalCardGoal[]) || []
    : [];

  const activeGoals = goals.filter((g: GoalCardGoal) => g.status === "ACTIVE");
  const completedGoals = goals.filter(
    (g: GoalCardGoal) => g.status === "COMPLETED",
  );

  return (
    <div className="mx-auto max-w-6xl px-5 pb-12 pt-5">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="section-kicker">Goals</p>
          <h1 className="text-3xl font-semibold md:text-4xl">Spending Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your savings and financial milestones.
          </p>
        </div>
        <CreateGoalDrawer />
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="surface-panel flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
            <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{activeGoals.length}</p>
            <p className="text-sm text-muted-foreground">Active goals</p>
          </div>
        </div>
        <div className="surface-panel flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50">
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{completedGoals.length}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
        </div>
        <div className="surface-panel flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/50">
            <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{goals.length}</p>
            <p className="text-sm text-muted-foreground">Total goals</p>
          </div>
        </div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Active Goals</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
            Completed Goals
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="surface-panel py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/50">
            <Target className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold">No goals yet</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            Start tracking your financial milestones by creating your first
            goal.
          </p>
          <div className="mt-6">
            <CreateGoalDrawer />
          </div>
        </div>
      )}
    </div>
  );
}
