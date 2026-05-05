import { MetricCard } from '@/components/MetricCard';
import { Shell } from '@/components/Shell';
import { StatusBadge } from '@/components/StatusBadge';
import { bots, conversations } from '@/lib/mock-data';

const metrics = [
  { label: 'Active bots', value: String(bots.filter((bot) => bot.status === 'online').length), hint: `${bots.length} bots tracked` },
  { label: 'Messages today', value: bots.reduce((total, bot) => total + bot.messagesToday, 0).toLocaleString(), hint: 'Across connected demo bots' },
  { label: 'Cost today', value: `$${bots.reduce((total, bot) => total + bot.costToday, 0).toFixed(2)}`, hint: 'Estimated LLM usage' },
  { label: 'Avg latency', value: `${Math.round(bots.reduce((total, bot) => total + bot.latencyMs, 0) / bots.length)}ms`, hint: 'Latest heartbeat average' }
];


export default function DashboardPage() {
  return (
    <Shell>
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-blue-300">Overview</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-dark-text sm:text-4xl">Bot operations command center</h2>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-dark-muted">Secure read-only foundation for monitoring Telegram bots, conversations, and LLM usage. Control actions are intentionally disabled in this first slice.</p>
        </div>
        <a href="/api/health" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-dark-border dark:bg-dark-card dark:text-dark-text dark:shadow-none dark:hover:bg-slate-800">Health check</a>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-dark-border dark:bg-dark-surface dark:shadow-none">
          <h3 className="text-lg font-black text-slate-950 dark:text-dark-text">Bot status</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {bots.map((bot) => (
              <article key={bot.id} className="rounded-2xl border border-slate-200 p-4 dark:border-dark-border dark:bg-dark-card/45">
                <div className="flex items-start justify-between gap-3">
                  <div><h4 className="font-black text-slate-950 dark:text-dark-text">{bot.name}</h4><p className="text-sm text-slate-500 dark:text-dark-muted">{bot.botUsername}</p></div>
                  <StatusBadge status={bot.status} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div><p className="text-slate-500 dark:text-dark-muted">Msgs</p><b>{bot.messagesToday}</b></div>
                  <div><p className="text-slate-500 dark:text-dark-muted">Cost</p><b>${bot.costToday.toFixed(2)}</b></div>
                  <div><p className="text-slate-500 dark:text-dark-muted">Latency</p><b>{bot.latencyMs}ms</b></div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-dark-border dark:bg-dark-surface dark:shadow-none">
          <h3 className="text-lg font-black text-slate-950 dark:text-dark-text">Recent conversations</h3>
          <div className="mt-4 space-y-3">
            {conversations.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-dark-card/70">
                <div className="flex items-center justify-between gap-3"><b>{item.username}</b><span className="text-xs font-bold text-slate-500 dark:text-dark-muted">{item.lastMessageAt}</span></div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-dark-muted">{item.lastMessage}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
