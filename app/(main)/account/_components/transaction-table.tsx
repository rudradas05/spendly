// "use client";

// import { useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import { format } from "date-fns";
// import { Transaction } from "@prisma/client";

// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Tooltip,
//   TooltipProvider,
//   TooltipTrigger,
//   TooltipContent,
// } from "@/components/ui/tooltip";
// import { Badge } from "@/components/ui/badge";
// import {
//   ChevronDown,
//   ChevronUp,
//   Clock,
//   Divide,
//   MoreHorizontal,
//   RefreshCw,
//   Search,
//   Trash,
//   X,
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";

// import { categoryColors } from "@/data/categories";
// import { CURRENCY_SYMBOL } from "@/lib/constants";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// const RECURRING_INTERVALS: Record<string, string> = {
//   DAILY: "Daily",
//   WEEKLY: "Weekly",
//   MONTHLY: "Monthly",
//   YEARLY: "Yearly",
// };

// interface TransactionTableProps {
//   transactions: Transaction[];
// }

// interface SortConfig {
//   field: keyof Transaction;
//   direction: "asc" | "desc";
// }

// const TransactionTable = ({ transactions }: TransactionTableProps) => {
//   const router = useRouter();
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);
//   const [sortConfig, setSortConfig] = useState<SortConfig>({
//     field: "date",
//     direction: "desc",
//   });

//   const [searchItem, setSearchItem] = useState("");
//   const [typeFilter, setTypeFilter] = useState("");
//   const [recurringFilter, setRecurringFilter] = useState("");

//   const filteredAndSortedTransactions = useMemo(() => {
//     let result = [...transactions];
//     if (searchItem) {
//       const searchLowwer = searchItem.toLowerCase();
//       result = result.filter((transactions) =>
//         transactions.description?.toLowerCase().includes(searchLowwer)
//       );
//     }
//     if (recurringFilter) {
//       result = result.filter((transactions) => {
//         if (recurringFilter === "recurring") return transactions.isRecurring;
//         return !transactions.isRecurring;
//       });
//     }

//     if (typeFilter) {
//       result = result.filter(
//         (transactions) => transactions.type === typeFilter
//       );
//     }

//     // result.sort((a, b) => {
//     //   let comparison = 0;
//     //   switch (sortConfig.field) {
//     //     case "date":
//     //       comparison = new Date(a.date) - new Date(b.date);
//     //       break;
//     //     case "amount":
//     //       comparison = new Date(a.amount) - new Date(b.amount);
//     //       break;
//     //     case "category":
//     //       comparison = a.category.localeCompare(b.category);
//     //       break;

//     //     default:
//     //       comparison = 0;
//     //   }

//     result.sort((a, b) => {
//       let comparison = 0;

//       switch (sortConfig.field) {
//         case "date":
//           comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
//           break;
//         case "amount":
//           comparison = Number(a.amount) - Number(b.amount);
//           break;
//         case "category":
//           comparison = a.category.localeCompare(b.category);
//           break;
//         default:
//           comparison = 0;
//       }

//       return sortConfig.direction === "asc" ? comparison : -comparison;
//     });
//     return result;
//   }, [transactions, searchItem, typeFilter, recurringFilter, sortConfig]);

//   const handleSort = (field: keyof Transaction) => {
//     setSortConfig((current) => ({
//       field,
//       direction:
//         current.field === field && current.direction === "asc" ? "desc" : "asc",
//     }));
//   };

//   const handleSelect = (id: string) => {
//     setSelectedIds((current) =>
//       current.includes(id)
//         ? current.filter((item) => item != id)
//         : [...current, id]
//     );
//   };
//   const handleSelectAll = () => {
//     setSelectedIds((current) =>
//       current.length === filteredAndSortedTransactions.length
//         ? []
//         : filteredAndSortedTransactions.map((t) => t.id)
//     );
//   };

//   const handleBulkDelete = () => {};

//   const handleClearFilters = () => {
//     setSearchItem("");
//     setTypeFilter("");
//     setRecurringFilter("");
//     setSelectedIds([]);
//   };

