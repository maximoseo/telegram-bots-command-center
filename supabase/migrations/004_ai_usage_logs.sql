-- Create ai_usage_logs table for tracking LLM usage via OpenRouter
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES pipeline_stages(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,
  model VARCHAR(255) NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  request_payload JSONB,
  response_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ai_usage_logs_pipeline_id ON ai_usage_logs(pipeline_id);
CREATE INDEX idx_ai_usage_logs_stage_id ON ai_usage_logs(stage_id);
CREATE INDEX idx_ai_usage_logs_bot_id ON ai_usage_logs(bot_id);
CREATE INDEX idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for service role
CREATE POLICY ai_usage_logs_service_policy ON ai_usage_logs
  FOR ALL USING (true);

COMMENT ON TABLE ai_usage_logs IS 'Tracks AI/LLM usage, tokens, and costs per pipeline/stage/bot';
