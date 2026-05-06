import { NextRequest, NextResponse } from 'next/server';
import { parseRepoUrl, getCommits } from '@/lib/github';

// GET /api/git/commits?repo_url=...&branch=...&limit=30
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const repoUrl = searchParams.get('repo_url');
    const branch = searchParams.get('branch') || 'main';
    const limit = parseInt(searchParams.get('limit') || '30');

    if (!repoUrl) {
      return NextResponse.json({ error: 'repo_url is required' }, { status: 400 });
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid GitHub repo URL' }, { status: 400 });
    }

    const commits = await getCommits(parsed.owner, parsed.repo, branch, limit);

    return NextResponse.json({ data: commits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
