"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { parseCSV } from "@/lib/csv";
import { importTransactions } from "@/actions/import-csv";
import { getUserAccounts } from "@/actions/dashboard";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import { useEffect } from "react";

type Step = 1 | 2 | 3;

type ColumnMapping = {
  date: number;
  description: number;
  amount: number;
  type?: number;
  category?: number;
};

type AccountOption = {
  id: string;
  name: string;
  type: string;
};

export default function ImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [hasHeader, setHasHeader] = useState(true);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    date: 0,
    description: 1,
    amount: 2,
  });
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    errors: number;
    totalRows: number;
  } | null>(null);

  const { loading: importing, fn: importFn } = useFetch(importTransactions);

  // Fetch accounts on mount
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const accountList = await getUserAccounts();
        setAccounts(accountList || []);
        if (accountList && accountList.length > 0) {
          const defaultAccount =
            accountList.find((a) => a.isDefault) || accountList[0];
          setSelectedAccountId(defaultAccount.id);
        }
      } catch (error) {
        toast.error("Failed to load accounts");
      }
    }
    fetchAccounts();
  }, []);

  // Smart column detection based on header names
  const detectColumns = useCallback((headers: string[]) => {
    const mapping: ColumnMapping = { date: -1, description: -1, amount: -1 };

    headers.forEach((header, index) => {
      const h = header.toLowerCase();
      if (h.includes("date") || h.includes("time")) {
        mapping.date = index;
      }
      if (
        h.includes("desc") ||
        h.includes("narr") ||
        h.includes("particular") ||
        h.includes("remark")
      ) {
        mapping.description = index;
      }
      if (
        h.includes("amount") ||
        h.includes("debit") ||
        h.includes("credit") ||
        h.includes("value")
      ) {
        mapping.amount = index;
      }
      if (h.includes("type") || h.includes("dr/cr")) {
        mapping.type = index;
      }
      if (h.includes("category") || h.includes("cat")) {
        mapping.category = index;
      }
    });

    // Fallback to sequential columns if not detected
    if (mapping.date === -1) mapping.date = 0;
    if (mapping.description === -1) mapping.description = 1;
    if (mapping.amount === -1) mapping.amount = 2;

    return mapping;
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      processFile(droppedFile);
    } else {
      toast.error("Please upload a CSV file");
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        processFile(selectedFile);
      }
    },
    [],
  );

  const processFile = useCallback(
    (selectedFile: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvContent(content);
        const rows = parseCSV(content);
        setParsedRows(rows);
        setFile(selectedFile);

        // Auto-detect columns from first row (header)
        if (rows.length > 0) {
          const detected = detectColumns(rows[0]);
          setColumnMapping(detected);
        }
      };
      reader.readAsText(selectedFile);
    },
    [detectColumns],
  );

  const columnOptions = useMemo(() => {
    if (parsedRows.length === 0) return [];
    const firstRow = parsedRows[0];
    return firstRow.map((cell, index) => ({
      value: index.toString(),
      label: `Column ${index + 1} (${cell.substring(0, 20)}${cell.length > 20 ? "..." : ""})`,
    }));
  }, [parsedRows]);

  const previewRows = useMemo(() => {
    const dataRows = hasHeader ? parsedRows.slice(1) : parsedRows;
    return dataRows.slice(0, 5);
  }, [parsedRows, hasHeader]);

  const handleImport = async () => {
    if (!selectedAccountId) {
      toast.error("Please select an account");
      return;
    }

    const result = await importFn({
      accountId: selectedAccountId,
      csvContent,
      columnMapping,
      hasHeader,
      fileName: file?.name || "import.csv",
    });

    if (result?.success) {
      setImportResult({
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors,
        totalRows: parsedRows.length - (hasHeader ? 1 : 0),
      });
      setStep(3);
      toast.success(`Successfully imported ${result.imported} transactions`);
    } else {
      toast.error(result?.error || "Import failed");
    }
  };

  const resetWizard = () => {
    setStep(1);
    setFile(null);
    setCsvContent("");
    setParsedRows([]);
    setImportResult(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-5 pb-12 pt-5">
      <div className="mb-6 space-y-2">
        <p className="section-kicker">Import</p>
        <h1 className="text-3xl font-semibold md:text-4xl">
          Import transactions
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload a CSV file to bulk import transactions into your account.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all ${
                step >= s
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}
            >
              {s}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                step >= s
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-400"
              }`}
            >
              {s === 1 ? "Upload" : s === 2 ? "Map columns" : "Complete"}
            </span>
            {s < 3 && (
              <div
                className={`mx-2 h-px w-8 ${
                  step > s ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 p-12 text-center transition-colors hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-900/10 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20"
            onClick={() => document.getElementById("csv-input")?.click()}
          >
            <input
              id="csv-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-100/70 dark:border-emerald-800 dark:bg-emerald-900/50">
              <Upload className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mb-2 text-lg font-medium">
              Drag and drop your CSV file here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse files
            </p>
          </div>

          {file && (
            <div className="surface-panel p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {parsedRows.length} rows detected
                  </p>
                </div>
                <Button onClick={() => setStep(2)}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Map Columns */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Account Selection */}
          <div className="surface-panel p-4">
            <label className="mb-2 block text-sm font-medium">
              Import to account
            </label>
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Table */}
          <div className="surface-panel overflow-x-auto p-4">
            <h3 className="mb-3 text-sm font-medium">CSV Preview</h3>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {parsedRows[0]?.map((cell, i) => (
                    <th
                      key={i}
                      className="border-b px-3 py-2 text-left font-medium text-muted-foreground"
                    >
                      {cell.substring(0, 20)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.slice(0, 3).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border-b px-3 py-2">
                        {cell.substring(0, 20)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Column Mapping */}
          <div className="surface-panel p-4">
            <h3 className="mb-4 text-sm font-medium">Map columns</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Date column *
                </label>
                <Select
                  value={columnMapping.date.toString()}
                  onValueChange={(v) =>
                    setColumnMapping((prev) => ({ ...prev, date: parseInt(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columnOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Description column *
                </label>
                <Select
                  value={columnMapping.description.toString()}
                  onValueChange={(v) =>
                    setColumnMapping((prev) => ({
                      ...prev,
                      description: parseInt(v),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columnOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Amount column *
                </label>
                <Select
                  value={columnMapping.amount.toString()}
                  onValueChange={(v) =>
                    setColumnMapping((prev) => ({
                      ...prev,
                      amount: parseInt(v),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columnOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Type column (optional)
                </label>
                <Select
                  value={columnMapping.type?.toString() || "none"}
                  onValueChange={(v) =>
                    setColumnMapping((prev) => ({
                      ...prev,
                      type: v === "none" ? undefined : parseInt(v),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not mapped</SelectItem>
                    {columnOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Category column (optional)
                </label>
                <Select
                  value={columnMapping.category?.toString() || "none"}
                  onValueChange={(v) =>
                    setColumnMapping((prev) => ({
                      ...prev,
                      category: v === "none" ? undefined : parseInt(v),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not mapped</SelectItem>
                    {columnOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Switch
                checked={hasHeader}
                onCheckedChange={setHasHeader}
                id="has-header"
              />
              <label htmlFor="has-header" className="text-sm">
                First row is header
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleImport} disabled={importing}>
              {importing ? "Importing..." : "Import now"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && importResult && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="surface-panel p-4 text-center">
              <p className="text-3xl font-semibold text-emerald-500">
                {importResult.imported}
              </p>
              <p className="text-sm text-muted-foreground">Imported</p>
            </div>
            <div className="surface-panel p-4 text-center">
              <p className="text-3xl font-semibold text-slate-500 dark:text-slate-400">
                {importResult.skipped}
              </p>
              <p className="text-sm text-muted-foreground">Skipped</p>
            </div>
            <div className="surface-panel p-4 text-center">
              <p className="text-3xl font-semibold text-amber-500">
                {importResult.errors}
              </p>
              <p className="text-sm text-muted-foreground">Errors</p>
            </div>
            <div className="surface-panel p-4 text-center">
              <p className="text-3xl font-semibold">{importResult.totalRows}</p>
              <p className="text-sm text-muted-foreground">Total Rows</p>
            </div>
          </div>

          {importResult.imported > 0 && (
            <div className="surface-panel flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">Import successful!</p>
                <p className="text-sm text-muted-foreground">
                  {importResult.imported} transactions have been added to your
                  account.
                </p>
              </div>
            </div>
          )}

          {importResult.errors > 0 && (
            <div className="surface-panel flex items-center gap-4 border-amber-200 p-6 dark:border-amber-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium">Some rows had errors</p>
                <p className="text-sm text-muted-foreground">
                  {importResult.errors} rows could not be imported due to
                  invalid data.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button asChild>
              <Link href={`/account/${selectedAccountId}`}>View account</Link>
            </Button>
            <Button variant="outline" onClick={resetWizard}>
              Import another file
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
