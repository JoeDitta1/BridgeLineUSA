// backend/scripts/inspect_materials.js
// Usage: node scripts/inspect_materials.js ../materials.json
import fs from 'fs';
import path from 'path';

const p = path.resolve(process.cwd(), process.argv[2] || '');
if (!p || !fs.existsSync(p)) {
  console.error('Usage: node scripts/inspect_materials.js <path-to-materials.json>');
  process.exit(1);
}

const raw = fs.readFileSync(p, 'utf8');
const data = JSON.parse(raw);

function brief(obj, n = 12) {
  return Object.fromEntries(Object.entries(obj).slice(0, n));
}

if (Array.isArray(data)) {
  console.log('Top-level is an ARRAY. length =', data.length);
  // keys across first 200 items
  const keyCounts = new Map();
  const families = new Map();
  for (const item of data.slice(0, 200)) {
    Object.keys(item).forEach(k => keyCounts.set(k, 1 + (keyCounts.get(k) || 0)));
    const fam = item.family || item.Family || item.category || item.Category || item.type || item.Type;
    if (fam) families.set(fam, 1 + (families.get(fam) || 0));
  }
  console.log('Common keys (first 200):', Array.from(keyCounts.entries()).sort((a,b)=>b[1]-a[1]).slice(0,30));
  console.log('Sample families (first 200):', Array.from(families.entries()).slice(0,20));
  console.log('First item:', brief(data[0] || {}));
} else if (data && typeof data === 'object') {
  console.log('Top-level is an OBJECT. keys =', Object.keys(data));
  // If it’s grouped by family, show counts
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) {
      console.log(`Group "${k}" -> ${v.length} items; first item:`, brief(v[0] || {}));
    } else if (v && typeof v === 'object') {
      const arr = Array.isArray(v.items) ? v.items : (Array.isArray(v.list) ? v.list : null);
      if (arr) console.log(`Group "${k}" -> ${arr.length} items via items/list; first:`, brief(arr[0] || {}));
    }
  }
} else {
  console.log('Unexpected JSON type:', typeof data);
}
