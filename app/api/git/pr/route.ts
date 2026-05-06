import { NextRequest, NextResponse } from 'next/server';
import { parseRepoUrl, createPullRequest, compareBranches } from '@/lib/github';

// POST /api/git/pr - Create a pull request
export async function POST(req: NextRequest) {
  try {
    const { repo_url, title, head, base = 'main', body = '' } = await req.json();

    if (!repo_url || !title || !head) {
      return NextResponse.json({ error: 'repo_url, title, and head are required' }, { status: 400 });
    }

    const parsed = parseRepoUrl(repo_url);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid GitHub repo URL' }, { status: 400 });
    }

    const result = await createPullRequest({
      owner: parsed.owner,
      repo: parsed.repo,
      title,
      head,
      base,
      body,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.pr }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/git/pr?repo_url=...&base=...&head=... - Compare branches (for PR preview)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const repoUrl = searchParams.get('repo_url');
    const base = searchParams.get('base') || 'main';
    const head = searchParams.get('head');

    if (!repoUrl || !head) {
      return NextResponse.json({ error: 'repo_url and head are required' }, { status: 400 });
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid GitHub repo URL' }, { status: 400 });
    }

    const comparison = await compareBranches(parsed.owner, parsed.repo, base, head);

    return NextResponse.json({ data: comparison });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
