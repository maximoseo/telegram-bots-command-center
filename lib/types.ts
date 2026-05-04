export type BotStatus = 'online' | 'offline' | 'error' | 'paused';

export interface BotSummary {
  id: string;
  name: string;
  botUsername: string;
  agentType: string;
  provider: string;
  model: string;
  status: BotStatus;
  messagesToday: number;
  costToday: number;
  latencyMs: number;
  lastHeartbeat: string;
}

export interface ConversationSummary {
  id: string;
  botName: string;
  username: string;
  lastMessage: string;
  messageCount: number;
  totalTokens: number;
  totalCost: number;
  lastMessageAt: string;
}

export interface DailyUsagePoint {
  date: string;
  messages: number;
  calls: number;
  cost: number;
}
