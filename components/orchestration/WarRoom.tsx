'use client';

import { useEffect, useState, useRef } from 'react';
import { Pipeline, PipelineStage, ExecutionEvent, GitActivity } from '@/lib/orchestration';

interface WarRoomProps {
  pipelineId: string;
}

export function WarRoom({ pipelineId }: WarRoomProps) {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const [gitActivity, setGitActivity] = useState<GitActivity[]>([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetch(`/api/pipelines/${pipelineId}`)
      .then(r => r.json())
      .then(({ data }) => {
        setPipeline(data);
        setStages(data.stages || []);
        setEvents(data.events || []);
        setGitActivity(data.git_activity || []);
      });
  }, [pipelineId]);

  // SSE connection for real-time updates
  useEffect(() => {
    const es = new EventSource(`/api/pipelines/${pipelineId}/events`);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      
      if (data.type === 'event') {
        setEvents(prev => [data.event, ...prev].slice(0, 100));
      } else if (data.type === 'stage_update') {
        setStages(prev => prev.map(s => s.id === data.stage.id ? data.stage : s));
      } else if (data.type === 'init') {
        setEvents(data.events || []);
      }
    };

    return () => es.close();
  }, [pipelineId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'running': return 'text-cyan-400';
      case 'failed': return 'text-red-400';
      case 'pending': return 'text-zinc-500';
      case 'blocked': return 'text-yellow-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '🔄';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      case 'blocked': return '🚫';
      default: return '○';
    }
  };

  const getProgress = (stage: PipelineStage) => {
    if (stage.status === 'completed') return 100;
    if (stage.status === 'pending' || stage.status === 'blocked') return 0;
    if (stage.status === 'running') {
      // Estimate based on events
      const stageEvents = events.filter(e => e.stage_id === stage.id);
      const commits = stageEvents.filter(e => e.event_type === 'commit').length;
      return Math.min(90, commits * 25 + 10);
    }
    return 0;
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'commit': return '●';
      case 'file_write': return '📝';
      case 'push': return '⬆️';
      case 'merge_ok': return '✅';
      case 'conflict': return '⚠️';
      case 'stage_start': return '▶️';
      case 'stage_complete': return '🏁';
      case 'error': return '❌';
      default: return '○';
    }
  };

  if (!pipeline) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-zinc-400">Loading pipeline...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{pipeline.name}</h1>
          <p className="text-zinc-400 text-sm">
            {pipeline.repo_url} • Branch: {pipeline.branch}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            pipeline.status === 'running' ? 'bg-cyan-500/20 text-cyan-400' :
            pipeline.status === 'completed' ? 'bg-green-500/20 text-green-400' :
            pipeline.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
            pipeline.status === 'failed' ? 'bg-red-500/20 text-red-400' :
            'bg-zinc-700 text-zinc-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              pipeline.status === 'running' ? 'bg-cyan-400 animate-pulse' :
              pipeline.status === 'completed' ? 'bg-green-400' :
              pipeline.status === 'paused' ? 'bg-yellow-400' :
              pipeline.status === 'failed' ? 'bg-red-400' :
              'bg-zinc-500'
            }`} />
            {pipeline.status.toUpperCase()}
          </span>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} 
                title={connected ? 'Connected' : 'Disconnected'} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stages Panel */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <h2 className="text-lg font-semibold mb-4 text-zinc-200">Stages</h2>
          <div className="space-y-4">
            {stages.map((stage) => {
              const progress = getProgress(stage);
              return (
                <div key={stage.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span>{getStatusIcon(stage.status)}</span>
                      <span className={`font-medium ${getStatusColor(stage.status)}`}>
                        {stage.order_index + 1}. {stage.name}
                      </span>
                    </span>
                    <span className="text-xs text-zinc-500">{progress}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stage.status === 'completed' ? 'bg-green-500' :
                        stage.status === 'running' ? 'bg-cyan-500 animate-pulse' :
                        stage.status === 'failed' ? 'bg-red-500' :
                        'bg-zinc-700'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {stage.status === 'running' && stage.bot_id && (
                    <p className="text-xs text-zinc-500">Bot working...</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-zinc-200">Live Feed</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {events.slice(0, 50).map((event) => (
              <div key={event.id} className="flex items-start gap-3 py-2 border-b border-zinc-800/50">
                <span className="text-xs text-zinc-500 whitespace-nowrap mt-0.5">
                  {formatTime(event.created_at)}
                </span>
                <span>{getEventIcon(event.event_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 truncate">
                    {event.payload?.message || event.event_type}
                  </p>
                  {event.payload?.file && (
                    <p className="text-xs text-zinc-500 font-mono">{event.payload.file as string}</p>
                  )}
                  {event.payload?.files_changed && (
                    <p className="text-xs text-zinc-500">
                      +{event.payload.additions || 0} -{event.payload.deletions || 0} ({(event.payload.files_changed as string[])?.length} files)
                    </p>
                  )}
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-8">
                No events yet. Start the pipeline to see activity.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Git Timeline */}
      {gitActivity.length > 0 && (
        <div className="mt-6 bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <h2 className="text-lg font-semibold mb-4 text-zinc-200">Git Timeline</h2>
          
          {/* Visual timeline */}
          <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
            {gitActivity.slice(0, 20).reverse().map((git, i) => (
              <div key={git.id} className="flex flex-col items-center min-w-[60px]">
                <div className={`w-3 h-3 rounded-full ${
                  git.bot_id ? 'bg-cyan-400' : 'bg-purple-400'
                }`} />
                {i < gitActivity.length - 1 && (
                  <div className="w-8 h-0.5 bg-zinc-700 -mt-1.5 -ml-8" />
                )}
                <span className="text-[10px] text-zinc-500 mt-1">
                  {formatTime(git.created_at)}
                </span>
              </div>
            ))}
          </div>

          {/* Commit list */}
          <div className="space-y-2">
            {gitActivity.slice(0, 10).map((git) => (
              <div key={git.id} className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-zinc-400 text-xs whitespace-nowrap">
                  {formatTime(git.created_at)}
                </span>
                <span className="text-zinc-200 truncate flex-1">
                  {git.message || 'No message'}
                </span>
                <span className="text-xs text-green-400">+{git.additions}</span>
                <span className="text-xs text-red-400">-{git.deletions}</span>
                <span className="text-xs text-zinc-500">{git.files_changed?.length || 0} files</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
