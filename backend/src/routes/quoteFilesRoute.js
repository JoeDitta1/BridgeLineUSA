// backend/src/routes/quoteFilesRoute.js
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import mime from 'mime-types';
import crypto from 'crypto';
import * as dbModule from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import fileServiceFactory from '../../src/fileService.js';
import { LocalFsDriver, SupabaseStorageDriver } from '../../src/fileService.js';
import * as filesModel from '../models/files.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;
const router = express.Router();

/* -------------------------------- helpers ---------------------------------- */
const safeFolderName = (input) => String(input).replace(/[\\/:*?"<>|]/g, '_').trim();
const getQuotesBaseDir = () => path.resolve(process.cwd(), 'data', 'quotes');

/** Look up customer_name by quote_no in DB */
function getCustomerByQuoteNo(quoteNo) {
  const row = db.prepare?.('SELECT customer_name FROM quotes WHERE quote_no = ?')?.get?.(quoteNo);
  return row?.customer_name || null;
}

/** data/quotes/<CustomerName>/<QuoteNo> */
const getQuoteDir = (customerName, quoteNo) =>
  path.join(getQuotesBaseDir(), safeFolderName(customerName), safeFolderName(quoteNo));

// helper: sha256 of a Buffer
function sha256Buf(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// returns existing {file_uuid, object_key} for given sha under a quote, or null
function findExistingBySha(quoteId, sha) {
  // Search canonical attachments first (attachments.parent_id stores the quote_no string)
  const row = db.prepare(`SELECT * FROM attachments WHERE parent_type = ? AND parent_id = ? AND sha256 = ? AND object_key LIKE ? ORDER BY created_at DESC LIMIT 1`).get('quote', quoteId, sha, 'customers/%');
  return row || null;
}

/** Ensure standard subfolders & return { dir, subdirs } */
async function ensureQuoteTree(customerName, quoteNo) {
  const dir = getQuoteDir(customerName, quoteNo);
  const subdirs = ['uploads', 'drawings', 'vendors', 'notes', 'exports'];
  await fsp.mkdir(dir, { recursive: true });
  for (const s of subdirs) await fsp.mkdir(path.join(dir, s), { recursive: true });
  return { dir, subdirs };
}

/** Find first file named `filename` under any standard subdir */
async function findFileAnySubdir(customerName, quoteNo, filename) {
  const { dir, subdirs } = await ensureQuoteTree(customerName, quoteNo);
  for (const s of subdirs) {
    const p = path.join(dir, s, filename);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      return { fullPath: p, subdir: s };
    }
  }
  return null;
}

/* ------------------------------- multer setup ------------------------------ */
// Use memory storage and hand buffers to the fileService (local or supabase)
const upload = multer({ storage: multer.memoryStorage() });
const fileService = fileServiceFactory.createFileService();

/* ----------------------------- list all files ------------------------------ */
// GET /api/quotes/:quoteNo/files   (returns ARRAY for backward compat)
// Prefer DB-driven attachments (Supabase or sqlite); fallback to filesystem
router.get('/:quoteNo/files', async (req, res) => {
  try {
    const { quoteNo } = req.params;
    const customerName = getCustomerByQuoteNo(quoteNo);
    if (!customerName) return res.status(404).json([]);

    const USE_SUPABASE = String(process.env.USE_SUPABASE || '').toLowerCase() === '1' ||
      String(process.env.USE_SUPABASE || '').toLowerCase() === 'true';

    // If supabase is enabled, query attachments table and build signed URLs
    if (USE_SUPABASE && process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY)) {
      const { createClient } = await import('@supabase/supabase-js');
      const SUPA_URL = process.env.SUPABASE_URL;
      const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;
      const supabase = createClient(SUPA_URL, SUPA_KEY);
      const { data, error } = await supabase.from('attachments').select('*').eq('parent_type', 'quote').eq('parent_id', quoteNo).order('created_at', { ascending: false });
      if (error) throw error;
      const out = [];
  // If EXTERNAL_API_BASE is explicitly set, use its absolute base for URLs.
  // Otherwise return relative paths (so the frontend dev proxy or host can
  // resolve them correctly). This avoids mixed-host/mixed-protocol issues.
  const baseForUrls = process.env.EXTERNAL_API_BASE || null;
      for (const r of (data || [])) {
        let signed = { url: null };
        try {
          // use fileService to create signed url
          signed = await fileService.signedUrl(r.object_key, 60);
        } catch (e) {}
        const filename = r.object_key.split('/').slice(-1)[0];
  const rel = `/files/${encodeURIComponent(safeFolderName(customerName))}/${encodeURIComponent(safeFolderName(quoteNo))}/${encodeURIComponent(r.label || '')}/${encodeURIComponent(filename)}`;
  const finalUrl = (signed && typeof signed.url === 'string' && signed.url.startsWith('http')) ? signed.url : (baseForUrls ? new URL(rel, baseForUrls).href : rel);
        out.push({
          name: filename,
          subdir: r.label || '',
          size: r.size_bytes || null,
          modifiedAt: r.created_at || null,
          mime: r.content_type || 'application/octet-stream',
          url: finalUrl
        });
      }
      return res.json(out);
    }

    // If sqlite attachments exist, return them
    try {
      const rows = db.prepare('SELECT * FROM attachments WHERE parent_type = ? AND parent_id = ? ORDER BY created_at DESC').all('quote', quoteNo) || [];
      if (rows.length > 0) {
        const out = [];
        for (const r of rows) {
          const signed = await fileService.signedUrl(r.object_key, 60).catch(() => ({ url: null }));
          const filename = (r.object_key || '').split('/').slice(-1)[0];
          const rel = `/files/${encodeURIComponent(safeFolderName(customerName))}/${encodeURIComponent(safeFolderName(quoteNo))}/${encodeURIComponent(r.label || '')}/${encodeURIComponent(filename)}`;
          const baseForUrls2 = process.env.EXTERNAL_API_BASE || null;
          const finalUrl2 = (signed && typeof signed.url === 'string' && signed.url.startsWith('http')) ? signed.url : (baseForUrls2 ? new URL(rel, baseForUrls2).href : rel);
          out.push({
            name: filename,
            subdir: r.label || '',
            size: r.size_bytes || null,
            modifiedAt: r.created_at || null,
            mime: r.content_type || 'application/octet-stream',
            url: finalUrl2
          });
        }
        return res.json(out);
      }
    } catch (e) {
      // proceed to filesystem fallback
    }

    // Filesystem fallback (legacy)
    const { dir, subdirs } = await ensureQuoteTree(customerName, quoteNo);
    const files = [];
  const baseForFiles = process.env.EXTERNAL_API_BASE || null;
    for (const s of subdirs) {
      const p = path.join(dir, s);
      if (!fs.existsSync(p)) continue;
      const names = await fsp.readdir(p);
      for (const name of names) {
        const full = path.join(p, name);
        const st = await fsp.stat(full);
        if (!st.isFile()) continue;
        const rel = `/files/${encodeURIComponent(safeFolderName(customerName))}/${encodeURIComponent(safeFolderName(quoteNo))}/${encodeURIComponent(s)}/${encodeURIComponent(name)}`;
        files.push({
          name,
          subdir: s,
          size: st.size,
          modifiedAt: st.mtime,
          mime: mime.lookup(name) || 'application/octet-stream',
          // Return relative path unless EXTERNAL_API_BASE is configured.
          url: baseForFiles ? new URL(rel, baseForFiles).href : rel
        });
      }
    }
    files.sort((a, b) => b.modifiedAt - a.modifiedAt);
    res.json(files);
  } catch (e) {
    console.error('[list files] failed:', e && e.message ? e.message : e);
    res.status(500).json([]);
  }
});

/* --------------------------------- upload ---------------------------------- */
// NEW preferred: POST /api/quotes/:quoteNo/upload?subdir=uploads|drawings|vendors|notes
// field name: files (multiple OK)
router.post('/:quoteNo/upload', upload.array('files'), async (req, res) => {
  try {
    const { quoteNo } = req.params;
    const subdir = String(req.query.subdir || 'uploads');
    const customerName = getCustomerByQuoteNo(quoteNo);
    if (!customerName) return res.status(404).json({ ok: false, error: `Quote ${quoteNo} not found` });

    const USE_SUPABASE = String(process.env.USE_SUPABASE || '').toLowerCase() === '1' || String(process.env.USE_SUPABASE || '').toLowerCase() === 'true';

    const localDriver = new LocalFsDriver({});
    let supaDriver = null;
    if (USE_SUPABASE) {
      try {
        supaDriver = new SupabaseStorageDriver({ bucket: process.env.SUPABASE_BUCKET_UPLOADS || 'blusa-uploads-prod' });
      } catch (e) {
        console.warn('[upload] supabase driver init failed:', e && e.message ? e.message : e);
        supaDriver = null;
      }
    }

    const attachments = [];
    const warnings = [];


    for (const f of (req.files || [])) {
      const buf = f.buffer || f.file?.buffer || f.data;
      if (!buf) {
        warnings.push(`missing buffer for ${f.originalname || f.filename}`);
        continue;
      }

      const sha = sha256Buf(buf);

      // fast path: if a file_version with this sha already exists for this quote, reuse its file_uuid/object_key
  const existing = findExistingBySha(quoteNo, sha);
      let fileUuid = null;
      if (existing && existing.object_key) {
        // object_key: customers/<customer>/quotes/<quoteNo>/<subdir>/<file_uuid>/original/<filename>
        const parts = existing.object_key.split('/');
        // expect parts[5] to be file_uuid when canonical
        fileUuid = parts[5] || null;
      }

      // build canonical keys (reuse fileUuid if found; else create new UUID)
      if (!fileUuid) fileUuid = uuidv4();
      const canonicalBase = `customers/${customerName}/quotes/${quoteNo}/${subdir}/${fileUuid}`;
      const canonicalOriginalKey = `${canonicalBase}/original/${f.originalname}`;

      // If an existing canonical object (for this quote + sha) exists, reuse it and skip driver saves
      let skipDriverSave = false;
      let chosenObjectKey = null;
      let supaMeta = null;
      let localMeta = null;
      if (existing && existing.object_key) {
        chosenObjectKey = existing.object_key;
        skipDriverSave = true;
      } else {
        // Save local copy (always) and await result
        localMeta = await localDriver.save({ parent_type: 'quote', parent_id: quoteNo, customer_name: customerName, subdir, originalname: f.originalname, buffer: buf, content_type: f.mimetype, uploaded_by: req.user?.id || null });

        // Attempt supabase save if enabled
        if (USE_SUPABASE && supaDriver) {
          try {
            supaMeta = await supaDriver.save({ parent_type: 'quote', parent_id: quoteNo, customer_name: customerName, subdir, originalname: f.originalname, buffer: buf, content_type: f.mimetype, uploaded_by: req.user?.id || null });
          } catch (e) {
            console.warn('[upload] supaDriver.save failed:', e && e.message ? e.message : e);
            supaMeta = null;
          }
        }

        chosenObjectKey = supaMeta?.object_key || localMeta?.object_key;
      }
      if (!chosenObjectKey) {
        console.error('[upload] no object_key returned by drivers', { localMeta, supaMeta });
        throw new Error('No object_key available after driver saves');
      }

      // DB transaction to ensure atomicity
      db.exec('BEGIN');
      try {
        // upsert files row by (quote_id, file_uuid) — we store file_uuid in the files.id field for simplicity
        // Ensure files.id is deterministic per fileUuid so we can reuse across versions
        const fileId = fileUuid; // reuse the uuid as the files.id
        let fileRow = db.prepare('SELECT id FROM files WHERE id = ?').get(fileId);
        if (!fileRow) {
          db.prepare('INSERT INTO files (id, customer_id, quote_id, kind, title, created_by) VALUES (?, ?, ?, ?, ?, ?)')
            .run(fileId, null, quoteNo, 'drawing', f.originalname, req.user?.id || null);
          fileRow = db.prepare('SELECT id FROM files WHERE id = ?').get(fileId);
        }

        // insert a new version only if this sha not already present for that file
        const vExists = db.prepare('SELECT id FROM file_versions WHERE file_id = ? AND sha256 = ?').get(fileRow.id, sha);
        if (!vExists) {
          db.prepare(`INSERT INTO file_versions (file_id, object_key, mime_type, ext, size_bytes, sha256, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`)
            .run(fileRow.id, chosenObjectKey, f.mimetype, path.extname(f.originalname || ''), Buffer.byteLength(buf), sha);
        }

        // ensure attachments row exists for canonical object (insert if missing)
        const attExists = db.prepare('SELECT id FROM attachments WHERE parent_type = ? AND parent_id = ? AND object_key = ? LIMIT 1').get('quote', quoteNo, chosenObjectKey);
        if (!attExists) {
          db.prepare('INSERT INTO attachments (id, parent_type, parent_id, label, object_key, content_type, size_bytes, sha256, uploaded_by, created_at, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(\'now\'), 1)')
            .run(uuidv4(), 'quote', quoteNo, subdir, chosenObjectKey, supaMeta?.content_type || localMeta?.content_type || f.mimetype, supaMeta?.size_bytes || localMeta?.size_bytes || Buffer.byteLength(buf), sha, req.user?.id || null);
        }

        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        // cleanup supabase orphan if we wrote it and DB failed
        if (supaMeta?.object_key) {
          try { await supaDriver.remove?.(supaMeta.object_key); } catch (_) {}
        }
        throw e;
      }

      // push result for response
      attachments.push({ filename: f.originalname, sha256: sha, object_key: chosenObjectKey, local_only: !supaMeta, label: subdir });
      if (!supaMeta) warnings.push('Supabase upload unavailable or disabled for some files');
    }

    // Return updated quote + attachments list for client to re-render folder tree
    const quote = db.prepare('SELECT * FROM quotes WHERE quote_no = ?').get(quoteNo);
    // expose unique labels for folder dropdowns
    const labels = [...new Set((attachments || []).map(a => a.label).filter(Boolean))];

    // Build attachmentsWithUrls by querying sqlite attachments and creating signed urls where possible
    const baseForAttachments = process.env.EXTERNAL_API_BASE || `${req.protocol}://${req.get('host')}`;
    const sqliteRows = db.prepare('SELECT * FROM attachments WHERE parent_type = ? AND parent_id = ? ORDER BY created_at DESC').all('quote', quoteNo) || [];
    const attachmentsWithUrls = [];
    for (const r of sqliteRows) {
      const filename = (r.object_key || '').split('/').slice(-1)[0] || '';
      // try signed url via supabase if configured
      let signed = null;
      try { signed = await (supaDriver ? supaDriver.signedUrl(r.object_key, 60) : fileService.signedUrl(r.object_key, 60)); } catch (e) { signed = null; }
      const rel = `/files/${encodeURIComponent(safeFolderName(customerName))}/${encodeURIComponent(safeFolderName(quoteNo))}/${encodeURIComponent(r.label || '')}/${encodeURIComponent(filename)}`;
      const finalUrl = (signed && signed.url && signed.url.startsWith('http')) ? signed.url : new URL(rel, baseForAttachments).href;
      attachmentsWithUrls.push({ ...r, name: filename, url: finalUrl });
    }

    // Also include any supabase-only attachments we created but may not be in sqliteRows
    // (the supaDriver.save inserts into supabase attachments table, but our sqlite may not have row)
    // For simplicity, attachmentsWithUrls is primarily driven by sqliteRows; add warnings if present
    const result = { ok: true, quote, attachments: attachmentsWithUrls, labels, warnings };
    return res.json(result);
  } catch (e) {
    console.error('[upload] failed:', e && e.message ? e.message : e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* ----------------------- legacy upload (kept for compat) ------------------- */
// POST /api/quotes/:quoteNo/files   (uploads to uploads/ subdir)
router.post('/:quoteNo/files', (req, res, next) => {
  // force subdir=uploads for legacy route
  req.query.subdir = 'uploads';
  next();
}, upload.array('files'), (req, res) => {
  try {
    const { quoteNo } = req.params;
    const customerName = getCustomerByQuoteNo(quoteNo);
    if (!customerName) return res.status(404).json({ uploaded: [] });

    const baseForLegacy = process.env.EXTERNAL_API_BASE || `${req.protocol}://${req.get('host')}`;
    res.json({
      uploaded: (req.files || []).map(f => {
        const rel = `/files/${encodeURIComponent(safeFolderName(customerName))}/${encodeURIComponent(safeFolderName(quoteNo))}/uploads/${encodeURIComponent(f.filename)}`;
        return {
          name: f.originalname,
          size: f.size,
          storedAs: f.filename,
          url: new URL(rel, baseForLegacy).href
        };
      })
    });
  } catch {
    res.json({ uploaded: [] });
  }
});

/* --------------------------- download (legacy) ----------------------------- */
// GET /api/quotes/:quoteNo/files/:filename   (search all subdirs)
router.get('/:quoteNo/files/:filename', async (req, res) => {
  try {
    const { quoteNo, filename } = req.params;
    const customerName = getCustomerByQuoteNo(quoteNo);
    if (!customerName) return res.status(404).end();

    const found = await findFileAnySubdir(customerName, quoteNo, filename);
    if (!found) return res.status(404).end();
    res.download(found.fullPath, filename);
  } catch {
    res.status(500).end();
  }
});

/* --------------------------- delete (legacy) ------------------------------- */
// DELETE /api/quotes/:quoteNo/files/:filename   (search all subdirs)
router.delete('/:quoteNo/files/:filename', async (req, res) => {
  try {
    const { quoteNo, filename } = req.params;
    const customerName = getCustomerByQuoteNo(quoteNo);
    if (!customerName) return res.status(404).json({ ok: false });

    const found = await findFileAnySubdir(customerName, quoteNo, filename);
    if (!found) return res.status(404).json({ ok: false });
    await fsp.unlink(found.fullPath);
    res.json({ ok: true, subdir: found.subdir });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* --------------------- subdir-aware download/delete ------------------------ */
// GET /api/quotes/:quoteNo/files/:subdir/:filename
router.get('/:quoteNo/files/:subdir/:filename', async (req, res) => {
  try {
    const { quoteNo, subdir, filename } = req.params;
    const customerName = getCustomerByQuoteNo(quoteNo);
    if (!customerName) return res.status(404).end();

    const p = path.join(getQuoteDir(customerName, quoteNo), safeFolderName(subdir), filename);
    if (!fs.existsSync(p)) return res.status(404).end();
    res.download(p, filename);
  } catch {
    res.status(500).end();
  }
});

// DELETE /api/quotes/:quoteNo/files/:subdir/:filename
router.delete('/:quoteNo/files/:subdir/:filename', async (req, res) => {
  try {
    const { quoteNo, subdir, filename } = req.params;
    const customerName = getCustomerByQuoteNo(quoteNo);
    if (!customerName) return res.status(404).json({ ok: false });

    const p = path.join(getQuoteDir(customerName, quoteNo), safeFolderName(subdir), filename);
    if (!fs.existsSync(p)) return res.status(404).json({ ok: false });
    await fsp.unlink(p);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

export default router;
