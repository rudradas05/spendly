"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Download, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  updateAccount,
  deleteAccount,
  exportTransactionsCSV,
} from "@/actions/account";
import useFetch from "@/hooks/use-fetch";

interface AccountActionsProps {
  accountId: string;
  accountName: string;
  accountType: "CURRENT" | "SAVINGS";
  minBalance: number;
}

export function AccountActions({
  accountId,
  accountName,
  accountType,
  minBalance,
}: AccountActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Edit form state
  const [name, setName] = useState(accountName);
  const [type, setType] = useState<"CURRENT" | "SAVINGS">(accountType);
  const [minBal, setMinBal] = useState(
    minBalance > 0 ? minBalance.toString() : "",
  );

  // Reset edit state when drawer opens
  useEffect(() => {
    if (editOpen) {
      setName(accountName);
      setType(accountType);
      setMinBal(minBalance > 0 ? minBalance.toString() : "");
    }
  }, [editOpen, accountName, accountType, minBalance]);

  const { loading: updateLoading, fn: updateFn } = useFetch(updateAccount);

  const { loading: deleteLoading, fn: deleteFn } = useFetch(deleteAccount);

  const { loading: exportLoading, fn: exportFn } = useFetch(
    exportTransactionsCSV,
  );

  const handleUpdate = async () => {
    const result = await updateFn(accountId, {
      name: name.trim(),
      type,
      minBalance: minBal || "0",
    });
    if (result?.success) {
      toast.success("Account updated");
      setEditOpen(false);
      router.refresh();
    } else {
      toast.error(result?.error || "Failed to update");
    }
  };

  const handleDelete = async () => {
    const result = await deleteFn(accountId);
    if (result?.success) {
      toast.success("Account deleted");
      setDeleteOpen(false);
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error(result?.error || "Failed to delete");
    }
  };

  const handleExport = async () => {
    const result = await exportFn(accountId);
    if (result?.success && result.data) {
      const blob = new Blob([result.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.accountName || "transactions"}-export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } else {
      toast.error(result?.error || "Failed to export");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Export CSV */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={exportLoading}
        className="gap-2 transition-all hover:scale-[1.02]"
      >
        {exportLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export
      </Button>

      {/* Edit Account */}
      <Drawer open={editOpen} onOpenChange={setEditOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 transition-all hover:scale-[1.02]"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </DrawerTrigger>
        <DrawerContent className="border-white/70 bg-white/90 backdrop-blur-xl shadow-[0_35px_90px_-60px_rgba(15,23,42,0.6)] data-[vaul-drawer-direction=bottom]:left-1/2 data-[vaul-drawer-direction=bottom]:right-auto data-[vaul-drawer-direction=bottom]:w-[min(560px,94vw)] data-[vaul-drawer-direction=bottom]:-translate-x-1/2 data-[vaul-drawer-direction=bottom]:rounded-3xl data-[vaul-drawer-direction=bottom]:border data-[vaul-drawer-direction=bottom]:mb-6">
          <DrawerHeader className="px-6 pt-6">
            <DrawerTitle>Edit account</DrawerTitle>
            <DrawerDescription>
              Update the details of your account.
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-5 px-6 pb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium">Account name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Main Checking"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Account type</label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as "CURRENT" | "SAVINGS")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Minimum balance alert
              </label>
              <Input
                type="number"
                step="0.01"
                value={minBal}
                onChange={(e) => setMinBal(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                onClick={handleUpdate}
                disabled={updateLoading || !name.trim()}
                className="flex-1"
              >
                {updateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete Account */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-rose-200 text-rose-600 transition-all hover:scale-[1.02] hover:bg-rose-50 hover:text-rose-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md rounded-2xl border-white/70 dark:border-slate-700/70 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
            <DialogTitle className="text-center">Delete account</DialogTitle>
            <DialogDescription className="text-center">
              This will permanently delete{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {accountName}
              </span>{" "}
              and all its transactions. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-1">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Type <span className="font-semibold">{accountName}</span> to
                confirm
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={accountName}
                className="border-rose-200 focus-visible:ring-rose-400"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading || confirmText !== accountName}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete permanently"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
