export default function NewsFeedLoading() {
  return (
    <div className="px-5 animate-pulse">
      {/* Header */}
      <div className="h-12 w-48 rounded-lg bg-muted/60 mb-6" />

      {/* News article cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="rounded-xl bg-muted/60 overflow-hidden">
            <div className="h-40 bg-muted/80" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted/80" />
              <div className="h-4 w-full rounded bg-muted/80" />
              <div className="h-4 w-1/2 rounded bg-muted/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
