-- 013: blog category (matches site subject-filter taxonomy) + series support
-- (blog_posts AND repository_items, mirroring Harry's shared series model)
ALTER TABLE blog_posts ADD COLUMN category TEXT;
ALTER TABLE blog_posts ADD COLUMN series_id TEXT;
ALTER TABLE blog_posts ADD COLUMN series_position INTEGER;
ALTER TABLE repository_items ADD COLUMN series_id TEXT;
ALTER TABLE repository_items ADD COLUMN series_position INTEGER;
CREATE INDEX IF NOT EXISTS idx_blog_series ON blog_posts(series_id, series_position);
