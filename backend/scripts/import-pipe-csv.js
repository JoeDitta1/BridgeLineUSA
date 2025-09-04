
// Node script: import a pipe CSV (½"→48", Sch 10/40/80 format) into SQLite
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { db, migrate } from '../src/db.js';

function run(path) {
  migrate();
  const csv = fs.readFileSync(path, 'utf-8');
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
  const ins = db.prepare(`INSERT INTO materials (family,size,unit_type,grade,weight_per_ft,weight_per_sqin,price_per_lb,price_per_ft,price_each,description)
    VALUES (@family,@size,@unit_type,@grade,@weight_per_ft,@weight_per_sqin,@price_per_lb,@price_per_ft,@price_each,@description)`);
  const exists = db.prepare('SELECT id FROM materials WHERE family=? AND size=?');
  let inserted = 0, skipped = 0;
  for (const r of rows) {
    if (exists.get(r.family, r.size)) { skipped++; continue; }
    let wpf = null;
    const od = parseFloat(r.od_in), t = parseFloat(r.wall_in);
    if (Number.isFinite(od) && Number.isFinite(t)) wpf = 10.69 * (od - t) * t;
    ins.run({
      family: r.family || 'Pipe',
      size: r.size,
      unit_type: r.unit_type || 'Per Foot',
      grade: r.grade || null,
      weight_per_ft: wpf || null,
      weight_per_sqin: r.weight_per_sqin ? Number(r.weight_per_sqin) : null,
      price_per_lb: r.price_per_lb ? Number(r.price_per_lb) : null,
      price_per_ft: r.price_per_ft ? Number(r.price_per_ft) : null,
      price_each: r.price_each ? Number(r.price_each) : null,
      description: r.notes || (r.schedule ? `Schedule ${r.schedule}` : null)
    });
    inserted++;
  }
  console.log(`Import done: inserted=${inserted}, skipped=${skipped}`);
}

const p = process.argv[2];
if (!p) {
  console.error('Usage: node scripts/import-pipe-csv.js <path-to-csv>');
  process.exit(1);
}
run(p);
