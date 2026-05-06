import { Loader } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader className={`${sizeClasses[size]} text-cyan-400 animate-spin`} />
      {text && <p className="text-zinc-400 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

export function LoadingCard({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}
