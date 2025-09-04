-- Add idempotency key to quote_revisions to support idempotent saves
PRAGMA foreign_keys = ON;

ALTER TABLE quote_revisions ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS uq_quote_revisions_idempotency ON quote_revisions (idempotency_key);