//   return (
//     <div className="space-y-4">
//       {/* filters */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1 ">
//           <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search transactions..."
//             value={searchItem}
//             onChange={(e) => setSearchItem(e.target.value)}
//             className="pl-8"
//           />
//         </div>
//         <div className="flex gap-2">
//           <Select value={typeFilter} onValueChange={setTypeFilter}>
//             <SelectTrigger>
//               <SelectValue placeholder="All Types" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="INCOME">Income</SelectItem>
//               <SelectItem value="EXPENSE">Expense</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select
//             value={recurringFilter}
//             onValueChange={(value) => setRecurringFilter(value)}
//           >
//             <SelectTrigger className="w-40">
//               <SelectValue placeholder="All Transactions" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="recurring">Recurring Only</SelectItem>
//               <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
//             </SelectContent>
//           </Select>

//           {selectedIds.length > 0 && (
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="destructive"
//                 size="sm"
//                 onClick={handleBulkDelete}
//               >
//                 <Trash className="h-4 w-4 mr-2" />
//                 Delete Selected({selectedIds.length})
//               </Button>
//             </div>
//           )}
//           {(searchItem || typeFilter || recurringFilter) && (
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={handleClearFilters}
//               title="Clear filters"
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* transactions */}
//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[50px]">
//                 <Checkbox
//                   onCheckedChange={handleSelectAll}
//                   checked={
//                     selectedIds.length ===
//                       filteredAndSortedTransactions.length &&
//                     filteredAndSortedTransactions.length > 0
//                   }
//                 />
//               </TableHead>
//               <TableHead
//                 className="cursor-pointer"
//                 onClick={() => handleSort("date")}
//               >
//                 <div className="flex items-center">
//                   Date{" "}
//                   {sortConfig.field === "date" &&
//                     (sortConfig.direction === "asc" ? (
//                       <ChevronUp className="ml-1 h-4 w-4" />
//                     ) : (
//                       <ChevronDown className="ml-1 h-4 w-4" />
//                     ))}
//                 </div>
//               </TableHead>
//               <TableHead>Description</TableHead>
//               <TableHead
//                 className="cursor-pointer"
//                 onClick={() => handleSort("category")}
//               >
//                 <div className="flex items-center">
//                   Category
//                   {sortConfig.field === "category" &&
//                     (sortConfig.direction === "asc" ? (
//                       <ChevronUp className="ml-1 h-4 w-4" />
//                     ) : (
//                       <ChevronDown className="ml-1 h-4 w-4" />
//                     ))}
//                 </div>
//               </TableHead>
//               <TableHead
//                 className="cursor-pointer"
//                 onClick={() => handleSort("amount")}
//               >
//                 <div className="flex items-center justify-end">
//                   Amount
//                   {sortConfig.field === "amount" &&
//                     (sortConfig.direction === "asc" ? (
//                       <ChevronUp className="ml-1 h-4 w-4" />
//                     ) : (
//                       <ChevronDown className="ml-1 h-4 w-4" />
//                     ))}
//                 </div>
//               </TableHead>
//               <TableHead>Recurring</TableHead>
//               <TableHead className="w-[50px]" />
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {filteredAndSortedTransactions.length === 0 ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={7}
//                   className="text-center text-muted-foreground"
//                 >
//                   No Transactions Found
//                 </TableCell>
//               </TableRow>
//             ) : (
//               filteredAndSortedTransactions.map((transaction) => (
//                 <TableRow key={transaction.id}>
//                   <TableCell className="font-medium">
//                     <Checkbox
//                       onCheckedChange={() => handleSelect(transaction.id)}
//                       checked={selectedIds.includes(transaction.id)}
//                     />
//                   </TableCell>
//                   <TableCell>
//                     {format(new Date(transaction.date), "PP")}
//                   </TableCell>
//                   <TableCell>{transaction.description}</TableCell>
//                   <TableCell className="capitalize">
//                     <span
//                       className={`px-2 py-1 rounded text-white text-sm`}
//                       style={{
//                         backgroundColor: categoryColors[transaction.category],
//                       }}
//                     >
//                       {transaction.category}
//                     </span>
//                   </TableCell>
//                   <TableCell
//                     className="text-right font-medium"
//                     style={{
//                       color: transaction.type === "EXPENSE" ? "red" : "green",
//                     }}
//                   >
//                     {transaction.type === "EXPENSE" ? "-" : "+"}
//                     {CURRENCY_SYMBOL}
//                     {Number(transaction.amount).toFixed(2)}
//                   </TableCell>
//                   <TableCell>
//                     {transaction.isRecurring ? (
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <Badge
//                               variant="outline"
//                               className="gap-1 bg-purple-400 hover:bg-purple-200"
//                             >
//                               <RefreshCw className="h-3 w-3" />
//                               {
//                                 RECURRING_INTERVALS[
//                                   transaction.recurringInterval ?? ""
//                                 ]
//                               }
//                             </Badge>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <div className="text-sm">
//                               <div className="font-medium">Next Date:</div>
//                               <div>
//                                 {transaction.nextRecurringDate
//                                   ? format(
//                                       new Date(transaction.nextRecurringDate),
//                                       "PP"
//                                     )
//                                   : "N/A"}
//                               </div>
//                             </div>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                     ) : (
//                       <Badge variant="outline" className="gap-1">
//                         <Clock className="h-3 w-3" />
//                         One-time
//                       </Badge>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" className="h-8 w-8 p-0">
//                           <MoreHorizontal className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent>
//                         <DropdownMenuLabel
//                           onClick={() =>
//                             router.push(
//                               `/transaction/create?edit=${transaction.id}`
//                             )
//                           }
//                         >
//                           Edit
//                         </DropdownMenuLabel>
//                         <DropdownMenuSeparator />
//                         <DropdownMenuItem>Delete</DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// };

// export default TransactionTable;

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import { format } from "date-fns";
// import { Transaction } from "@prisma/client";

// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Tooltip,
//   TooltipProvider,
//   TooltipTrigger,
//   TooltipContent,
// } from "@/components/ui/tooltip";
// import { Badge } from "@/components/ui/badge";
// import {
//   ChevronDown,
//   ChevronUp,
//   Clock,
//   MoreHorizontal,
//   RefreshCw,
//   Search,
//   Trash,
//   X,
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";

// import { categoryColors } from "@/data/categories";
// import { CURRENCY_SYMBOL } from "@/lib/constants";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import useFetch from "@/hooks/use-fetch";
// import { bulkDeleteTransactions } from "@/actions/account";
// import { toast } from "sonner";
// import { BarLoader } from "react-spinners";

// const RECURRING_INTERVALS: Record<string, string> = {
//   DAILY: "Daily",
//   WEEKLY: "Weekly",
//   MONTHLY: "Monthly",
//   YEARLY: "Yearly",
// };

// interface TransactionTableProps {
//   transactions: Transaction[];
// }

// interface SortConfig {
//   field: keyof Transaction;
//   direction: "asc" | "desc";
// }

// const TransactionTable = ({ transactions }: TransactionTableProps) => {
//   const router = useRouter();
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);
//   const [sortConfig, setSortConfig] = useState<SortConfig>({
//     field: "date",
//     direction: "desc",
//   });

