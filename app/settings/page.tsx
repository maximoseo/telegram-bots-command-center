import { Shell } from '@/components/Shell';

const rows = [
  ['Supabase URL', Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)],
  ['Supabase anon key', Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)],
  ['App URL', Boolean(process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL)],
  ['Telegram token storage', false]
] as const;

export default function SettingsPage() {
  return (
    <Shell>
      <div className="mb-6"><p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-blue-300">Settings</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-dark-text">Environment status</h2><p className="mt-2 text-slate-600 dark:text-dark-muted">Status only. No secrets or token values are displayed.</p></div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-dark-border dark:bg-dark-surface dark:shadow-none">
        <div className="space-y-3">
          {rows.map(([label, ok]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-dark-card"><span className="font-bold text-slate-950 dark:text-dark-text">{label}</span><span className={ok ? 'font-black text-emerald-700 dark:text-emerald-300' : 'font-black text-amber-700 dark:text-amber-300'}>{ok ? 'Configured' : 'Missing'}</span></div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
