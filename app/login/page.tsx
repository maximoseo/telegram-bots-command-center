export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Login</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Command Center access</h1>
        <p className="mt-3 text-slate-600">Supabase Auth wiring is reserved for the next safe slice. This scaffold keeps the UI ready without exposing credentials.</p>
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Magic-link authentication will be enabled after RLS and redirect URLs are verified.</div>
        <a href="/dashboard" className="mt-6 inline-flex w-full justify-center rounded-2xl bg-slate-950 px-4 py-3 font-bold text-white">View read-only demo</a>
      </section>
    </main>
  );
}
