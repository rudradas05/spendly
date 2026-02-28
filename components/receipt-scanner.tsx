"use client";

import { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/scan-receipt";
import { CURRENCY_SYMBOL } from "@/lib/constants";

export type ScannedReceipt = {
  amount: number;
  date: string;
  description: string;
  category: string;
  confidence: number;
};

interface ReceiptScannerProps {
  onResult: (data: ScannedReceipt) => void;
}

export function ReceiptScanner({ onResult }: ReceiptScannerProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ScannedReceipt | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const { loading, fn: scanFn } = useFetch(scanReceipt);

  const resetState = () => {
    setResult(null);
    setScanError(null);
  };

  const handleFileSelect = async (file: File) => {
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, WebP, or HEIC image");
      return;
    }

    resetState();

    // Read as base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      // Strip the data:...;base64, prefix
      const base64 = dataUrl.split(",")[1];

      const response = await scanFn({
        base64Image: base64,
        mimeType: file.type,
      });

      if (response?.success && response.data) {
        if (response.data.confidence >= 0.5) {
          setResult(response.data);
        } else {
          setScanError("Could not read receipt clearly. Try a clearer photo.");
          setResult(response.data); // Still show what we found
        }
      } else if (response && !response.success) {
        setScanError(response.error || "Failed to scan receipt");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value so same file can be selected again
    e.target.value = "";
  };

  const handleUseData = () => {
    if (result) {
      onResult(result);
      setOpen(false);
      resetState();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetState();
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-all flex items-center dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
        >
          <Camera className="h-4 w-4" />
          Scan receipt
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan a receipt</DialogTitle>
        </DialogHeader>

        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleInputChange}
        />
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          onChange={handleInputChange}
        />

        {loading ? (
          // Loading state
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            <p className="mt-4 text-sm text-muted-foreground">
              Reading your receipt...
            </p>
          </div>
        ) : result ? (
          // Result state
          <div className="space-y-4">
            {result.confidence >= 0.5 ? (
              <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-4 dark:bg-emerald-900/20 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Receipt scanned successfully
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Found: </span>
                    <span className="font-medium">
                      {result.description || "Unknown"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Amount: </span>
                    <span className="font-semibold text-lg">
                      {CURRENCY_SYMBOL}
                      {result.amount.toLocaleString()}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Category: </span>
                    <span className="capitalize">
                      {result.category.replace("-", " ")}
                    </span>
                  </p>
                  {result.date && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Date: </span>
                      <span>{new Date(result.date).toLocaleDateString()}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Confidence: {Math.round(result.confidence * 100)}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-4 dark:bg-amber-900/20 dark:border-amber-800">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Low confidence result</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {scanError ||
                    "Could not read this receipt clearly. Fill in manually or try a clearer photo."}
                </p>
                {result.amount > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">
                        Best guess - Amount:{" "}
                      </span>
                      <span>
                        {CURRENCY_SYMBOL}
                        {result.amount.toLocaleString()}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {result.confidence >= 0.5 && (
                <Button onClick={handleUseData} className="flex-1">
                  Use this data
                </Button>
              )}
              <Button variant="outline" onClick={resetState} className="flex-1">
                Try again
              </Button>
            </div>
          </div>
        ) : scanError && !result ? (
          // Error state
          <div className="space-y-4">
            <div className="rounded-xl border-2 border-red-200 bg-red-50/50 p-4 dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <X className="h-5 w-5" />
                <span className="font-medium">Scan failed</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{scanError}</p>
            </div>
            <Button variant="outline" onClick={resetState} className="w-full">
              Try again
            </Button>
          </div>
        ) : (
          // Initial state - selection cards
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 transition-all hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                <Camera className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Take a photo</span>
            </button>

            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 transition-all hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400">
                <Upload className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">Upload image</span>
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ReceiptScanner;
