interface SkeletonCardProps {
  variant?: 'shop' | 'order' | 'product';
}

export function SkeletonCard({ variant = 'shop' }: SkeletonCardProps) {
  if (variant === 'order') return <SkeletonOrderCard />;
  if (variant === 'product') return <SkeletonProductRow />;
  return <SkeletonShopCard />;
}

export function SkeletonShopCard() {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm animate-pulse">
      <div className="flex items-start gap-4">
        {/* Icon placeholder */}
        <div className="w-14 h-14 bg-muted rounded-xl flex-shrink-0" />
        
        {/* Content placeholder */}
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-5 bg-muted rounded-full w-24 mt-2" />
        </div>
        
        {/* Status badge placeholder */}
        <div className="h-6 w-16 bg-muted rounded-full flex-shrink-0" />
      </div>
    </div>
  );
}

export function SkeletonOrderCard() {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/4" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 bg-muted rounded-full" />
          <div className="w-5 h-5 bg-muted rounded" />
        </div>
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
