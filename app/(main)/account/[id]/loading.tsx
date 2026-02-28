import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="space-y-8 px-5 pb-16">
      {/* Header */}
      <section className="surface-panel p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-56" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-36 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-background/70 p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="mt-3 h-8 w-32" />
              <Skeleton className="mt-1.5 h-2.5 w-24" />
            </div>
          ))}
        </div>
      </section>

      {/* Chart */}
      <div className="surface-panel p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-background/70 px-4 py-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-6 w-28" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-6 h-72 w-full" />
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div className="surface-panel p-4">
          <div className="flex gap-3">
            <Skeleton className="h-9 flex-1 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-40 rounded-xl" />
          </div>
        </div>
        <div className="surface-panel overflow-hidden">
          <div className="border-b border-border/40 px-4 py-3">
            <div className="grid grid-cols-6 gap-4">
              {["Date", "Description", "Category", "Amount", "Recurring", ""].map((h) => (
                <Skeleton key={h} className="h-3 w-full" />
              ))}
            </div>
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b border-border/30 px-4 py-4 last:border-0">
              <div className="grid grid-cols-6 items-center gap-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-5 w-20 rounded-lg" />
                <Skeleton className="h-3 w-16 justify-self-end" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-7 w-7 justify-self-end rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
