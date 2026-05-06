import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const USERNAME_DOMAIN = 'maximo-seo.com';
const DEFAULT_APP_PATH = '/dashboard';
const ALLOWED_PATH_PREFIXES = ['/dashboard', '/bots', '/conversations', '/broadcasts', '/analytics', '/audit', '/settings', '/orchestration'];

function normalizeIdentifier(value: unknown) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return '';
  return trimmed.includes('@') ? trimmed : `${trimmed}@${USERNAME_DOMAIN}`;
}

function normalizeSafeAppPath(value: unknown) {
  if (typeof value !== 'string') return DEFAULT_APP_PATH;
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_APP_PATH;

  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed).trim();
  } catch {
    decoded = trimmed;
  }

  const candidate = decoded.replace(/[\u0000-\u001F\u007F]/g, '');
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return DEFAULT_APP_PATH;
  if (/^[a-z][a-z0-9+.-]*:/i.test(candidate)) return DEFAULT_APP_PATH;

  return ALLOWED_PATH_PREFIXES.some((prefix) => candidate === prefix || candidate.startsWith(`${prefix}/`))
    ? candidate
    : DEFAULT_APP_PATH;
}

function isAllowedPostOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  const host = request.headers.get('host');
  if (!host) return false;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host || origin === 'https://tg-command-center.maximo-seo.ai';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isAllowedPostOrigin(request)) {
    return NextResponse.json({ ok: false, message: 'Invalid request origin.' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ ok: false, message: 'Supabase auth is not configured.' }, { status: 500 });
  }

  let body: { identifier?: unknown; password?: unknown; nextPath?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid login request.' }, { status: 400 });
  }

  const email = normalizeIdentifier(body.identifier);
  const password = typeof body.password === 'string' ? body.password : '';
  const nextPath = normalizeSafeAppPath(body.nextPath);

  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'Enter your username/email and password.' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, nextPath });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ ok: false, message: 'Invalid username or password.' }, { status: 401 });
  }

  return response;
}
