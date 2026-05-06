import { NextRequest, NextResponse } from 'next/server';
import {
  createPipeline,
  listPipelines,
  getPipeline,
  updatePipelineStatus,
  deletePipeline,
  createStages,
  getStagesForPipeline,
  logEvent,
} from '@/lib/orchestration';
import { createClient } from '@/lib/supabase/client';

// GET /api/pipelines - List all pipelines for current user
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const pipelines = await listPipelines(user.id);
    return NextResponse.json({ data: pipelines });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/pipelines - Create a new pipeline
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, description, repo_url, branch, config, stages, template_id } = body;

    if (!name || !repo_url) {
      return NextResponse.json({ error: 'name and repo_url are required' }, { status: 400 });
    }

    // Create pipeline
    const pipeline = await createPipeline({
      name,
      description,
      repo_url,
      branch: branch || 'main',
      created_by: user.id,
      template_id,
      config,
    });

    // Create stages if provided
    if (stages && stages.length > 0) {
      await createStages(pipeline.id, stages);
    }

    // Log creation event
    await logEvent({
      pipeline_id: pipeline.id,
      event_type: 'info',
      payload: { message: `Pipeline "${name}" created` },
    });

    const fullPipeline = await getPipeline(pipeline.id);
    return NextResponse.json({ data: fullPipeline }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
