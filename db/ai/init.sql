-- ============================================================
--  AI_DB — AI Service
--  AI Agent system: models, tools, agents, memory, prompts
--  + generation logs, roadmap gen, evaluation, doc suggestions
--  Auto-executed on first PostgreSQL container start
-- ============================================================
--
-- Cross-service references (NO FK):
--   user_id         -> auth_db.users
--   project_id      -> learning_db.projects
--   roadmap_node_id -> learning_db.roadmap_nodes
--   content_node_id -> learning_db.content_nodes
--   review_id       -> learning_db.node_ai_reviews
--   attempt_id      -> learning_db.*_attempts
-- ============================================================


-- ████████████████████████████████████████████████████████████
-- PART 1: AI AGENT INFRASTRUCTURE
-- ████████████████████████████████████████████████████████████

-- === AI MODELS ===================================================
-- Registry các LLM model mà hệ thống sử dụng.
-- Quản lý tập trung: thêm model mới, disable model cũ, set default,
-- tracking cost per token để tính chi phí.
--
-- Ví dụ rows:
--   { name: "claude-sonnet-4-20250514", provider: "anthropic", ... }
--   { name: "gpt-4o-mini",    provider: "openai",    ... }
--   { name: "gemini-2.5-pro", provider: "google",    ... }

