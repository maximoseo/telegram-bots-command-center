import { useState } from "react";
import { X, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AddBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bot: {
    name: string;
    bot_username: string;
    agent_type: string;
    llm_provider: string;
    llm_model: string;
  }) => void;
  loading?: boolean;
}

export function AddBotModal({ isOpen, onClose, onSubmit, loading }: AddBotModalProps) {
  const [form, setForm] = useState({
    name: "",
    bot_username: "",
    agent_type: "",
    llm_provider: "",
    llm_model: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div 
        className="relative w-full max-w-md rounded-xl border border-line bg-bg-elevated shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text">Add Bot</h2>
              <p className="text-xs text-muted">Connect a new Telegram bot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-text hover:bg-bg-sunken transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-text">Bot Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="My Awesome Bot"
              className="bg-bg-elevated border-line text-text"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-text">Bot Username</Label>
            <Input
              id="username"
              value={form.bot_username}
              onChange={(e) => setForm(f => ({ ...f, bot_username: e.target.value }))}
              placeholder="@myawesomebot"
              className="bg-bg-elevated border-line text-text"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="agent_type" className="text-text">Agent Type</Label>
              <Input
                id="agent_type"
                value={form.agent_type}
                onChange={(e) => setForm(f => ({ ...f, agent_type: e.target.value }))}
                placeholder="support"
                className="bg-bg-elevated border-line text-text"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="llm_provider" className="text-text">LLM Provider</Label>
              <Input
                id="llm_provider"
                value={form.llm_provider}
                onChange={(e) => setForm(f => ({ ...f, llm_provider: e.target.value }))}
                placeholder="openai"
                className="bg-bg-elevated border-line text-text"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="llm_model" className="text-text">Model</Label>
            <Input
              id="llm_model"
              value={form.llm_model}
              onChange={(e) => setForm(f => ({ ...f, llm_model: e.target.value }))}
              placeholder="gpt-4"
              className="bg-bg-elevated border-line text-text"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading || !form.name.trim()}
              className="flex-1 bg-primary text-text-inverse hover:bg-primary-hover"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Bot"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-line text-text hover:bg-bg-sunken"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