//   const [searchItem, setSearchItem] = useState("");
//   const [typeFilter, setTypeFilter] = useState("");
//   const [recurringFilter, setRecurringFilter] = useState("");

//   const {
//     loading: deleteLoading,
//     fn: deleteFn,
//     data: deleted,
//   } = useFetch(bulkDeleteTransactions);

//   const filteredAndSortedTransactions = useMemo(() => {
//     let result = [...transactions];

//     if (searchItem) {
//       const searchLower = searchItem.toLowerCase();
//       result = result.filter((t) =>
//         t.description?.toLowerCase().includes(searchLower)
//       );
//     }

//     if (recurringFilter) {
//       result = result.filter((t) =>
//         recurringFilter === "recurring" ? t.isRecurring : !t.isRecurring
//       );
//     }

//     if (typeFilter) {
//       result = result.filter((t) => t.type === typeFilter);
//     }

//     result.sort((a, b) => {
//       let comparison = 0;

//       switch (sortConfig.field) {
//         case "date":
//           comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
//           break;
//         case "amount":
//           comparison = Number(a.amount) - Number(b.amount);
//           break;
//         case "category":
//           comparison = a.category.localeCompare(b.category);
//           break;
//         default:
//           comparison = 0;
//       }

//       return sortConfig.direction === "asc" ? comparison : -comparison;
//     });

