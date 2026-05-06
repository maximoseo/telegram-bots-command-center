export interface Bot {
  id: string;
  owner_id: string;
  name: string;
  bot_username: string | null;
  agent_type: string | null;
  llm_provider: string | null;
  llm_model: string | null;
  status: 'online' | 'offline' | 'error' | 'paused';
  last_heartbeat: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  owner_id: string;
  bot_id: string;
  telegram_chat_id: bigint | null;
  telegram_user_id: bigint | null;
  username: string | null;
  message_count: number;
  total_tokens: number;
  total_cost: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  owner_id: string;
  conversation_id: string;
  bot_id: string;
  direction: 'incoming' | 'outgoing';
  sender_type: 'user' | 'bot' | 'system';
  content_type: string;
  content: string | null;
  tokens_used: number;
  cost: number;
  llm_model: string | null;
  latency_ms: number | null;
  created_at: string;
}

export interface LlmCall {
  id: string;
  owner_id: string;
  bot_id: string | null;
  conversation_id: string | null;
  provider: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  total_cost: number;
  latency_ms: number | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface TokenUsageDaily {
  id: string;
  owner_id: string;
  bot_id: string | null;
  usage_date: string;
  provider: string;
  model: string;
  total_calls: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  total_cost: number;
  avg_latency_ms: number | null;
  error_count: number;
}

export interface Profile {
  id: string;
  email: string | null;
  role: 'viewer' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Website {
  id: string;
  name: string;
  url: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWebsiteInput {
  name: string;
  url: string;
  description?: string;
  icon?: string;
  color?: string;
}
