'use client';

import { useState } from 'react';

interface Stage {
  name: string;
  description: string;
  bot_id: string;
  task_prompt: string;
  file_scope: string[];
  depends_on: number[]; // indexes of dependent stages
}

interface PipelineBuilderProps {
  bots: Array<{ id: string; name: string; username: string }>;
  onSubmit: (pipeline: {
    name: string;
    description: string;
    repo_url: string;
    branch: string;
    stages: Stage[];
    config: Record<string, unknown>;
  }) => void;
}

export function PipelineBuilder({ bots, onSubmit }: PipelineBuilderProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [stages, setStages] = useState<Stage[]>([]);
  const [autoMerge, setAutoMerge] = useState(true);
  const [conflictStrategy, setConflictStrategy] = useState<'pause' | 'keep_latest' | 'ai_merge'>('pause');
  const [autoPr, setAutoPr] = useState(false);
  const [timeout, setTimeout] = useState(30);

  const addStage = () => {
    setStages([...stages, {
      name: '',
      description: '',
      bot_id: '',
      task_prompt: '',
      file_scope: [],
      depends_on: [],
    }]);
  };

  const updateStage = (index: number, updates: Partial<Stage>) => {
    setStages(stages.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const removeStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name || !repoUrl || stages.length === 0) return;
    
    onSubmit({
      name,
      description,
      repo_url: repoUrl,
      branch,
      stages: stages.map((s, i) => ({ ...s, order_index: i })) as any,
      config: {
        timeout_minutes: timeout,
        auto_merge: autoMerge,
        conflict_strategy: conflictStrategy,
        auto_pr: autoPr,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-zinc-950 text-white">
      <h1 className="text-2xl font-bold mb-6">New Pipeline</h1>

      {/* Basic Info */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Pipeline Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Build New Dashboard Feature"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Branch</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="feature/new-feature"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-zinc-400 mb-1">Repository URL *</label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-zinc-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this pipeline does..."
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Stages</h2>
          <button
            onClick={addStage}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Stage
          </button>
        </div>

        {stages.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-8">
            No stages yet. Add stages to define your pipeline workflow.
          </p>
        ) : (
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={index} className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-cyan-400">Stage {index + 1}</span>
                  <button
                    onClick={() => removeStage(index)}
                    className="text-zinc-500 hover:text-red-400 text-sm"
                  >
                    ✕ Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Stage Name</label>
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => updateStage(index, { name: e.target.value })}
                      placeholder="Frontend Components"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Assign Bot</label>
                    <select
                      value={stage.bot_id}
                      onChange={(e) => updateStage(index, { bot_id: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Select bot...</option>
                      {bots.map(bot => (
                        <option key={bot.id} value={bot.id}>🤖 {bot.name} (@{bot.username})</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-zinc-500 mb-1">Task Prompt</label>
                    <textarea
                      value={stage.task_prompt}
                      onChange={(e) => updateStage(index, { task_prompt: e.target.value })}
                      placeholder="Build the header component with navigation..."
                      rows={2}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">File Scope (comma separated)</label>
                    <input
                      type="text"
                      value={stage.file_scope.join(', ')}
                      onChange={(e) => updateStage(index, { file_scope: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="src/components/**, src/styles/**"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Depends On (stage numbers)</label>
                    <input
                      type="text"
                      value={stage.depends_on.map(d => d + 1).join(', ')}
                      onChange={(e) => updateStage(index, { 
                        depends_on: e.target.value.split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < stages.length && n !== index) 
                      })}
                      placeholder="1, 2"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Visual Pipeline Flow */}
        {stages.length > 1 && (
          <div className="mt-4 p-3 bg-zinc-800/30 rounded-lg">
            <p className="text-xs text-zinc-500 mb-2">Pipeline Flow:</p>
            <div className="flex items-center gap-2 flex-wrap">
              {stages.map((stage, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-cyan-900/30 border border-cyan-800/50 rounded text-xs text-cyan-300">
                    {stage.name || `Stage ${i + 1}`}
                  </span>
                  {i < stages.length - 1 && <span className="text-zinc-600">→</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={autoMerge} onChange={(e) => setAutoMerge(e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500" />
            <span className="text-sm text-zinc-300">Auto-merge when no conflicts</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={autoPr} onChange={(e) => setAutoPr(e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500" />
            <span className="text-sm text-zinc-300">Auto-create PR when all stages complete</span>
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">On conflict:</span>
            <select value={conflictStrategy} onChange={(e) => setConflictStrategy(e.target.value as any)}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500">
              <option value="pause">Pause & notify me</option>
              <option value="keep_latest">Keep latest commit</option>
              <option value="ai_merge">AI auto-merge</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">Timeout per stage:</span>
            <select value={timeout} onChange={(e) => setTimeout(Number(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-500">
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!name || !repoUrl || stages.length === 0}
        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed rounded-xl text-lg font-bold transition-all"
      >
        🚀 Create Pipeline
      </button>
    </div>
  );
}
