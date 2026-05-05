import Link from 'next/link';
import { BarChart3, Bot, Gauge, LogOut, MessageSquare, Settings, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: Gauge },
  { href: '/bots', label: 'Bots', icon: Bot },
  { href: '/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings }
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-slate-200 bg-white/85 backdrop-blur dark:border-dark-border dark:bg-dark-surface/88 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-soft dark:bg-dark-accent dark:shadow-none"><Bot size={22} /></div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-dark-muted">Telegram Bots</p>
            <h1 className="text-lg font-black tracking-tight text-slate-950 dark:text-dark-text">Command Center</h1>
          </div>
        </div>
        <div className="px-4 pb-4 lg:hidden">
          <ThemeToggle />
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:overflow-visible">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-dark-muted dark:hover:bg-dark-card dark:hover:text-dark-text">
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-4 pb-4 lg:block">
          <ThemeToggle />
        </div>
        <form action="/auth/sign-out" method="post" className="mx-4 mb-4">
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-dark-border dark:bg-dark-card dark:text-dark-text dark:hover:bg-slate-800">
            <LogOut size={16} /> Sign out
          </button>
        </form>
        <div className="mx-4 mb-5 hidden rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-950 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100 lg:block">
          <div className="mb-2 flex items-center gap-2 font-bold"><ShieldCheck size={16} /> Safe first slice</div>
          Read-only dashboard shell. No bot tokens, no webhooks, no lifecycle controls.
        </div>
      </aside>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
