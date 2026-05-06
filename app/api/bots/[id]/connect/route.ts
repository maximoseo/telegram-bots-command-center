import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAuthenticatedServerUser } from '@/lib/supabase/auth-server';
import { createWebhookSecret, encryptSecret, tokenHint } from '@/lib/telegram/crypto';
import { getTelegramBotInfo, setTelegramWebhook, deleteTelegramWebhook } from '@/lib/telegram/api';

const APP_URL = (process.env.APP_URL || 'https://tg-command-center.maximo-seo.ai').replace(/\/$/, '');

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthenticatedServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  if (!token || !/^\d+:[A-Za-z0-9_-]{20,}$/.test(token)) {
    return NextResponse.json({ error: 'Invalid Telegram bot token format.' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data: existing, error: fetchError } = await supabase
    .from('bots')
    .select('id, owner_id')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single();

  if (fetchError || !existing) return NextResponse.json({ error: 'Bot not found.' }, { status: 404 });

  try {
    const botInfo = await getTelegramBotInfo(token);
    if (!botInfo.is_bot) throw new Error('Token does not belong to a Telegram bot.');

    const encrypted = encryptSecret(token);
    const webhookSecret = createWebhookSecret();
    const webhookUrl = `${APP_URL}/api/telegram/webhook/${id}`;
    await setTelegramWebhook(token, webhookUrl, webhookSecret);

    const { data, error } = await supabase
      .from('bots')
      .update({
        bot_username: botInfo.username ? `@${botInfo.username}` : null,
        telegram_bot_id: botInfo.id,
        telegram_first_name: botInfo.first_name,
        telegram_can_join_groups: botInfo.can_join_groups ?? null,
        telegram_can_read_all_group_messages: botInfo.can_read_all_group_messages ?? null,
        telegram_supports_inline_queries: botInfo.supports_inline_queries ?? null,
        token_ciphertext: encrypted.ciphertext,
        token_iv: encrypted.iv,
        token_auth_tag: encrypted.authTag,
        token_hint: tokenHint(token),
        webhook_secret: webhookSecret,
        webhook_url: webhookUrl,
        connected_at: new Date().toISOString(),
        last_heartbeat: new Date().toISOString(),
        last_error: null,
        status: 'online',
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('owner_id', user.id)
      .select('id, name, bot_username, status, is_active, telegram_bot_id, telegram_first_name, token_hint, webhook_url, connected_at')
      .single();

    if (error) throw error;
    return NextResponse.json({ bot: data, telegram: { id: botInfo.id, username: botInfo.username, first_name: botInfo.first_name } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Telegram connection failed.';
    await supabase.from('bots').update({ status: 'error', is_active: false, last_error: message, updated_at: new Date().toISOString() }).eq('id', id).eq('owner_id', user.id);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthenticatedServerUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { data: bot, error: fetchError } = await supabase
    .from('bots')
    .select('id, token_ciphertext, token_iv, token_auth_tag')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single();

  if (fetchError || !bot) return NextResponse.json({ error: 'Bot not found.' }, { status: 404 });

  // Token decryption is intentionally optional during disconnect; DB state is always revoked.
  try {
    const { decryptSecret } = await import('@/lib/telegram/crypto');
    const token = decryptSecret({ ciphertext: bot.token_ciphertext, iv: bot.token_iv, authTag: bot.token_auth_tag });
    await deleteTelegramWebhook(token);
  } catch {
    // Continue local revoke even if Telegram webhook deletion cannot be performed.
  }

  const { data, error } = await supabase
    .from('bots')
    .update({
      status: 'offline',
      is_active: false,
      token_ciphertext: null,
      token_iv: null,
      token_auth_tag: null,
      token_hint: null,
      webhook_secret: null,
      webhook_url: null,
      connected_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('owner_id', user.id)
    .select('id, name, bot_username, status, is_active')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bot: data });
}