//     return result;
//   }, [transactions, searchItem, typeFilter, recurringFilter, sortConfig]);

//   const handleSort = (field: keyof Transaction) => {
//     setSortConfig((current) => ({
//       field,
//       direction:
//         current.field === field && current.direction === "asc" ? "desc" : "asc",
//     }));
//   };

//   const handleSelect = (id: string) => {
//     setSelectedIds((current) =>
//       current.includes(id)
//         ? current.filter((item) => item !== id)
//         : [...current, id]
//     );
//   };

//   const handleSelectAll = () => {
//     setSelectedIds((current) =>
//       current.length === filteredAndSortedTransactions.length
//         ? []
//         : filteredAndSortedTransactions.map((t) => t.id)
//     );
//   };

//   const handleBulkDelete = async () => {
//     if (
//       window.confirm(
//         `Are you sure you want to delete ${selectedIds.length} transactions ?`
//       )
//     ) {
//       return;
//     }
//     deleteFn(selectedIds);
//   };

//   useEffect(() => {
//     if (deleted && !deleteLoading) {
//       toast.error("Transactions delete succesfully");
//     }
//   }, [deleted, deleteLoading]);

//   const handleClearFilters = () => {
//     setSearchItem("");
//     setTypeFilter("");
//     setRecurringFilter("");
//     setSelectedIds([]);
//   };

//   return (
//     <div className="space-y-4">
//       {deleteLoading && (
//         <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
//       )}{" "}
//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search transactions..."
//             value={searchItem}
//             onChange={(e) => setSearchItem(e.target.value)}
//             className="pl-8"
//           />
//         </div>

//         <div className="flex gap-2">
//           <Select value={typeFilter} onValueChange={setTypeFilter}>
//             <SelectTrigger>
//               <SelectValue placeholder="All Types" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="INCOME">Income</SelectItem>
//               <SelectItem value="EXPENSE">Expense</SelectItem>
//             </SelectContent>
//           </Select>

//           <Select
//             value={recurringFilter}
//             onValueChange={(value) => setRecurringFilter(value)}
//           >
//             <SelectTrigger className="w-40">
//               <SelectValue placeholder="All Transactions" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="recurring">Recurring Only</SelectItem>
//               <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
//             </SelectContent>
//           </Select>

//           {selectedIds.length > 0 && (
//             <Button
//               variant="destructive"
//               size="sm"
//               onClick={handleBulkDelete}
//               className="flex items-center gap-2"
//             >
//               <Trash className="h-4 w-4" />
//               Delete Selected ({selectedIds.length})
//             </Button>
//           )}

//           {(searchItem || typeFilter || recurringFilter) && (
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={handleClearFilters}
//               title="Clear filters"
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           )}
//         </div>
//       </div>
//       {/* Transactions Table */}
//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[50px]">
//                 <Checkbox
//                   onCheckedChange={handleSelectAll}
//                   checked={
//                     selectedIds.length ===
//                       filteredAndSortedTransactions.length &&
//                     filteredAndSortedTransactions.length > 0
//                   }
//                 />
//               </TableHead>

//               {[
//                 { label: "Date", key: "date" },
//                 { label: "Description", key: "description" },
//                 { label: "Category", key: "category" },
//                 { label: "Amount", key: "amount" },
//               ].map(({ label, key }) => (
//                 <TableHead
//                   key={key}
//                   className={`${
//                     key !== "description"
//                       ? "cursor-pointer hover:text-primary"
//                       : ""
//                   } ${key === "amount" ? "text-right" : ""} transition-colors`}
//                   onClick={
//                     key !== "description"
//                       ? () => handleSort(key as keyof Transaction)
//                       : undefined
//                   }
//                 >
//                   <div
//                     className={`flex items-center ${
//                       key === "amount" ? "justify-end" : ""
//                     }`}
//                   >
//                     {label}
//                     {sortConfig.field === key &&
//                       (sortConfig.direction === "asc" ? (
//                         <ChevronUp className="ml-1 h-4 w-4" />
//                       ) : (
//                         <ChevronDown className="ml-1 h-4 w-4" />
//                       ))}
//                   </div>
//                 </TableHead>
//               ))}

