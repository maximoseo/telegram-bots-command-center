import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Telegram Bots Command Center',
  description: 'Read-only command center scaffold for Telegram bot operations and LLM usage observability.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
