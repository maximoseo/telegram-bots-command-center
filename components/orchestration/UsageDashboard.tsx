'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Zap, Clock, Activity } from 'lucide-react';

interface UsageDashboardProps {
  pipelineId: string;
}

interface UsageLog {
  id: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  latency_ms: number;
  created_at: string;
  bot_id: string | null;
  stage_id: string | null;
}

interface UsageStats {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  avg_latency: number;
}

const COLORS = ['#06b6d4', '#a855f7', '#22c55e', '#f97316', '#ec4899', '#f59e0b'];

export function UsageDashboard({ pipelineId }: UsageDashboardProps) {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [stats, setStats] = useState<UsageStats>({
    total_requests: 0,
    total_tokens: 0,
    total_cost: 0,
    avg_latency: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsageData();
    const interval = setInterval(loadUsageData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [pipelineId]);

  const loadUsageData = async () => {
    try {
      const res = await fetch(`/api/ai/proxy?pipeline_id=${pipelineId}`);
      const { data, stats: statsData } = await res.json();
      setLogs(data || []);
      setStats(statsData || { total_requests: 0, total_tokens: 0, total_cost: 0, avg_latency: 0 });
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModelDistribution = () => {
    const distribution: Record<string, number> = {};
    logs.forEach(log => {
      const modelName = log.model.split('/').pop() || log.model;
      distribution[modelName] = (distribution[modelName] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getCostOverTime = () => {
    const costByHour: Record<string, number> = {};
    logs.forEach(log => {
      const hour = new Date(log.created_at).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      costByHour[hour] = (costByHour[hour] || 0) + log.cost_usd;
    });
    return Object.entries(costByHour).map(([hour, cost]) => ({ 
      hour, 
      cost: parseFloat(cost.toFixed(4)) 
    }));
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="animate-pulse text-zinc-400 text-center">Loading usage data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-zinc-400">Total Requests</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.total_requests}</div>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-zinc-400">Total Tokens</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {(stats.total_tokens / 1000).toFixed(1)}K
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-sm text-zinc-400">Total Cost</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${stats.total_cost.toFixed(4)}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-zinc-400">Avg Latency</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(stats.avg_latency)}ms
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Over Time */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Cost Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={getCostOverTime()}>
              <XAxis 
                dataKey="hour" 
                tick={{ fill: '#71717a', fontSize: 10 }}
                stroke="#3f3f46"
              />
              <YAxis 
                tick={{ fill: '#71717a', fontSize: 10 }}
                stroke="#3f3f46"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number) => `$${value.toFixed(4)}`}
              />
              <Bar dataKey="cost" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Model Distribution */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Model Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={getModelDistribution()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getModelDistribution().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Recent AI Calls</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
          {logs.slice(0, 20).map(log => (
            <div key={log.id} className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{log.model}</span>
                <span className="text-xs text-zinc-500">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <span>{log.total_tokens} tokens</span>
                <span className="text-green-400">${log.cost_usd.toFixed(4)}</span>
                <span>{log.latency_ms}ms</span>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-zinc-500 text-xs text-center py-8">No AI usage yet</div>
          )}
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
