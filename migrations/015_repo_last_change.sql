-- 015: persistent "last confirmed real change" timestamp for repository items.
-- source_last_checked_at is stamped on EVERY freshness-check run regardless
-- of outcome (last poll); pending_update_note is cleared once a change is
-- used in a Friday special. Neither survives as a durable "when did this
-- document actually last change" signal for admin sorting — this does.
ALTER TABLE repository_items ADD COLUMN last_change_detected_at INTEGER;
CREATE INDEX IF NOT EXISTS idx_repo_last_change ON repository_items(last_change_detected_at DESC);
