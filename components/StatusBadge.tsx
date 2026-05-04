import type { BotStatus } from '@/lib/types';

const styles: Record<BotStatus, string> = {
  online: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  offline: 'bg-slate-100 text-slate-600 ring-slate-200',
  error: 'bg-rose-50 text-rose-700 ring-rose-200',
  paused: 'bg-amber-50 text-amber-700 ring-amber-200'
};

export function StatusBadge({ status }: { status: BotStatus }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[status]}`}>{status}</span>;
}
