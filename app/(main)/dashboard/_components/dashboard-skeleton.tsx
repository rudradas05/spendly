import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => {
  return (
    <div className="space-y-10 px-5 pb-16">
      {/* Hero skeleton */}
      <section className="surface-panel overflow-hidden p-6 sm:p-8">
        <div className="space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-72" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <Skeleton className="h-3 w-24 bg-white/20" />
              <Skeleton className="mt-3 h-8 w-36 bg-white/20" />
            </div>
          ))}
        </div>
      </section>

      {/* Charts skeleton */}
      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="surface-panel p-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-6 w-40" />
            <Skeleton className="mt-6 h-64 w-full" />
          </div>
          <div className="surface-panel p-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-6 w-44" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border/40 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-panel p-6">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-2 h-6 w-36" />
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-4 h-2.5 w-full rounded-full" />
          </div>
          <div className="surface-panel p-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-6 w-40" />
            <div className="mt-6 flex gap-4">
              <Skeleton className="h-40 w-40 rounded-full" />
              <div className="flex-1 space-y-3 pt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-2.5 w-2.5 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-3 w-8" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="surface-panel p-6">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-6 w-36" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-2.5 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accounts skeleton */}
      <section className="space-y-5">
        <div>
          <Skeleton className="h-7 w-28" />
          <Skeleton className="mt-1.5 h-3.5 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="surface-panel p-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
              <div className="mt-6">
                <Skeleton className="h-2.5 w-28" />
                <Skeleton className="mt-2 h-8 w-32" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardSkeleton;
