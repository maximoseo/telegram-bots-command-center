'use client';

import { useEffect, useState } from 'react';
import { WarRoom } from '@/components/orchestration/WarRoom';
import { PipelineBuilder } from '@/components/orchestration/PipelineBuilder';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Pipeline {
  id: string;
  name: string;
  status: string;
  repo_url: string;
  branch: string;
  progress: number;
  created_at: string;
}

export default function OrchestrationPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'create' | 'warroom'>('list');
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPipelines();
    loadBots();
  }, []);

  const loadPipelines = async () => {
    try {
      const res = await fetch('/api/pipelines');
      const { data } = await res.json();
      setPipelines(data || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const loadBots = async () => {
    try {
      const res = await fetch('/api/bots');
      const { data } = await res.json();
      setBots(data || []);
    } catch {}
  };

  const handleCreatePipeline = async (pipeline: any) => {
    const res = await fetch('/api/pipelines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pipeline),
    });
    const { data } = await res.json();
    if (data) {
      setPipelines([data, ...pipelines]);
      setSelectedPipeline(data.id);
      setView('warroom');
    }
  };

  const handleStartPipeline = async (id: string) => {
    await fetch(`/api/pipelines/${id}/start`, { method: 'POST' });
    setSelectedPipeline(id);
    setView('warroom');
    loadPipelines();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-zinc-700 text-zinc-300',
      running: 'bg-cyan-500/20 text-cyan-400',
      paused: 'bg-yellow-500/20 text-yellow-400',
      completed: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
    };
    return styles[status] || styles.draft;
  };

  // War Room view
  if (view === 'warroom' && selectedPipeline) {
    return (
      <ErrorBoundary>
        <div>
          <button
            onClick={() => { setView('list'); setSelectedPipeline(null); }}
            className="mb-4 px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to Pipelines
          </button>
          <WarRoom pipelineId={selectedPipeline} />
        </div>
      </ErrorBoundary>
    );
  }

  // Create view
  if (view === 'create') {
    return (
      <ErrorBoundary>
        <div>
          <button
            onClick={() => setView('list')}
            className="mb-4 px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to Pipelines
          </button>
          <PipelineBuilder bots={bots} onSubmit={handleCreatePipeline} />
        </div>
      </ErrorBoundary>
    );
  }

  // List view
  return (
    <ErrorBoundary>
      <div className="p-6 bg-zinc-950 min-h-screen text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🎯 Orchestration</h1>
          <p className="text-zinc-400 text-sm">Multi-bot pipelines working on the same codebase</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition-colors"
        >
          + New Pipeline
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading pipelines..." />
        </div>
      ) : pipelines.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-zinc-400 text-lg mb-2">No pipelines yet</p>
          <p className="text-zinc-500 text-sm mb-4">Create your first pipeline to orchestrate bots working together</p>
          <button
            onClick={() => setView('create')}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition-colors"
          >
            Create Pipeline
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelines.map((pipeline) => (
            <div
              key={pipeline.id}
              className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 hover:border-zinc-700 transition-colors cursor-pointer"
              onClick={() => { setSelectedPipeline(pipeline.id); setView('warroom'); }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-zinc-200 truncate">{pipeline.name}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(pipeline.status)}`}>
                  {pipeline.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-3 font-mono truncate">{pipeline.repo_url}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Branch: {pipeline.branch}</span>
                {pipeline.status === 'draft' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStartPipeline(pipeline.id); }}
                    className="px-2 py-1 bg-cyan-700 hover:bg-cyan-600 rounded text-xs transition-colors"
                  >
                    ▶ Start
                  </button>
                )}
              </div>
              {pipeline.status === 'running' && (
                <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 animate-pulse rounded-full" style={{ width: `${pipeline.progress}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}