//               <TableHead>Recurring</TableHead>
//               <TableHead className="w-[50px]" />
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {filteredAndSortedTransactions.length === 0 ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={7}
//                   className="text-center text-muted-foreground"
//                 >
//                   No Transactions Found
//                 </TableCell>
//               </TableRow>
//             ) : (
//               filteredAndSortedTransactions.map((transaction) => (
//                 <TableRow
//                   key={transaction.id}
//                   className="hover:bg-muted/50 transition-colors cursor-pointer"
//                 >
//                   <TableCell>
//                     <Checkbox
//                       onCheckedChange={() => handleSelect(transaction.id)}
//                       checked={selectedIds.includes(transaction.id)}
//                     />
//                   </TableCell>

//                   <TableCell>
//                     {format(new Date(transaction.date), "PP")}
//                   </TableCell>

//                   <TableCell>{transaction.description}</TableCell>

//                   <TableCell className="capitalize">
//                     {/* eslint-disable-next-line react/no-inline-styles */}
//                     <span
//                       className="px-2 py-1 rounded text-white text-sm transition-transform hover:scale-105"
//                       style={{
//                         backgroundColor:
//                           categoryColors[transaction.category] ?? "#6b7280",
//                       }}
//                     >
//                       {transaction.category}
//                     </span>
//                   </TableCell>

//                   <TableCell
//                     className="text-right font-medium"
//                     style={{
//                       color: transaction.type === "EXPENSE" ? "red" : "green",
//                     }}
//                   >
//                     {transaction.type === "EXPENSE" ? "-" : "+"}
//                     {CURRENCY_SYMBOL}
//                     {Number(transaction.amount).toFixed(2)}
//                   </TableCell>

//                   <TableCell>
//                     {transaction.isRecurring ? (
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <Badge
//                               variant="outline"
//                               className="gap-1 bg-purple-400 hover:bg-purple-300 cursor-pointer transition-colors"
//                             >
//                               <RefreshCw className="h-3 w-3" />
//                               {
//                                 RECURRING_INTERVALS[
//                                   transaction.recurringInterval ?? ""
//                                 ]
//                               }
//                             </Badge>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <div className="text-sm">
//                               <div className="font-medium">Next Date:</div>
//                               <div>
//                                 {transaction.nextRecurringDate
//                                   ? format(
//                                       new Date(transaction.nextRecurringDate),
//                                       "PP"
//                                     )
//                                   : "N/A"}
//                               </div>
//                             </div>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                     ) : (
//                       <Badge
//                         variant="outline"
//                         className="gap-1 cursor-pointer hover:bg-muted/80 transition-colors"
//                       >
//                         <Clock className="h-3 w-3" />
//                         One-time
//                       </Badge>
//                     )}
//                   </TableCell>

//                   <TableCell>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button
//                           variant="ghost"
//                           className="h-8 w-8 p-0 hover:bg-muted transition-colors"
//                         >
//                           <MoreHorizontal className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent>
//                         <DropdownMenuLabel
//                           onClick={() =>
//                             router.push(
//                               `/transaction/create?edit=${transaction.id}`
//                             )
//                           }
//                           className="cursor-pointer"
//                         >
//                           Edit
//                         </DropdownMenuLabel>
//                         <DropdownMenuSeparator />
//                         <DropdownMenuItem
//                           className="cursor-pointer text-destructive"
//                           onClick={() => deleteFn([transaction.id])}
//                         >
//                           Delete
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// };

// export default TransactionTable;

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import { format } from "date-fns";
// import { Transaction } from "@prisma/client";

// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Tooltip,
//   TooltipProvider,
//   TooltipTrigger,
//   TooltipContent,
// } from "@/components/ui/tooltip";
// import { Badge } from "@/components/ui/badge";
// import {
//   ChevronDown,
//   ChevronUp,
//   Clock,
//   MoreHorizontal,
//   RefreshCw,
//   Search,
//   Trash,
//   X,
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";

// import { categoryColors } from "@/data/categories";
// import { CURRENCY_SYMBOL } from "@/lib/constants";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import useFetch from "@/hooks/use-fetch";
// import { bulkDeleteTransactions } from "@/actions/account";
// import { toast } from "sonner";
// import { BarLoader } from "react-spinners";

// const RECURRING_INTERVALS: Record<string, string> = {
//   DAILY: "Daily",
//   WEEKLY: "Weekly",
//   MONTHLY: "Monthly",
//   YEARLY: "Yearly",
// };

// interface TransactionTableProps {
//   transactions: Transaction[];
// }

// interface SortConfig {
//   field: keyof Transaction;
//   direction: "asc" | "desc";
// }

// const TransactionTable = ({ transactions }: TransactionTableProps) => {
//   const router = useRouter();
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);
//   const [sortConfig, setSortConfig] = useState<SortConfig>({
//     field: "date",
//     direction: "desc",
//   });

