-- Migration: create quote_sync_queue to enqueue async uploads to Supabase
CREATE TABLE IF NOT EXISTS quote_sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_no TEXT NOT NULL,
  customer_name TEXT,
  quote_dir TEXT,
  meta_path TEXT,
  payload_json TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, done, failed
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quote_sync_queue_status ON quote_sync_queue(status, created_at);
