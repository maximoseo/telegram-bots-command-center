-- Real Telegram bot connection foundation: encrypted token metadata + webhook state.
-- Raw Telegram bot tokens must never be exposed to the browser or committed.

alter table public.bots
  add column if not exists telegram_bot_id bigint,
  add column if not exists telegram_first_name text,
  add column if not exists telegram_can_join_groups boolean,
  add column if not exists telegram_can_read_all_group_messages boolean,
  add column if not exists telegram_supports_inline_queries boolean,
  add column if not exists token_ciphertext text,
  add column if not exists token_iv text,
  add column if not exists token_auth_tag text,
  add column if not exists token_hint text,
  add column if not exists webhook_secret text,
  add column if not exists webhook_url text,
  add column if not exists connected_at timestamptz,
  add column if not exists last_error text;

create index if not exists bots_owner_telegram_id_idx on public.bots(owner_id, telegram_bot_id);
create index if not exists bots_webhook_secret_idx on public.bots(webhook_secret) where webhook_secret is not null;

-- Needed for webhook conversation upserts by Telegram chat.
create unique index if not exists conversations_owner_bot_chat_uidx
  on public.conversations(owner_id, bot_id, telegram_chat_id);
