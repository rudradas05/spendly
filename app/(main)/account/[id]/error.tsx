"use client";

import { ErrorDisplay } from "@/components/error-display";

export default function AccountError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      title="Account failed to load"
      description="We couldn't load this account's transactions. Try refreshing or go back to your dashboard."
      reset={reset}
      backHref="/dashboard"
      backLabel="Back to dashboard"
    />
  );
}
