import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role for orchestration operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types
export interface Pipeline {
  id: string;
  name: string;
  description: string | null;
  repo_url: string;
  branch: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  created_by: string;
  template_id: string | null;
  config: PipelineConfig;
  progress: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface PipelineConfig {
  timeout_minutes: number;
  auto_merge: boolean;
  conflict_strategy: 'pause' | 'keep_latest' | 'ai_merge';
  auto_pr: boolean;
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  description: string | null;
  order_index: number;
  bot_id: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'blocked';
  depends_on: string[];
  task_prompt: string | null;
  file_scope: string[];
  config: Record<string, unknown>;
  started_at: string | null;
  completed_at: string | null;
  result: Record<string, unknown> | null;
  error_message: string | null;
}

export interface ExecutionEvent {
  id: number;
  pipeline_id: string;
  stage_id: string | null;
  bot_id: string | null;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface GitActivity {
  id: string;
  pipeline_id: string;
  stage_id: string | null;
  bot_id: string | null;
  commit_sha: string | null;
  files_changed: string[];
  additions: number;
  deletions: number;
  message: string | null;
  pr_number: number | null;
  pr_url: string | null;
  created_at: string;
}

export interface PipelineConflict {
  id: string;
  pipeline_id: string;
  file_path: string;
  bot_a_id: string | null;
  bot_b_id: string | null;
  bot_a_content: string | null;
  bot_b_content: string | null;
  resolution: 'keep_a' | 'keep_b' | 'manual' | 'ai_merge' | 'pending';
  resolved_content: string | null;
  resolved_at: string | null;
}

// ============ PIPELINE CRUD ============

export async function createPipeline(data: {
  name: string;
  description?: string;
  repo_url: string;
  branch: string;
  created_by: string;
  template_id?: string;
  config?: Partial<PipelineConfig>;
}) {
  const { data: pipeline, error } = await supabase
    .from('pipelines')
    .insert({
      ...data,
      config: {
        timeout_minutes: 30,
        auto_merge: true,
        conflict_strategy: 'pause',
        auto_pr: false,
        ...data.config,
      },
    })
    .select()
    .single();

  if (error) throw error;
  return pipeline as Pipeline;
}

export async function getPipeline(id: string) {
  const { data, error } = await supabase
    .from('pipelines')
    .select('*, pipeline_stages(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function listPipelines(userId: string) {
  const { data, error } = await supabase
    .from('pipelines')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Pipeline[];
}

export async function updatePipelineStatus(id: string, status: Pipeline['status']) {
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'running') updates.started_at = new Date().toISOString();
  if (status === 'completed' || status === 'failed') updates.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('pipelines')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Pipeline;
}

export async function deletePipeline(id: string) {
  const { error } = await supabase.from('pipelines').delete().eq('id', id);
  if (error) throw error;
}

// ============ STAGES ============

export async function createStages(pipelineId: string, stages: Array<{
  name: string;
  description?: string;
  order_index: number;
  bot_id?: string;
  depends_on?: string[];
  task_prompt?: string;
  file_scope?: string[];
}>) {
  const { data, error } = await supabase
    .from('pipeline_stages')
    .insert(stages.map(s => ({ ...s, pipeline_id: pipelineId })))
    .select();

  if (error) throw error;
  return data as PipelineStage[];
}

export async function updateStageStatus(id: string, status: PipelineStage['status'], result?: Record<string, unknown>) {
  const updates: Record<string, unknown> = { status };
  if (status === 'running') updates.started_at = new Date().toISOString();
  if (status === 'completed' || status === 'failed') updates.completed_at = new Date().toISOString();
  if (result) updates.result = result;

  const { data, error } = await supabase
    .from('pipeline_stages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as PipelineStage;
}

export async function getStagesForPipeline(pipelineId: string) {
  const { data, error } = await supabase
    .from('pipeline_stages')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .order('order_index');

  if (error) throw error;
  return data as PipelineStage[];
}

// ============ EXECUTION EVENTS ============

export async function logEvent(event: {
  pipeline_id: string;
  stage_id?: string;
  bot_id?: string;
  event_type: string;
  payload?: Record<string, unknown>;
}) {
  const { error } = await supabase
    .from('execution_events')
    .insert({ ...event, payload: event.payload || {} });

  if (error) throw error;
}

export async function getRecentEvents(pipelineId: string, limit = 50) {
  const { data, error } = await supabase
    .from('execution_events')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as ExecutionEvent[];
}

// ============ GIT ACTIVITY ============

export async function logGitActivity(activity: {
  pipeline_id: string;
  stage_id?: string;
  bot_id?: string;
  commit_sha?: string;
  files_changed?: string[];
  additions?: number;
  deletions?: number;
  message?: string;
  pr_number?: number;
  pr_url?: string;
}) {
  const { error } = await supabase.from('git_activity').insert(activity);
  if (error) throw error;
}

export async function getGitActivity(pipelineId: string, limit = 30) {
  const { data, error } = await supabase
    .from('git_activity')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as GitActivity[];
}

// ============ CONFLICTS ============

export async function createConflict(conflict: {
  pipeline_id: string;
  file_path: string;
  bot_a_id?: string;
  bot_b_id?: string;
  bot_a_content?: string;
  bot_b_content?: string;
}) {
  const { data, error } = await supabase
    .from('pipeline_conflicts')
    .insert({ ...conflict, resolution: 'pending' })
    .select()
    .single();

  if (error) throw error;
  return data as PipelineConflict;
}

export async function resolveConflict(id: string, resolution: PipelineConflict['resolution'], resolvedContent?: string) {
  const { error } = await supabase
    .from('pipeline_conflicts')
    .update({
      resolution,
      resolved_content: resolvedContent,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function getPendingConflicts(pipelineId: string) {
  const { data, error } = await supabase
    .from('pipeline_conflicts')
    .select('*')
    .eq('pipeline_id', pipelineId)
    .eq('resolution', 'pending');

  if (error) throw error;
  return data as PipelineConflict[];
}

// ============ TEMPLATES ============

export async function listTemplates(userId?: string) {
  let query = supabase.from('pipeline_templates').select('*');
  if (userId) {
    query = query.or(`is_public.eq.true,created_by.eq.${userId}`);
  } else {
    query = query.eq('is_public', true);
  }
  const { data, error } = await query.order('usage_count', { ascending: false });
  if (error) throw error;
  return data;
}

// ============ REALTIME SUBSCRIPTIONS ============

export function subscribeToEvents(pipelineId: string, callback: (event: ExecutionEvent) => void) {
  return supabase
    .channel(`pipeline-events-${pipelineId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'execution_events',
      filter: `pipeline_id=eq.${pipelineId}`,
    }, (payload) => {
      callback(payload.new as ExecutionEvent);
    })
    .subscribe();
}

export function subscribeToStageUpdates(pipelineId: string, callback: (stage: PipelineStage) => void) {
  return supabase
    .channel(`pipeline-stages-${pipelineId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'pipeline_stages',
      filter: `pipeline_id=eq.${pipelineId}`,
    }, (payload) => {
      callback(payload.new as PipelineStage);
    })
    .subscribe();
}

export function subscribeToPipelineStatus(pipelineId: string, callback: (pipeline: Pipeline) => void) {
  return supabase
    .channel(`pipeline-status-${pipelineId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'pipelines',
      filter: `id=eq.${pipelineId}`,
    }, (payload) => {
      callback(payload.new as Pipeline);
    })
    .subscribe();
}
