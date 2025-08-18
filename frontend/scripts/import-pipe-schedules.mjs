// node scripts/import-pipe-schedules.mjs scripts/pipe_schedules.csv
// CSV columns: nps, od_in, schedule, wall_in, weight_lb_per_ft (optional)
// If weight_lb_per_ft is blank, it will be computed: (OD - wall) * wall * 10.69

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const target = path.join(__dirname, '..', 'src', 'data', 'materials.json');

const inPath = process.argv[2];
if (!inPath) { console.error('Usage: node scripts/import-pipe-schedules.mjs <csv>'); process.exit(1); }

const csv = fs.readFileSync(inPath, 'utf8').trim().split(/\r?\n/);
const hdr = csv.shift().split(',').map(s=>s.trim().toLowerCase());
const idx = (name) => hdr.indexOf(name);

const rows = csv.map(line=>{
  const cols = line.split(',').map(s=>s.trim());
  const nps = cols[idx('nps')];
  const od  = parseFloat(cols[idx('od_in')]);
  const sch = cols[idx('schedule')];
  const wall = parseFloat(cols[idx('wall_in')]);
  let wpf = cols[idx('weight_lb_per_ft')] ? parseFloat(cols[idx('weight_lb_per_ft')]) : NaN;
  if (!Number.isFinite(wpf) && Number.isFinite(od) && Number.isFinite(wall)) {
    wpf = (od - wall) * wall * 10.69; // industry formula @ 0.2836 lb/in^3
  }
  return { nps, od_in: +od.toFixed(3), schedule: sch, wall_in: +wall.toFixed(3), weight_lb_per_ft: +wpf.toFixed(3) };
});

const materials = JSON.parse(fs.readFileSync(target, 'utf8'));
const keyOf = (m) => `${(m.type||'').toLowerCase()}|${(m.size||'').toLowerCase()}`;
const seen = new Set(materials.map(keyOf));
let added = 0;

for (const r of rows) {
  const size = `NPS ${r.nps} SCH ${r.schedule}`;
  const item = {
    type: 'Pipe',
    family: 'Pipe',
    size,
    unit_type: 'Per Foot',
    od_in: r.od_in,
    schedule: r.schedule,
    wall_in: r.wall_in,
    weight_per_ft: r.weight_lb_per_ft,
    price_per_lb: 0,
    grade: '' // selectable in the Quote
  };
  const k = keyOf(item);
  if (!seen.has(k)) { materials.push(item); seen.add(k); added++; }
}

fs.writeFileSync(target, JSON.stringify(materials, null, 2));
console.log(`Imported ${added} new pipe items into materials.json`);
