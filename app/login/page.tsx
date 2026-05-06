import { LoginForm } from '@/components/auth/LoginForm';
import { Zap, Shield, BarChart3, Bot } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Product framing */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-sidebar-bg flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-text-inverse shadow-lg">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-fg">Telegram Bots</p>
              <h1 className="text-lg font-bold text-sidebar-fg-active">Command Center</h1>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-sidebar-fg-active mb-4">
            Manage your bots<br />from a secure console
          </h2>
          <p className="text-sidebar-fg text-lg leading-relaxed mb-8">
            Observability, analytics, and control for your Telegram bot operations.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sidebar-fg-active">Secure by default</h3>
                <p className="text-sm text-sidebar-fg">Read-only dashboard. No bot tokens exposed.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent shrink-0">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-sidebar-fg-active">Real-time analytics</h3>
                <p className="text-sm text-sidebar-fg">Track LLM usage, costs, and performance.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent shrink-0">
                <Bot className="h-5 w-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold text-sidebar-fg-active">Multi-bot support</h3>
                <p className="text-sm text-sidebar-fg">Manage all your bots in one place.</p>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-sidebar-fg/60">
          © 2026 Telegram Bots Command Center. All rights reserved.
        </p>
      </div>
      
      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-bg">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-text-inverse shadow-lg">
                <Zap size={28} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">Welcome back</h2>
            <p className="text-text-muted">Sign in with your username and password</p>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
