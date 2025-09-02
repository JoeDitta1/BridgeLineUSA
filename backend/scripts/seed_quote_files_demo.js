import crypto from 'crypto';
import http from 'http';
import { db } from '../src/db.js';

// Demo seed + test for GET /api/files/quote/:quoteNo
// Adjust QUOTE_NO to a quote_no present in your DB (quotes.quote_no)
const QUOTE_NO = 'SCM-Q-0001';
const FILE_ID = crypto.randomUUID();

// Keys should match objects you uploaded to Supabase (optional)
const ORIGINAL_KEY = 'customers/ACME/quotes/SCM-Q-0001/drawings/12345678/original/assy.pdf';
const PREVIEW_256_KEY = 'customers/ACME/quotes/SCM-Q-0001/drawings/12345678/previews/256.webp';

function upsertDemo() {
  // Resolve numeric quote id from quote_no
  const q = db.prepare('SELECT id, quote_no FROM quotes WHERE quote_no = ?').get(QUOTE_NO);
  if (!q) {
    console.error('Quote not found. Create a quote with quote_no =', QUOTE_NO, 'or change QUOTE_NO in this script.');
    process.exit(1);
  }
  const quoteId = q.id;

  // Insert file record (id is text)
  db.prepare(`
    INSERT OR IGNORE INTO files (id, quote_id, kind, title, created_at)
    VALUES (?, ?, 'drawing', 'Demo Assembly Dwg', datetime('now'))
  `).run(FILE_ID, quoteId);

  // Insert file_version (let sqlite assign the integer id)
  const info = db.prepare(`
    INSERT INTO file_versions (file_id, object_key, mime_type, ext, size_bytes, sha256, created_at)
    VALUES (?, ?, 'application/pdf', 'pdf', 123456, 'deadbeef', datetime('now'))
  `).run(FILE_ID, ORIGINAL_KEY);

  const versionId = info.lastInsertRowid;

  // Insert preview row pointing at the version
  db.prepare(`
    INSERT OR IGNORE INTO file_previews (file_version_id, size_key, object_key, mime_type, width_px, height_px, created_at)
    VALUES (?, '256', ?, 'image/webp', 256, 181, datetime('now'))
  `).run(versionId, PREVIEW_256_KEY);

  // Link file to quote
  db.prepare(`
    INSERT OR IGNORE INTO quote_files (quote_id, file_id, role, created_at)
    VALUES (?, ?, 'primary_drawing', datetime('now'))
  `).run(quoteId, FILE_ID);

  console.log('Seeded demo file rows for quote id:', quoteId, 'file_id:', FILE_ID, 'version_id:', versionId);
  return { quoteId, fileId: FILE_ID, versionId };
}

function callEndpoint(quoteNo) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: 'localhost', port: 4000, path: `/api/files/quote/${encodeURIComponent(quoteNo)}`, method: 'GET' },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            console.log('\n=== /api/files/quote response ===\n', JSON.stringify(json, null, 2));
            resolve(json);
          } catch (e) {
            console.error('Failed to parse response:', data);
            reject(e);
          }
        });
      }
    );
    req.on('error', (err) => { console.error('Request error:', err); reject(err); });
    req.end();
  });
}

(async function main(){
  try {
    const seeded = upsertDemo();
    await new Promise(r => setTimeout(r, 200)); // small delay
    await callEndpoint(QUOTE_NO);
    console.log('\nDone.');
  } catch (e) {
    console.error('Seed/test failed:', e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();
