"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { toNumber, getErrorMessage } from "@/lib/serialize";
import { Goal } from "@prisma/client";

// Get all goals for the current user
export async function getUserGoals() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const goals = await db.goal.findMany({
      where: { userId: user.id },
      orderBy: [{ status: "asc" }, { deadline: "asc" }],
    });

    return {
      success: true,
      data: goals.map((goal) => ({
        ...goal,
        targetAmount: toNumber(goal.targetAmount),
        currentAmount: toNumber(goal.currentAmount),
      })),
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Create a new goal
export async function createGoal(data: {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: Date;
  color?: string;
  icon?: string;
  category?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const goal = await db.goal.create({
      data: {
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        deadline: data.deadline,
        color: data.color || "#10b981",
        icon: data.icon || "target",
        category: data.category,
        userId: user.id,
      },
    });

    revalidatePath("/goals");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        ...goal,
        targetAmount: toNumber(goal.targetAmount),
        currentAmount: toNumber(goal.currentAmount),
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Update a goal
export async function updateGoal(
  goalId: string,
  data: {
    name?: string;
    targetAmount?: number;
    currentAmount?: number;
    deadline?: Date | null;
    color?: string;
    icon?: string;
    category?: string | null;
    status?: "ACTIVE" | "COMPLETED" | "CANCELLED";
  },
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    // Verify goal ownership
    const existingGoal = await db.goal.findFirst({
      where: { id: goalId, userId: user.id },
    });
    if (!existingGoal) throw new Error("Goal not found");

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.targetAmount !== undefined)
      updateData.targetAmount = data.targetAmount;
    if (data.currentAmount !== undefined)
      updateData.currentAmount = data.currentAmount;
    if (data.deadline !== undefined) updateData.deadline = data.deadline;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.status !== undefined) updateData.status = data.status;

    // Auto-complete goal if current >= target
    if (
      data.currentAmount !== undefined &&
      data.currentAmount >=
        (data.targetAmount || Number(existingGoal.targetAmount))
    ) {
      updateData.status = "COMPLETED";
    }

    const goal = await db.goal.update({
      where: { id: goalId },
      data: updateData,
    });

    revalidatePath("/goals");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        ...goal,
        targetAmount: toNumber(goal.targetAmount),
        currentAmount: toNumber(goal.currentAmount),
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Add amount to a goal
export async function addToGoal(goalId: string, amount: number) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const existingGoal = await db.goal.findFirst({
      where: { id: goalId, userId: user.id },
    });
    if (!existingGoal) throw new Error("Goal not found");

    const newCurrentAmount = Number(existingGoal.currentAmount) + amount;
    const targetAmount = Number(existingGoal.targetAmount);

    const goal = await db.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: newCurrentAmount,
        status: newCurrentAmount >= targetAmount ? "COMPLETED" : "ACTIVE",
      },
    });

    revalidatePath("/goals");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        ...goal,
        targetAmount: toNumber(goal.targetAmount),
        currentAmount: toNumber(goal.currentAmount),
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Delete a goal
export async function deleteGoal(goalId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    // Verify goal ownership
    const existingGoal = await db.goal.findFirst({
      where: { id: goalId, userId: user.id },
    });
    if (!existingGoal) throw new Error("Goal not found");

    await db.goal.delete({
      where: { id: goalId },
    });

    revalidatePath("/goals");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// Get goal summary for dashboard
export async function getGoalsSummary() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const goals = await db.goal.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { deadline: "asc" },
      take: 3,
    });

    const totalActive = await db.goal.count({
      where: { userId: user.id, status: "ACTIVE" },
    });

    const totalCompleted = await db.goal.count({
      where: { userId: user.id, status: "COMPLETED" },
    });

    return {
      success: true,
      data: {
        goals: goals.map((goal) => ({
          ...goal,
          targetAmount: toNumber(goal.targetAmount),
          currentAmount: toNumber(goal.currentAmount),
        })),
        totalActive,
        totalCompleted,
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
