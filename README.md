# Telegram Bots Command Center

Secure first-slice scaffold for a Telegram bot operations dashboard.

## Current scope

- Next.js 14 App Router + TypeScript + Tailwind CSS
- Read-only dashboard pages for overview, bots, conversations, analytics, settings
- `/api/health` endpoint
- Minimal Supabase migration with owner-based RLS
- No Telegram token storage or bot lifecycle actions in this phase
- No LLM proxy or webhook registration in this phase

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

## Security notes

- Do not commit `.env*` files.
- Browser code may only use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Service role keys, Render API keys, Telegram tokens, and LLM provider keys are server-only.
- First migration intentionally excludes raw Telegram tokens and provider API keys.
