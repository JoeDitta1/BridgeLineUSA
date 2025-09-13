import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// Use the SAME DB the server uses: ./data/app.db
const DB_FILE = path.resolve(process.cwd(), 'data', 'app.db');

// CLI arg #1 = path to your materials JSON
const INPUT = process.argv[2];
if (!INPUT) {
  console.error('Usage: node scripts/seed-from-json.mjs <path-to-materials.json>');
  process.exit(1);
}
const inputPath = path.resolve(INPUT);
if (!fs.existsSync(inputPath)) {
  console.error('File not found:', inputPath);
  process.exit(1);
}

// Read JSON
const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Open DB and ensure schema matches the backend (src/db.js)
const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
db.exec(`
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
`);

const upsert = db.prepare(`
  INSERT INTO materials (
    family, size, unit_type, grade,
    weight_per_ft, weight_per_sqin,
    price_per_lb, price_per_ft, price_each,
    description
  )
  VALUES (
    @family, @size, @unit_type, @grade,
    @weight_per_ft, @weight_per_sqin,
    @price_per_lb, @price_per_ft, @price_each,
    @description
  )
  ON CONFLICT(family, size) DO UPDATE SET
    unit_type      = COALESCE(excluded.unit_type, materials.unit_type),
    grade          = COALESCE(excluded.grade, materials.grade),
    weight_per_ft  = COALESCE(excluded.weight_per_ft, materials.weight_per_ft),
    weight_per_sqin= COALESCE(excluded.weight_per_sqin, materials.weight_per_sqin),
    price_per_lb   = COALESCE(excluded.price_per_lb, materials.price_per_lb),
    price_per_ft   = COALESCE(excluded.price_per_ft, materials.price_per_ft),
    price_each     = COALESCE(excluded.price_each, materials.price_each),
    description    = COALESCE(excluded.description, materials.description)
`);

let inserted = 0, updated = 0, skipped = 0;
const num = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseFloat(v); return Number.isFinite(n) ? n : null;
};

db.transaction(() => {
  for (const m of raw) {
    const rec = {
      // accept either "family" or legacy "type/category"
      family: (m.family || m.type || m.category || 'Material').toString(),
      size: (m.size || m.description || '').toString(),
      unit_type: m.unit_type || null,
      grade: m.grade || null,
      weight_per_ft: num(m.weight_per_ft),
      weight_per_sqin: num(m.weight_per_sqin),
      price_per_lb: num(m.price_per_lb),
      price_per_ft: num(m.price_per_ft),
      price_each: num(m.price_each),
      description: m.description || null,
    };
    if (!rec.family || !rec.size) { skipped++; continue; }
    const res = upsert.run(rec);
    if (res.changes === 1 && res.lastInsertRowid) inserted++;
    else if (res.changes === 1) updated++;
  }
})();

console.log(`Seed complete. Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);
db.close();
