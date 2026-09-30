-- podfy-public-eu schema (no data), exported 2026-09-30 — for local smoke databases
CREATE TABLE Site_Releases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  release_date TEXT NOT NULL,
  version TEXT NOT NULL,
  deployment_ref TEXT,
  fixes TEXT,
  new_features TEXT,
  area_tags TEXT,
  is_published INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE Site_Buyer (id INTEGER PRIMARY KEY, segment TEXT NOT NULL, keyword TEXT NOT NULL, wtp_percent REAL NOT NULL);
CREATE TABLE Site_Form (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT, message TEXT, consent INTEGER NOT NULL, hp_contact TEXT, turnstile_score REAL, user_agent TEXT, ip TEXT, source_path TEXT, created_at TEXT NOT NULL, sector TEXT, created TEXT, first_response TEXT, status TEXT);
CREATE TABLE Site_Pricing (
  plan_name     TEXT PRIMARY KEY,
  type          TEXT NOT NULL DEFAULT 'plan',
  default_price REAL NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'EUR',
  synced_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE blog_posts (
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
, title_nl   TEXT, excerpt_nl TEXT, content_nl TEXT, source     TEXT NOT NULL DEFAULT 'admin', title_de   TEXT, excerpt_de TEXT, content_de TEXT, title_fr   TEXT, excerpt_fr TEXT, content_fr TEXT, newsletter_subject_de TEXT, newsletter_body_de    TEXT, newsletter_subject_fr TEXT, newsletter_body_fr    TEXT, faq_json TEXT, category TEXT, series_id TEXT, series_position INTEGER, company_link_path TEXT);
CREATE TABLE repository_items (
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
, linkedin_post_text TEXT, external_url TEXT, slug TEXT, category TEXT, cover_image_key TEXT, summary_en TEXT, summary_nl TEXT, summary_de TEXT, summary_fr TEXT, links_json TEXT, faq_json TEXT, featured_at INTEGER, pending_update_note TEXT, source_last_checked_at INTEGER, source_etag TEXT, source_content_length INTEGER, series_id TEXT, series_position INTEGER, last_change_detected_at INTEGER);
CREATE TABLE share_events (
  event_id        TEXT    PRIMARY KEY,
  user_email      TEXT,
  entity_type     TEXT    NOT NULL CHECK(entity_type IN ('blog_post','repository_item')),
  entity_id       TEXT    NOT NULL,
  channel         TEXT    NOT NULL CHECK(channel IN ('linkedin_share','copy_text')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  ip_hash         TEXT,
  user_agent_hash TEXT
);
CREATE TABLE passthrough_events (
  id         TEXT PRIMARY KEY,
  blog_id    TEXT NOT NULL,
  src        TEXT,                       -- newsletter | digest | direct
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE profile_badge (
  id           INTEGER PRIMARY KEY CHECK (id = 1),
  name         TEXT,
  headline     TEXT,
  linkedin_url TEXT,
  photo_key    TEXT,
  synced_at    INTEGER,
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE series (
  id           TEXT PRIMARY KEY,
  title_nl     TEXT NOT NULL,
  title_en     TEXT,
  title_de     TEXT,
  title_fr     TEXT,
  excerpt_nl   TEXT NOT NULL,
  excerpt_en   TEXT,
  excerpt_de   TEXT,
  excerpt_fr   TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX idx_blog_status ON blog_posts(status, published_at DESC);
CREATE INDEX idx_blog_revival
  ON blog_posts(revival_status, published_at, last_linkedin_shared_at);
CREATE INDEX idx_ri_published ON repository_items(published, created_at DESC);
CREATE INDEX idx_share_events_entity
  ON share_events(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_pt_blog ON passthrough_events(blog_id, created_at DESC);
CREATE UNIQUE INDEX idx_repo_slug ON repository_items(slug);
CREATE INDEX idx_blog_series ON blog_posts(series_id, series_position);
CREATE INDEX idx_repo_last_change ON repository_items(last_change_detected_at DESC);
