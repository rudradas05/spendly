"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  title?: string;
  description?: string;
  reset?: () => void;
  backHref?: string;
  backLabel?: string;
}

export function ErrorDisplay({
  title = "Something went wrong",
  description = "An unexpected error occurred. Try refreshing the page or go back to safety.",
  reset,
  backHref = "/dashboard",
  backLabel = "Go to dashboard",
}: ErrorDisplayProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="surface-panel max-w-md px-8 py-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
          <AlertTriangle className="h-8 w-8 text-rose-500" />
        </div>
        <p className="section-kicker text-rose-500">Error</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {reset && (
            <Button
              onClick={reset}
              className="gap-2 shadow-sm transition-all hover:scale-[1.02]"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            className="gap-2 transition-all hover:scale-[1.02]"
          >
            <Link href={backHref}>
              <Home className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
