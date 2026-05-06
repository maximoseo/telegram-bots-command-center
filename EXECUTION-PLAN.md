# TG Command Center — Execution Plan
**Created:** 2026-05-05 | **Branch:** `alpha/bootstrap-readonly-dashboard`
**Status:** Typecheck ✅ | Lint ✅ | Build ✅

---

## What We Found

### Current Alpha Scaffold — Works ✅
- Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui
- Supabase magic link auth (production: wired, protecting routes)
- 5 dashboard pages: Overview, Bots, Conversations, Analytics, Settings
- `/api/health` endpoint
- Database schema in `supabase/migrations/` (not yet applied to production Supabase)
- Recharts in package.json (not used yet)

### Issues Found — Needs Work ❌
1. **CSS tokens are barebones** — only 4 variables (`--bg`, `--text`, `--muted`, `--line`), no dark mode tokens
2. **Dark mode doesn't exist** — no theme provider, no toggle, no `.dark` class
3. **Dashboard uses mock data only** — `lib/mock-data.ts`, no Supabase queries, no real data flow
4. **Login page is placeholder** — just "View read-only demo" link, no magic link form rendering
5. **Analytics page uses manual CSS bars** — Recharts is installed but unused for charts
6. **Sidebar is basic** — no active state highlighting, no mobile hamburger
7. **Shell needs redesign** — missing header, user menu, theme toggle, responsive polish
8. **No component for empty/loading/error states** — DataNotice and EmptyState listed in OVERHAUL-PLAN but don't exist yet
9. **Conversion overlay is missing** — no loading skeletons, no transition states
10. **Supabase client lib** — `lib/supabase.ts` exists but doesn't handle server-side client

### What the Master Plan Covers
The master plan (`08-telegram-command-center` document) defines 6 phases from making alpha useful through broadcasts & analytics. The existing OVERHAUL-PLAN.md covers UI/UX overhaul in 8 PRs.

---

## Prioritized Execution Order

### Phase 0 — Foundation (NOW)
**Goal:** Make the dashboard work with real Supabase data and professional visual design

| # | Task | File(s) | Priority |
|---|------|---------|----------|
| 0.1 | Apply Supabase migration to production project | `supabase/migrations/` | 🔴 Critical |
| 0.2 | Set up `.env.local` with production Supabase credentials | `.env.local` | 🔴 Critical |
| 0.3 | Create `lib/supabase/server.ts` for server-side queries | `lib/supabase/server.ts` | 🔴 Critical |
| 0.4 | Create `lib/supabase/queries.ts` — real data functions | `lib/supabase/queries.ts` | 🔴 Critical |

### Phase 1 — Semantic Design System
**Goal:** Full CSS token palette, dark mode system, theme provider

| # | Task | File(s) |
|---|------|---------|
| 1.1 | Expand `app/globals.css` — full semantic token system (light + dark) | `app/globals.css` |
| 1.2 | Create `components/theme-provider.tsx` — `light`/`dark`/`system` | `components/theme-provider.tsx` |
| 1.3 | Create `components/ThemeToggle.tsx` — accessible pill toggle | `components/ThemeToggle.tsx` |
| 1.4 | Update `app/layout.tsx` — theme bootstrapping + body classes | `app/layout.tsx` |
| 1.5 | Add dark mode support to `tailwind.config.ts` (`darkMode: 'class'`) | `tailwind.config.ts` |

### Phase 2 — Shell Redesign
**Goal:** Premium sidebar, top header, user menu, mobile responsive nav

| # | Task | File(s) |
|---|------|---------|
| 2.1 | Redesign `Shell.tsx` — sidebar with active states, header with theme toggle | `components/Shell.tsx` |
| 2.2 | Add mobile hamburger nav + slideover | `components/Shell.tsx` or `components/navigation/MobileNav.tsx` |
| 2.3 | Add user dropdown (email, sign out) | `components/Shell.tsx` |
| 2.4 | Add brand logo + gradient identity | `components/Shell.tsx` |

### Phase 3 — Login Experience
**Goal:** Trustworthy, polished magic link auth page

| # | Task | File(s) |
|---|------|---------|
| 3.1 | Build `components/auth/LoginForm.tsx` — full states (idle/loading/success/error) | `components/auth/LoginForm.tsx` |
| 3.2 | Redesign `app/login/page.tsx` — two-column layout, product framing | `app/login/page.tsx` |
| 3.3 | Create `app/auth/callback/route.ts` — Supabase OAuth callback | `app/auth/callback/route.ts` |
| 3.4 | Create middleware for route protection | `middleware.ts` |

### Phase 4 — Dashboard Overview with Real Data
**Goal:** Overview page fetches from Supabase, shows real metrics

