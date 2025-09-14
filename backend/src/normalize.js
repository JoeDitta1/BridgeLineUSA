
// Basic rules + fuzzy/alias matching for offline normalization
import { db } from './db.js';

const X = /[×x]/g;
const NON = /[^A-Z0-9]/g;

export function canonKey(family, size) {
  const f = String(family || '').toUpperCase().replace(NON, '');
  const s = String(size || '').toUpperCase().replace(X, 'X').replace(NON, '');
  return `${f}|${s}`;
}

export function normalizeText(txt) {
  if (!txt) return '';
  return String(txt).toUpperCase()
    .replace(X, 'X')
    .replace(/\s+/g, ' ')
    .trim();
}

export function keyFromFreeText(txt) {
  const t = normalizeText(txt);
  return t.replace(NON, '');
}

function score(a, b) {
  // Jaccard-ish char bigram similarity (fast & decent)
  const bigrams = (s) => {
    const arr = [];
    for (let i = 0; i < s.length - 1; i++) arr.push(s.slice(i, i+2));
    return new Set(arr);
  };
  const A = bigrams(a), B = bigrams(b);
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function findMaterialByText(freeText) {
  const free = normalizeText(freeText);
  if (!free) return null;

  // Alias exact match first
  const ali = db.prepare('SELECT m.* FROM material_alias a JOIN materials m ON a.material_id=m.id WHERE UPPER(a.alias_text)=?').get(free.toUpperCase());
  if (ali) return { material: ali, confidence: 1, via: 'alias' };

  // Build candidate list (small DB ok)
  const mats = db.prepare('SELECT * FROM materials').all();
  const keyed = mats.map(m => ({
    m,
    key: canonKey(m.family, m.size),
    sizeKey: keyFromFreeText(m.size),
    famKey: keyFromFreeText(m.family)
  }));

  const freeKey = keyFromFreeText(free);
  let best = null;
  for (const k of keyed) {
    // quick path: if free contains fam/size substrings or vice versa
    const f1 = freeKey.includes(k.sizeKey) || k.sizeKey.includes(freeKey);
    const f2 = freeKey.includes(k.famKey) || k.famKey.includes(freeKey);
    let sc = 0;
    if (f1 && f2) {
      sc = 0.99;
    } else {
      sc = score(freeKey, k.key);
    }
    if (!best || sc > best.score) best = { m: k.m, score: sc };
  }

  if (best && best.score >= 0.93) return { material: best.m, confidence: best.score, via: 'fuzzy-high' };
  if (best && best.score >= 0.80) return { material: best.m, confidence: best.score, via: 'fuzzy' };
  return null;
}
