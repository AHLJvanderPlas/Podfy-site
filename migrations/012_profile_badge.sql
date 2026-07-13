-- 012: self-hosted LinkedIn profile badge (weekly server-side sync, no client-side LinkedIn calls)
CREATE TABLE profile_badge (
  id           INTEGER PRIMARY KEY CHECK (id = 1),
  name         TEXT,
  headline     TEXT,
  linkedin_url TEXT,
  photo_key    TEXT,
  synced_at    INTEGER,
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);
INSERT INTO profile_badge (id, name, headline, linkedin_url)
VALUES (1, 'Alexander van der Plas', 'Founder, Podfy', 'https://nl.linkedin.com/in/ahljvanderplas');
