import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN;

if (!GITHUB_TOKEN) {
  console.warn('[GitHub] No GitHub token found. Git operations will be limited.');
}

export const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

export interface CreateBranchParams {
  owner: string;
  repo: string;
  branchName: string;
  fromBranch?: string;
}

export interface CreatePRParams {
  owner: string;
  repo: string;
  title: string;
  head: string;
  base: string;
  body?: string;
}

export interface CommitInfo {
  sha: string;
  message: string;
  author: {
    name: string;
    date: string;
  };
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
}

/**
 * Parse GitHub repo URL to extract owner and repo name
 */
export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com[/:]([\w-]+)\/([\w-]+?)(\.git)?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

/**
 * Create a new branch from an existing branch
 */
export async function createBranch({ owner, repo, branchName, fromBranch = 'main' }: CreateBranchParams) {
  try {
    // Get the SHA of the source branch
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${fromBranch}`,
    });

    const sha = refData.object.sha;

    // Create new branch
    const { data } = await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha,
    });

    return {
      success: true,
      branch: branchName,
      sha: data.object.sha,
    };
  } catch (error: any) {
    if (error.status === 422) {
      // Branch already exists
      return { success: false, error: 'Branch already exists' };
    }
    throw error;
  }
}

/**
 * Get commit history for a branch
 */
export async function getCommits(owner: string, repo: string, branch: string, limit = 30): Promise<CommitInfo[]> {
  const { data } = await octokit.repos.listCommits({
    owner,
    repo,
    sha: branch,
    per_page: limit,
  });

  return data.map(commit => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: {
      name: commit.commit.author?.name || 'Unknown',
      date: commit.commit.author?.date || new Date().toISOString(),
    },
    stats: {
      additions: commit.stats?.additions || 0,
      deletions: commit.stats?.deletions || 0,
      total: commit.stats?.total || 0,
    },
  }));
}

/**
 * Get files changed in a commit
 */
export async function getCommitFiles(owner: string, repo: string, sha: string) {
  const { data } = await octokit.repos.getCommit({
    owner,
    repo,
    ref: sha,
  });

  return data.files?.map(file => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    changes: file.changes,
    patch: file.patch,
  })) || [];
}

/**
 * Create a pull request
 */
export async function createPullRequest({ owner, repo, title, head, base, body = '' }: CreatePRParams) {
  try {
    const { data } = await octokit.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body,
    });

    return {
      success: true,
      pr: {
        number: data.number,
        url: data.html_url,
        state: data.state,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check if a branch exists
 */
export async function branchExists(owner: string, repo: string, branch: string): Promise<boolean> {
  try {
    await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get repository info
 */
export async function getRepoInfo(owner: string, repo: string) {
  const { data } = await octokit.repos.get({
    owner,
    repo,
  });

  return {
    name: data.name,
    full_name: data.full_name,
    description: data.description,
    default_branch: data.default_branch,
    private: data.private,
    url: data.html_url,
  };
}

/**
 * Compare two branches/commits
 */
export async function compareBranches(owner: string, repo: string, base: string, head: string) {
  const { data } = await octokit.repos.compareCommits({
    owner,
    repo,
    base,
    head,
  });

  return {
    ahead_by: data.ahead_by,
    behind_by: data.behind_by,
    total_commits: data.total_commits,
    commits: data.commits.map(c => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author?.name,
      date: c.commit.author?.date,
    })),
    files: data.files?.map(f => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
    })) || [],
  };
}
