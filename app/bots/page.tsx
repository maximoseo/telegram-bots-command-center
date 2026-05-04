import { Shell } from '@/components/Shell';
import { StatusBadge } from '@/components/StatusBadge';
import { bots } from '@/lib/mock-data';

export default function BotsPage() {
  return (
    <Shell>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Bots</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">Bot management</h2>
        <p className="mt-2 text-slate-600">Read-only bot inventory. Add/import/configuration actions are intentionally deferred.</p>
      </div>
      <div className="grid gap-4">
        {bots.map((bot) => (
          <article key={bot.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3"><h3 className="text-xl font-black">{bot.name}</h3><StatusBadge status={bot.status} /></div>
                <p className="mt-1 text-sm text-slate-500">{bot.botUsername} · {bot.agentType}</p>
                <p className="mt-3 text-slate-600">Provider: <b>{bot.provider}</b> · Model: <b>{bot.model}</b> · Last heartbeat: {bot.lastHeartbeat}</p>
              </div>
              <div className="grid min-w-80 grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Messages</p><b>{bot.messagesToday}</b></div>
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Cost</p><b>${bot.costToday.toFixed(2)}</b></div>
                <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Latency</p><b>{bot.latencyMs}ms</b></div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Shell>
  );
}
