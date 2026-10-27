-- ============================================================
-- URL SHORTENER DATABASE SCHEMA
-- PostgreSQL
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'USER'
        CHECK (role IN ('USER', 'ADMIN')),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- URLS
-- ============================================================

CREATE TABLE IF NOT EXISTS urls (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    original_url TEXT NOT NULL,

    short_code VARCHAR(50) NOT NULL UNIQUE,

    custom_alias VARCHAR(50) UNIQUE,

    password_hash TEXT,

    expires_at TIMESTAMPTZ,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- CLICKS / ANALYTICS
-- ============================================================

CREATE TABLE IF NOT EXISTS clicks (
    id BIGSERIAL PRIMARY KEY,

    url_id BIGINT NOT NULL
        REFERENCES urls(id)
        ON DELETE CASCADE,

    ip_hash VARCHAR(128),

    user_agent TEXT,

    browser VARCHAR(100),

    operating_system VARCHAR(100),

    device_type VARCHAR(50),

    referrer TEXT,

    country VARCHAR(100),

    clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- REFRESH TOKENS
-- ============================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_urls_user_id
ON urls(user_id);

CREATE INDEX IF NOT EXISTS idx_urls_short_code
ON urls(short_code);

CREATE INDEX IF NOT EXISTS idx_urls_custom_alias
ON urls(custom_alias);

CREATE INDEX IF NOT EXISTS idx_urls_expires_at
ON urls(expires_at);

CREATE INDEX IF NOT EXISTS idx_urls_created_at
ON urls(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clicks_url_id
ON clicks(url_id);

CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at
ON clicks(clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_clicks_url_date
ON clicks(url_id, clicked_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
ON refresh_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at
ON refresh_tokens(expires_at);


-- ============================================================
-- UPDATE TIMESTAMP FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS update_users_updated_at ON users;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


DROP TRIGGER IF EXISTS update_urls_updated_at ON urls;

CREATE TRIGGER update_urls_updated_at
BEFORE UPDATE ON urls
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();