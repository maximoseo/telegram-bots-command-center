"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { Shell } from "@/components/Shell";
import { BotCard } from "@/components/bots/BotCard";
import { AddBotModal } from "@/components/bots/AddBotModal";
import { DataNotice, EmptyState } from "@/components/DataNotice";
import { MetricCardSkeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Bot, ShieldCheck } from "lucide-react";
import type { Bot as BotType } from "@/types/prompt";

export default function BotsPage() {
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBots = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bots");
      if (!res.ok) throw new Error("Failed to fetch bots");
      const data = await res.json();
      setBots(data.bots || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bots");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBots(); }, [fetchBots]);

  const handleAddBot = async (botData: { name: string; bot_username: string; agent_type: string; llm_provider: string; llm_model: string }) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/bots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(botData) });
      if (!res.ok) throw new Error("Failed to add bot");
      setModalOpen(false);
      setNotice("Bot record created. Use Connect Telegram to verify token and register webhook.");
      await fetchBots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add bot");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConnectBot = async (bot: BotType) => {
    const token = window.prompt(`Paste Telegram Bot Token for ${bot.name}. It will be sent only to the server and stored encrypted.`);
    if (!token) return;
    try {
      setActionLoading(true);
      setError(null);
      const res = await fetch(`/api/bots/${bot.id}/connect`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to connect Telegram bot");
      setNotice(`Telegram bot connected: ${data.telegram?.username ? `@${data.telegram.username}` : bot.name}`);
      await fetchBots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect Telegram bot");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnectBot = async (bot: BotType) => {
    if (!confirm(`Disconnect Telegram webhook and revoke stored token for "${bot.name}"?`)) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/bots/${bot.id}/connect`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to disconnect bot");
      setNotice("Telegram bot disconnected.");
      await fetchBots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect bot");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBot = async (bot: BotType) => {
    if (!confirm(`Are you sure you want to delete "${bot.name}"?`)) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/bots/${bot.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete bot");
      await fetchBots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete bot");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBot = async (bot: BotType) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/bots/${bot.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !bot.is_active, status: !bot.is_active ? "online" : "paused" }) });
      if (!res.ok) throw new Error("Failed to update bot");
      await fetchBots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update bot");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Shell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Bots</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-text">Bot management</h2>
          <p className="mt-2 text-text-secondary max-w-2xl">Add bots, verify Telegram tokens, register webhooks, and monitor real connection status.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-primary text-text-inverse hover:bg-primary-hover"><Plus className="h-4 w-4 mr-2" /> Add Bot</Button>
      </div>

      <div className="mb-4 rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm text-text-secondary">
        <div className="mb-1 flex items-center gap-2 font-bold text-text"><ShieldCheck className="h-4 w-4 text-primary" /> Secure connect flow</div>
        Tokens are verified with Telegram, stored encrypted server-side, and never shown back in the dashboard.
      </div>

      {error && <DataNotice variant="error" className="mb-4">{error}</DataNotice>}
      {notice && <DataNotice className="mb-4">{notice}</DataNotice>}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}</div>
      ) : bots.length === 0 ? (
        <EmptyState icon={<Bot className="h-6 w-6" />} title="No bots yet" description="Add your first Telegram bot, then connect it with a BotFather token." action={<Button onClick={() => setModalOpen(true)} className="bg-primary text-text-inverse hover:bg-primary-hover"><Plus className="h-4 w-4 mr-2" /> Add Your First Bot</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bots.map((bot) => <BotCard key={bot.id} bot={bot} onDelete={handleDeleteBot} onToggle={handleToggleBot} onConnect={handleConnectBot} onDisconnect={handleDisconnectBot} loading={actionLoading} />)}
        </div>
      )}

      <AddBotModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddBot} loading={actionLoading} />
    </Shell>
  );
}
