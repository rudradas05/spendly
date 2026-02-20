"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { categoryColors } from "@/data/categories";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useFetch from "@/hooks/use-fetch";
import { bulkDeleteTransactions } from "@/actions/account";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

const ITEMS_PER_PAGE = 10;

const RECURRING_INTERVALS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

type TransactionRow = {
  id: string;
  amount: number;
  description: string | null;
  category: string;
  type: "INCOME" | "EXPENSE";
  date: Date | string;
  isRecurring: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
  nextRecurringDate?: Date | string | null;
};

interface TransactionTableProps {
  transactions: TransactionRow[];
}

interface SortConfig {
  field: keyof TransactionRow;
  direction: "asc" | "desc";
}

const TransactionTable = ({ transactions }: TransactionTableProps) => {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "date",
    direction: "desc",
  });

  const [searchItem, setSearchItem] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { loading: deleteLoading, fn: deleteFn } =
    useFetch(bulkDeleteTransactions);

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchItem) {
      const searchLower = searchItem.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower)
      );
    }

    if (recurringFilter) {
      result = result.filter((transaction) =>
        recurringFilter === "recurring"
          ? transaction.isRecurring
          : !transaction.isRecurring
      );
    }

    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = Number(a.amount) - Number(b.amount);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchItem, typeFilter, recurringFilter, sortConfig]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedTransactions, safePage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    setSelectedIds([]);
  };

  const handleSort = (field: keyof TransactionRow) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((transaction) => transaction.id)
    );
  };

  const handleBulkDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} transaction(s)?`
    );
    if (!confirmed) return;
    const result = await deleteFn(selectedIds);
    if (result?.success) {
      toast.success("Transactions deleted successfully");
      setSelectedIds([]);
      router.refresh();
    } else if (result) {
      toast.error(result.message || "Failed to delete transactions");
    }
  };

  const handleClearFilters = () => {
    setSearchItem("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {deleteLoading && (
        <BarLoader className="mt-4" width="100%" color="#14b8a6" />
      )}

      <div className="surface-panel p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchItem}
              onChange={(event) => {
                setSearchItem(event.target.value);
                setCurrentPage(1);
                setSelectedIds([]);
              }}
              className="bg-background/70 pl-8"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
                setCurrentPage(1);
                setSelectedIds([]);
              }}
            >
            <SelectTrigger className="w-full border-border/60 bg-background/70 sm:w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={recurringFilter}
              onValueChange={(value) => {
                setRecurringFilter(value);
                setCurrentPage(1);
                setSelectedIds([]);
              }}
            >
            <SelectTrigger className="w-full border-border/60 bg-background/70 sm:w-44">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
              <SelectContent>
                <SelectItem value="recurring">Recurring Only</SelectItem>
                <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
              </SelectContent>
            </Select>

            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="flex items-center gap-2"
                disabled={deleteLoading}
              >
                <Trash className="h-4 w-4" />
                Delete Selected ({selectedIds.length})
              </Button>
            )}

            {(searchItem || typeFilter || recurringFilter) && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleClearFilters}
                title="Clear filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="surface-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  onCheckedChange={handleSelectAll}
                  checked={
                    selectedIds.length === paginatedTransactions.length &&
                    paginatedTransactions.length > 0
                  }
                />
              </TableHead>

              {[
                { label: "Date", key: "date" },
                { label: "Description", key: "description" },
                { label: "Category", key: "category" },
                { label: "Amount", key: "amount" },
              ].map(({ label, key }) => (
                <TableHead
                  key={key}
                  className={`${
                    key !== "description"
                      ? "cursor-pointer hover:text-primary"
                      : ""
                  } ${key === "amount" ? "text-right" : ""} transition-colors`}
                  onClick={
                    key !== "description"
                      ? () => handleSort(key as keyof TransactionRow)
                      : undefined
                  }
                >
                  <div
                    className={`flex items-center ${
                      key === "amount" ? "justify-end" : ""
                    }`}
                  >
                    {label}
                    {sortConfig.field === key &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
              ))}
              <TableHead>Recurring</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Search className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      {searchItem || typeFilter || recurringFilter
                        ? "No transactions match your filters"
                        : "No transactions yet. Add one to start tracking."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                className="cursor-pointer transition-colors hover:bg-white/70"
                onClick={() =>
                  router.push(`/transaction/create?edit=${transaction.id}`)
                }
                >
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      onCheckedChange={() => handleSelect(transaction.id)}
                      checked={selectedIds.includes(transaction.id)}
                    />
                  </TableCell>

                  <TableCell>
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>

                  <TableCell>{transaction.description}</TableCell>

                  <TableCell className="capitalize">
                    <span
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-white shadow-sm transition-transform hover:scale-[1.03]"
                      style={{
                        backgroundColor:
                          categoryColors[transaction.category] ?? "#6b7280",
                      }}
                    >
                      {transaction.category}
                    </span>
                  </TableCell>

                  <TableCell
                    className={`text-right font-medium ${
                      transaction.type === "EXPENSE"
                        ? "text-rose-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}
                    {CURRENCY_SYMBOL}
                    {Number(transaction.amount).toFixed(2)}
                  </TableCell>

                  <TableCell>
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="gap-1 border-emerald-200 bg-emerald-100/80 text-emerald-700"
                            >
                              <RefreshCw className="h-3 w-3" />
                              {
                                RECURRING_INTERVALS[
                                  transaction.recurringInterval ?? ""
                                ]
                              }
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-medium">Next Date:</div>
                              <div>
                                {transaction.nextRecurringDate
                                  ? format(
                                      new Date(transaction.nextRecurringDate),
                                      "PP"
                                    )
                                  : "N/A"}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 border-slate-200 bg-slate-100/80 text-slate-600"
                      >
                        <Clock className="h-3 w-3" />
                        One-time
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transaction.id}`
                            )
                          }
                          className="cursor-pointer"
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive"
                          onClick={() => deleteFn([transaction.id])}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="surface-panel flex items-center justify-between px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          {filteredAndSortedTransactions.length} transaction{filteredAndSortedTransactions.length !== 1 ? "s" : ""}
          {(searchItem || typeFilter || recurringFilter) && " (filtered)"}
          {" · "}
          Page {safePage} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(safePage - 1)}
            disabled={safePage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(safePage + 1)}
            disabled={safePage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
