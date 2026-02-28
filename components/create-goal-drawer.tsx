"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, PlusCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { createGoal } from "@/actions/goals";
import { cn } from "@/lib/utils";
import { CURRENCY_SYMBOL } from "@/lib/constants";

const goalSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  targetAmount: z.coerce.number().positive("Target must be positive"),
  currentAmount: z.coerce.number().min(0).optional(),
  deadline: z.date().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

const COLORS = [
  { label: "Emerald", value: "#10b981" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Pink", value: "#ec4899" },
  { label: "Orange", value: "#f97316" },
  { label: "Amber", value: "#f59e0b" },
];

const ICONS = [
  { label: "Target", value: "target" },
  { label: "Home", value: "home" },
  { label: "Car", value: "car" },
  { label: "Plane", value: "plane" },
  { label: "Laptop", value: "laptop" },
  { label: "Gift", value: "gift" },
  { label: "Wallet", value: "wallet" },
  { label: "Piggy Bank", value: "piggy-bank" },
];

interface CreateGoalDrawerProps {
  trigger?: React.ReactNode;
}

export function CreateGoalDrawer({ trigger }: CreateGoalDrawerProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema) as never,
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      color: "#10b981",
      icon: "target",
    },
  });

  const { loading, fn: createGoalFn } = useFetch(createGoal);

  const deadline = watch("deadline");
  const selectedColor = watch("color");
  const selectedIcon = watch("icon");

  const onSubmit = async (data: GoalFormData) => {
    const result = await createGoalFn({
      name: data.name,
      targetAmount: Number(data.targetAmount),
      currentAmount: Number(data.currentAmount) || 0,
      deadline: data.deadline,
      color: data.color,
      icon: data.icon,
    });
    if (result?.success) {
      toast.success("Goal created successfully!");
      reset();
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result?.error || "Failed to create goal");
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Create Spending Goal
            </DrawerTitle>
          </DrawerHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 p-4 pb-8"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Goal Name
              </label>
              <Input
                {...register("name")}
                placeholder="e.g., Emergency Fund, New Laptop"
                className={cn(errors.name && "border-red-500")}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Target Amount ({CURRENCY_SYMBOL})
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("targetAmount")}
                  placeholder="10000"
                  className={cn(errors.targetAmount && "border-red-500")}
                />
                {errors.targetAmount && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.targetAmount.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Starting Amount ({CURRENCY_SYMBOL})
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("currentAmount")}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Target Date (optional)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={(date) => setValue("deadline", date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Color
                </label>
                <Select
                  value={selectedColor}
                  onValueChange={(value) => setValue("color", value)}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: selectedColor }}
                      />
                      <SelectValue placeholder="Select color" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Icon</label>
                <Select
                  value={selectedIcon}
                  onValueChange={(value) => setValue("icon", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create Goal"}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
