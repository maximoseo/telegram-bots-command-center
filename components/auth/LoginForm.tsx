"use client";

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoginState = 'idle' | 'loading' | 'success' | 'error';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo = '/dashboard' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<LoginState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setState('error');
      setErrorMessage('Please enter your email address');
      return;
    }

    setState('loading');
    
    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        throw new Error('Failed to initialize Supabase client');
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}${redirectTo}`,
        },
      });

      if (error) {
        throw error;
      }

      setState('success');
    } catch (err) {
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-text">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === 'error') setState('idle');
            }}
            disabled={state === 'loading' || state === 'success'}
            className={cn(
              "pl-10 bg-bg-elevated border-line text-text placeholder:text-muted",
              state === 'error' && "border-error"
            )}
            required
          />
        </div>
      </div>

      {state === 'error' && (
        <div className="flex items-center gap-2 rounded-lg bg-error-bg border border-error-border p-3 text-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {state === 'success' && (
        <div className="flex items-center gap-2 rounded-lg bg-success-bg border border-success-border p-3 text-sm text-success">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <p>Check your email for a magic link to sign in.</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={state === 'loading' || state === 'success'}
        className="w-full bg-primary text-text-inverse hover:bg-primary-hover"
      >
        {state === 'loading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending magic link...
          </>
        ) : state === 'success' ? (
          'Magic link sent'
        ) : (
          'Send magic link'
        )}
      </Button>

      <p className="text-xs text-center text-muted">
        We&apos;ll send you a secure magic link to sign in. No password needed.
      </p>
    </form>
  );
}
