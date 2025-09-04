CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,              -- 'openai', 'ollama', 'anthropic', etc.
  key_value TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,   -- 1=true, 0=false
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS api_keys_provider_idx ON api_keys(provider, active);