// backend/scripts/inspect_categories.js
// Usage: node scripts/inspect_categories.js ../materials.json
import fs from 'fs';

const path = process.argv[2] || '../materials.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const tally = (field) => {
  const m = new Map();
  for (const r of data) {
    const v = (r?.[field] ?? '').toString().trim();
    m.set(v, (m.get(v) || 0) + 1);
  }
  return [...m.entries()].sort((a,b) => b[1]-a[1]);
};

console.log('By category:\n', tally('category'));
console.log('\nBy type:\n', tally('type'));
console.log('\nBy family:\n', tally('family'));
