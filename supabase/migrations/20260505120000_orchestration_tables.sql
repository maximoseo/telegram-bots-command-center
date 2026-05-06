-- Orchestration System: Pipelines, Stages, Events, Git Activity
-- TG Command Center - Multi-Bot Collaboration

-- Pipeline Templates (reusable blueprints)
CREATE TABLE IF NOT EXISTS pipeline_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  stages JSONB NOT NULL DEFAULT '[]',
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orchestration Pipelines
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  repo_url TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'failed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  template_id UUID REFERENCES pipeline_templates(id),
  config JSONB DEFAULT '{"timeout_minutes": 30, "auto_merge": true, "conflict_strategy": "pause", "auto_pr": false}',
  progress INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline Stages (ordered steps within a pipeline)
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  bot_id UUID REFERENCES bots(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped', 'blocked')),
  depends_on UUID[] DEFAULT '{}',
  task_prompt TEXT,
  file_scope TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Execution Events (real-time activity log)
CREATE TABLE IF NOT EXISTS execution_events (
  id BIGSERIAL PRIMARY KEY,
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  bot_id UUID REFERENCES bots(id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'file_write', 'file_read', 'commit', 'push', 'pr_created', 'pr_merged',
    'conflict', 'merge_ok', 'stage_start', 'stage_complete', 'stage_fail',
    'pipeline_start', 'pipeline_complete', 'pipeline_fail', 'pipeline_pause',
    'message', 'error', 'warning', 'info'
  )),
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Git Activity Tracking
CREATE TABLE IF NOT EXISTS git_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  bot_id UUID REFERENCES bots(id),
  commit_sha TEXT,
  files_changed TEXT[] DEFAULT '{}',
  additions INT DEFAULT 0,
  deletions INT DEFAULT 0,
  message TEXT,
  pr_number INT,
  pr_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conflict Records
CREATE TABLE IF NOT EXISTS pipeline_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  bot_a_id UUID REFERENCES bots(id),
  bot_b_id UUID REFERENCES bots(id),
  bot_a_content TEXT,
  bot_b_content TEXT,
  resolution TEXT CHECK (resolution IN ('keep_a', 'keep_b', 'manual', 'ai_merge', 'pending')),
  resolved_content TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pipelines_status ON pipelines(status);
CREATE INDEX idx_pipelines_created_by ON pipelines(created_by);
CREATE INDEX idx_stages_pipeline ON pipeline_stages(pipeline_id, order_index);
CREATE INDEX idx_stages_status ON pipeline_stages(status);
CREATE INDEX idx_events_pipeline_time ON execution_events(pipeline_id, created_at DESC);
CREATE INDEX idx_events_recent ON execution_events(created_at DESC) WHERE created_at > NOW() - INTERVAL '1 hour';
CREATE INDEX idx_events_type ON execution_events(event_type, created_at DESC);
CREATE INDEX idx_git_pipeline ON git_activity(pipeline_id, created_at DESC);
CREATE INDEX idx_git_bot ON git_activity(bot_id, created_at DESC);
CREATE INDEX idx_conflicts_pipeline ON pipeline_conflicts(pipeline_id) WHERE resolution = 'pending';

-- Enable Supabase Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE execution_events;
ALTER PUBLICATION supabase_realtime ADD TABLE pipeline_stages;
ALTER PUBLICATION supabase_realtime ADD TABLE pipelines;

-- RLS Policies
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE git_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_templates ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write their own pipelines
CREATE POLICY "Users can manage their own pipelines" ON pipelines
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can read pipeline stages" ON pipeline_stages
  FOR ALL USING (
    pipeline_id IN (SELECT id FROM pipelines WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can read execution events" ON execution_events
  FOR ALL USING (
    pipeline_id IN (SELECT id FROM pipelines WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can read git activity" ON git_activity
  FOR ALL USING (
    pipeline_id IN (SELECT id FROM pipelines WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can manage conflicts" ON pipeline_conflicts
  FOR ALL USING (
    pipeline_id IN (SELECT id FROM pipelines WHERE created_by = auth.uid())
  );

CREATE POLICY "Users can read public templates" ON pipeline_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can manage their templates" ON pipeline_templates
  FOR ALL USING (created_by = auth.uid());
