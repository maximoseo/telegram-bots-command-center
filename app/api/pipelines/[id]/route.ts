import { NextRequest, NextResponse } from 'next/server';
import {
  getPipeline,
  updatePipelineStatus,
  deletePipeline,
  getStagesForPipeline,
  getRecentEvents,
  getGitActivity,
  getPendingConflicts,
  logEvent,
} from '@/lib/orchestration';
import { createClient } from '@/lib/supabase/client';

interface Params {
  params: { id: string };
}

// GET /api/pipelines/[id] - Get pipeline details with stages, events, git activity
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const pipeline = await getPipeline(params.id);
    if (!pipeline) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const [stages, events, gitActivity, conflicts] = await Promise.all([
      getStagesForPipeline(params.id),
      getRecentEvents(params.id, 100),
      getGitActivity(params.id),
      getPendingConflicts(params.id),
    ]);

    return NextResponse.json({
      data: {
        ...pipeline,
        stages,
        events,
        git_activity: gitActivity,
        conflicts,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/pipelines/[id] - Update pipeline (status, config)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { status } = body;

    if (status) {
      const pipeline = await updatePipelineStatus(params.id, status);
      await logEvent({
        pipeline_id: params.id,
        event_type: status === 'running' ? 'pipeline_start' : 
                   status === 'completed' ? 'pipeline_complete' :
                   status === 'failed' ? 'pipeline_fail' :
                   status === 'paused' ? 'pipeline_pause' : 'info',
        payload: { message: `Pipeline status changed to ${status}` },
      });
      return NextResponse.json({ data: pipeline });
    }

    return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/pipelines/[id] - Delete pipeline
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await deletePipeline(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
