import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

if (!OPENROUTER_API_KEY) {
  console.warn('[AI Proxy] OPENROUTER_API_KEY not set. AI features will not work.');
}

// Pricing per 1M tokens (approximate)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'anthropic/claude-3.5-sonnet': { input: 3.0, output: 15.0 },
  'anthropic/claude-3-opus': { input: 15.0, output: 75.0 },
  'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 },
  'openai/gpt-4': { input: 30.0, output: 60.0 },
  'openai/gpt-3.5-turbo': { input: 0.5, output: 1.5 },
};

interface AIProxyRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  pipeline_id?: string;
  stage_id?: string;
  bot_id?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: AIProxyRequest = await req.json();
    const { model, messages, temperature = 0.7, max_tokens = 2000, pipeline_id, stage_id, bot_id } = body;

    if (!model || !messages || messages.length === 0) {
      return NextResponse.json({ error: 'model and messages are required' }, { status: 400 });
    }

    // Calculate input tokens (rough estimate: 1 token ≈ 4 chars)
    const inputText = messages.map(m => m.content).join(' ');
    const estimatedInputTokens = Math.ceil(inputText.length / 4);

    // Call OpenRouter
    const startTime = Date.now();
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tg-command-center.vercel.app',
        'X-Title': 'TG Command Center',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    // Extract token usage from OpenRouter response
    const usage = data.usage || {};
    const inputTokens = usage.prompt_tokens || estimatedInputTokens;
    const outputTokens = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || inputTokens + outputTokens;

    // Calculate cost
    const pricing = MODEL_PRICING[model] || { input: 1.0, output: 2.0 };
    const cost = (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;

    // Log usage to database
    await supabase.from('ai_usage_logs').insert({
      pipeline_id,
      stage_id,
      bot_id,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens,
      cost_usd: cost,
      latency_ms: latency,
      request_payload: { messages, temperature, max_tokens },
      response_payload: data,
    });

    return NextResponse.json({
      success: true,
      data: data.choices?.[0]?.message || data,
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: totalTokens,
        cost_usd: cost,
        latency_ms: latency,
      },
    });
  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/ai/proxy?pipeline_id=xxx - Get usage stats
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pipelineId = searchParams.get('pipeline_id');
    const stageId = searchParams.get('stage_id');

    let query = supabase.from('ai_usage_logs').select('*').order('created_at', { ascending: false });

    if (pipelineId) {
      query = query.eq('pipeline_id', pipelineId);
    }
    if (stageId) {
      query = query.eq('stage_id', stageId);
    }

    const { data, error } = await query.limit(100);

    if (error) throw error;

    // Calculate aggregates
    const stats = {
      total_requests: data.length,
      total_tokens: data.reduce((sum, log) => sum + (log.total_tokens || 0), 0),
      total_cost: data.reduce((sum, log) => sum + (log.cost_usd || 0), 0),
      avg_latency: data.length > 0 
        ? data.reduce((sum, log) => sum + (log.latency_ms || 0), 0) / data.length 
        : 0,
    };

    return NextResponse.json({ data, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
