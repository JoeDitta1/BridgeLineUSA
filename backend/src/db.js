
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.SCM_DATA_DIR || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'app.db');     // ← only one of these
console.log('[DB] Using database at:', DB_PATH);   // ← the log line


fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(DB_PATH);

export function migrate() {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
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
  `);

  // Ensure admin settings KV table and counters table exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT UNIQUE,
      value TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS counters (
      key TEXT PRIMARY KEY,
      next_value INTEGER NOT NULL
    );
  `);

  // If an old key/value `settings` table exists, migrate it safely to a
  // preserved table and create the new single-row `settings` table used by
  // the rest of the backend. This avoids the "no such column: id" error
  // when older DBs still have the legacy schema.
  try {
    const cols = db.prepare("PRAGMA table_info('settings')").all() || [];
    const hasKeyCol = cols.some(c => c.name === 'key');
    const hasIdCol = cols.some(c => c.name === 'id');
    if (hasKeyCol && !hasIdCol) {
      // Preserve existing kv table
      db.exec("ALTER TABLE settings RENAME TO settings_kv;");

      // Create new single-row settings table expected by current code
      db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          org_prefix TEXT NOT NULL DEFAULT 'SCM',
          system_abbr TEXT,
          quote_series TEXT NOT NULL DEFAULT 'Q',
          quote_pad INTEGER NOT NULL DEFAULT 4,
          next_quote_seq INTEGER NOT NULL DEFAULT 1,
          sales_series TEXT NOT NULL DEFAULT 'S',
          sales_pad INTEGER NOT NULL DEFAULT 3,
          next_sales_seq INTEGER NOT NULL DEFAULT 1
        );
      `);

      // Ensure the single required row exists
      db.exec(`
        INSERT OR IGNORE INTO settings (id, org_prefix, quote_series, quote_pad, next_quote_seq, sales_series, sales_pad, next_sales_seq)
        VALUES (1, 'SCM', 'Q', 4, 1, 'S', 3, 1);
      `);

      console.log('[DB] Legacy settings table detected and migrated to settings_kv; new settings row created');
    }
  } catch (e) {
    console.warn('[DB] settings migration check failed:', e && e.message ? e.message : e);
  }

  // NEW: equipment tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      status TEXT,
      location TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      manual_path TEXT,
      capabilities_json TEXT
    );

    CREATE TABLE IF NOT EXISTS equipment_docs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_id INTEGER NOT NULL,
      path TEXT NOT NULL,
      label TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
    );
  `);

  // System materials: families, specs, sizes
  db.exec(`
    CREATE TABLE IF NOT EXISTS material_families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS material_specs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      grade TEXT,
      density REAL,
      unit TEXT,
      notes TEXT,
      ai_searchable INTEGER DEFAULT 1,
      FOREIGN KEY(family_id) REFERENCES material_families(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS material_sizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      size_label TEXT NOT NULL,
      dims_json TEXT,
      FOREIGN KEY(family_id) REFERENCES material_families(id) ON DELETE CASCADE
    );
  `);

  // Seed initial families if missing
  try {
    const famCount = db.prepare('SELECT COUNT(1) as cnt FROM material_families').get();
    if (!famCount || famCount.cnt === 0) {
      const insert = db.prepare('INSERT INTO material_families (name) VALUES (?)');
      ['Angle','Tube','Pipe','Channel','Beam'].forEach(n => insert.run(n));
      console.log('[DB] seeded material_families');
    }
  } catch (e) {
    console.warn('[DB] seed material_families failed:', e && e.message ? e.message : e);
  }
}
