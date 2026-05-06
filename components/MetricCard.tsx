import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: {
    value: number;
    label: string;
    up: boolean;
  };
  loading?: boolean;
  className?: string;
}

export function MetricCard({ label, value, hint, trend, loading, className }: MetricCardProps) {
  if (loading) {
    return (
      <div className={cn("rounded-xl border border-line bg-bg-elevated p-5 animate-pulse", className)}>
        <div className="h-3 w-24 bg-bg-sunken rounded mb-3" />
        <div className="h-8 w-16 bg-bg-sunken rounded mb-2" />
        <div className="h-3 w-32 bg-bg-sunken rounded" />
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-line bg-bg-elevated p-5 shadow-sm transition-shadow hover:shadow-md", className)}>
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-text">{value}</p>
      
      {trend && (
        <div className="mt-2 flex items-center gap-1.5 text-sm">
          <span className={cn(
            "font-medium",
            trend.up ? "text-success" : "text-error"
          )}>
            {trend.up ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="text-muted">{trend.label}</span>
        </div>
      )}
      
      {hint && !trend && (
        <p className="mt-2 text-sm text-muted">{hint}</p>
      )}
    </div>
  );
}
