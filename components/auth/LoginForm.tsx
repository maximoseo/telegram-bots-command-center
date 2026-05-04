'use client';

import { useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type LoginFormProps = {
  nextPath: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function LoginForm({ nextPath, supabaseUrl, supabaseAnonKey }: LoginFormProps) {
  const envReady = Boolean(supabaseUrl && supabaseAnonKey);
  const supabase = useMemo(
    () => createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    if (!supabase || !envReady) {
      setStatus('error');
      setMessage('Supabase environment variables are not configured yet.');
      return;
    }

    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath || '/dashboard')}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });

    if (error) {
      setStatus('error');
      setMessage(error.message);
      return;
    }

    setStatus('sent');
    setMessage('Magic link sent. Check your email and return through the link.');
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-bold text-slate-700">Email address</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="service@maximo-seo.com"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-indigo-600 transition focus:ring-2"
          disabled={!envReady || status === 'loading'}
        />
      </label>
      <button
        type="submit"
        disabled={!envReady || status === 'loading'}
        className="inline-flex w-full justify-center rounded-2xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {status === 'loading' ? 'Sending...' : 'Send magic link'}
      </button>
      {message ? (
        <div className={`rounded-2xl p-4 text-sm ${status === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{message}</div>
      ) : null}
    </form>
  );
}
