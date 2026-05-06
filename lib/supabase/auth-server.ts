import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getAuthenticatedServerUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Server components/API read cookies here; auth routes/middleware handle writes.
      }
    }
  });

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