CREATE TABLE IF NOT EXISTS ai_models (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT        NOT NULL UNIQUE,
    provider         TEXT        NOT NULL
                       CHECK (provider IN ('anthropic','openai','google','local','other')),
    display_name     TEXT        NOT NULL DEFAULT '',
    max_tokens       INTEGER     NOT NULL DEFAULT 4096,
    context_window   INTEGER     NOT NULL DEFAULT 128000,
    cost_per_1k_in   REAL        NOT NULL DEFAULT 0,
    cost_per_1k_out  REAL        NOT NULL DEFAULT 0,
    supports_vision  BOOLEAN     NOT NULL DEFAULT FALSE,
    supports_tools   BOOLEAN     NOT NULL DEFAULT TRUE,
    is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_models_provider ON ai_models (provider);
CREATE INDEX IF NOT EXISTS idx_models_active   ON ai_models (is_active) WHERE is_active = TRUE;


-- === AI TOOLS ====================================================
-- Registry các tool mà AI agents có thể gọi (function calling).
-- Mỗi tool có schema (JSON Schema format) để LLM biết cách gọi.
--
-- Ví dụ rows:
--   { name: "search_documents", category: "retrieval",
--     schema: { type: "function", function: { name: "...", parameters: {...} } } }
--   { name: "generate_quiz",   category: "generation", ... }
--   { name: "evaluate_essay",  category: "evaluation", ... }

CREATE TABLE IF NOT EXISTS ai_tools (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT        NOT NULL UNIQUE,
    group            TEXT        NOT NULL DEFAULT 'general',
    description      TEXT        NOT NULL DEFAULT '',
    tool_schema      JSONB       NOT NULL DEFAULT '{}',
    is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- === AI AGENT CONFIGS ============================================
-- Định nghĩa agent cho từng use case.
-- Mỗi agent = system_prompt + model + tools + parameters.
--
-- Ví dụ rows:
--   { name: "quiz_agent",     model: "claude-sonnet-4-6", tools: ["search_documents","generate_quiz"] }
--   { name: "eval_agent",     model: "gpt-4o",   tools: ["evaluate_essay","score_skills"] }
--   { name: "chat_agent",     model: "claude-sonnet-4-6", tools: ["search_documents"] }
--   { name: "roadmap_agent",  model: "claude-sonnet-4-6", tools: ["search_documents","generate_roadmap"] }

CREATE TABLE IF NOT EXISTS ai_agent_configs (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT        NOT NULL UNIQUE,
    description      TEXT        NOT NULL DEFAULT '',
    model_id         UUID        NOT NULL REFERENCES ai_models(id),
    fallback_model_id UUID       REFERENCES ai_models(id),
    system_prompt    TEXT        NOT NULL DEFAULT '',
    tool_ids         JSONB       NOT NULL DEFAULT '[]',
    -- shape: ["uuid-tool-1", "uuid-tool-2"]
    parameters       JSONB       NOT NULL DEFAULT '{}',
    -- shape: { "temperature": 0.7, "max_tokens": 4096, "top_p": 1.0 }
    is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
    version          INTEGER     NOT NULL DEFAULT 1,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_active ON ai_agent_configs (is_active) WHERE is_active = TRUE;


-- === AI MEMORIES =================================================
-- Memory dài hạn per user hoặc per conversation.
-- AI nhớ: user yếu chỗ nào, thích học kiểu gì, context quan trọng.
--
-- memory_type:
--   'user'         → tóm tắt profile học tập (yếu analysis, thích video)
--   'project'      → context dự án (đang học DevOps, ưu tiên Docker)
--   'conversation' → tóm tắt cuộc chat dài (RAG sliding window)
--
-- AI đọc memories trước khi trả lời → personalized responses.
-- Memories được AI tự tạo/cập nhật sau mỗi interaction quan trọng.

CREATE TABLE IF NOT EXISTS ai_memories (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        NOT NULL,
    memory_type      TEXT        NOT NULL
                       CHECK (memory_type IN ('user','project','conversation')),
    -- Scope: memory này gắn với entity nào
    scope_id         UUID,
    -- NULL         → user-level memory (áp dụng mọi nơi)
    -- project UUID → project-level memory
    -- chat UUID    → conversation-level memory (content_node_chats.id)
    content          TEXT        NOT NULL,
    -- Tóm tắt ngắn gọn: "User yếu phần analysis, thích ví dụ thực tế"
    metadata         JSONB       NOT NULL DEFAULT '{}',
    -- shape: { "source": "quiz_attempt", "confidence": 0.85,
    --          "tags": ["weakness","analysis"], "expires_at": null }
    importance       REAL        NOT NULL DEFAULT 0.5
                       CHECK (importance >= 0 AND importance <= 1),
    -- 0.0 = low priority (có thể quên), 1.0 = critical (luôn nhớ)
    -- AI dùng importance để quyết định load memories nào khi context window giới hạn
    is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mem_user       ON ai_memories (user_id);
CREATE INDEX IF NOT EXISTS idx_mem_type       ON ai_memories (user_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_mem_scope      ON ai_memories (user_id, memory_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_mem_importance  ON ai_memories (user_id, importance DESC)
    WHERE is_active = TRUE;


-- ████████████████████████████████████████████████████████████
-- PART 2: AI OPERATIONS
-- ████████████████████████████████████████████████████████████

-- === AI GENERATION LOGS ==========================================
-- Log MỌI request đến AI service. Bảng quan trọng nhất — dùng cho:
--   - Tracking usage & cost per user
--   - Debugging (tại sao AI trả sai?)
--   - Analytics (feature nào dùng nhiều nhất?)
--   - Rate limiting (user đã dùng bao nhiêu tokens hôm nay?)

CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        NOT NULL,
    agent_config_id  UUID        REFERENCES ai_agent_configs(id),
    request_type     TEXT        NOT NULL
                       CHECK (request_type IN (
                         'chat',
                         'quiz_gen','flashcard_gen','essay_gen','teach_gen',
                         'essay_eval','teach_eval','evaluation',
                         'plan_gen','roadmap_gen',
                         'doc_suggest','embed',
                         'memory_update'
                       )),
    reference_type   TEXT        NOT NULL DEFAULT ''
                       CHECK (reference_type IN (
                         '','project','roadmap_node','content_node',
                         'review','attempt'
                       )),
    reference_id     UUID,

    request_body     JSONB       NOT NULL DEFAULT '{}',
    response_body    JSONB       NOT NULL DEFAULT '{}',

    -- Resolved model (actual model used, from agent_config or override)
    model_used       TEXT        NOT NULL DEFAULT '',
    tokens_in        INTEGER     NOT NULL DEFAULT 0,
    tokens_out       INTEGER     NOT NULL DEFAULT 0,
    latency_ms       INTEGER     NOT NULL DEFAULT 0,
    tool_calls       JSONB       NOT NULL DEFAULT '[]',
    -- shape: [{ "tool": "search_documents", "input": {...}, "output": {...}, "latency_ms": 120 }]
    status           TEXT        NOT NULL DEFAULT 'success'
                       CHECK (status IN ('success','failed','timeout')),
    error_message    TEXT,

    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_user    ON ai_generation_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type    ON ai_generation_logs (request_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_agent   ON ai_generation_logs (agent_config_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_ref     ON ai_generation_logs (reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_generation_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_status  ON ai_generation_logs (status)
    WHERE status != 'success';


-- === AI ROADMAP GENERATIONS ======================================
-- Lịch sử mỗi lần AI generate roadmap từ documents + survey.
-- project_id -> cross-service ref to learning_db.projects (NO FK)

