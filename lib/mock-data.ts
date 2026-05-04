import type { BotSummary, ConversationSummary, DailyUsagePoint } from './types';

export const bots: BotSummary[] = [
  { id: 'seo', name: 'SEO Analysis Bot', botUsername: '@maximo_seo_bot', agentType: 'Agent Zero', provider: 'OpenAI', model: 'GPT-4o', status: 'online', messagesToday: 145, costToday: 3.2, latencyMs: 1180, lastHeartbeat: '2 minutes ago' },
  { id: 'support', name: 'Customer Support Bot', botUsername: '@support_agent_bot', agentType: 'Custom RAG', provider: 'Anthropic', model: 'Claude 3.5', status: 'online', messagesToday: 89, costToday: 4.1, latencyMs: 820, lastHeartbeat: '4 minutes ago' },
  { id: 'sales', name: 'Sales Qualification Bot', botUsername: '@sales_ai_bot', agentType: 'Workflow', provider: 'Google', model: 'Gemini 2.0', status: 'paused', messagesToday: 23, costToday: 0.8, latencyMs: 2100, lastHeartbeat: '18 minutes ago' },
  { id: 'content', name: 'Content Bot', botUsername: '@content_ops_bot', agentType: 'Agent Zero', provider: 'OpenRouter', model: 'GPT-5.5', status: 'online', messagesToday: 67, costToday: 2.8, latencyMs: 1420, lastHeartbeat: '1 minute ago' }
];

export const conversations: ConversationSummary[] = [
  { id: 'c1', botName: 'SEO Analysis Bot', username: '@client_alpha', lastMessage: 'Can you audit the homepage title and internal links?', messageCount: 18, totalTokens: 12450, totalCost: 0.84, lastMessageAt: '2 minutes ago' },
  { id: 'c2', botName: 'Customer Support Bot', username: '@lead_44', lastMessage: 'I need help connecting the dashboard to Supabase.', messageCount: 11, totalTokens: 8300, totalCost: 0.52, lastMessageAt: '7 minutes ago' },
  { id: 'c3', botName: 'Content Bot', username: '@editor_team', lastMessage: 'Generate a short outline for the new landing page.', messageCount: 9, totalTokens: 6700, totalCost: 0.38, lastMessageAt: '14 minutes ago' }
];

export const usage: DailyUsagePoint[] = [
  { date: 'Mon', messages: 320, calls: 140, cost: 8.2 },
  { date: 'Tue', messages: 410, calls: 188, cost: 10.1 },
  { date: 'Wed', messages: 385, calls: 162, cost: 9.7 },
  { date: 'Thu', messages: 530, calls: 240, cost: 12.4 },
  { date: 'Fri', messages: 470, calls: 210, cost: 11.3 },
  { date: 'Sat', messages: 260, calls: 102, cost: 5.1 },
  { date: 'Sun', messages: 295, calls: 118, cost: 6.0 }
];
