import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const protectedRoutes = ['/dashboard', '/bots', '/conversations', '/analytics', '/settings'];
const authRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const code = request.nextUrl.searchParams.get('code');
    const error = request.nextUrl.searchParams.get('error');
    const errorCode = request.nextUrl.searchParams.get('error_code');
    const errorDescription = request.nextUrl.searchParams.get('error_description');

    if (code) {
      const callbackUrl = new URL('/auth/callback', request.url);
      callbackUrl.searchParams.set('code', code);
      callbackUrl.searchParams.set('next', '/dashboard');
      return NextResponse.redirect(callbackUrl);
    }

    if (error || errorCode || errorDescription) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', '/dashboard');
      if (error) loginUrl.searchParams.set('error', error);
      if (errorCode) loginUrl.searchParams.set('error_code', errorCode);
      if (errorDescription) loginUrl.searchParams.set('error_description', errorDescription);
      return NextResponse.redirect(loginUrl);
    }
  }

  const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtected) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('reason', 'missing_supabase_env');
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/bots/:path*', '/conversations/:path*', '/analytics/:path*', '/settings/:path*', '/login']
};
