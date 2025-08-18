// backend/src/utils/paths.js
import fs from 'fs';
import path from 'path';

export const DATA_DIR = path.join(process.cwd(), 'data');
export const UPLOADS_ROOT = path.join(DATA_DIR, 'uploads');
export const QUOTES_ROOT = path.join(UPLOADS_ROOT, 'quotes');

export function ensureDirSync(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

export function quoteFolder(quoteNo) {
  const safe = String(quoteNo).replace(/[^a-zA-Z0-9._-]/g, '_');
  return path.join(QUOTES_ROOT, safe);
}

// Safe ensure on demand
export function ensureQuoteFolder(quoteNo) {
  ensureDirSync(UPLOADS_ROOT);
  ensureDirSync(QUOTES_ROOT);
  const q = quoteFolder(quoteNo);
  ensureDirSync(q);
  return q;
}
