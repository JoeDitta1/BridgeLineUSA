// backend/scripts/inspect_plate.js
// Usage: node scripts/inspect_plate.js ../materials.json
import fs from 'fs';

const path = process.argv[2] || '../materials.json';
const raw = fs.readFileSync(path, 'utf8');
const data = JSON.parse(raw);

if (!Array.isArray(data)) {
  console.log('Top-level is not an array. typeof =', typeof data);
  process.exit(0);
}

const FIELDS = ['family', 'category', 'type', 'label', 'description', 'value'];
const TOKENS = [
  'plate',           // catches "diamond plate"
  'flat bar',        // many people quote plate as flat bar stock
  'sheet'            // future-proofing
];

const isPlateLike = (rec) => {
  const hay = FIELDS.map(k => (rec?.[k] ?? '') + '').join(' ').toLowerCase();
  return TOKENS.some(t => hay.includes(t));
};

const plates = data.filter(isPlateLike);

// key frequency
const keyCounts = new Map();
for (const r of plates) {
  for (const k of Object.keys(r)) keyCounts.set(k, (keyCounts.get(k) || 0) + 1);
}

const topKeys = [...keyCounts.entries()]
  .sort((a,b) => b[1]-a[1])
  .slice(0, 50)
  .map(([k,v]) => [k,v]);

console.log(`Total records: ${data.length}`);
console.log(`Plate-like items found: ${plates.length}`);
console.log('Top keys on Plate-like:', topKeys);

// quick peek
plates.slice(0, 3).forEach((r, i) => {
  const view = {};
  FIELDS.forEach(k => view[k] = r?.[k]);
  console.log(`\nSample #${i+1}`, view);
});
