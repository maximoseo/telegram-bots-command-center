'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient(url: string, anonKey: string) {
  if (!url || !anonKey) {
    return null;
  }

  return createBrowserClient(url, anonKey);
}