| # | Task | File(s) |
|---|------|---------|
| 4.1 | Rewrite `app/dashboard/page.tsx` → async server component with Supabase data | `app/dashboard/page.tsx` |
| 4.2 | Enhance `MetricCard.tsx` — icons, trends, tones, loading state | `components/MetricCard.tsx` |
| 4.3 | Create `components/DataNotice.tsx` — info/warning/error/success variants | `components/DataNotice.tsx` |
| 4.4 | Create `components/EmptyState.tsx` — icon, description, optional CTA | `components/EmptyState.tsx` |
| 4.5 | Create `components/Skeleton.tsx` — loading skeletons for cards | `components/Skeleton.tsx` |
| 4.6 | Enhance `StatusBadge.tsx` — dot animation, sizes | `components/StatusBadge.tsx` |

### Phase 5 — Bot Management
**Goal:** CRUD for bots via API routes, configuration UI

| # | Task | File(s) |
|---|------|---------|
| 5.1 | Build `app/api/bots/route.ts` — GET/POST | `app/api/bots/route.ts` |
| 5.2 | Build `app/api/bots/[id]/route.ts` — GET/PATCH/DELETE | `app/api/bots/[id]/route.ts` |
| 5.3 | Redesign `app/bots/page.tsx` — card/table view toggle, real data | `app/bots/page.tsx` |
| 5.4 | Create `components/bots/AddBotModal.tsx` | `components/bots/AddBotModal.tsx` |
| 5.5 | Create `components/bots/BotCard.tsx` | `components/bots/BotCard.tsx` |
| 5.6 | Build `app/dashboard/bots/[botId]/page.tsx` — detail + config tabs | `app/dashboard/bots/[botId]/page.tsx` |

### Phase 6 — Real-time Conversations
**Goal:** Live message viewer with Supabase Realtime

| # | Task | File(s) |
|---|------|---------|
| 6.1 | Build `app/api/conversations/route.ts` | `app/api/conversations/route.ts` |
| 6.2 | Build `app/api/messages/route.ts` | `app/api/messages/route.ts` |
| 6.3 | Redesign `app/conversations/page.tsx` — search, filter, real data | `app/conversations/page.tsx` |
| 6.4 | Create `components/conversations/ConversationDetail.tsx` — chat UI | `components/conversations/ConversationDetail.tsx` |
| 6.5 | Create `components/conversations/MessageBubble.tsx` | `components/conversations/MessageBubble.tsx` |
| 6.6 | Add Supabase Realtime subscription for live messages | `components/conversations/LiveMessageFeed.tsx` |

### Phase 7 — Analytics with Recharts
**Goal:** Actual charts, date range filtering, export

| # | Task | File(s) |
|---|------|---------|
| 7.1 | Build `app/api/analytics/route.ts` | `app/api/analytics/route.ts` |
| 7.2 | Redesign `app/analytics/page.tsx` — Recharts, date picker | `app/analytics/page.tsx` |
| 7.3 | Create `components/analytics/MessageChart.tsx` | `components/analytics/MessageChart.tsx` |
| 7.4 | Create `components/analytics/CostChart.tsx` | `components/analytics/CostChart.tsx` |
| 7.5 | Add CSV export | `components/analytics/ExportButton.tsx` |

### Phase 8 — Telegram Bot Integration
**Goal:** Webhook registration, token encryption, message receiving

| # | Task | File(s) |
|---|------|---------|
| 8.1 | Build `lib/telegram/crypto.ts` — AES-256-GCM encryption | `lib/telegram/crypto.ts` |
| 8.2 | Build `lib/telegram/client.ts` — Bot API wrapper | `lib/telegram/client.ts` |
| 8.3 | Build `app/api/telegram/webhook/route.ts` | `app/api/telegram/webhook/route.ts` |
| 8.4 | Build `app/api/bots/[id]/webhook/route.ts` | `app/api/bots/[id]/webhook/route.ts` |
| 8.5 | Add token management UI in bot config | `components/bots/TokenManager.tsx` |

### Phase 9 — AI Response Engine
**Goal:** OpenRouter integration, per-bot AI config

| # | Task | File(s) |
|---|------|---------|
| 9.1 | Build `lib/ai/responder.ts` | `lib/ai/responder.ts` |
| 9.2 | Build `app/api/bots/[id]/ai-config/route.ts` | `app/api/bots/[id]/ai-config/route.ts` |
| 9.3 | Add AI config UI tab in bot detail | `components/bots/AIConfigTab.tsx` |
| 9.4 | Add command handler system | `components/bots/CommandEditor.tsx` |

### Phase 10 — Broadcasts
**Goal:** Message broadcasting, scheduling, delivery tracking

