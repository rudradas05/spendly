"use client";

import { ErrorDisplay } from "@/components/error-display";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <ErrorDisplay
          title="Application error"
          description="A critical error occurred. Please try again."
          reset={reset}
          backHref="/"
          backLabel="Return home"
        />
      </body>
    </html>
  );
}
