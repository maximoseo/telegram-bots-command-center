import { LoginForm } from '@/components/auth/LoginForm';
import { hasSupabaseEnv } from '@/lib/supabase/env';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reason?: string }> }) {
  const params = await searchParams;
  const envReady = hasSupabaseEnv();
  const nextPath = params.next && params.next.startsWith('/') ? params.next : '/dashboard';
  const missingEnv = params.reason === 'missing_supabase_env' || !envReady;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Login</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Command Center access</h1>
        <p className="mt-3 text-slate-600">Sign in with a Supabase magic link. Dashboard routes are protected after this step.</p>
        {missingEnv ? (
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            Supabase public environment variables are missing in this environment. Configure them before production sign-in.
          </div>
        ) : null}
        <LoginForm nextPath={nextPath} envReady={envReady} />
      </section>
    </main>
  );
}
