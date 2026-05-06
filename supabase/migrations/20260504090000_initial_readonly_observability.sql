-- Initial read-only observability schema for Telegram Bots Command Center.
-- This phase intentionally excludes Telegram bot tokens and LLM provider API keys.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  bot_username text,
  agent_type text,
  llm_provider text,
  llm_model text,
  status text not null default 'offline' check (status in ('online','offline','error','paused')),
  last_heartbeat timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  bot_id uuid not null references public.bots(id) on delete cascade,
  telegram_chat_id bigint,
  telegram_user_id bigint,
  username text,
  message_count int not null default 0,
  total_tokens int not null default 0,
  total_cost numeric(10,4) not null default 0,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  bot_id uuid not null references public.bots(id) on delete cascade,
  direction text not null check (direction in ('incoming','outgoing')),
  sender_type text not null check (sender_type in ('user','bot','system')),
  content_type text not null default 'text',
  content text,
  tokens_used int not null default 0,
  cost numeric(10,6) not null default 0,
  llm_model text,
  latency_ms int,
  created_at timestamptz not null default now()
);

create table if not exists public.llm_calls (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  bot_id uuid references public.bots(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  provider text not null,
  model text not null,
  prompt_tokens int not null default 0,
  completion_tokens int not null default 0,
  total_tokens int not null default 0,
  total_cost numeric(10,6) not null default 0,
  latency_ms int,
  status text not null default 'success',
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.token_usage_daily (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  bot_id uuid references public.bots(id) on delete cascade,
  usage_date date not null,
  provider text not null,
  model text not null,
  total_calls int not null default 0,
  total_prompt_tokens int not null default 0,
  total_completion_tokens int not null default 0,
  total_tokens int not null default 0,
  total_cost numeric(10,4) not null default 0,
  avg_latency_ms int,
  error_count int not null default 0,
  unique(owner_id, bot_id, usage_date, provider, model)
);

alter table public.profiles enable row level security;
alter table public.bots enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.llm_calls enable row level security;
alter table public.token_usage_daily enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "bots_select_own" on public.bots;
drop policy if exists "conversations_select_own" on public.conversations;
drop policy if exists "messages_select_own" on public.messages;
drop policy if exists "llm_calls_select_own" on public.llm_calls;
drop policy if exists "token_usage_daily_select_own" on public.token_usage_daily;

create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "bots_select_own" on public.bots for select to authenticated using (owner_id = auth.uid());
create policy "conversations_select_own" on public.conversations for select to authenticated using (owner_id = auth.uid());
create policy "messages_select_own" on public.messages for select to authenticated using (owner_id = auth.uid());
create policy "llm_calls_select_own" on public.llm_calls for select to authenticated using (owner_id = auth.uid());
create policy "token_usage_daily_select_own" on public.token_usage_daily for select to authenticated using (owner_id = auth.uid());

create index if not exists bots_owner_status_idx on public.bots(owner_id, status);
create index if not exists conversations_owner_last_idx on public.conversations(owner_id, last_message_at desc);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at desc);
create index if not exists llm_calls_owner_created_idx on public.llm_calls(owner_id, created_at desc);
create index if not exists token_usage_daily_owner_date_idx on public.token_usage_daily(owner_id, usage_date desc);