//   const [searchItem, setSearchItem] = useState("");
//   const [typeFilter, setTypeFilter] = useState("");
//   const [recurringFilter, setRecurringFilter] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   const {
//     loading: deleteLoading,
//     fn: deleteFn,
//     data: deleted,
//   } = useFetch(bulkDeleteTransactions);

//   const filteredAndSortedTransactions = useMemo(() => {
//     let result = [...transactions];

//     if (searchItem) {
//       const searchLower = searchItem.toLowerCase();
//       result = result.filter((t) =>
//         t.description?.toLowerCase().includes(searchLower)
//       );
//     }

//     if (recurringFilter) {
//       result = result.filter((t) =>
//         recurringFilter === "recurring" ? t.isRecurring : !t.isRecurring
//       );
//     }

//     if (typeFilter) {
//       result = result.filter((t) => t.type === typeFilter);
//     }

//     result.sort((a, b) => {
//       let comparison = 0;

//       switch (sortConfig.field) {
//         case "date":
//           comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
//           break;
//         case "amount":
//           comparison = Number(a.amount) - Number(b.amount);
//           break;
//         case "category":
//           comparison = a.category.localeCompare(b.category);
//           break;
//         default:
//           comparison = 0;
//       }

//       return sortConfig.direction === "asc" ? comparison : -comparison;
//     });

//     return result;
//   }, [transactions, searchItem, typeFilter, recurringFilter, sortConfig]);

//   const totalPages = Math.ceil(
//     filteredAndSortedTransactions.length / ITEMS_PER_PAGE
//   );
//   const paginatedTransactions = useMemo(() => {
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     return filteredAndSortedTransactions.slice(
//       startIndex,
//       startIndex + ITEMS_PER_PAGE
//     );
//   }, [filteredAndSortedTransactions, currentPage]);

//   const handleSort = (field: keyof Transaction) => {
//     setSortConfig((current) => ({
//       field,
//       direction:
//         current.field === field && current.direction === "asc" ? "desc" : "asc",
//     }));
//   };

//   const handleSelect = (id: string) => {
//     setSelectedIds((current) =>
//       current.includes(id)
//         ? current.filter((item) => item !== id)
//         : [...current, id]
//     );
//   };

//   const handleSelectAll = () => {
//     setSelectedIds((current) =>
//       current.length === filteredAndSortedTransactions.length
//         ? []
//         : filteredAndSortedTransactions.map((t) => t.id)
//     );
//   };

//   const handleBulkDelete = async () => {
//     const confirmed = window.confirm(
//       `Are you sure you want to delete ${selectedIds.length} transaction(s)?`
//     );
//     if (!confirmed) return;

//     await deleteFn(selectedIds);
//   };

//   useEffect(() => {
//     if (deleted && !deleteLoading) {
//       if (deleted.success) {
//         toast.success("Transactions deleted successfully");
//         setSelectedIds([]);
//         router.refresh();
//       } else {
//         toast.error(deleted.message || "Failed to delete transactions");
//       }
//     }
//   }, [deleted, deleteLoading, router]);

//   const handleClearFilters = () => {
//     setSearchItem("");
//     setTypeFilter("");
//     setRecurringFilter("");
//     setSelectedIds([]);
//   };

//   const handlePageChange = (newPage) => {
//     setCurrentPage(newPage);
//     setSelectedIds([]); // Clear selections on page change
//   };

//   return (
//     <div className="space-y-4">
//       {deleteLoading && (
//         <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
//       )}

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search transactions..."
//             value={searchItem}
//             onChange={(e) => {
//               setSearchItem(e.target.value);
//               setCurrentPage(1);
//             }}
//             className="pl-8"
//           />
//         </div>

//         <div className="flex gap-2">
//           <Select
//             value={typeFilter}
//             onValueChange={(value) => {
//               setTypeFilter(value);
//               setCurrentPage(1);
//             }}
//           >
//             <SelectTrigger className="w-[130px]">
//               <SelectValue placeholder="All Types" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="INCOME">Income</SelectItem>
//               <SelectItem value="EXPENSE">Expense</SelectItem>
//             </SelectContent>
//           </Select>

//           <Select
//             value={recurringFilter}
//             onValueChange={(value) => {
//               setRecurringFilter(value);
//               setCurrentPage(1);
//             }}
//           >
//             <SelectTrigger className="w-40">
//               <SelectValue placeholder="All Transactions" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="recurring">Recurring Only</SelectItem>
//               <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
//             </SelectContent>
//           </Select>

//           {selectedIds.length > 0 && (
//             <Button
//               variant="destructive"
//               size="sm"
//               onClick={handleBulkDelete}
//               className="flex items-center gap-2 cursor-pointer"
//               disabled={deleteLoading}
//             >
//               <Trash className="h-4 w-4" />
//               Delete Selected ({selectedIds.length})
//             </Button>
//           )}

//           {(searchItem || typeFilter || recurringFilter) && (
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={handleClearFilters}
//               title="Clear filters"
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Transactions Table */}
//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[50px]">
//                 <Checkbox
//                   onCheckedChange={handleSelectAll}
//                   checked={
//                     selectedIds.length ===
//                       filteredAndSortedTransactions.length &&
//                     filteredAndSortedTransactions.length > 0
//                   }
//                 />
//               </TableHead>

