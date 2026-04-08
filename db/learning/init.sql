-- ============================================================
--  LEARNING_DB — Learning Service
--  Projects, documents, roadmap, learning content, progress,
--  schedule, analytics, realtime chat
--  Auto-executed on first PostgreSQL container start
-- ============================================================

-- ─── ENUM TYPES ───────────────────────────────────────────────────────────────

CREATE TYPE project_role      AS ENUM ('owner', 'editor', 'viewer');
CREATE TYPE content_node_type AS ENUM ('video', 'pdf');
CREATE TYPE node_status       AS ENUM ('draft', 'active', 'archived');
CREATE TYPE doc_file_type     AS ENUM ('pdf', 'xlsx', 'png', 'txt', 'docx', 'mp4', 'mp3', 'other');
CREATE TYPE permission_level  AS ENUM ('view', 'edit');
CREATE TYPE skill_dimension   AS ENUM ('analysis', 'synthesis', 'critique', 'interview');

-- ─── TRIGGER FUNCTION ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- DOMAIN 1: PROJECTS
-- ============================================================

-- ─── projects ─────────────────────────────────────────────────────────────────
-- Dự án học tập. Mỗi card trên trang "Project Hub" là 1 row.
-- owner_id -> cross-service ref to auth_db.users (NO FK)
CREATE TABLE IF NOT EXISTS projects (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID         NOT NULL,  -- ref auth_db.users (NO FK)
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    is_archived     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner    ON projects (owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_created  ON projects (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_active   ON projects (owner_id) WHERE is_archived = FALSE;

CREATE TRIGGER set_updated_at_projects
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ─── project_members ──────────────────────────────────────────────────────────
-- Cộng tác B2B. "Shared with Me" query JOIN bảng này.
CREATE TABLE IF NOT EXISTS project_members (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id      UUID         NOT NULL,  -- ref auth_db.users (NO FK)
    role         project_role NOT NULL DEFAULT 'viewer',
    invited_by   UUID,                   -- ref auth_db.users (NO FK)
    invited_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    accepted_at  TIMESTAMPTZ,            -- NULL = lời mời đang chờ
    UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pm_project ON project_members (project_id);
CREATE INDEX IF NOT EXISTS idx_pm_user    ON project_members (user_id);
CREATE INDEX IF NOT EXISTS idx_pm_shared  ON project_members (user_id, accepted_at)
    WHERE accepted_at IS NOT NULL;


-- ─── project_tags ─────────────────────────────────────────────────────────────


-- ─── project_survey_responses ─────────────────────────────────────────────────
-- Kết quả "Quick Check-in" — khảo sát AI trước khi tạo roadmap.
CREATE TABLE IF NOT EXISTS plan_survey_responses (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id           UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id              UUID        NOT NULL,  -- ref auth_db.users (NO FK)
    study_duration_days  TEXT,
    target_mastery       TEXT,
    wishes_text          TEXT,
    calendar_synced      BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_survey_project ON project_survey_responses (project_id);
CREATE INDEX IF NOT EXISTS idx_survey_user    ON project_survey_responses (user_id);


-- ============================================================
-- DOMAIN 2: DOCUMENTS
-- ============================================================

-- ─── project_documents ────────────────────────────────────────────────────────
-- Metadata file upload. File thật lưu trong MinIO.
CREATE TABLE IF NOT EXISTS project_documents (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id       UUID          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    filename         VARCHAR(500)  NOT NULL,
    file_type        doc_file_type NOT NULL DEFAULT 'other',
    file_size_bytes  BIGINT,
    src_url          TEXT, -- URL of the file 
    minio_key        TEXT          NOT NULL,
    minio_bucket     TEXT          NOT NULL DEFAULT 'uploads',
    mime_type        VARCHAR(127),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
);

CREATE INDEX IF NOT EXISTS idx_pdocs_project  ON project_documents (project_id);
CREATE INDEX IF NOT EXISTS idx_pdocs_created  ON project_documents (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pdocs_type     ON project_documents (project_id, file_type);



-- ============================================================
-- DOMAIN 3: ROADMAP
-- ============================================================

-- ─── roadmaps ─────────────────────────────────────────────────────────────────
-- Mỗi dự án có đúng 1 roadmap. AI gen ra từ các file trong project_documents.
CREATE TABLE IF NOT EXISTS roadmaps (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (project_id)
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_project ON roadmaps (project_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_creator ON roadmaps (created_by);

CREATE TRIGGER set_updated_at_roadmaps
    BEFORE UPDATE ON roadmaps
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ─── roadmap_nodes ────────────────────────────────────────────────────────────
-- Các node TOPIC trong mind map. Self-referential tree qua parent_id.
-- Đây là navigation structure: root → branch → leaf.
-- Khi user click vào leaf node → chuyển sang trang học tập.
-- KHÔNG chứa nội dung học (video/pdf) — nội dung nằm trong learning_nodes.
CREATE TABLE IF NOT EXISTS roadmap_nodes (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id   UUID         NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    parent_id    UUID         REFERENCES roadmap_nodes(id)     ON DELETE SET NULL,
    -- NULL = root node
    title        VARCHAR(500) NOT NULL,
    sort_order   INT          NOT NULL DEFAULT 0,
    is_completed BOOLEAN      NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rnodes_roadmap ON roadmap_nodes (roadmap_id);
CREATE INDEX IF NOT EXISTS idx_rnodes_parent  ON roadmap_nodes (parent_id);
CREATE INDEX IF NOT EXISTS idx_rnodes_combo   ON roadmap_nodes (roadmap_id, parent_id);

CREATE TRIGGER set_updated_at_roadmap_nodes
    BEFORE UPDATE ON roadmap_nodes
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ─── learning_nodes ───────────────────────────────────────────────────────────
-- TẦNG 2: Sub-topic nodes bên trong trang học tập của 1 leaf roadmap node.
-- Mỗi learning_node có thể chứa nhiều content_nodes (tầng 3: video/pdf).
CREATE TABLE IF NOT EXISTS learning_nodes (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_node_id  UUID         NOT NULL REFERENCES roadmap_nodes(id) ON DELETE CASCADE,
    title            VARCHAR(500) NOT NULL,
    description      TEXT,
    sort_order       INT          NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lnodes_rnode ON learning_nodes (roadmap_node_id);
CREATE INDEX IF NOT EXISTS idx_lnodes_sort  ON learning_nodes (roadmap_node_id, sort_order);

CREATE TRIGGER set_updated_at_learning_nodes
    BEFORE UPDATE ON learning_nodes
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ─── content_nodes ────────────────────────────────────────────────────────────
-- TẦNG 3: Node nội dung thực tế (video/pdf) gắn vào 1 learning_node.
-- source_url = link ngoài (YouTube, PDF online), minio_key = file upload.
-- Ít nhất 1 trong 2 phải có giá trị.
CREATE TABLE IF NOT EXISTS content_nodes (
    id               UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_node_id UUID              NOT NULL REFERENCES learning_nodes(id) ON DELETE CASCADE,
    document_id      UUID              REFERENCES project_documents(id) ON DELETE SET NULL,
    node_type        content_node_type NOT NULL,
    title            VARCHAR(500)      NOT NULL,
    sort_order       INT               NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ       NOT NULL DEFAULT NOW()

);

CREATE INDEX IF NOT EXISTS idx_cnodes_lnode    ON content_nodes (learning_node_id);
CREATE INDEX IF NOT EXISTS idx_cnodes_document ON content_nodes (document_id);
CREATE INDEX IF NOT EXISTS idx_cnodes_type     ON content_nodes (learning_node_id, node_type);



-- ============================================================
-- DOMAIN 4: LEARNING
-- ============================================================

-- ─── content_node_chats ───────────────────────────────────────────────────────
-- Khung chat AI gắn với từng content_node (video/pdf).
-- Conversation thread gắn chặt với 1 content_node cụ thể.
CREATE TABLE IF NOT EXISTS content_node_chats (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id  UUID        NOT NULL 
    messages         JSONB       NOT NULL DEFAULT '[]',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (content_node_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cnchats_cnode ON content_node_chats (content_node_id);
CREATE INDEX IF NOT EXISTS idx_cnchats_user  ON content_node_chats (user_id);

CREATE TRIGGER set_updated_at_cn_chats
    BEFORE UPDATE ON content_node_chats
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ─── node_asset_suggestions ───────────────────────────────────────────────────
-- Danh sách tài liệu GỢI Ý hiển thị trong sidebar khi user click learning_node.
-- Staging area — tài liệu chưa được upload/xác nhận.
-- Khi user tick chọn + nhấn Upload → tạo project_documents + content_node,
-- rồi set is_uploaded=true và ghi document_id vào đây.
CREATE TABLE IF NOT EXISTS node_asset_suggestions (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_node_id UUID          NOT NULL REFERENCES learning_nodes(id) ON DELETE CASCADE,
    suggested_by     UUID          NOT NULL,  -- ref auth_db.users (NO FK)
    title            VARCHAR(500)  NOT NULL,
    document_id      UUID          REFERENCES project_documents(id) ON DELETE SET NULL,
    suggested_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
);

CREATE INDEX IF NOT EXISTS idx_nasug_node     ON node_asset_suggestions (learning_node_id);
CREATE INDEX IF NOT EXISTS idx_nasug_uploaded ON node_asset_suggestions (learning_node_id, is_uploaded);


-- ─── learning_sessions ────────────────────────────────────────────────────────
-- Phiên học tập. Có thể invite bạn bè vào cùng học (workspace chung).
CREATE TABLE IF NOT EXISTS learning_sessions (
    id                      UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id              UUID             NOT NULL REFERENCES projects(id)       ON DELETE CASCADE,
    roadmap_node_id         UUID             NOT NULL REFERENCES roadmap_nodes(id)  ON DELETE CASCADE,
    default_join_permission permission_level NOT NULL DEFAULT 'view',
    created_at              TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lsess_project ON learning_sessions (project_id);
CREATE INDEX IF NOT EXISTS idx_lsess_creator ON learning_sessions (created_by);





-- ─── topic_progress ───────────────────────────────────────────────────────────
-- Tiến độ học của từng user trên từng roadmap_node (leaf topic).
-- is_completed do AI set sau khi đánh giá điểm 4 chiều đạt ngưỡng.
-- Drives: progress bar dashboard, màu node trên mind map (xanh = done).
CREATE TABLE IF NOT EXISTS topic_progress (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        NOT NULL,  -- ref auth_db.users (NO FK)
    roadmap_node_id  UUID        NOT NULL REFERENCES roadmap_nodes(id) ON DELETE CASCADE,
    project_id       UUID        NOT NULL REFERENCES projects(id)      ON DELETE CASCADE,
    is_completed     BOOLEAN     NOT NULL DEFAULT FALSE,
    completed_at     TIMESTAMPTZ,
    score_analysis   FLOAT,
    score_synthesis  FLOAT,
    score_critique   FLOAT,
    score_interview  FLOAT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, roadmap_node_id)
);

CREATE INDEX IF NOT EXISTS idx_tprog_user      ON topic_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_tprog_node      ON topic_progress (roadmap_node_id);
CREATE INDEX IF NOT EXISTS idx_tprog_dashboard ON topic_progress (user_id, project_id, is_completed);

CREATE TRIGGER set_updated_at_topic_progress
    BEFORE UPDATE ON topic_progress
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ─── node_ai_reviews ──────────────────────────────────────────────────────────
-- Phiên ôn tập AI gắn với 1 content_node. Mỗi lần user mở "Ôn tập" = 1 row.
-- Là bảng cha cho 4 loại attempt: quiz, flashcard, essay, teach_ai.
-- Lưu trạng thái tổng hợp (hoàn thành chưa, điểm trung bình) và AI model đã dùng.
--
-- Luồng:
--   1. User click "Ôn tập" trên content_node → tạo node_ai_reviews row
--   2. User chọn tab quiz/flashcard/essay/teach → tạo attempt row tương ứng
--   3. Khi tất cả tab hoàn thành → set is_completed = true
CREATE TABLE IF NOT EXISTS node_ai_reviews (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id  UUID        NOT NULL 
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (parent_id)
);


-- ─── quiz_attempts ────────────────────────────────────────────────────────────
-- Lịch sử ôn tập trắc nghiệm. AI tạo 5-10 câu mới mỗi lần.
-- answers lưu đủ: câu hỏi + lựa chọn + đáp án user chọn + đáp án đúng.
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id    UUID         NOT NULL REFERENCES node_ai_reviews(id) ON DELETE CASCADE,
    score_pct    FLOAT,                  -- 0-100, NULL = chưa submit
    answers      JSONB        NOT NULL DEFAULT '[]',
    -- shape: [{ "question": "...", "options": [{"label":"a","text":"...","correct":false}],
    --           "selected": "a", "correct": "b", "is_correct": false, "explanation": "..." }]
    completed_at TIMESTAMPTZ,            -- NULL = đang làm dở
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_review ON quiz_attempts (review_id);
CREATE INDEX IF NOT EXISTS idx_quiz_user   ON quiz_attempts (user_id);


-- ─── flashcard_attempts ───────────────────────────────────────────────────────
-- Lịch sử ôn tập flashcard. Mỗi lần lật bộ thẻ = 1 row.
-- cards lưu đủ: front/back + user đã nhớ hay chưa (remembered).
CREATE TABLE IF NOT EXISTS flashcard_attempts (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id    UUID         NOT NULL REFERENCES node_ai_reviews(id) ON DELETE CASCADE,
    total_cards  INTEGER      NOT NULL DEFAULT 0,
    remembered   INTEGER      NOT NULL DEFAULT 0,
    cards        JSONB        NOT NULL DEFAULT '[]',
    -- shape: [{ "front": "...", "back": "...", "remembered": true }]
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fc_att_review ON flashcard_attempts (review_id);
CREATE INDEX IF NOT EXISTS idx_fc_att_user   ON flashcard_attempts (user_id);


-- ─── essay_attempts ──────────────────────────────────────────────────────────
-- Lịch sử tự luận. AI ra đề, user viết bài, AI chấm + feedback.
CREATE TABLE IF NOT EXISTS essay_attempts (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id    UUID         NOT NULL REFERENCES node_ai_reviews(id) ON DELETE CASCADE,
    question     TEXT         NOT NULL,
    answer_text  TEXT         NOT NULL DEFAULT '',
    feedback     TEXT         NOT NULL DEFAULT '',
    score        FLOAT,                  -- 0-100
    submitted_at TIMESTAMPTZ,            -- NULL = chưa nộp
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_essay_att_review ON essay_attempts (review_id);


-- ─── teach_ai_attempts ───────────────────────────────────────────────────────
-- Lịch sử "Dạy AI". AI hỏi câu hỏi, user giải thích lại, AI đánh giá.
CREATE TABLE IF NOT EXISTS teach_ai_attempts (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id    UUID         NOT NULL REFERENCES node_ai_reviews(id) ON DELETE CASCADE,
    ai_question  TEXT         NOT NULL DEFAULT '',
    explanation  TEXT         NOT NULL DEFAULT '',
    feedback     TEXT         NOT NULL DEFAULT '',
    score        FLOAT,                  -- 0-100
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teach_att_review ON teach_ai_attempts (review_id);


-- ============================================================
-- DOMAIN 5: SCHEDULE
-- ============================================================

-- ─── calendar_connections ─────────────────────────────────────────────────────
-- OAuth token kết nối Google/Outlook Calendar.
-- access_token và refresh_token PHẢI được encrypt ở application layer.
CREATE TABLE IF NOT EXISTS calendar_connections (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID        NOT NULL,  -- ref auth_db.users (NO FK)
    provider             VARCHAR(50) NOT NULL DEFAULT 'google',
    access_token         TEXT        NOT NULL,
    refresh_token        TEXT,
    token_expires_at     TIMESTAMPTZ,
    external_calendar_id VARCHAR(255),
    is_active            BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_calconn_user ON calendar_connections (user_id);

CREATE TRIGGER set_updated_at_cal_conn
    BEFORE UPDATE ON calendar_connections
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ─── schedule_entries ─────────────────────────────────────────────────────────
-- Từng slot học tập hiển thị trên lịch tuần (mỗi ô màu = 1 row).
-- Click vào entry → nhảy vào trang học tập của roadmap_node_id tương ứng.
CREATE TABLE IF NOT EXISTS schedule_entries (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID        NOT NULL,  -- ref auth_db.users (NO FK)
    project_id        UUID        NOT NULL REFERENCES projects(id)      ON DELETE CASCADE,
    roadmap_node_id   UUID        NOT NULL REFERENCES roadmap_nodes(id) ON DELETE CASCADE,
    color_hex         VARCHAR(7)  NOT NULL DEFAULT '#4A90D9',
    starts_at         TIMESTAMPTZ NOT NULL,
    ends_at           TIMESTAMPTZ NOT NULL,
    external_event_id VARCHAR(255),
    is_cancelled      BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_schedule_time CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_sched_user       ON schedule_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_sched_project    ON schedule_entries (project_id);
CREATE INDEX IF NOT EXISTS idx_sched_user_range ON schedule_entries (user_id, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_sched_week       ON schedule_entries (user_id, starts_at DESC)
    WHERE is_cancelled = FALSE;


-- ============================================================
-- DOMAIN 6: ANALYTICS
-- ============================================================

-- ─── skill_snapshots ──────────────────────────────────────────────────────────
-- Điểm kỹ năng AI tính theo 4 chiều cho từng topic (roadmap_node).
-- AI INSERT 1 row mới mỗi lần tính lại; lấy row mới nhất theo computed_at.
CREATE TABLE IF NOT EXISTS skill_snapshots (
    id               UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID            NOT NULL,  -- ref auth_db.users (NO FK)
    project_id       UUID            NOT NULL REFERENCES projects(id)      ON DELETE CASCADE,
    roadmap_node_id  UUID            NOT NULL REFERENCES roadmap_nodes(id) ON DELETE CASCADE,
    dimension        skill_dimension NOT NULL,
    score_pct        FLOAT           NOT NULL CHECK (score_pct >= 0 AND score_pct <= 100),
    computed_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_user_proj ON skill_snapshots (user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_skill_node      ON skill_snapshots (user_id, roadmap_node_id, dimension);
CREATE INDEX IF NOT EXISTS idx_skill_latest    ON skill_snapshots (user_id, roadmap_node_id, computed_at DESC);


-- ============================================================
-- REALTIME CHAT (workspace collaboration)
-- ============================================================

-- ─── chat_rooms ───────────────────────────────────────────────────────────────
-- Chat room gắn với learning session.
CREATE TABLE IF NOT EXISTS chat_rooms (
    room_id      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   UUID        REFERENCES projects(id) ON DELETE CASCADE,
    name         TEXT        NOT NULL DEFAULT '',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatrooms_session ON chat_rooms (session_id);


-- ─── chat_members ─────────────────────────────────────────────────────────────


-- ─── chat_messages ────────────────────────────────────────────────────────────
-- Tin nhắn chat. user_name denormalized từ auth.
CREATE TABLE IF NOT EXISTS chat_messages (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id    UUID        NOT NULL REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL,  -- ref auth_db.users (NO FK)
    content    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatmsgs_room    ON chat_messages (room_id);
CREATE INDEX IF NOT EXISTS idx_chatmsgs_created ON chat_messages (room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatmsgs_user    ON chat_messages (user_id);
