export function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-muted rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="h-6 w-16 bg-muted rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonProductRow() {
  return (
    <div className="flex items-center gap-3 py-3 animate-pulse">
      <div className="w-14 h-14 bg-muted rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/4" />
      </div>
      <div className="h-8 w-16 bg-muted rounded-lg" />
    </div>
  );
}
