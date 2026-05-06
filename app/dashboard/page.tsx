import { Shell } from '@/components/Shell';
import { MetricCard } from '@/components/MetricCard';
import { StatusBadge } from '@/components/StatusBadge';
import { DataNotice, EmptyState } from '@/components/DataNotice';
import { DashboardSkeleton } from '@/components/Skeleton';
import { getDashboardMetrics, getBots } from '@/lib/supabase/queries';
import type { Bot as BotType } from '@/types/prompt';
import { getAuthenticatedServerUser } from '@/lib/supabase/auth-server';
import { Bot, MessageSquare, BarChart3 } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getAuthenticatedServerUser();

  if (!user) {
    redirect('/login');
  }

  let metrics: Awaited<ReturnType<typeof getDashboardMetrics>> | null = null;
  let bots: BotType[] = [];
  let error: string | null = null;

  try {
    [metrics, bots] = await Promise.all([
      getDashboardMetrics(user.id),
      getBots(user.id),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load dashboard data';
  }

  if (error) {
    return (
      <Shell>
        <DataNotice variant="error" title="Failed to load dashboard">
          {error}. Please try refreshing the page.
        </DataNotice>
      </Shell>
    );
  }

  const activeBots = (bots || []).filter((bot) => bot.status === 'online').length;
  const totalCost = (metrics?.tokenUsage || []).reduce((sum, item) => sum + (item.total_cost || 0), 0);
  const totalMessages = (metrics?.tokenUsage || []).reduce((sum, item) => sum + (item.total_tokens || 0), 0);

  return (
    <Shell>
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Overview</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-text sm:text-4xl">Bot operations command center</h2>
          <p className="mt-2 max-w-2xl text-text-secondary">
            Monitor your Telegram bots, conversations, and LLM usage in real-time.
          </p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard 
          label="Active bots" 
          value={`${activeBots}/${bots.length}`} 
          hint={activeBots > 0 ? `${activeBots} bot${activeBots > 1 ? 's' : ''} online` : 'No bots online'}
        />
        <MetricCard 
          label="Total conversations" 
          value={metrics?.totalConversations?.toLocaleString() ?? '0'} 
          hint="Across all bots"
        />
        <MetricCard 
          label="Total messages" 
          value={metrics?.totalMessages?.toLocaleString() ?? '0'} 
          hint="All time"
        />
        <MetricCard 
          label="Estimated cost" 
          value={`$${totalCost.toFixed(2)}`} 
          hint="Based on token usage"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-xl border border-line bg-bg-elevated p-5 shadow-sm">
          <h3 className="text-lg font-black text-text mb-4">Bot status</h3>
          
          {bots.length === 0 ? (
            <EmptyState
              icon={<Bot className="h-6 w-6" />}
              title="No bots yet"
              description="Connect your first Telegram bot to start monitoring."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {bots.map((bot) => (
                <article key={bot.id} className="rounded-xl border border-line bg-bg p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-text">{bot.name}</h4>
                      <p className="text-sm text-muted">{bot.bot_username || 'No username'}</p>
                    </div>
                    <StatusBadge status={bot.status} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted text-xs">Type</p>
                      <p className="font-medium text-text">{bot.agent_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted text-xs">LLM</p>
                      <p className="font-medium text-text">{bot.llm_provider || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted text-xs">Status</p>
                      <p className="font-medium text-text">{bot.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-line bg-bg-elevated p-5 shadow-sm">
          <h3 className="text-lg font-black text-text mb-4">Recent activity</h3>
          
          {(metrics?.recentConversations || []).length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="h-6 w-6" />}
              title="No conversations yet"
              description="Start chatting with your bots to see activity here."
            />
          ) : (
            <div className="space-y-3">
              {(metrics?.recentConversations || []).map((conv) => (
                <div key={conv.id} className="rounded-xl bg-bg p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-text text-sm">{conv.message_count} messages</span>
                    <span className="text-xs text-muted">
                      {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                    <span>{conv.total_tokens?.toLocaleString() || 0} tokens</span>
                    <span>${conv.total_cost?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {((metrics?.tokenUsage || []).length > 0) && (
        <section className="mt-6 rounded-xl border border-line bg-bg-elevated p-5 shadow-sm">
          <h3 className="text-lg font-black text-text mb-4">Token usage (last 7 days)</h3>
          <div className="space-y-2">
            {(metrics?.tokenUsage || []).map((day) => (
              <div key={day.usage_date} className="flex items-center gap-4">
                <span className="text-sm text-muted w-24">{new Date(day.usage_date).toLocaleDateString()}</span>
                <div className="flex-1 h-8 bg-bg-sunken rounded-lg overflow-hidden">
                  <div 
                    className="h-full bg-primary/20 rounded-lg transition-all"
                    style={{ width: `${Math.min(100, (day.total_tokens / 10000) * 100)}%` }}
                  />
                </div>
                <span className="text-sm text-text w-20 text-right">{day.total_tokens?.toLocaleString() || 0}</span>
                <span className="text-sm text-muted w-16 text-right">${day.total_cost?.toFixed(2) || '0.00'}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </Shell>
  );
}
