import { Shell } from '@/components/Shell';
import { conversations } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export default function ConversationsPage() {
  return (
    <Shell>
      <div className="mb-6"><p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Conversations</p><h2 className="mt-2 text-3xl font-black tracking-tight">Conversation viewer</h2><p className="mt-2 text-slate-600">Read-only chat history preview with redacted-safe demo content.</p></div>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {conversations.map((item) => (
          <div key={item.id} className="border-b border-slate-100 p-5 last:border-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-black">{item.username}</h3><p className="text-sm text-slate-500">{item.botName}</p></div><span className="text-sm font-semibold text-slate-500">{item.lastMessageAt}</span></div>
            <p className="mt-3 text-slate-700">{item.lastMessage}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500"><span>{item.messageCount} messages</span><span>·</span><span>{item.totalTokens.toLocaleString()} tokens</span><span>·</span><span>${item.totalCost.toFixed(2)} cost</span></div>
          </div>
        ))}
      </div>
    </Shell>
  );
}
