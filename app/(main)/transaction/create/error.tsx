"use client";

import { ErrorDisplay } from "@/components/error-display";

export default function TransactionError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      title="Transaction form failed to load"
      description="We couldn't load the transaction form. Try refreshing or go back to your dashboard."
      reset={reset}
      backHref="/dashboard"
      backLabel="Back to dashboard"
    />
  );
}
