import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionLoading() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-12 pt-5">
      <div className="mb-4 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-3 w-72" />
      </div>

      <div className="surface-panel p-5 md:p-6">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-5 w-40" />
        <Skeleton className="mt-1 h-3 w-64" />

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-8" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-xl" />
              <Skeleton className="h-10 flex-1 rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-14 rounded-full" />
              ))}
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        <div className="mt-4 border-t border-border/40 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