//               {[
//                 { label: "Date", key: "date" },
//                 { label: "Description", key: "description" },
//                 { label: "Category", key: "category" },
//                 { label: "Amount", key: "amount" },
//               ].map(({ label, key }) => (
//                 <TableHead
//                   key={key}
//                   className={`${
//                     key !== "description"
//                       ? "cursor-pointer hover:text-primary"
//                       : ""
//                   } ${key === "amount" ? "text-right" : ""} transition-colors`}
//                   onClick={
//                     key !== "description"
//                       ? () => handleSort(key as keyof Transaction)
//                       : undefined
//                   }
//                 >
//                   <div
//                     className={`flex items-center ${
//                       key === "amount" ? "justify-end" : ""
//                     }`}
//                   >
//                     {label}
//                     {sortConfig.field === key &&
//                       (sortConfig.direction === "asc" ? (
//                         <ChevronUp className="ml-1 h-4 w-4" />
//                       ) : (
//                         <ChevronDown className="ml-1 h-4 w-4" />
//                       ))}
//                   </div>
//                 </TableHead>
//               ))}

//               <TableHead>Recurring</TableHead>
//               <TableHead className="w-[50px]" />
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {filteredAndSortedTransactions.length === 0 ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={7}
//                   className="text-center text-muted-foreground"
//                 >
//                   No Transactions Found
//                 </TableCell>
//               </TableRow>
//             ) : (
//               filteredAndSortedTransactions.map((transaction) => (
//                 <TableRow
//                   key={transaction.id}
//                   className="hover:bg-muted/50 transition-colors cursor-pointer"
//                 >
//                   <TableCell>
//                     <Checkbox
//                       onCheckedChange={() => handleSelect(transaction.id)}
//                       checked={selectedIds.includes(transaction.id)}
//                     />
//                   </TableCell>

//                   <TableCell>
//                     {format(new Date(transaction.date), "PP")}
//                   </TableCell>

//                   <TableCell>{transaction.description}</TableCell>

//                   <TableCell className="capitalize">
//                     {/* eslint-disable-next-line react/no-inline-styles */}
//                     <span
//                       className="px-2 py-1 rounded text-white text-sm transition-transform hover:scale-105"
//                       style={{
//                         backgroundColor:
//                           categoryColors[transaction.category] ?? "#6b7280",
//                       }}
//                     >
//                       {transaction.category}
//                     </span>
//                   </TableCell>

//                   <TableCell
//                     className="text-right font-medium"
//                     style={{
//                       color: transaction.type === "EXPENSE" ? "red" : "green",
//                     }}
//                   >
//                     {transaction.type === "EXPENSE" ? "-" : "+"}
//                     {CURRENCY_SYMBOL}
//                     {Number(transaction.amount).toFixed(2)}
//                   </TableCell>

//                   <TableCell>
//                     {transaction.isRecurring ? (
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <Badge
//                               variant="outline"
//                               className="gap-1 bg-purple-400 hover:bg-purple-300 cursor-pointer transition-colors"
//                             >
//                               <RefreshCw className="h-3 w-3" />
//                               {
//                                 RECURRING_INTERVALS[
//                                   transaction.recurringInterval ?? ""
//                                 ]
//                               }
//                             </Badge>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <div className="text-sm">
//                               <div className="font-medium">Next Date:</div>
//                               <div>
//                                 {transaction.nextRecurringDate
//                                   ? format(
//                                       new Date(transaction.nextRecurringDate),
//                                       "PP"
//                                     )
//                                   : "N/A"}
//                               </div>
//                             </div>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                     ) : (
//                       <Badge
//                         variant="outline"
//                         className="gap-1 cursor-pointer hover:bg-muted/80 transition-colors"
//                       >
//                         <Clock className="h-3 w-3" />
//                         One-time
//                       </Badge>
//                     )}
//                   </TableCell>

//                   <TableCell>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button
//                           variant="ghost"
//                           className="h-8 w-8 p-0 hover:bg-muted transition-colors"
//                         >
//                           <MoreHorizontal className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent>
//                         <DropdownMenuItem
//                           onClick={() =>
//                             router.push(
//                               `/transaction/create?edit=${transaction.id}`
//                             )
//                           }
//                           className="cursor-pointer"
//                         >
//                           Edit
//                         </DropdownMenuItem>
//                         <DropdownMenuSeparator />
//                         <DropdownMenuItem
//                           className="cursor-pointer text-destructive"
//                           onClick={() => deleteFn([transaction.id])}
//                         >
//                           Delete
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// };

// export default TransactionTable;

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Transaction } from "@prisma/client";

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

