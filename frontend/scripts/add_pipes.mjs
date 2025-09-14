// client/scripts/add_pipes.mjs
// Adds NPS pipe sizes with STD & XH schedules to materials.json.
// Defaults to SA-106B seamless; unit is Per Foot; no weight_per_ft (so price/ft works out of the box).
// Dedupes if items already exist.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const materialsPath = path.resolve(__dirname, '../src/data/materials.json');
const raw = fs.readFileSync(materialsPath, 'utf8');
const materials = JSON.parse(raw);

// Edit this list if you need fewer/more sizes.
// I’m including common NPS up to 24". We’ll stop at STD & XH (no Sch 100).
const sizes = [
  '1/2"', '3/4"', '1"', '1-1/4"', '1-1/2"', '2"', '2-1/2"', '3"', '3-1/2"',
  '4"', '5"', '6"', '8"', '10"', '12"', '14"', '16"', '18"', '20"', '24"'
];
const schedules = ['STD', 'XH'];
const spec = 'SA-106B'; // change to A53 or another default later if you prefer

// Build a quick lookup to avoid duplicates
const keyOf = (m) => `${(m.type||'').toLowerCase()}|${(m.category||'').toLowerCase()}|${(m.size||'').toLowerCase()}`;
const seen = new Set(materials.map(keyOf));

const additions = [];

for (const nps of sizes) {
  for (const sch of schedules) {
    const item = {
      type: 'Pipe',
      category: 'Pipe',
      size: `${nps} ${sch}`,
      description: `${nps} ${sch} ${spec}`,
      unit_type: 'Per Foot',
      label: `Pipe - ${nps} ${sch} (${spec})`,
      value: `Pipe|${nps} ${sch}|${spec}`,
      spec
      // weight_per_ft intentionally omitted for now; you can price per foot in QuoteForm.
    };
    const k = keyOf(item);
    if (!seen.has(k)) {
      seen.add(k);
      additions.push(item);
    }
  }
}

if (!additions.length) {
  console.log('No new pipe items to add (everything already present).');
} else {
  materials.push(...additions);
  fs.writeFileSync(materialsPath, JSON.stringify(materials, null, 2), 'utf8');
  console.log(`Added ${additions.length} pipe items to materials.json`);
}
