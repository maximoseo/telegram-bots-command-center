import { Bot, Pencil, Trash2, Power } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Bot as BotType } from "@/types/prompt";

interface BotCardProps {
  bot: BotType;
  onEdit?: (bot: BotType) => void;
  onDelete?: (bot: BotType) => void;
  onToggle?: (bot: BotType) => void;
}

export function BotCard({ bot, onEdit, onDelete, onToggle }: BotCardProps) {
  return (
    <div className={cn(
      "rounded-xl border bg-bg-elevated p-5 transition-all hover:shadow-md",
      bot.is_active ? "border-line" : "border-line/50 opacity-75"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
            bot.is_active ? "bg-primary/10" : "bg-bg-sunken"
          )}>
            <Bot className={cn(
              "h-5 w-5",
              bot.is_active ? "text-primary" : "text-muted"
            )} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-text truncate">{bot.name}</h3>
            <p className="text-sm text-muted">{bot.bot_username || "No username"}</p>
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
          <p className="text-muted text-xs mb-1">Model</p>
          <p className="font-medium text-text">{bot.llm_model || "N/A"}</p>
        </div>
        <div>
          <p className="text-muted text-xs mb-1">Last Heartbeat</p>
          <p className="font-medium text-text">
            {bot.last_heartbeat 
              ? new Date(bot.last_heartbeat).toLocaleDateString() 
              : "Never"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 pt-4 border-t border-line">
        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(bot)}
            className={cn(
              "text-xs",
              bot.is_active 
                ? "text-success hover:text-success hover:bg-success-bg" 
                : "text-muted hover:text-text hover:bg-bg-sunken"
            )}
          >
            <Power className="h-3.5 w-3.5 mr-1" />
            {bot.is_active ? "Active" : "Inactive"}
          </Button>
        )}
        
        <div className="ml-auto flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(bot)}
              className="text-muted hover:text-text hover:bg-bg-sunken"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(bot)}
              className="text-muted hover:text-error hover:bg-error-bg"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
