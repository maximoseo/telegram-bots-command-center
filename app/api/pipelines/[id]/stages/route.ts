import { NextRequest, NextResponse } from 'next/server';
import { getStagesForPipeline } from '@/lib/orchestration';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/pipelines/[id]/stages
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id: pipelineId } = await params;
    const stages = await getStagesForPipeline(pipelineId);
    return NextResponse.json({ data: stages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
