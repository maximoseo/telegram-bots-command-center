import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAuthenticatedServerUser } from '@/lib/supabase/auth-server';
import { NextResponse } from 'next/server';

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

  return NextResponse.json({ bots: data ?? [] });
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

    return NextResponse.json({ bot: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
