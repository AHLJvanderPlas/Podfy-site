-- 005 (podfy-public): passthrough click measurement (sent → clicked funnel).
-- /li/{blogId} logs email→LinkedIn clicks; ?src= tags identify the channel.
CREATE TABLE IF NOT EXISTS passthrough_events (
  id         TEXT PRIMARY KEY,
  blog_id    TEXT NOT NULL,
  src        TEXT,                       -- newsletter | digest | direct
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_pt_blog ON passthrough_events(blog_id, created_at DESC);
