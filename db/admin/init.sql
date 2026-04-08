-- ============================================================
--  ADMIN_DB — Admin Service
--  System dashboard, activity logs, analytics, platform settings
--  Auto-executed on first PostgreSQL container start
-- ============================================================

-- === PLATFORM STATISTICS (aggregated snapshots) =================

-- System stats: periodic snapshots of platform-wide metrics
-- Precomputed from other services to power the admin dashboard
CREATE TABLE IF NOT EXISTS system_stats (
    id             SERIAL PRIMARY KEY,
    total_students INTEGER     NOT NULL DEFAULT 0,
    total_teachers INTEGER     NOT NULL DEFAULT 0,
    total_courses  INTEGER     NOT NULL DEFAULT 0,
    active_courses INTEGER     NOT NULL DEFAULT 0,
    avg_completion REAL        NOT NULL DEFAULT 0,
    snapshot_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



-- === ACTIVITY LOGS ==============================================

-- Activity feed: recent actions across the platform


-- === COURSE ANALYTICS (admin view) ==============================

-- Course stats: aggregated per-course metrics for admin dashboard


-- === TEACHER ANALYTICS (admin view) =============================

-- Teacher stats: aggregated per-teacher metrics
-- Synced from Auth Service + Teacher Service events
CREATE TABLE IF NOT EXISTS teacher_stats (
    id             SERIAL PRIMARY KEY,
    teacher_id     UUID        NOT NULL UNIQUE,
    teacher_name   TEXT        NOT NULL DEFAULT '',
    email          TEXT        NOT NULL DEFAULT '',
    specialty      TEXT        NOT NULL DEFAULT '',
    total_courses  INTEGER     NOT NULL DEFAULT 0,
    total_students INTEGER     NOT NULL DEFAULT 0,
    avg_rating     REAL        NOT NULL DEFAULT 0,
    status         TEXT        NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active','inactive')),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- === PLATFORM SETTINGS ==========================================

-- System settings: key-value config for the platform


-- === ADMIN CHAT (AI analytics assistant) ========================

-- Admin AI chats: conversation history for the admin AI assistant
CREATE TABLE IF NOT EXISTS admin_ai_chats (
    chat_id      TEXT PRIMARY KEY,
    admin_id     UUID        NOT NULL,
    title        TEXT        NOT NULL DEFAULT 'New Chat',
    messages_json JSONB      NOT NULL DEFAULT '[]',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- === ANNOUNCEMENTS & NOTIFICATIONS ==============================



-- ============================================================
--  Indexes
-- ============================================================

-- System stats
CREATE INDEX IF NOT EXISTS idx_system_stats_snapshot   ON system_stats(snapshot_at DESC);

-- Daily stats
CREATE INDEX IF NOT EXISTS idx_daily_stats_date        ON daily_stats(stat_date DESC);

-- Activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_created   ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user      ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity    ON activity_logs(entity_type, entity_id);

-- Course stats
CREATE INDEX IF NOT EXISTS idx_course_stats_status     ON course_stats(status);
CREATE INDEX IF NOT EXISTS idx_course_stats_students   ON course_stats(total_students DESC);

-- Teacher stats
CREATE INDEX IF NOT EXISTS idx_teacher_stats_status    ON teacher_stats(status);
CREATE INDEX IF NOT EXISTS idx_teacher_stats_rating    ON teacher_stats(avg_rating DESC);

-- Admin AI chats
CREATE INDEX IF NOT EXISTS idx_admin_ai_chats_admin    ON admin_ai_chats(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_ai_chats_updated  ON admin_ai_chats(updated_at DESC);

-- Announcements
CREATE INDEX IF NOT EXISTS idx_announcements_active    ON announcements(is_active, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_role      ON announcements(target_role);
