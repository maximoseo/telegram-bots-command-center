import { NextRequest, NextResponse } from 'next/server';
import { getRecentEvents } from '@/lib/orchestration';

interface Params {
  params: { id: string };
}

// GET /api/pipelines/[id]/events - Server-Sent Events stream
export async function GET(req: NextRequest, { params }: Params) {
  const pipelineId = params.id;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial events
      const events = await getRecentEvents(pipelineId, 20);
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'init', events })}\n\n`));

      // Set up Supabase realtime subscription
      const { subscribeToEvents, subscribeToStageUpdates } = await import('@/lib/orchestration');
      
      const eventSub = subscribeToEvents(pipelineId, (event) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'event', event })}\n\n`));
        } catch {}
      });

      const stageSub = subscribeToStageUpdates(pipelineId, (stage) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'stage_update', stage })}\n\n`));
        } catch {}
      });

      // Heartbeat every 30s
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 30000);

      // Cleanup on abort
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        eventSub.unsubscribe();
        stageSub.unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
