-- Real Telegram bot connection foundation.
-- Uses a separate table so we do not need to ALTER the existing owner-created bots table.
-- Raw Telegram bot tokens must never be exposed to the browser or committed.

create table if not exists public.bot_connections (
  bot_id uuid primary key references public.bots(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  telegram_bot_id bigint,
  telegram_first_name text,
  telegram_can_join_groups boolean,
  telegram_can_read_all_group_messages boolean,
  telegram_supports_inline_queries boolean,
  token_ciphertext text,
  token_iv text,
  token_auth_tag text,
  token_hint text,
  webhook_secret text,
  webhook_url text,
  connected_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, telegram_bot_id)
);

create index if not exists bot_connections_owner_idx on public.bot_connections(owner_id);
create index if not exists bot_connections_webhook_secret_idx on public.bot_connections(webhook_secret) where webhook_secret is not null;

alter table public.bot_connections enable row level security;

drop policy if exists "bot_connections_select_own" on public.bot_connections;
create policy "bot_connections_select_own" on public.bot_connections for select to authenticated using (owner_id = auth.uid());

