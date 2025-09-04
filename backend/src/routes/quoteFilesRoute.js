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

// read commonly-used envs for logging/diagnostics
const useSupabaseEnv = String(process.env.USE_SUPABASE || '').toLowerCase() === '1' || String(process.env.USE_SUPABASE || '').toLowerCase() === 'true';
const supabaseBucket = process.env.SUPABASE_BUCKET_UPLOADS || 'blusa-uploads-prod';

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
// Create service lazily so envs (dotenv) can load before we pick a driver
const getFileService = () => fileServiceFactory.createFileService();

/* ----------------------------- list all files ------------------------------ */
// GET /api/quotes/:quoteNo/files   (returns ARRAY for backward compat)
// Prefer DB-driven attachments (Supabase or sqlite); fallback to filesystem
router.get('/:quoteNo/files', async (req, res) => {
  const quoteNo = String(req.params.quoteNo || '');
  const subdir  = String(req.query.subdir || '').trim();          // e.g. drawings
  const customer = String(req.query.customer || '').trim();       // e.g. Atas

  console.log('[list files] start', { quoteNo, subdir, customer });

  try {
    // Prefer DB if available (sqlite attachments table). Fallback to driver.list()
    if (req.db?.all) {
      const rows = await req.db.all(
        `SELECT id, label, object_key, content_type, size_bytes, subdir, created_at
           FROM attachments
          WHERE parent_type='quote' AND parent_id=? AND (?='' OR subdir=?) AND (?='' OR customer_name=?)
          ORDER BY created_at DESC`,
        [quoteNo, subdir, subdir, customer, customer]
      );
      const svc = getFileService();
      const files = [];
      for (const r of rows) {
        const url = await svc.signedUrl(r.object_key, 900).catch(() => null);
        files.push({ id: r.id, label: r.label, objectKey: r.object_key, subdir: r.subdir, contentType: r.content_type, sizeBytes: r.size_bytes, createdAt: r.created_at, signedUrl: url });
      }
      console.log('[list files] ok', { count: files.length });
      return res.json({ ok: true, files });
    }

    // Fallback: ask the storage driver (LocalFs or Supabase) to list
    const svc = getFileService();
    const files = await svc.list({ parent_type: 'quote', parent_id: quoteNo, subdir, customer_name: customer });
    return res.json({ ok: true, files });
  } catch (err) {
    console.error('[list files] error', {
      quoteNo, subdir, customer,
      message: err?.message, code: err?.code, stack: err?.stack
    });
    return res.status(500).json({ ok: false, error: err?.message || 'List failed' });
  }
});

/* --------------------------------- upload ---------------------------------- */
// NEW preferred: POST /api/quotes/:quoteNo/upload?subdir=uploads|drawings|vendors|notes
// field name: files (multiple OK)
router.post('/:quoteNo/upload', upload.array('files'), async (req, res) => {
  try {
    const { quoteNo } = req.params;
    const subdir = String(req.query.subdir || 'uploads');
  // prefer customer passed by client (req.body or ?customer) else fall back to DB lookup
  const customerNameFromReq = (req.body?.customerName || req.query?.customer || req.query?.customerName || '').toString().trim();
  const customerName = customerNameFromReq || getCustomerByQuoteNo(quoteNo);
  console.log('[upload] start', { quoteNo, subdir, count: (req.files || []).length, useSupabase: useSupabaseEnv, bucket: supabaseBucket, customerNameSource: customerNameFromReq ? 'request' : 'db' });
  if (!customerName) return res.status(404).json({ ok: false, error: `Quote ${quoteNo} not found` });


    const svc = getFileService();
    const saved = [];
    for (const f of req.files || []) {
      const buf = f.buffer || f.file?.buffer || f.data;
      if (!buf) continue;
      const meta = await svc.save({ parent_type: 'quote', parent_id: quoteNo, customer_name: customerName, subdir, originalname: f.originalname, buffer: buf, content_type: f.mimetype, uploaded_by: req.user?.id || null });
      // Only insert into sqlite when req.db is present
      if (req.db?.run) {
        try {
          await req.db.run(
            `INSERT INTO attachments
             (parent_type, parent_id, subdir, customer_name, label, object_key, content_type, size_bytes, uploaded_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            ['quote', quoteNo, subdir, customerName, f.originalname, meta.object_key, f.mimetype || '', f.size || f.buffer?.length || 0, req.user?.id || null]
          );
        } catch (e) {
          console.warn('[upload] attachments insert failed', e && e.message ? e.message : e);
        }
      }
      const url = await svc.signedUrl(meta.object_key, 900).catch(() => null);
      saved.push({ label: f.originalname, objectKey: meta.object_key, signedUrl: url });
    }
    return res.json({ ok: true, attachments: saved });

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
  } catch (err) {
    console.error('[upload] failed', {
      message: err?.message,
      code: err?.code,
      name: err?.name,
      stack: err?.stack,
    });
    return res.status(500).json({ ok: false, error: err?.message || 'Upload failed', code: err?.code || null });
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
