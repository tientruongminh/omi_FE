-- ============================================================
--  AUTH_DB — Auth Service
--  User accounts, authentication, authorization (RBAC)
--  Auto-executed on first PostgreSQL container start
-- ============================================================

-- Users: authentication accounts with role-based access
CREATE TABLE IF NOT EXISTS users (
    user_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email        TEXT UNIQUE NOT NULL,
    password     TEXT        NOT NULL,  -- bcrypt hash
    name         TEXT        NOT NULL DEFAULT '',
    avatar_url   TEXT        NOT NULL DEFAULT '',
    role         TEXT        NOT NULL DEFAULT 'student'
                   CHECK (role IN ('student', 'teacher', 'admin')),
    is_active    BOOLEAN     NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Refresh tokens: JWT refresh token management (per device)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash   TEXT        NOT NULL,
    device_info  TEXT        NOT NULL DEFAULT '',
    expires_at   TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
--  Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email          ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role           ON users(role);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user  ON refresh_tokens(user_id);
