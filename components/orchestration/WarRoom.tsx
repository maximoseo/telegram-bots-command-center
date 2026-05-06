'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FileText, GitBranch, Clock, AlertTriangle, Activity, Terminal } from 'lucide-react';

interface WarRoomProps {
  pipelineId: string;
}

interface Stage {
  id: string;
  name: string;
  status: string;
  bot_id: string | null;
  progress?: number;
  file_scope: string[];
  started_at: string | null;
  completed_at: string | null;
}

interface ExecutionEvent {
  id: number;
  event_type: string;
  payload: any;
  created_at: string;
  bot_id: string | null;
  stage_id: string | null;
}

interface GitActivity {
  id: string;
  commit_sha: string | null;
  files_changed: string[];
  message: string | null;
  bot_id: string | null;
  created_at: string;
  additions: number;
  deletions: number;
}

interface FileOwnership {
  [filePath: string]: {
    botId: string;
    botName: string;
    color: string;
    lastModified: string;
  };
}

interface Bot {
  id: string;
  name: string;
  color: string;
}

const BOT_COLORS: Record<string, string> = {
  'bot-1': '#06b6d4', // cyan
  'bot-2': '#a855f7', // purple
  'bot-3': '#22c55e', // green
  'bot-4': '#f97316', // orange
};

