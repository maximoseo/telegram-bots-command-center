import { Bot, Link2, PlugZap, Trash2, Power, Unplug } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Bot as BotType } from "@/types/prompt";

interface BotCardProps {
  bot: BotType;
  onDelete?: (bot: BotType) => void;
  onToggle?: (bot: BotType) => void;
  onConnect?: (bot: BotType) => void;
  onDisconnect?: (bot: BotType) => void;
  loading?: boolean;
}

export function BotCard({ bot, onDelete, onToggle, onConnect, onDisconnect, loading }: BotCardProps) {
  const connected = Boolean(bot.connected_at && bot.token_hint && bot.webhook_url);

  return (
    <div className={cn(
      "rounded-xl border bg-bg-elevated p-5 transition-all hover:shadow-md",
      bot.is_active ? "border-primary/35" : "border-line/70 opacity-90"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
            connected ? "bg-primary/15" : "bg-bg-sunken"
          )}>
            <Bot className={cn("h-5 w-5", connected ? "text-primary" : "text-muted")} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-text truncate">{bot.name}</h3>
            <p className="text-sm text-muted">{bot.bot_username || "No Telegram username yet"}</p>
          </div>
        </div>
        <StatusBadge status={bot.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted text-xs mb-1">Agent Type</p>
          <p className="font-medium text-text">{bot.agent_type || "N/A"}</p>
        </div>
        <div>
          <p className="text-muted text-xs mb-1">LLM Provider</p>
          <p className="font-medium text-text">{bot.llm_provider || "N/A"}</p>
        </div>
        <div>
          <p className="text-muted text-xs mb-1">Telegram</p>
          <p className="font-medium text-text">{bot.telegram_first_name || (connected ? "Connected" : "Not connected")}</p>
        </div>
        <div>
          <p className="text-muted text-xs mb-1">Last Heartbeat</p>
          <p className="font-medium text-text">
            {bot.last_heartbeat ? new Date(bot.last_heartbeat).toLocaleString() : "Never"}
          </p>
        </div>
      </div>

      {connected ? (
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs text-text-secondary">
          <div className="mb-1 flex items-center gap-2 font-bold text-text"><Link2 className="h-3.5 w-3.5 text-primary" /> Webhook connected</div>
          <div>Token: {bot.token_hint || "configured"}</div>
          {bot.connected_at ? <div>Connected: {new Date(bot.connected_at).toLocaleString()}</div> : null}
        </div>
      ) : bot.last_error ? (
        <div className="mt-4 rounded-lg border border-error/25 bg-error-bg p-3 text-xs text-error">{bot.last_error}</div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 pt-4 border-t border-line">
        {connected ? (
          <Button variant="outline" size="sm" onClick={() => onDisconnect?.(bot)} disabled={loading} className="border-line text-text hover:bg-bg-sunken">
            <Unplug className="h-3.5 w-3.5 mr-1" /> Disconnect
          </Button>
        ) : (
          <Button size="sm" onClick={() => onConnect?.(bot)} disabled={loading} className="bg-primary text-text-inverse hover:bg-primary-hover">
            <PlugZap className="h-3.5 w-3.5 mr-1" /> Connect Telegram
          </Button>
        )}
        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(bot)}
            disabled={loading || !connected}
            className={cn("text-xs", bot.is_active ? "text-success hover:text-success hover:bg-success-bg" : "text-muted hover:text-text hover:bg-bg-sunken")}
          >
            <Power className="h-3.5 w-3.5 mr-1" />
            {bot.is_active ? "Active" : "Inactive"}
          </Button>
        )}
        <div className="ml-auto">
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(bot)} disabled={loading} className="text-muted hover:text-error hover:bg-error-bg">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
