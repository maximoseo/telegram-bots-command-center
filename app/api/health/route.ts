import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    ok: true,
    service: 'telegram-bots-command-center',
    mode: 'read-only-bootstrap',
    timestamp: new Date().toISOString()
  });
}
