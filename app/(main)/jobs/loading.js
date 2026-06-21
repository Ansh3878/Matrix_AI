export default function JobsLoading() {
  return (
    <div className="px-5 animate-pulse">
      {/* Search bar skeleton */}
      <div className="flex gap-3 mb-6">
        <div className="h-10 flex-1 rounded-lg bg-muted/60" />
        <div className="h-10 w-28 rounded-lg bg-muted/60" />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-muted/60" />
        ))}
      </div>

      {/* Job cards */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/60" />
        ))}
      </div>
    </div>
  );
}