interface TransactionTableProps {
  transactions: Transaction[];
}

interface SortConfig {
  field: keyof Transaction;
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

  // Filter + sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchItem) {
      const searchLower = searchItem.toLowerCase();
      result = result.filter((t) =>
        t.description?.toLowerCase().includes(searchLower)
      );
    }

    if (recurringFilter) {
      result = result.filter((t) =>
        recurringFilter === "recurring" ? t.isRecurring : !t.isRecurring
      );
    }

    if (typeFilter) {
      result = result.filter((t) => t.type === typeFilter);
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

  // Pagination logic
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

  const handleSort = (field: keyof Transaction) => {
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
        : paginatedTransactions.map((t) => t.id)
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

      {/* Filters */}
      <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchItem}
              onChange={(e) => {
                setSearchItem(e.target.value);
                setCurrentPage(1);
                setSelectedIds([]);
              }}
              className="pl-8 bg-white/80"
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
            <SelectTrigger className="w-full sm:w-[140px] bg-white/80">
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
            <SelectTrigger className="w-full sm:w-44 bg-white/80">
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

      {/* Transactions Table */}
      <div className="rounded-2xl border bg-white/70 shadow-sm overflow-hidden">
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
                      ? () => handleSort(key as keyof Transaction)
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
                  className="text-center text-muted-foreground"
                >
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
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
                      className="px-2 py-1 rounded text-white text-sm transition-transform hover:scale-105"
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
                              className="gap-1 border-emerald-200 bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100 cursor-pointer transition-colors"
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
                        className="gap-1 border-slate-200 bg-slate-100/80 text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
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
                          className="h-8 w-8 p-0 hover:bg-muted transition-colors"
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between rounded-2xl border bg-white/70 px-4 py-3 text-sm shadow-sm">
        <span className="text-muted-foreground">
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
