import { NextRequest, NextResponse } from 'next/server';
import { getGitActivity } from '@/lib/orchestration';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/pipelines/[id]/git
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: pipelineId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30');

    const activity = await getGitActivity(pipelineId, limit);
    return NextResponse.json({ data: activity });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
