export interface Database {
  public: {
    Tables: {
      bots: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          bot_username: string | null;
          agent_type: string | null;
          llm_provider: string | null;
          llm_model: string | null;
          status: 'online' | 'offline' | 'error' | 'paused';
          last_heartbeat: string | null;
          is_active: boolean;
          telegram_bot_id: number | null;
          telegram_first_name: string | null;
          telegram_can_join_groups: boolean | null;
          telegram_can_read_all_group_messages: boolean | null;
          telegram_supports_inline_queries: boolean | null;
          token_ciphertext: string | null;
          token_iv: string | null;
          token_auth_tag: string | null;
          token_hint: string | null;
          webhook_secret: string | null;
          webhook_url: string | null;
          connected_at: string | null;
          last_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bots']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bots']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          owner_id: string;
          bot_id: string;
          telegram_chat_id: number | null;
          telegram_user_id: number | null;
          username: string | null;
          message_count: number;
          total_tokens: number;
          total_cost: number;
          last_message_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      messages: {
        Row: {
          id: string;
          owner_id: string;
          conversation_id: string;
          bot_id: string;
          direction: 'incoming' | 'outgoing';
          sender_type: 'user' | 'bot' | 'system';
          content_type: string;
          content: string | null;
          tokens_used: number;
          cost: number;
          llm_model: string | null;
          latency_ms: number | null;
          created_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          role: 'viewer' | 'admin';
          created_at: string;
          updated_at: string;
        };
      };
      llm_calls: {
        Row: {
          id: string;
          owner_id: string;
          bot_id: string | null;
          conversation_id: string | null;
          provider: string;
          model: string;
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          total_cost: number;
          latency_ms: number | null;
          status: string;
          error_message: string | null;
          created_at: string;
        };
      };
      token_usage_daily: {
        Row: {
          id: string;
          owner_id: string;
          bot_id: string | null;
          usage_date: string;
          provider: string;
          model: string;
          total_calls: number;
          total_prompt_tokens: number;
          total_completion_tokens: number;
          total_tokens: number;
          total_cost: number;
          avg_latency_ms: number | null;
          error_count: number;
        };
      };
    };
  };
}
