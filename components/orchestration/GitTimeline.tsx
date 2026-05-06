'use client';

import { useState, useEffect } from 'react';
import { GitBranch, GitPullRequest, Check, X, Loader } from 'lucide-react';

interface GitTimelineProps {
  pipelineId: string;
  repoUrl: string;
  branch: string;
  onPRCreated?: (prUrl: string) => void;
}

interface Commit {
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

export function GitTimeline({ pipelineId, repoUrl, branch, onPRCreated }: GitTimelineProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingPR, setCreatingPR] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);

  useEffect(() => {
    loadCommits();
    const interval = setInterval(loadCommits, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [repoUrl, branch]);

  const loadCommits = async () => {
    try {
      const res = await fetch(`/api/git/commits?repo_url=${encodeURIComponent(repoUrl)}&branch=${branch}&limit=20`);
      const { data } = await res.json();
      setCommits(data || []);
    } catch (error) {
      console.error('Failed to load commits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePR = async () => {
    setCreatingPR(true);
    try {
      const res = await fetch('/api/git/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_url: repoUrl,
          title: `[Orchestration] Pipeline ${pipelineId}`,
          head: branch,
          base: 'main',
          body: `Auto-generated PR from orchestration pipeline ${pipelineId}\n\n**Changes:**\n- ${commits.length} commits\n- ${commits.reduce((sum, c) => sum + c.stats.additions, 0)} additions\n- ${commits.reduce((sum, c) => sum + c.stats.deletions, 0)} deletions`,
        }),
      });

      const { data, error } = await res.json();
      if (error) {
        alert(`Failed to create PR: ${error}`);
      } else {
        setPrUrl(data.url);
        if (onPRCreated) onPRCreated(data.url);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setCreatingPR(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="animate-pulse text-zinc-400 text-center">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-cyan-400" />
          Git Timeline
        </h2>
        {!prUrl && commits.length > 0 && (
          <button
            onClick={handleCreatePR}
            disabled={creatingPR}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg text-sm font-medium transition-colors"
          >
            {creatingPR ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <GitPullRequest className="w-4 h-4" />
                Create PR
              </>
            )}
          </button>
        )}
        {prUrl && (
          <a
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
          >
            <Check className="w-4 h-4" />
            View PR
          </a>
        )}
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
        {commits.map((commit, idx) => (
          <div key={commit.sha} className="relative">
            {/* Timeline connector */}
            {idx < commits.length - 1 && (
              <div className="absolute left-[7px] top-6 w-0.5 h-full bg-zinc-800" />
            )}

            <div className="flex gap-3">
              <div className="w-4 h-4 rounded-full bg-cyan-500 border-2 border-zinc-900 flex-shrink-0 z-10" />
              
              <div className="flex-1 pb-4">
                <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm text-white mb-1 leading-tight">
                        {commit.message.split('\n')[0]}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {commit.author.name} · {formatDate(commit.author.date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <code className="text-xs text-cyan-400 font-mono bg-zinc-900/50 px-2 py-0.5 rounded">
                      {commit.sha.slice(0, 7)}
                    </code>
                    <div className="flex gap-2 text-xs">
                      <span className="text-green-400">+{commit.stats.additions}</span>
                      <span className="text-red-400">-{commit.stats.deletions}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {commits.length === 0 && (
          <div className="text-zinc-500 text-sm text-center py-8">
            No commits on this branch yet
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #18181b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #52525b;
        }
      `}</style>
    </div>
  );
}
