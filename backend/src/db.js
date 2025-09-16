
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

    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote_no TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      description TEXT,
      requested_by TEXT,
      estimator TEXT,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Draft',
      sales_order_no TEXT,
      rev INTEGER NOT NULL DEFAULT 0,
      app_state TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date);
    CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_name);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_customer_date_description ON quotes(customer_name, date, description);
  `);

  // Ensure columns for quotes table
  const ensureColumn = (table, col, typeDefault) => {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all();
    const exists = cols.some(c => c.name === col);
    if (!exists) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${typeDefault}`);
  };
  ensureColumn('quotes', 'description', 'TEXT');
  ensureColumn('quotes', 'requested_by', 'TEXT');
  ensureColumn('quotes', 'estimator', 'TEXT');
  ensureColumn('quotes', 'app_state', 'TEXT');
  ensureColumn('quotes', 'deleted_at', 'TEXT NULL');
  ensureColumn('quotes', 'rev', 'INTEGER NOT NULL DEFAULT 0');

  // Settings table for quote numbering
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
  const srow = db.prepare('SELECT id FROM settings WHERE id=1').get();
  if (!srow) {
    db.prepare(`
      INSERT INTO settings (id, org_prefix, system_abbr, quote_series, quote_pad, next_quote_seq, sales_series, sales_pad, next_sales_seq)
      VALUES (1, 'SCM', NULL, 'Q', 4, 1, 'S', 3, 1)
    `).run();
  }

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

  // Users and authentication tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      full_name TEXT,
      role TEXT NOT NULL DEFAULT 'staff',
      company_id INTEGER,
      oem_company_name TEXT,
      phone TEXT,
      status TEXT DEFAULT 'active',
      last_login TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL DEFAULT 'oem',
      contact_email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      country TEXT DEFAULT 'USA',
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
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

    CREATE TABLE IF NOT EXISTS preferred_vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      vendor_name TEXT NOT NULL,
      vendor_url TEXT,
      priority INTEGER DEFAULT 1,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(family_id) REFERENCES material_families(id) ON DELETE CASCADE
    );
  `);

      // Seed initial families if missing
    try {
      const famCount = db.prepare('SELECT COUNT(1) as cnt FROM material_families').get();
      if (!famCount || famCount.cnt === 0) {
        const insert = db.prepare('INSERT INTO material_families (name) VALUES (?)');
        ['Angle','Tube','Pipe','Channel','Beam','Flange'].forEach(n => insert.run(n));
        console.log('[DB] seeded material_families');
      }

      // Seed preferred vendors if missing
      try {
        const vendorCount = db.prepare('SELECT COUNT(1) as cnt FROM preferred_vendors').get();
        if (!vendorCount || vendorCount.cnt === 0) {
          const vendorInsert = db.prepare(`
            INSERT INTO preferred_vendors (family_id, vendor_name, vendor_url, priority, notes)
            VALUES (?, ?, ?, ?, ?)
          `);

          // Get family IDs
          const families = db.prepare('SELECT id, name FROM material_families').all();
          const familyMap = {};
          families.forEach(f => familyMap[f.name.toLowerCase()] = f.id);

          // Seed some preferred vendors
          const seedVendors = [
            { family: 'pipe', name: 'Steel Supply LP', url: 'https://www.steelsupplylp.com', priority: 1, notes: 'Excellent for carbon steel pipe' },
            { family: 'flange', name: 'Steel Supply LP', url: 'https://www.steelsupplylp.com', priority: 1, notes: 'Wide selection of flanges' },
            { family: 'beam', name: 'Industrial Metals Co.', url: 'https://www.industrialmetals.com', priority: 1, notes: 'Structural steel specialist' },
            { family: 'pipe', name: 'Pipe Masters Inc.', url: 'https://www.pipemasters.com', priority: 2, notes: 'Good for specialty pipes' },
            { family: 'flange', name: 'Alloy Flanges Co.', url: 'https://www.alloyflanges.com', priority: 2, notes: 'Specializes in alloy flanges' }
          ];

          seedVendors.forEach(vendor => {
            const familyId = familyMap[vendor.family];
            if (familyId) {
              vendorInsert.run(familyId, vendor.name, vendor.url, vendor.priority, vendor.notes);
            }
          });

          console.log('[DB] seeded preferred_vendors');
        }
      } catch (e) {
        console.error('[DB] seeding error:', e);
      }
    } catch (e) {
      console.warn('[DB] seed material_families failed:', e && e.message ? e.message : e);
    }
}
