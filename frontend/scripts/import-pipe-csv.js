// node client/scripts/import-pipe-csv.js pipe.csv
const fs = require('fs');
const path = require('path');

const materialsPath = path.join(__dirname, '..', 'src', 'data', 'materials.json');
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/import-pipe-csv.js pipe.csv');
  process.exit(1);
}

function parseCSV(text) {
  const rows = text.split(/\r?\n/).filter(Boolean);
  const [hdr, ...lines] = rows;
  const cols = hdr.split(',').map(s => s.trim());
  return lines.map(line => {
    const cells = line.split(',').map(s => s.trim());
    const obj = {};
    cols.forEach((c,i)=>obj[c]=cells[i]);
    return obj;
  });
}

const csv = fs.readFileSync(csvPath,'utf8');
const items = parseCSV(csv);

let base = [];
try {
  const raw = JSON.parse(fs.readFileSync(materialsPath,'utf8'));
  base = Array.isArray(raw) ? raw : (raw.materials || raw.items || []);
} catch(_) {}

const key = (m)=>`${(m.type||m.family)||'GEN'}|${m.size}`;
const map = new Map(base.map(m => [key(m), m]));

for (const r of items) {
  const size = `NPS ${r.nps} Sch ${r.schedule}`;
  map.set(`Pipe|${size}`, {
    type: 'Pipe',
    category: 'Pipe',
    size,
    unit_type: 'Per Foot',
    od_in: parseFloat(r.od_in) || undefined,
    wall_in: parseFloat(r.wall_in) || undefined,
    schedule: r.schedule,
    weight_per_ft: parseFloat(r.weight_per_ft) || undefined,
    price_per_lb: r.price_per_lb ? parseFloat(r.price_per_lb) : 0.65
  });
}

const out = Array.from(map.values());
fs.writeFileSync(materialsPath, JSON.stringify(out, null, 2));
console.log(`Imported ${items.length} pipe rows. Total materials: ${out.length}`);
