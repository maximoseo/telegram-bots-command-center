'use client';

import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Settings, Trash2, Play } from 'lucide-react';

interface Bot {
  id: string;
  name: string;
  description: string | null;
  color: string;
}

interface PipelineBuilderProps {
  bots: Bot[];
  onSubmit: (pipeline: any) => void;
}

interface StageNodeData {
  label: string;
  botId: string | null;
  botName: string;
  botColor: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  taskPrompt: string;
  fileScope: string[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Custom Stage Node Component
function StageNode({ data, id }: NodeProps<StageNodeData>) {
  const getStatusColor = () => {
    switch (data.status) {
      case 'running': return 'border-cyan-500 bg-cyan-500/10';
      case 'completed': return 'border-green-500 bg-green-500/10';
      case 'failed': return 'border-red-500 bg-red-500/10';
      default: return 'border-zinc-700 bg-zinc-800/50';
    }
  };

  return (
    <div className={`px-4 py-3 rounded-lg border-2 ${getStatusColor()} backdrop-blur-sm min-w-[200px] transition-all`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-cyan-500" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.botColor }}
          />
          <span className="text-sm font-semibold text-white">{data.label}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => data.onEdit(id)}
            className="p-1 hover:bg-zinc-700 rounded transition-colors"
          >
            <Settings className="w-3 h-3 text-zinc-400" />
          </button>
          <button
            onClick={() => data.onDelete(id)}
            className="p-1 hover:bg-red-900/30 rounded transition-colors"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>
      
      <div className="text-xs text-zinc-400 mb-1">{data.botName}</div>
      
      {data.status === 'running' && (
        <div className="mt-2 h-1 bg-zinc-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-cyan-500 transition-all duration-300 animate-pulse"
            style={{ width: `${data.progress}%` }}
          />
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-purple-500" />
    </div>
  );
}

const nodeTypes = {
  stageNode: StageNode,
};

export function PipelineBuilder({ bots, onSubmit }: PipelineBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [pipelineName, setPipelineName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [nodeConfig, setNodeConfig] = useState({
    name: '',
    botId: '',
    taskPrompt: '',
    fileScope: '',
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#06b6d4' } }, eds)),
    [setEdges]
  );

  const addStage = () => {
    const newNode: Node<StageNodeData> = {
      id: `stage-${Date.now()}`,
      type: 'stageNode',
      position: { x: Math.random() * 400 + 100, y: nodes.length * 150 + 100 },
      data: {
        label: 'New Stage',
        botId: null,
        botName: 'No Bot',
        botColor: '#71717a',
        status: 'pending',
        progress: 0,
        taskPrompt: '',
        fileScope: [],
        onEdit: (id) => {
          const node = nodes.find(n => n.id === id);
          if (node) {
            setEditingNode(id);
            setNodeConfig({
              name: node.data.label,
              botId: node.data.botId || '',
              taskPrompt: node.data.taskPrompt,
              fileScope: node.data.fileScope.join(', '),
            });
          }
        },
        onDelete: (id) => {
          setNodes((nds) => nds.filter((n) => n.id !== id));
          setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
        },
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const saveNodeConfig = () => {
    if (!editingNode) return;
    
    const selectedBot = bots.find(b => b.id === nodeConfig.botId);
    
    setNodes((nds) =>
      nds.map((node) =>
        node.id === editingNode
          ? {
              ...node,
              data: {
                ...node.data,
                label: nodeConfig.name || 'Unnamed Stage',
                botId: nodeConfig.botId,
                botName: selectedBot?.name || 'No Bot',
                botColor: selectedBot?.color || '#71717a',
                taskPrompt: nodeConfig.taskPrompt,
                fileScope: nodeConfig.fileScope.split(',').map(s => s.trim()).filter(Boolean),
              },
            }
          : node
      )
    );
    setEditingNode(null);
    setNodeConfig({ name: '', botId: '', taskPrompt: '', fileScope: '' });
  };

  const handleSubmit = () => {
    if (!pipelineName || !repoUrl || nodes.length === 0) {
      alert('Please provide pipeline name, repo URL, and at least one stage');
      return;
    }

    // Build dependency graph from edges
    const dependencyMap: Record<string, string[]> = {};
    edges.forEach(edge => {
      if (!dependencyMap[edge.target]) {
        dependencyMap[edge.target] = [];
      }
      dependencyMap[edge.target].push(edge.source);
    });

    const stages = nodes.map((node, idx) => ({
      name: node.data.label,
      order_index: idx,
      bot_id: node.data.botId,
      depends_on: dependencyMap[node.id] || [],
      task_prompt: node.data.taskPrompt,
      file_scope: node.data.fileScope,
    }));

    onSubmit({
      name: pipelineName,
      repo_url: repoUrl,
      branch,
      stages,
      config: {
        timeout_minutes: 30,
        auto_merge: true,
        conflict_strategy: 'pause',
        auto_pr: false,
      },
    });
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="grid grid-cols-3 gap-4 mb-3">
          <input
            type="text"
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            placeholder="Pipeline Name"
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="Repository URL"
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="Branch"
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={addStage}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Stage
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors ml-auto"
          >
            <Play className="w-4 h-4" />
            Create Pipeline
          </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-zinc-950"
        >
          <Background color="#27272a" gap={16} />
          <Controls className="bg-zinc-800 border-zinc-700" />
          <MiniMap className="bg-zinc-900 border-zinc-700" nodeColor={(node) => {
            const data = node.data as StageNodeData;
            return data.botColor;
          }} />
        </ReactFlow>
      </div>

      {/* Edit Modal */}
      {editingNode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Configure Stage</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Stage Name</label>
                <input
                  type="text"
                  value={nodeConfig.name}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Bot</label>
                <select
                  value={nodeConfig.botId}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, botId: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select Bot</option>
                  {bots.map(bot => (
                    <option key={bot.id} value={bot.id}>{bot.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Task Prompt</label>
                <textarea
                  value={nodeConfig.taskPrompt}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, taskPrompt: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">File Scope (comma-separated)</label>
                <input
                  type="text"
                  value={nodeConfig.fileScope}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, fileScope: e.target.value })}
                  placeholder="src/**, lib/**"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setEditingNode(null)}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveNodeConfig}
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
