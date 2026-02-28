"use client";

import { useState } from "react";
import AddTransactionForm from "./transaction-form";
import ReceiptScanner, { ScannedReceipt } from "@/components/receipt-scanner";
import type { Category } from "@/data/categories";

type AccountOption = {
  id: string;
  name: string;
  type: "CURRENT" | "SAVINGS";
  isDefault?: boolean;
};

interface TransactionFormData {
  id?: string;
  type: "INCOME" | "EXPENSE";
  amount: number | string;
  description?: string | null;
  accountId: string;
  category: string;
  date: Date | string;
  isRecurring: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | null;
}

interface TransactionFormWrapperProps {
  accounts: AccountOption[];
  categories: Category[];
  initialData?: TransactionFormData | null;
  forceEdit?: boolean;
  showScanner?: boolean;
}

export function TransactionFormWrapper({
  accounts,
  categories,
  initialData,
  forceEdit,
  showScanner = true,
}: TransactionFormWrapperProps) {
  const [scannedData, setScannedData] = useState<ScannedReceipt | null>(null);

  const handleScanResult = (data: ScannedReceipt) => {
    setScannedData(data);
  };

  return (
    <>
      {showScanner && !forceEdit && (
        <div className="mb-4">
          <ReceiptScanner onResult={handleScanResult} />
        </div>
      )}
      <AddTransactionForm
        accounts={accounts}
        categories={categories}
        initialData={initialData}
        forceEdit={forceEdit}
        scannedData={scannedData}
      />
    </>
  );
}

export default TransactionFormWrapper;
