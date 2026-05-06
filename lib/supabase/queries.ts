import { createServerSupabaseClient } from './server';

// Dashboard overview metrics
export async function getDashboardMetrics(ownerId: string) {
  const supabase = createServerSupabaseClient();

  const [
    { count: totalBots },
    { count: totalConversations },
    { count: totalMessages },
    { count: totalLlmCalls },
  ] = await Promise.all([
    supabase.from('bots').select('*', { count: 'exact', head: true }).eq('owner_id', ownerId),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('owner_id', ownerId),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('owner_id', ownerId),
    supabase.from('llm_calls').select('*', { count: 'exact', head: true }).eq('owner_id', ownerId),
  ]);

  const { data: recentConversations } = await supabase
    .from('conversations')
    .select('id, message_count, total_tokens, total_cost, last_message_at')
    .eq('owner_id', ownerId)
    .order('last_message_at', { ascending: false })
    .limit(5);

  const { data: tokenUsage } = await supabase
    .from('token_usage_daily')
    .select('usage_date, total_tokens, total_cost')
    .eq('owner_id', ownerId)
    .order('usage_date', { ascending: false })
    .limit(7);

  return {
    totalBots: totalBots ?? 0,
    totalConversations: totalConversations ?? 0,
    totalMessages: totalMessages ?? 0,
    totalLlmCalls: totalLlmCalls ?? 0,
    recentConversations: recentConversations ?? [],
    tokenUsage: tokenUsage ?? [],
  };
}

// Bot management
export async function getBots(ownerId: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('bots')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getBotById(ownerId: string, botId: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('bots')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('id', botId)
    .single();

  if (error) throw error;
  return data;
}

// Conversations
export async function getConversations(ownerId: string, botId?: string) {
  const supabase = createServerSupabaseClient();

  let query = supabase
    .from('conversations')
    .select('*')
    .eq('owner_id', ownerId)
    .order('last_message_at', { ascending: false });

  if (botId) {
    query = query.eq('bot_id', botId);
  }

  const { data, error } = await query.limit(50);

  if (error) throw error;
  return data ?? [];
}

// Messages for a conversation
export async function getMessages(ownerId: string, conversationId: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// LLM calls
export async function getLlmCalls(ownerId: string, limit = 50) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('llm_calls')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

// Token usage analytics
export async function getTokenUsage(ownerId: string, days = 30) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('token_usage_daily')
    .select('*')
    .eq('owner_id', ownerId)
    .order('usage_date', { ascending: false })
    .limit(days);

  if (error) throw error;
  return data ?? [];
}
