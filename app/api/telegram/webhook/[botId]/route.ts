import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { decryptSecret } from '@/lib/telegram/crypto';
import { sendTelegramMessage } from '@/lib/telegram/api';

type TelegramUpdate = {
  update_id?: number;
  message?: {
    message_id?: number;
    text?: string;
    chat?: { id?: number; username?: string; first_name?: string; last_name?: string; type?: string };
    from?: { id?: number; username?: string; first_name?: string; last_name?: string };
  };
};

export async function POST(request: Request, { params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  const supabase = createServerSupabaseClient();
  const secret = request.headers.get('x-telegram-bot-api-secret-token') || '';

  const { data: bot, error } = await supabase
    .from('bot_connections')
    .select('bot_id, owner_id, webhook_secret, token_ciphertext, token_iv, token_auth_tag, bots!inner(id, name, is_active)')
    .eq('bot_id', botId)
    .single();

  const botRow = Array.isArray(bot?.bots) ? bot?.bots[0] : bot?.bots;
  if (error || !bot || !botRow?.is_active || !bot.webhook_secret || secret !== bot.webhook_secret) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let update: TelegramUpdate;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const message = update.message;
  const chatId = message?.chat?.id;
  const text = message?.text || '';

  await supabase
    .from('bots')
    .update({ status: 'online', last_heartbeat: new Date().toISOString(), last_error: null, updated_at: new Date().toISOString() })
    .eq('id', bot.bot_id);

  if (!chatId) return NextResponse.json({ ok: true });

  const username = message?.from?.username || message?.chat?.username || null;
  let conversationId: string | null = null;
  const now = new Date().toISOString();
  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('id, message_count')
    .eq('owner_id', bot.owner_id)
    .eq('bot_id', bot.bot_id)
    .eq('telegram_chat_id', chatId)
    .maybeSingle();

  if (existingConversation?.id) {
    conversationId = existingConversation.id;
    await supabase
      .from('conversations')
      .update({
        telegram_user_id: message?.from?.id || null,
        username,
        message_count: (existingConversation.message_count || 0) + 1,
        last_message_at: now,
        updated_at: now
      })
      .eq('id', existingConversation.id);
  } else {
    const { data: insertedConversation } = await supabase
      .from('conversations')
      .insert({
        owner_id: bot.owner_id,
        bot_id: bot.bot_id,
        telegram_chat_id: chatId,
        telegram_user_id: message?.from?.id || null,
        username,
        message_count: 1,
        last_message_at: now,
        updated_at: now
      })
      .select('id')
      .single();
    conversationId = insertedConversation?.id || null;
  }

  if (conversationId && text) {
    await supabase.from('messages').insert({
      owner_id: bot.owner_id,
      conversation_id: conversationId,
      bot_id: bot.bot_id,
      direction: 'incoming',
      sender_type: 'user',
      content_type: 'text',
      content: text.slice(0, 4000)
    });
  }

  try {
    const token = decryptSecret({ ciphertext: bot.token_ciphertext, iv: bot.token_iv, authTag: bot.token_auth_tag });
    const reply = `✅ ${botRow.name} is connected to TG Command Center. I received your message.`;
    await sendTelegramMessage(token, chatId, reply);
    if (conversationId) {
      await supabase.from('messages').insert({
        owner_id: bot.owner_id,
        conversation_id: conversationId,
        bot_id: bot.bot_id,
        direction: 'outgoing',
        sender_type: 'bot',
        content_type: 'text',
        content: reply
      });
    }
  } catch (sendError) {
    await supabase.from('bots').update({ status: 'error', last_error: sendError instanceof Error ? sendError.message : 'Reply failed', updated_at: new Date().toISOString() }).eq('id', bot.bot_id);
  }

  return NextResponse.json({ ok: true });
}

export function GET() {
  return NextResponse.json({ ok: true, endpoint: 'telegram-webhook' });
}
