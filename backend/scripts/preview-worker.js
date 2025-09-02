#!/usr/bin/env node
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env.local') });
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import dotenv from 'dotenv';

// load env from backend/.env.local if present BEFORE importing modules that read process.env
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env.local') });

import { db } from '../src/db.js';
import { LocalFsDriver } from '../src/fileService.js';
import { supabase } from '../lib/supabaseClient.js';
import * as filesModel from '../src/models/files.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENABLE = String(process.env.ENABLE_PREVIEW_WORKER || '').toLowerCase() === '1' || String(process.env.ENABLE_PREVIEW_WORKER || '').toLowerCase() === 'true';
if (!ENABLE) {
  console.log('[previews] ENABLE_PREVIEW_WORKER not set; exiting');
  process.exit(0);
}

// Support running worker from repo root or backend folder
const QUOTES_ROOT_CANDIDATES = [
  path.resolve(process.cwd(), 'backend', 'data', 'quotes'),
  path.resolve(process.cwd(), 'data', 'quotes')
];
const QUOTES_ROOT = QUOTES_ROOT_CANDIDATES.find(p => fsSync.existsSync(p)) || QUOTES_ROOT_CANDIDATES[0];
const BUCKET = process.env.SUPABASE_BUCKET_UPLOADS || 'blusa-uploads-prod';
const USE_SUPABASE = String(process.env.USE_SUPABASE || '').toLowerCase() === '1' || String(process.env.USE_SUPABASE || '').toLowerCase() === 'true';

const localDriver = new LocalFsDriver({ base: QUOTES_ROOT });
const supaClient = supabase || null;

async function rowsNeedingPreviews() {
  // Select file_versions that have no previews yet
  return db.prepare(`
    SELECT fv.id as version_id, fv.file_id, fv.object_key, fv.mime_type, fv.ext, fv.size_bytes
    FROM file_versions fv
    LEFT JOIN file_previews fp ON fp.file_version_id = fv.id
    WHERE fp.id IS NULL
    ORDER BY fv.created_at ASC
    LIMIT 50
  `).all();
}

function isRasterMime(mime) {
  if (!mime) return false;
  return mime.startsWith('image/') || mime === 'application/pdf';
}

async function ensureLocalPathForObjectKey(object_key) {
  // For local storage driver, object_key maps directly under QUOTES_ROOT (files served by /files)
  const p = path.join(QUOTES_ROOT, object_key);
  if (fsSync.existsSync(p)) return p;
  // Fallback: try to find the filename anywhere under QUOTES_ROOT (handles legacy prefixes)
  const filename = path.basename(object_key);
  // simple recursive search with limit to avoid scanning massive trees
  const maxDepth = 6;
  async function search(dir, depth) {
    if (depth > maxDepth) return null;
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return null; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isFile() && e.name === filename) return full;
    }
    for (const e of entries) {
      if (e.isDirectory()) {
        const found = await search(path.join(dir, e.name), depth + 1);
        if (found) return found;
      }
    }
    return null;
  }
  try {
    const found = await search(QUOTES_ROOT, 0);
    if (found) return found;
  } catch (e) {
    // ignore
  }
  return null;
}

async function generatePreview(inputBuffer, size) {
  // produce webp with width=size, preserve aspect ratio, no enlargement
  const img = sharp(inputBuffer, { limitInputPixels: false }).webp({ quality: 80 });
  const meta = await img.metadata();
  const resized = await img.resize({ width: size, withoutEnlargement: true }).toBuffer();
  const outMeta = await sharp(resized).metadata();
  return { buffer: resized, width: outMeta.width || null, height: outMeta.height || null, mime: 'image/webp' };
}

async function renderPdfFirstPage(buffer) {
  // Use sharp's pdf input support: it will render the first page automatically
  return buffer; // sharp can handle PDF directly when given the buffer
}

