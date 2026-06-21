export default function DashboardLoading() {
  return (
    <div className="px-5 animate-pulse">
      {/* Title skeleton */}
      <div className="flex items-center justify-between mb-5">
        <div className="h-14 w-72 rounded-lg bg-muted/60" />
      </div>

      {/* Stats cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted/60" />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-72 rounded-xl bg-muted/60 mb-6" />

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-48 rounded-xl bg-muted/60" />
        <div className="h-48 rounded-xl bg-muted/60" />
      </div>
    </div>
  );
}
