// backend/scripts/seed_materials_to_pg.js
// Usage: node scripts/seed_materials_to_pg.js <path-to-materials.json>
// Example: node scripts/seed_materials_to_pg.js ../data/materials.json

import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Pool } = pg;

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Usage: node scripts/seed_materials_to_pg.js <path-to-materials.json>');
  process.exit(1);
}

const absPath = path.resolve(process.cwd(), jsonPath);
if (!fs.existsSync(absPath)) {
  console.error('File not found:', absPath);
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
});

function norm(v) {
  return (v === undefined || v === null) ? null : String(v).trim();
}

(async () => {
  const raw = fs.readFileSync(absPath, 'utf8');
  /** Expecting an array of material objects.
   *  We'll try to map common keys used in your app:
   *   - family (e.g., Plate, Angle, Tube, Channel, Beam)
   *   - size
   *   - grade
   *   - unit or unit_type
   *   - description
   *   - price_* fields if present (we'll map to price_per_unit if possible)
   */
  let items = JSON.parse(raw);
  if (!Array.isArray(items)) {
    console.error('materials.json must be an array of objects.');
    process.exit(1);
  }

  const client = await pool.connect();
  let inserted = 0, updated = 0, skipped = 0;

  try {
    await client.query('begin');

    for (const it of items) {
      const family = norm(it.family || it.Family);
      const size = norm(it.size || it.Size || it.size_label);
      const grade = norm(it.grade || it.Grade);
      const unit  = norm(it.unit || it.unit_type || it.Unit);
      const description = norm(it.description || it.Description);

      // pick a price if present; otherwise null
      const price_per_unit =
        it.price_per_unit ?? it.price_each ?? it.price_per_ft ?? it.price_per_lb ?? null;

      if (!family || !size) {
        skipped++;
        continue; // must have at least family + size
      }

      // Upsert-by-lookup (no unique index required):
      const sel = await client.query(
        `select id from public.materials
         where tenant_id is null
           and family = $1 and size = $2
           and coalesce(grade,'') = coalesce($3,'')
           and coalesce(unit,'')  = coalesce($4,'')
           and coalesce(description,'') = coalesce($5,'')`,
        [family, size, grade, unit, description]
      );

      if (sel.rows.length) {
        // update price if provided
        if (price_per_unit != null) {
          await client.query(
            `update public.materials
               set price_per_unit = $1
             where id = $2`,
            [price_per_unit, sel.rows[0].id]
          );
          updated++;
        } else {
          skipped++;
        }
      } else {
        await client.query(
          `insert into public.materials
             (tenant_id, family, size, grade, unit, description, price_per_unit)
           values
             (null, $1, $2, $3, $4, $5, $6)`,
          [family, size, grade, unit, description, price_per_unit ?? null]
        );
        inserted++;
      }
    }

    await client.query('commit');
    console.log(`[seed] inserted=${inserted} updated=${updated} skipped=${skipped}`);
  } catch (e) {
    await client.query('rollback');
    console.error('[seed] failed:', e.message || e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
