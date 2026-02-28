"use client";

import { ErrorDisplay } from "@/components/error-display";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      title="Dashboard failed to load"
      description="We couldn't load your financial data. This is usually temporary — try refreshing."
      reset={reset}
      backHref="/"
      backLabel="Return home"
    />
  );
}
