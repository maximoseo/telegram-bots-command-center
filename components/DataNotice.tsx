import { cn } from "@/lib/utils";
import { Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface DataNoticeProps {
  variant?: "info" | "warning" | "error" | "success";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
};

const styles = {
  info: "bg-info-bg border-info-border text-info",
  warning: "bg-warning-bg border-warning-border text-warning",
  error: "bg-error-bg border-error-border text-error",
  success: "bg-success-bg border-success-border text-success",
};

export function DataNotice({ variant = "info", title, children, className }: DataNoticeProps) {
  const Icon = icons[variant];
  
  return (
    <div className={cn("rounded-lg border p-4", styles[variant], className)}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-4", className)}>
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-sunken text-muted mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}
