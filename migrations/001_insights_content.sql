-- 001 (podfy-public): Insights content — blog posts, repository items, share events
-- Serves podfy.net/insights. Managed from podfy-admin (PUBLIC_DB binding).
-- LinkedIn schedule engine tables live in podfy-main (admin migration 063).

-- ── Blog posts (market updates) ──────────────────────────────────────────────
-- status: draft | published
-- revival_status: auto | evergreen | time_sensitive | outdated | excluded
-- linkedin_text: manual override, used verbatim; NULL = AI generates
-- linkedin_attachment_item_id: NULL=auto, 'cover'=force image, else repository item_id
-- Newsletter content generated per language (subscriber picks nl|en at signup).
CREATE TABLE IF NOT EXISTS blog_posts (
  id                          TEXT    PRIMARY KEY,
  title                       TEXT    NOT NULL,
  slug                        TEXT    NOT NULL UNIQUE,
  excerpt                     TEXT,
  content                     TEXT,                    -- markdown
  status                      TEXT    NOT NULL DEFAULT 'draft',
  published_at                INTEGER,
  cover_image_key             TEXT,                    -- R2 key under marketing/covers/
  source_item_id              TEXT,                    -- optional linked repository item
  language                    TEXT    NOT NULL DEFAULT 'en',
  revival_status              TEXT    NOT NULL DEFAULT 'auto',
  revival_context             TEXT,
  revival_reviewed_at         INTEGER,
  last_linkedin_shared_at     INTEGER,
  linkedin_text               TEXT,
  linkedin_attachment_item_id TEXT,
  linkedin_post_url           TEXT,
  newsletter_subject_en       TEXT,
  newsletter_body_en          TEXT,
  newsletter_subject_nl       TEXT,
  newsletter_body_nl          TEXT,
  created_at                  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at                  INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_revival
  ON blog_posts(revival_status, published_at, last_linkedin_shared_at);

-- ── Repository items (documents: PDF/PPTX/DOCX; whitepapers, market reports) ─
-- access_level: public | subscriber | group
-- GATING: only published public/subscriber items may ever upload to LinkedIn;
-- 'group' content never leaves the platform. Enforced in one shared classifier.
CREATE TABLE IF NOT EXISTS repository_items (
  item_id                  TEXT    PRIMARY KEY,
  title                    TEXT    NOT NULL,
  description              TEXT,
  file_key                 TEXT    NOT NULL,            -- R2 key under marketing/repo/
  mime_type                TEXT,
  file_size                INTEGER,
  published                INTEGER NOT NULL DEFAULT 0,
  access_level             TEXT    NOT NULL DEFAULT 'public'
                           CHECK(access_level IN ('public','subscriber','group')),
  linkedin_enabled         INTEGER NOT NULL DEFAULT 0,
  linkedin_document_urn    TEXT,                        -- cached owned asset: upload once
  linkedin_post_urn        TEXT,
  linkedin_post_url        TEXT,
  linkedin_post_status     TEXT,
  linkedin_post_created_at INTEGER,
  linkedin_last_error      TEXT,
  created_at               INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at               INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_ri_published ON repository_items(published, created_at DESC);

-- ── Public share-button tracking (privacy-preserving: hashed IP/UA only) ─────
CREATE TABLE IF NOT EXISTS share_events (
  event_id        TEXT    PRIMARY KEY,
  user_email      TEXT,
  entity_type     TEXT    NOT NULL CHECK(entity_type IN ('blog_post','repository_item')),
  entity_id       TEXT    NOT NULL,
  channel         TEXT    NOT NULL CHECK(channel IN ('linkedin_share','copy_text')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  ip_hash         TEXT,
  user_agent_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_share_events_entity
  ON share_events(entity_type, entity_id, created_at DESC);
