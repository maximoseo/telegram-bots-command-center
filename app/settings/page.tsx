import { Shell } from '@/components/Shell';

export const dynamic = 'force-dynamic';

const checks = [
  ['Supabase URL', Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)],
  ['Supabase anon key', Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)],
  ['Server app URL', Boolean(process.env.APP_URL)]
] as const;

export default function SettingsPage() {
  return (
    <Shell>
      <div className="mb-6"><p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Settings</p><h2 className="mt-2 text-3xl font-black tracking-tight">Environment status</h2><p className="mt-2 text-slate-600">Status only. No secrets or token values are displayed.</p></div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          {checks.map(([label, ok]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span className="font-bold">{label}</span><span className={ok ? 'text-emerald-700 font-black' : 'text-amber-700 font-black'}>{ok ? 'Configured' : 'Missing'}</span></div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
