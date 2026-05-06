import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAuthenticatedServerUser } from '@/lib/supabase/auth-server';
import { NextResponse } from 'next/server';

function mergeConnection(bot: Record<string, unknown>, connection?: Record<string, unknown>) {
  return {
    ...bot,
    telegram_bot_id: connection?.telegram_bot_id ?? null,
    telegram_first_name: connection?.telegram_first_name ?? null,
    telegram_can_join_groups: connection?.telegram_can_join_groups ?? null,
    telegram_can_read_all_group_messages: connection?.telegram_can_read_all_group_messages ?? null,
    telegram_supports_inline_queries: connection?.telegram_supports_inline_queries ?? null,
    token_hint: connection?.token_hint ?? null,
    webhook_url: connection?.webhook_url ?? null,
    connected_at: connection?.connected_at ?? null,
    last_error: connection?.last_error ?? null,
  };
}

export async function GET() {
  const user = await getAuthenticatedServerUser();
  const supabase = createServerSupabaseClient();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('bots')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const botIds = (data ?? []).map((bot) => bot.id);
  let connections: Record<string, Record<string, unknown>> = {};
  if (botIds.length) {
    const { data: connRows } = await supabase
      .from('bot_connections')
      .select('bot_id, telegram_bot_id, telegram_first_name, telegram_can_join_groups, telegram_can_read_all_group_messages, telegram_supports_inline_queries, token_hint, webhook_url, connected_at, last_error')
      .in('bot_id', botIds)
      .eq('owner_id', user.id);
    connections = Object.fromEntries((connRows ?? []).map((row) => [row.bot_id, row]));
  }

  return NextResponse.json({ bots: (data ?? []).map((bot) => mergeConnection(bot, connections[bot.id])) });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedServerUser();
  const supabase = createServerSupabaseClient();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('bots')
      .insert({
        owner_id: user.id,
        name: body.name,
        bot_username: body.bot_username,
        agent_type: body.agent_type,
        llm_provider: body.llm_provider,
        llm_model: body.llm_model,
        status: 'offline',
        is_active: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bot: mergeConnection(data) }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
