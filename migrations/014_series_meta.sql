-- 014: series metadata (title + excerpt, 4 languages) — operator types Dutch,
-- EN/DE/FR are AI-translated and stored. id matches blog_posts.series_id /
-- repository_items.series_id (free-text slug set in the admin editor).
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
