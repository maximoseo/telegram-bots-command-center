import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "metric" | "avatar";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const baseClass = "animate-pulse rounded-md bg-bg-sunken";
  
  const variantClasses = {
    text: "h-4 w-full",
    card: "h-32 w-full",
    metric: "h-24 w-full",
    avatar: "h-10 w-10 rounded-full",
  };

  return (
    <div className={cn(baseClass, variantClasses[variant], className)} />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-bg-elevated p-5 space-y-3">
      <Skeleton variant="text" className="w-24 h-3" />
      <Skeleton variant="text" className="w-16 h-8" />
      <Skeleton variant="text" className="w-32 h-3" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton variant="text" className="w-32 h-4" />
        <Skeleton variant="text" className="w-64 h-8" />
        <Skeleton variant="text" className="w-96 h-4" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
      
      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-xl border border-line bg-bg-elevated p-5 space-y-4">
          <Skeleton variant="text" className="w-24 h-5" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        </div>
        
        <div className="rounded-xl border border-line bg-bg-elevated p-5 space-y-4">
          <Skeleton variant="text" className="w-32 h-5" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-20" />
          ))}
        </div>
      </div>
    </div>
  );
}
