-- Additions for advanced quote schema: storage_key_root, version_current, qc, totals
PRAGMA foreign_keys = ON;

ALTER TABLE quotes ADD COLUMN storage_key_root TEXT;
ALTER TABLE quotes ADD COLUMN version_current INTEGER;
ALTER TABLE quotes ADD COLUMN qc TEXT;
ALTER TABLE quotes ADD COLUMN totals TEXT;

CREATE TABLE IF NOT EXISTS quote_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  version INTEGER NOT NULL,
  label TEXT,
  storage_key_json TEXT,
  storage_key_pdf TEXT,
  snapshot_json TEXT,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(quote_id, version)
);

CREATE TABLE IF NOT EXISTS quote_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL,
  kind TEXT,
  name TEXT,
  size INTEGER,
  content_type TEXT,
  storage_key TEXT,
  public_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quote_revisions_quote ON quote_revisions(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_files_quote ON quote_files(quote_id);