| # | Task | File(s) |
|---|------|---------|
| 10.1 | Build `app/api/broadcasts/route.ts` | `app/api/broadcasts/route.ts` |
| 10.2 | Build `app/dashboard/broadcasts/page.tsx` | `app/dashboard/broadcasts/page.tsx` |
| 10.3 | Create `components/broadcasts/BroadcastComposer.tsx` | `components/broadcasts/BroadcastComposer.tsx` |
| 10.4 | Create `components/broadcasts/BroadcastStats.tsx` | `components/broadcasts/BroadcastStats.tsx` |

---

## Files That DON'T Exist Yet (Need Creating)

```
components/
├── theme-provider.tsx        ✨ NEW
├── ThemeToggle.tsx           ✨ NEW
├── DataNotice.tsx            ✨ NEW
├── EmptyState.tsx            ✨ NEW
├── Skeleton.tsx              ✨ NEW
├── auth/
│   └── LoginForm.tsx         ✨ NEW
├── bots/
│   ├── AddBotModal.tsx       ✨ NEW
│   ├── BotCard.tsx           ✨ NEW
│   ├── BotConfigForm.tsx     ✨ NEW
│   ├── CommandEditor.tsx     ✨ NEW
│   └── TokenManager.tsx      ✨ NEW
├── conversations/
│   ├── ConversationDetail.tsx ✨ NEW
│   ├── ConversationList.tsx   ✨ NEW
│   ├── MessageBubble.tsx      ✨ NEW
│   └── LiveMessageFeed.tsx    ✨ NEW
├── broadcasts/
│   ├── BroadcastComposer.tsx  ✨ NEW
│   ├── BroadcastList.tsx      ✨ NEW
│   └── BroadcastStats.tsx     ✨ NEW
├── analytics/
│   ├── MessageChart.tsx       ✨ NEW
│   ├── CostChart.tsx          ✨ NEW
│   └── ExportButton.tsx       ✨ NEW
├── navigation/
│   └── MobileNav.tsx          ✨ NEW
lib/
├── supabase/
│   ├── server.ts              ✨ NEW
│   └── queries.ts             ✨ NEW
├── telegram/
│   ├── client.ts              ✨ NEW
│   ├── webhook-handler.ts     ✨ NEW
│   ├── types.ts               ✨ NEW
│   └── crypto.ts              ✨ NEW
├── ai/
│   └── responder.ts           ✨ NEW
app/
├── auth/callback/route.ts     ✨ NEW
├── api/
│   ├── bots/route.ts          ✨ NEW
│   ├── bots/[id]/route.ts     ✨ NEW
│   ├── bots/[id]/webhook/route.ts ✨ NEW
│   ├── conversations/route.ts ✨ NEW
│   ├── messages/route.ts      ✨ NEW
│   ├── broadcasts/route.ts    ✨ NEW
│   ├── telegram/webhook/route.ts ✨ NEW
│   └── analytics/route.ts     ✨ NEW
├── dashboard/bots/[botId]/page.tsx ✨ NEW
├── dashboard/broadcasts/page.tsx   ✨ NEW
├── dashboard/broadcasts/new/page.tsx ✨ NEW
supabase/
└── migrations/002_bots_and_messages.sql ✨ NEW
middleware.ts                   ✨ NEW
```

---

## What We Start With NOW

**Phase 0: Foundation** — the first things to build immediately:

1. **Apply migration** to new Supabase project (`jzfamdshbfbwolupywrw`)
2. **Set up `.env.local`** with production credentials  
3. **Create server Supabase client** (`lib/supabase/server.ts`)
4. **Create query functions** (`lib/supabase/queries.ts`)
5. **Wire real data** into dashboard overview page
6. **Add middleware** for auth protection

Then move to Phase 1 (design system) and Phase 2 (shell redesign).

---

## Environment Variables Needed

```env
NEXT_PUBLIC_SUPABASE_URL=https://jzfamdshbfbwolupywrw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZmFtZHNoYmZid29sdXB5d3J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NjkyMTUsImV4cCI6MjA5MzU0NTIxNX0.QE4WHojuDPTz3ETPIN9u6sGjpEfpsoRt6zFtTCZzkM8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZmFtZHNoYmZid29sdXB5d3J3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk2OTIxNSwiZXhwIjoyMDkzNTQ1MjE1fQ.mGSBvmW7xH8jn3cCCp0hKWDZMEYwq15NwKfeDNPlq6g
NEXT_PUBLIC_APP_URL=https://tg-command-center.maximo-seo.ai
APP_URL=https://tg-command-center.maximo-seo.ai
```

---

## Next Step
I'll begin **Phase 0** — creating the foundation files and applying the migration to the new Supabase project. Ready?
