export default function ResumeLoading() {
  return (
    <div className="px-5 animate-pulse">
      {/* Action bar skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-10 w-48 rounded-lg bg-muted/60" />
        <div className="h-10 w-32 rounded-lg bg-muted/60" />
      </div>

      {/* Resume editor skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left panel */}
        <div className="space-y-4">
          <div className="h-10 rounded-lg bg-muted/60" />
          <div className="h-64 rounded-xl bg-muted/60" />
          <div className="h-10 rounded-lg bg-muted/60" />
          <div className="h-40 rounded-xl bg-muted/60" />
        </div>
        {/* Right preview */}
        <div className="h-[600px] rounded-xl bg-muted/60" />
      </div>
    </div>
  );
}
