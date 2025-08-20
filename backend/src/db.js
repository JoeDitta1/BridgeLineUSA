import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cross-platform data dir inside the repo (works on Windows + Codespaces)
const DATA_DIR = process.env.SCM_DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'app.db');
console.log('[DB] Using database at:', DB_PATH);

// Open DB
export const db = new Database(DB_PATH);

// Create all needed tables
export function migrate() {
  db.exec(`
    PRAGMA journal_mode = WAL;

    /* materials */
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY,
      family TEXT NOT NULL,
      size TEXT NOT NULL,
      unit_type TEXT,
      grade TEXT,
      weight_per_ft REAL,
      weight_per_sqin REAL,
      price_per_lb REAL,
      price_per_ft REAL,
      price_each REAL,
      description TEXT,
      UNIQUE(family, size)
    );

    CREATE TABLE IF NOT EXISTS material_alias (
      id INTEGER PRIMARY KEY,
      material_id INTEGER NOT NULL,
      alias_text TEXT NOT NULL UNIQUE,
      FOREIGN KEY(material_id) REFERENCES materials(id)
    );

    /* parts, price history (unchanged) */
    CREATE TABLE IF NOT EXISTS parts (
      id INTEGER PRIMARY KEY,
      part_no TEXT NOT NULL UNIQUE,
      revision TEXT,
      title TEXT
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY,
      material_key TEXT NOT NULL,
      unit_type TEXT NOT NULL,
      grade TEXT,
      domestic INTEGER DEFAULT 0,
      payload_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(material_key, unit_type, grade, domestic)
    );

    /* quotes */
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote_no TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      description TEXT,
      requested_by TEXT,
      estimator TEXT,
      date TEXT NOT NULL,                 -- YYYY-MM-DD
      status TEXT DEFAULT 'Draft',
      sales_order_no TEXT,
      rev INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_quote_no_rev ON quotes(quote_no, rev);
  `);
}
