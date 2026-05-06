"use client";

import { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type LoginState = 'idle' | 'loading' | 'error';

interface LoginFormProps {
  redirectTo?: string;
}

function normalizeNextPath(value: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  return value;
}

export function LoginForm({ redirectTo = '/dashboard' }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<LoginState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const safeRedirectTo = normalizeNextPath(redirectTo);
  const disabled = state === 'loading';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim() || !password) {
      setState('error');
      setErrorMessage('Please enter your username/email and password.');
      return;
    }

    setState('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, nextPath: safeRedirectTo })
      });
      const result = await response.json().catch(() => ({ ok: false, message: 'Login failed.' }));

      if (!response.ok || !result.ok) {
        setState('error');
        setErrorMessage(result.message || 'Invalid username or password.');
        return;
      }

      window.location.assign(result.nextPath || safeRedirectTo);
    } catch {
      setState('error');
      setErrorMessage('Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-text">Username or email</Label>
        <div className="relative">
          <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="maximoseo"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (state === 'error') setState('idle');
            }}
            disabled={disabled}
            className={cn(
              "pl-10 bg-bg-elevated border-line text-text placeholder:text-muted",
              state === 'error' && "border-error"
            )}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-text">Password</Label>
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (state === 'error') setState('idle');
            }}
            disabled={disabled}
            className={cn(
              "pl-10 pr-10 bg-bg-elevated border-line text-text placeholder:text-muted",
              state === 'error' && "border-error"
            )}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition hover:text-text"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={disabled}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {state === 'error' && (
        <div className="flex items-center gap-2 rounded-lg bg-error-bg border border-error-border p-3 text-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={disabled}
        className="w-full bg-primary text-text-inverse hover:bg-primary-hover"
      >
        {state === 'loading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>

      <p className="text-xs text-center text-muted">
        Use your command-center username or email. Username `maximoseo` is supported.
      </p>
    </form>
  );
}
