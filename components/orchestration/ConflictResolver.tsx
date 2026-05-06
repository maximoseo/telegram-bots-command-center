'use client';

import { PipelineConflict } from '@/lib/orchestration';
import { useState } from 'react';

interface ConflictResolverProps {
  conflict: PipelineConflict;
  onResolve: (conflictId: string, resolution: string, content?: string) => void;
}

export function ConflictResolver({ conflict, onResolve }: ConflictResolverProps) {
  const [manualContent, setManualContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResolve = async (resolution: string) => {
    setLoading(true);
    await onResolve(conflict.id, resolution, resolution === 'manual' ? manualContent : undefined);
    setLoading(false);
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-red-800/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-red-400 text-lg">⚠️</span>
        <h3 className="text-lg font-semibold text-red-300">Conflict Detected</h3>
      </div>

      <p className="text-sm text-zinc-400 mb-4 font-mono">{conflict.file_path}</p>

      {/* Side by side diff */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-medium text-cyan-400 mb-2">Bot A Version</h4>
          <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 overflow-x-auto max-h-64 overflow-y-auto">
            {conflict.bot_a_content || 'No content'}
          </pre>
        </div>
        <div>
          <h4 className="text-sm font-medium text-purple-400 mb-2">Bot B Version</h4>
          <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 overflow-x-auto max-h-64 overflow-y-auto">
            {conflict.bot_b_content || 'No content'}
          </pre>
        </div>
      </div>

      {/* Manual merge area */}
      <div className="mb-4">
        <label className="block text-sm text-zinc-400 mb-1">Manual Merge (optional)</label>
        <textarea
          value={manualContent}
          onChange={(e) => setManualContent(e.target.value)}
          placeholder="Paste your merged version here..."
          rows={4}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyan-500 resize-none"
        />
      </div>

      {/* Resolution buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleResolve('keep_a')}
          disabled={loading}
          className="px-4 py-2 bg-cyan-800/50 hover:bg-cyan-700/50 border border-cyan-700 rounded-lg text-sm text-cyan-300 transition-colors disabled:opacity-50"
        >
          Keep Bot A
        </button>
        <button
          onClick={() => handleResolve('keep_b')}
          disabled={loading}
          className="px-4 py-2 bg-purple-800/50 hover:bg-purple-700/50 border border-purple-700 rounded-lg text-sm text-purple-300 transition-colors disabled:opacity-50"
        >
          Keep Bot B
        </button>
        <button
          onClick={() => handleResolve('manual')}
          disabled={loading || !manualContent}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-sm text-zinc-300 transition-colors disabled:opacity-50"
        >
          Use Manual Merge
        </button>
        <button
          onClick={() => handleResolve('ai_merge')}
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-amber-800/50 to-orange-800/50 hover:from-amber-700/50 hover:to-orange-700/50 border border-amber-700 rounded-lg text-sm text-amber-300 transition-colors disabled:opacity-50"
        >
          ✨ AI Merge
        </button>
      </div>
    </div>
  );
}
