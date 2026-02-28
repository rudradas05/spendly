"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/error-display";

export default function GoalsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Goals error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <ErrorDisplay
        title="Goals error"
        description={error.message}
        reset={reset}
        backHref="/dashboard"
        backLabel="Go to dashboard"
      />
    </div>
  );
}
