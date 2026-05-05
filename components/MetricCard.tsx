export function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-dark-border dark:bg-dark-surface dark:shadow-none">
      <p className="text-sm font-semibold text-slate-500 dark:text-dark-muted">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-dark-text">{value}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-dark-muted">{hint}</p>
    </div>
  );
}
