import { Shell } from '@/components/Shell';
import { usage } from '@/lib/mock-data';

export default function AnalyticsPage() {
  const max = Math.max(...usage.map((item) => item.messages));
  return (
    <Shell>
      <div className="mb-6"><p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Analytics</p><h2 className="mt-2 text-3xl font-black tracking-tight">Token & cost analytics</h2><p className="mt-2 text-slate-600">Lightweight first-slice visualization. Real LLM proxy data comes in a later phase.</p></div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black">Message volume</h3>
        <div className="mt-6 flex h-72 items-end gap-3">
          {usage.map((item) => (
            <div key={item.date} className="flex flex-1 flex-col items-center gap-3">
              <div className="w-full rounded-t-2xl bg-indigo-600" style={{ height: `${Math.max(12, (item.messages / max) * 230)}px` }} aria-label={`${item.date}: ${item.messages} messages`} />
              <span className="text-xs font-bold text-slate-500">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
