"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  Car,
  Gift,
  Home,
  Laptop,
  MoreVertical,
  PiggyBank,
  Plane,
  Plus,
  Target,
  Trash2,
  Wallet,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { addToGoal, deleteGoal, updateGoal } from "@/actions/goals";
import { CURRENCY_SYMBOL } from "@/lib/constants";

interface GoalCardProps {
  goal: {
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
  compact?: boolean;
}

const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  target: Target,
  home: Home,
  car: Car,
  plane: Plane,
  laptop: Laptop,
  gift: Gift,
  wallet: Wallet,
  "piggy-bank": PiggyBank,
};

export function GoalCard({ goal, compact = false }: GoalCardProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const router = useRouter();

  const { loading: adding, fn: addFn } = useFetch(addToGoal);
  const { loading: deleting, fn: deleteFn } = useFetch(deleteGoal);
  const { loading: updating, fn: updateFn } = useFetch(updateGoal);

  const Icon = ICON_MAP[goal.icon] || Target;
  const progress = Math.min(
    (goal.currentAmount / goal.targetAmount) * 100,
    100,
  );
  const remaining = goal.targetAmount - goal.currentAmount;
  const isCompleted = goal.status === "COMPLETED" || progress >= 100;

  const handleAdd = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const result = await addFn(goal.id, value);
    if (result?.success) {
      toast.success(
        `Added ${CURRENCY_SYMBOL}${value.toLocaleString()} to goal`,
      );
      setAmount("");
      setAddOpen(false);
      router.refresh();
    } else {
      toast.error(result?.error || "Failed to add amount");
    }
  };

  const handleDelete = async () => {
    const result = await deleteFn(goal.id);
    if (result?.success) {
      toast.success("Goal deleted");
      router.refresh();
    } else {
      toast.error(result?.error || "Failed to delete goal");
    }
  };

  const handleMarkComplete = async () => {
    const result = await updateFn(goal.id, { status: "COMPLETED" });
    if (result?.success) {
      toast.success("Goal marked as complete!");
      router.refresh();
    } else {
      toast.error(result?.error || "Failed to update goal");
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-slate-50/50 p-3 dark:bg-slate-800/50">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${goal.color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color: goal.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{goal.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <Progress
              value={progress}
              className="h-1.5 flex-1"
              style={
                {
                  "--progress-color": goal.color,
                } as React.CSSProperties
              }
            />
            <span className="text-xs text-muted-foreground">
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`surface-panel p-5 transition-all hover:shadow-md ${
        isCompleted ? "opacity-75" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            <Icon className="h-6 w-6" style={{ color: goal.color }} />
          </div>
          <div>
            <h3 className="font-semibold">{goal.name}</h3>
            {goal.deadline && (
              <p className="text-xs text-muted-foreground">
                {new Date(goal.deadline) > new Date()
                  ? `Due ${formatDistanceToNow(new Date(goal.deadline), { addSuffix: true })}`
                  : `Deadline was ${format(new Date(goal.deadline), "MMM d, yyyy")}`}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isCompleted && (
              <DropdownMenuItem
                onClick={handleMarkComplete}
                disabled={updating}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark complete
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600"
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete goal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span
            className="text-2xl font-semibold"
            style={{ color: goal.color }}
          >
            {CURRENCY_SYMBOL}
            {goal.currentAmount.toLocaleString("en-IN", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
          <span className="text-sm text-muted-foreground">
            of {CURRENCY_SYMBOL}
            {goal.targetAmount.toLocaleString("en-IN", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
        <Progress
          value={progress}
          className="mt-2 h-2"
          style={
            {
              "--progress-color": goal.color,
            } as React.CSSProperties
          }
        />
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {progress.toFixed(0)}% complete
          </span>
          {!isCompleted && remaining > 0 && (
            <span className="text-muted-foreground">
              {CURRENCY_SYMBOL}
              {remaining.toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}{" "}
              to go
            </span>
          )}
          {isCompleted && (
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              Goal reached!
            </span>
          )}
        </div>
      </div>

      {!isCompleted && (
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-4 w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Progress
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to {goal.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Amount ({CURRENCY_SYMBOL})
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                {[100, 500, 1000, 5000].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(preset.toString())}
                    className="flex-1"
                  >
                    +{CURRENCY_SYMBOL}
                    {preset}
                  </Button>
                ))}
              </div>
              <Button onClick={handleAdd} disabled={adding} className="w-full">
                {adding ? "Adding..." : "Add to Goal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
