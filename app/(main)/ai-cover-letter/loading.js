export default function CoverLetterLoading() {
  return (
    <div className="px-5 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-12 w-56 rounded-lg bg-muted/60" />
        <div className="h-10 w-36 rounded-lg bg-muted/60" />
      </div>

      {/* Cover letter list skeletons */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted/60" />
        ))}
      </div>
    </div>
  );
}