async function runOnce() {
  // Backfill: create file/file_versions rows for canonical attachments that lack a file_versions entry
  try {
    const atRows = db.prepare("SELECT * FROM attachments WHERE object_key LIKE 'customers/%' ORDER BY created_at ASC").all() || [];
    for (const a of atRows) {
      const exists = db.prepare('SELECT id FROM file_versions WHERE object_key = ? LIMIT 1').get(a.object_key);
      if (exists) continue;
      console.log('[previews] backfilling file_version for attachment', a.id, a.object_key);
      try {
        const fileId = filesModel.createFile({ customer_id: null, quote_id: a.parent_id, kind: 'drawing', title: a.object_key, created_by: a.uploaded_by || null });
        const fv = filesModel.addFileVersion({ file_id: fileId, object_key: a.object_key, mime_type: a.content_type || null, ext: path.extname(a.object_key || ''), size_bytes: a.size_bytes || null, sha256: a.sha256 || null });
        filesModel.linkFileToQuote({ quote_id: a.parent_id, file_id: fileId, role: a.label });
        console.log('[previews] backfilled file_version id=', fv.id);
      } catch (e) { console.warn('[previews] backfill failed for', a.object_key, e && e.message ? e.message : e); }
    }
  } catch (e) { console.warn('[previews] backfill stage failed', e && e.message ? e.message : e); }
  console.log('[previews] scanning for file_versions without previews...');
  const rows = await rowsNeedingPreviews();
  console.log('[previews] found', rows.length, 'candidates');
  for (const r of rows) {
    try {
      console.log('[previews] processing version', r.version_id, 'object_key=', r.object_key);
      // check idempotency: ensure no previews exist for this version (race-safe)
      const exists = db.prepare('SELECT COUNT(1) as cnt FROM file_previews WHERE file_version_id = ?').get(r.version_id);
      if (exists && exists.cnt > 0) { console.log('[previews] already has previews, skipping', r.version_id); continue; }

      // locate source object locally or via supabase
      let srcPath = await ensureLocalPathForObjectKey(r.object_key);
      let srcBuffer = null;
      if (srcPath) {
        srcBuffer = await fs.readFile(srcPath);
      } else if (supaClient) {
        // download from Supabase storage (temporary signed url fetch)
        try {
          const { data } = await supaClient.storage.from(BUCKET).createSignedUrl(r.object_key, 60);
          const signedUrl = data?.signedUrl;
          if (signedUrl) {
            const resp = await fetch(signedUrl);
            if (!resp.ok) throw new Error('fetch failed: ' + resp.status);
            srcBuffer = Buffer.from(await resp.arrayBuffer());
          }
        } catch (e) { console.warn('[previews] failed to fetch from supabase:', e.message || e); }
      }

      if (!srcBuffer) { console.warn('[previews] source not found locally or supabase for', r.object_key); continue; }

      let inputBuffer = srcBuffer;
      if (r.mime_type === 'application/pdf' || (r.ext || '').toLowerCase() === '.pdf') {
        inputBuffer = await renderPdfFirstPage(srcBuffer);
      }

      // For DXF or other unknowns, generate a simple placeholder (single-color image)
      if (!isRasterMime(r.mime_type)) {
        // placeholder: 1024x1024 gray PNG buffer
        const placeholder = await sharp({ create: { width: 1024, height: 1024, channels: 3, background: '#cccccc' } }).png().toBuffer();
        inputBuffer = placeholder;
      }

      // generate sizes
      const sizes = [256, 1024];
      const previewsToInsert = [];
      for (const size of sizes) {
        try {
          const { buffer: outBuf, width, height, mime } = await generatePreview(inputBuffer, size);
          // canonical preview object_key
          // canonical preview object_key: <dir>/previews/<size>.webp
          // use POSIX join to ensure forward slashes for storage keys
          const posixDir = r.object_key.split('/').slice(0, -1).join('/') || '';
          const preview_object_key = [posixDir, 'previews', `${size}.webp`].filter(Boolean).join('/');
          // idempotent: check if file_previews with same object_key exists
          const pExists = db.prepare('SELECT id FROM file_previews WHERE object_key = ? LIMIT 1').get(preview_object_key);
          if (pExists) { console.log('[previews] preview object already present, skipping', preview_object_key); continue; }

          // write locally under data/quotes/<object_key>
          const localFull = path.join(QUOTES_ROOT, preview_object_key);
          await fs.mkdir(path.dirname(localFull), { recursive: true });
          await fs.writeFile(localFull, outBuf);

          // if supabase enabled, upload preview
          if (supaClient) {
            try {
              await supaClient.storage.from(BUCKET).upload(preview_object_key, outBuf, { upsert: true, contentType: 'image/webp' });
            } catch (e) { console.warn('[previews] supabase upload preview failed:', e.message || e); }
          }

          previewsToInsert.push({ file_version_id: r.version_id, size_key: String(size), object_key: preview_object_key, mime_type: 'image/webp', width_px: width, height_px: height });
        } catch (e) { console.error('[previews] failed to generate size', size, e && e.message ? e.message : e); }
      }

      // insert preview rows in a transaction
      if (previewsToInsert.length) {
        const insert = db.prepare('INSERT INTO file_previews (file_version_id, size_key, object_key, mime_type, width_px, height_px, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\'))');
        const tx = db.transaction((items) => { for (const it of items) insert.run(it.file_version_id, it.size_key, it.object_key, it.mime_type, it.width_px, it.height_px); });
        try { tx(previewsToInsert); console.log('[previews] inserted', previewsToInsert.length, 'previews for version', r.version_id); } catch (e) { console.error('[previews] failed to insert previews rows:', e && e.message ? e.message : e); }
      }

    } catch (e) {
      console.error('[previews] processing failed for row', r && r.version_id, e && e.stack ? e.stack : e);
    }
  }
  console.log('[previews] run complete');
}

runOnce().catch(e => { console.error('[previews] fatal', e && e.stack ? e.stack : e); process.exit(1); });
