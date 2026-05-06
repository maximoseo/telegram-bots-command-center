import { NextRequest, NextResponse } from 'next/server';
import { 
  parseRepoUrl, 
  createBranch, 
  createPullRequest,
  getCommits,
  getCommitFiles,
  compareBranches,
  branchExists,
  getRepoInfo,
} from '@/lib/github';

// POST /api/git/branch - Create a new branch
export async function POST(req: NextRequest) {
  try {
    const { repo_url, branch_name, from_branch = 'main' } = await req.json();

    if (!repo_url || !branch_name) {
      return NextResponse.json({ error: 'repo_url and branch_name are required' }, { status: 400 });
    }

    const parsed = parseRepoUrl(repo_url);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid GitHub repo URL' }, { status: 400 });
    }

    const result = await createBranch({
      owner: parsed.owner,
      repo: parsed.repo,
      branchName: branch_name,
      fromBranch: from_branch,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/git/branch?repo_url=...&branch=... - Check if branch exists
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const repoUrl = searchParams.get('repo_url');
    const branch = searchParams.get('branch');

    if (!repoUrl || !branch) {
      return NextResponse.json({ error: 'repo_url and branch are required' }, { status: 400 });
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid GitHub repo URL' }, { status: 400 });
    }

    const exists = await branchExists(parsed.owner, parsed.repo, branch);

    return NextResponse.json({ exists });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