export function WarRoom({ pipelineId }: WarRoomProps) {
  const [pipeline, setPipeline] = useState<any>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const [gitActivity, setGitActivity] = useState<GitActivity[]>([]);
  const [fileOwnership, setFileOwnership] = useState<FileOwnership>({});
  const [bots, setBots] = useState<Bot[]>([]);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    setupRealtimeSubscriptions();
  }, [pipelineId]);

  useEffect(() => {
    // Auto-scroll events feed
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  useEffect(() => {
    // Build file ownership map from git activity
    const ownership: FileOwnership = {};
    gitActivity.forEach((activity) => {
      const bot = bots.find(b => b.id === activity.bot_id);
      if (bot) {
        activity.files_changed.forEach(file => {
          ownership[file] = {
            botId: bot.id,
            botName: bot.name,
            color: bot.color,
            lastModified: activity.created_at,
          };
        });
      }
    });
    setFileOwnership(ownership);
  }, [gitActivity, bots]);

  const loadData = async () => {
    try {
      // Load pipeline details
      const pipelineRes = await fetch(`/api/pipelines/${pipelineId}`);
      const { data: pipelineData } = await pipelineRes.json();
      setPipeline(pipelineData);

      // Load stages
      const stagesRes = await fetch(`/api/pipelines/${pipelineId}/stages`);
      const { data: stagesData } = await stagesRes.json();
      setStages(stagesData || []);

      // Load events
      const eventsRes = await fetch(`/api/pipelines/${pipelineId}/events`);
      const { data: eventsData } = await eventsRes.json();
      setEvents(eventsData || []);

      // Load git activity
      const gitRes = await fetch(`/api/pipelines/${pipelineId}/git`);
      const { data: gitData } = await gitRes.json();
      setGitActivity(gitData || []);

      // Load bots
      const botsRes = await fetch('/api/bots');
      const { data: botsData } = await botsRes.json();
      setBots(botsData || []);
    } catch (error) {
      console.error('Failed to load war room data:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const supabase = createClient();

    // Subscribe to execution events
    const eventsChannel = supabase
      .channel(`pipeline-events-${pipelineId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'execution_events',
        filter: `pipeline_id=eq.${pipelineId}`,
      }, (payload) => {
        setEvents((prev) => [payload.new as ExecutionEvent, ...prev]);
      })
      .subscribe();

    // Subscribe to stage updates
    const stagesChannel = supabase
      .channel(`pipeline-stages-${pipelineId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'pipeline_stages',
        filter: `pipeline_id=eq.${pipelineId}`,
      }, (payload) => {
        setStages((prev) =>
          prev.map((s) => (s.id === payload.new.id ? payload.new as Stage : s))
        );
      })
      .subscribe();

    // Subscribe to git activity
    const gitChannel = supabase
      .channel(`pipeline-git-${pipelineId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'git_activity',
        filter: `pipeline_id=eq.${pipelineId}`,
      }, (payload) => {
        setGitActivity((prev) => [payload.new as GitActivity, ...prev]);
      })
      .subscribe();

    return () => {
      eventsChannel.unsubscribe();
      stagesChannel.unsubscribe();
      gitChannel.unsubscribe();
    };
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-zinc-700 text-zinc-400',
      running: 'bg-cyan-500/20 text-cyan-400 animate-pulse',
      completed: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
      blocked: 'bg-yellow-500/20 text-yellow-400',
      skipped: 'bg-zinc-600/20 text-zinc-500',
    };
    return colors[status] || colors.pending;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'success': return <Activity className="w-4 h-4 text-green-400" />;
      default: return <Terminal className="w-4 h-4 text-cyan-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getBotColor = (botId: string | null) => {
    if (!botId) return '#71717a';
    const bot = bots.find(b => b.id === botId);
    return bot?.color || BOT_COLORS[botId] || '#71717a';
  };

  const calculateProgress = () => {
    if (stages.length === 0) return 0;
    const completed = stages.filter(s => s.status === 'completed').length;
    return Math.round((completed / stages.length) * 100);
  };

  return (
    <div className="p-6 bg-zinc-950 min-h-screen text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{pipeline?.name || 'War Room'}</h1>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span className="flex items-center gap-1">
            <GitBranch className="w-4 h-4" />
            {pipeline?.branch}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(pipeline?.status || 'pending')}`}>
            {pipeline?.status}
          </span>
          <span>{calculateProgress()}% Complete</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stages + File Map */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stage Progress */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Pipeline Stages
            </h2>
            <div className="space-y-2">
              {stages.map((stage, idx) => {
                const bot = bots.find(b => b.id === stage.bot_id);
                return (
                  <div key={stage.id} className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: getBotColor(stage.bot_id) }}
                        />
                        <span className="text-sm font-medium">{stage.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(stage.status)}`}>
                        {stage.status}
                      </span>
                    </div>
                    {bot && <div className="text-xs text-zinc-500">{bot.name}</div>}
                    {stage.status === 'running' && stage.progress !== undefined && (
                      <div className="mt-2 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 transition-all duration-300"
                          style={{ width: `${stage.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* File Map */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              File Ownership Map
            </h2>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto custom-scrollbar">
              {Object.entries(fileOwnership).map(([file, owner]) => (
                <div key={file} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: owner.color }}
                  />
                  <span className="text-zinc-400 truncate flex-1 font-mono">{file}</span>
                  <span className="text-zinc-600 text-[10px]">{owner.botName}</span>
                </div>
              ))}
              {Object.keys(fileOwnership).length === 0 && (
                <div className="text-zinc-500 text-xs text-center py-4">No file activity yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column: Git Timeline */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 h-full">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-green-400" />
              Git Timeline
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              {gitActivity.map((activity, idx) => {
                const bot = bots.find(b => b.id === activity.bot_id);
                return (
                  <div key={activity.id} className="relative">
                    {/* Timeline connector */}
                    {idx < gitActivity.length - 1 && (
                      <div className="absolute left-[7px] top-6 w-0.5 h-full bg-zinc-800" />
                    )}
                    
                    <div className="flex gap-3">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-zinc-900 flex-shrink-0 z-10"
                        style={{ backgroundColor: bot?.color || '#71717a' }}
                      />
                      <div className="flex-1 pb-4">
                        <div className="text-xs text-zinc-400 mb-1">
                          {formatTimestamp(activity.created_at)}
                        </div>
                        <div className="text-sm font-medium mb-1">
                          {activity.message || 'Commit'}
                        </div>
                        {bot && <div className="text-xs text-zinc-500 mb-2">{bot.name}</div>}
                        {activity.commit_sha && (
                          <div className="text-xs text-cyan-400 font-mono mb-2">
                            {activity.commit_sha.slice(0, 7)}
                          </div>
                        )}
                        <div className="flex gap-3 text-xs">
                          <span className="text-green-400">+{activity.additions}</span>
                          <span className="text-red-400">-{activity.deletions}</span>
                          <span className="text-zinc-500">{activity.files_changed.length} files</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {gitActivity.length === 0 && (
                <div className="text-zinc-500 text-xs text-center py-8">No commits yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Feed */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 h-full flex flex-col">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-orange-400" />
              Live Feed
            </h2>
            <div className="flex-1 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
              {events.map((event) => {
                const bot = bots.find(b => b.id === event.bot_id);
                return (
                  <div key={event.id} className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                    <div className="flex items-start gap-2">
                      {getEventIcon(event.event_type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium capitalize">{event.event_type}</span>
                          <span className="text-[10px] text-zinc-500">
                            {formatTimestamp(event.created_at)}
                          </span>
                        </div>
                        {bot && (
                          <div className="text-xs text-zinc-500 mb-1">{bot.name}</div>
                        )}
                        <div className="text-xs text-zinc-400">
                          {event.payload?.message || JSON.stringify(event.payload)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={eventsEndRef} />
              {events.length === 0 && (
                <div className="text-zinc-500 text-xs text-center py-8">No events yet</div>
              )}
            </div>
          </div>
        </div>
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
