"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/error-display";

export default function ImportError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Import error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <ErrorDisplay
        title="Import failed"
        description={error.message}
        reset={reset}
        backHref="/dashboard"
        backLabel="Go to dashboard"
      />
    </div>
  );
}
