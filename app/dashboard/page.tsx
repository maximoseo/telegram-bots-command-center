import { Shell } from '@/components/Shell';
import { MetricCard } from '@/components/MetricCard';
import { StatusBadge } from '@/components/StatusBadge';
import { bots, conversations, usage } from '@/lib/mock-data';

export default function DashboardPage() {
  const active = bots.filter((bot) => bot.status === 'online').length;
  const messages = usage.reduce((sum, item) => sum + item.messages, 0);
  const calls = usage.reduce((sum, item) => sum + item.calls, 0);
  const cost = usage.reduce((sum, item) => sum + item.cost, 0);

  return (
    <Shell>
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Overview</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Bot operations command center</h2>
          <p className="mt-2 max-w-2xl text-slate-600">Secure read-only foundation for monitoring Telegram bots, conversations, and LLM usage. Control actions are intentionally disabled in this first slice.</p>
        </div>
        <a href="/api/health" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">Health check</a>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active bots" value={`${active}/${bots.length}`} hint="Online in demo observability mode" />
        <MetricCard label="Messages this week" value={messages.toLocaleString()} hint="Aggregated from read-only mock data" />
        <MetricCard label="AI calls this week" value={calls.toLocaleString()} hint="Proxy layer planned for later phase" />
        <MetricCard label="Cost this week" value={`$${cost.toFixed(2)}`} hint="Estimated from aggregate usage" />
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-slate-950">Bot status</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {bots.map((bot) => (
              <article key={bot.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><h4 className="font-black text-slate-950">{bot.name}</h4><p className="text-sm text-slate-500">{bot.botUsername}</p></div>
                  <StatusBadge status={bot.status} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div><p className="text-slate-500">Msgs</p><b>{bot.messagesToday}</b></div>
                  <div><p className="text-slate-500">Cost</p><b>${bot.costToday.toFixed(2)}</b></div>
                  <div><p className="text-slate-500">Latency</p><b>{bot.latencyMs}ms</b></div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-slate-950">Recent conversations</h3>
          <div className="mt-4 space-y-3">
            {conversations.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3"><b>{item.username}</b><span className="text-xs font-bold text-slate-500">{item.lastMessageAt}</span></div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.lastMessage}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
