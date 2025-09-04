// ESM script (package.json has "type":"module")
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL   = process.env.SUPABASE_URL;
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---- helpers ---------------------------------------------------------------

const normalizeValue = (r) => {
  const raw = (r.value ?? '').toString().trim();
  if (raw) return raw;
  const cat = (r.category ?? r.type ?? 'Unknown').toString().trim();
  const sz  = (r.size ?? r.description ?? r.label ?? 'N/A').toString().trim();
  return `${cat}|${sz}`;
};

const normalizeRow = (r) => ({
  category: r.category ?? null,
  type: r.type ?? null,
  size: r.size ?? null,
  description: r.description ?? null,
  unit_type: r.unit_type ?? null,
  label: r.label ?? null,
  weight_per_ft: r.weight_per_ft ?? null,
  value: normalizeValue(r), // <-- conflict key (plain column has UNIQUE index)
});

// Deduplicate by normalized key (case + whitespace insensitive)
const dedupeByValue = (rows) => {
  const map = new Map();
  for (const r of rows) {
    const key = r.value.trim();         // plain UNIQUE index is on value (not lower())
    const canon = key.toLowerCase();    // avoid within-batch collisions due to case
    // prefer the first seen; if you want “last wins”, replace the if-block
    if (!map.has(canon)) map.set(canon, { ...r, value: key });
  }
  return [...map.values()];
};

const chunk = (arr, n) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

// ---- main ------------------------------------------------------------------

async function main() {
  const src = process.argv[2] || path.resolve(__dirname, '../materials.json');
  const raw = fs.readFileSync(path.resolve(__dirname, src), 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    console.error('Input JSON top-level must be an array');
    process.exit(1);
  }

  const normalized = data.map(normalizeRow);
  const uniqueRows = dedupeByValue(normalized);

  console.log(`[seed] input=${data.length} unique_by_value=${uniqueRows.length} dups=${data.length - uniqueRows.length}`);

  const batches = chunk(uniqueRows, 500);
  let ok = 0;

  for (let i = 0; i < batches.length; i++) {
    const b = batches[i];

    // Use upsert by 'value' (matches your plain UNIQUE index on "value")
    const { error } = await supabase
      .from('materials')
      .upsert(b, { onConflict: 'value' }); // do not set ignoreDuplicates (we want updates)

    if (error) {
      console.error(`[seed] batch ${i + 1} failed: ${error.message}`);
      // Helpful hint if the specific “affect row a second time” ever reappears:
      if (/affect row a second time/i.test(error.message)) {
        console.error('Hint: a duplicate "value" still exists within this batch. Our dedupe should prevent this; check for invisible differences (e.g., trailing spaces).');
      }
      process.exit(1);
    } else {
      ok += b.length;
      console.log(`[seed] batch ${i + 1}/${batches.length} ok: ${b.length}`);
    }
  }

  console.log(`[seed] done — inserted_or_upserted=${ok} failed=0`);
}

main().catch((e) => {
  console.error('[seed] fatal:', e);
  process.exit(1);
});
