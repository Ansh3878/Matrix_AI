export default function InterviewLoading() {
  return (
    <div className="px-5 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-12 w-64 rounded-lg bg-muted/60" />
        <div className="h-10 w-40 rounded-lg bg-muted/60" />
      </div>

      {/* Quiz cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-44 rounded-xl bg-muted/60" />
        ))}
      </div>
    </div>
  );
}
