import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  BarChart3, 
  Bot, 
  Gauge, 
  MessageSquare, 
  Settings, 
  ShieldCheck,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: Gauge },
  { href: '/bots', label: 'Bots', icon: Bot },
  { href: '/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings }
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-sidebar-bg border-r border-line transform transition-transform duration-300 ease-in-out lg:transform-none",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-accent">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-text-inverse shadow-md">
            <Zap size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-fg truncate">Telegram Bots</p>
            <h1 className="text-sm font-bold text-sidebar-fg-active tracking-tight">Command Center</h1>
          </div>
          <button 
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg text-sidebar-fg hover:text-sidebar-fg-active hover:bg-sidebar-accent transition"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {nav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-fg-active" 
                    : "text-sidebar-fg hover:text-sidebar-fg-active hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon size={18} className={isActive ? "text-primary" : ""} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Info box */}
        <div className="mx-3 mb-4 rounded-lg border border-line bg-bg-sunken p-3 text-xs">
          <div className="mb-1.5 flex items-center gap-2 font-semibold text-text">
            <ShieldCheck size={14} className="text-success" /> 
            Safe first slice
          </div>
          <p className="text-text-muted leading-relaxed">
            Read-only dashboard. No bot tokens or webhooks.
          </p>
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-accent">
          <div className="flex items-center justify-between">
            <ThemeToggle className="scale-90 origin-left" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-bg-elevated/80 backdrop-blur-md px-4">
          <button 
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-bg-sunken transition"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-semibold text-text truncate">
            {nav.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.label || 'Command Center'}
          </h1>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
