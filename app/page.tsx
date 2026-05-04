import { redirect } from 'next/navigation';

type HomePageProps = {
  searchParams: Promise<{
    code?: string;
    error?: string;
    error_code?: string;
    error_description?: string;
    next?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  if (params.code) {
    const nextPath = params.next && params.next.startsWith('/') ? params.next : '/dashboard';
    const query = new URLSearchParams({ code: params.code, next: nextPath });
    redirect(`/auth/callback?${query.toString()}`);
  }

  if (params.error || params.error_code || params.error_description) {
    const query = new URLSearchParams();
    query.set('next', '/dashboard');
    if (params.error) query.set('error', params.error);
    if (params.error_code) query.set('error_code', params.error_code);
    if (params.error_description) query.set('error_description', params.error_description);
    redirect(`/login?${query.toString()}`);
  }

  redirect('/dashboard');
}
