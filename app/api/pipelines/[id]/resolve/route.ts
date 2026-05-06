import { NextRequest, NextResponse } from 'next/server';
import { resolveConflict, getPendingConflicts, logEvent, updatePipelineStatus } from '@/lib/orchestration';
import { createClient } from '@/lib/supabase/client';

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/pipelines/[id]/resolve - Resolve a conflict
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { conflict_id, resolution, resolved_content } = body;

    if (!conflict_id || !resolution) {
      return NextResponse.json({ error: 'conflict_id and resolution required' }, { status: 400 });
    }

    await resolveConflict(conflict_id, resolution, resolved_content);

    await logEvent({
      pipeline_id: id,
      event_type: 'merge_ok',
      payload: { conflict_id, resolution },
    });

    // Check if all conflicts resolved — resume pipeline if paused
    const remaining = await getPendingConflicts(id);
    if (remaining.length === 0) {
      await updatePipelineStatus(id, 'running');
      await logEvent({
        pipeline_id: id,
        event_type: 'info',
        payload: { message: 'All conflicts resolved, pipeline resumed' },
      });
    }

    return NextResponse.json({ 
      data: { 
        resolved: true, 
        remaining_conflicts: remaining.length,
      } 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
