import { NextRequest, NextResponse } from 'next/server';
import {
  getStagesForPipeline,
  updateStageStatus,
  logEvent,
  logGitActivity,
} from '@/lib/orchestration';
import { createClient } from '@/lib/supabase/client';

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/pipelines/[id]/start - Start pipeline execution
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: pipelineId } = await params;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const stages = await getStagesForPipeline(pipelineId);

    if (stages.length === 0) {
      return NextResponse.json({ error: 'Pipeline has no stages' }, { status: 400 });
    }

    // Update pipeline status to running
    const { updatePipelineStatus } = await import('@/lib/orchestration');
    await updatePipelineStatus(pipelineId, 'running');

    // Find stages with no dependencies (entry points)
    const entryStages = stages.filter(s => 
      !s.depends_on || s.depends_on.length === 0
    );

    // Start entry stages
    for (const stage of entryStages) {
      await updateStageStatus(stage.id, 'running');
      await logEvent({
        pipeline_id: pipelineId,
        stage_id: stage.id,
        bot_id: stage.bot_id || undefined,
        event_type: 'stage_start',
        payload: { stage_name: stage.name, bot_id: stage.bot_id },
      });

      // Send task to bot via Telegram (if bot assigned)
      if (stage.bot_id) {
        await sendTaskToBot(pipelineId, stage);
      }
    }

    await logEvent({
      pipeline_id: pipelineId,
      event_type: 'pipeline_start',
      payload: { 
        total_stages: stages.length, 
        entry_stages: entryStages.map(s => s.name),
      },
    });

    return NextResponse.json({ 
      data: { 
        message: 'Pipeline started',
        running_stages: entryStages.map(s => s.name),
      } 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper: Send task prompt to bot via Telegram
async function sendTaskToBot(pipelineId: string, stage: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || !stage.bot_id) return;

  // Build task message
  const message = `🎯 PIPELINE TASK

Stage: ${stage.name}
${stage.description ? `Description: ${stage.description}` : ''}

${stage.file_scope?.length ? `File Scope: ${stage.file_scope.join(', ')}` : ''}

TASK:
${stage.task_prompt || 'No specific prompt provided.'}

When done, report completion via /complete command.`;

  // Log the dispatch
  await logEvent({
    pipeline_id: pipelineId,
    stage_id: stage.id,
    bot_id: stage.bot_id,
    event_type: 'message',
    payload: { type: 'task_dispatch', message },
  });
}
