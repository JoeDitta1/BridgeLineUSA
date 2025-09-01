// backend/src/routes/quoteFilesRoute.js
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import mime from 'mime-types';
import * as dbModule from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import fileServiceFactory from '../../src/fileService.js';

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

    const attachments = [];
    for (const f of (req.files || [])) {
      const meta = await fileService.save({
        parent_type: 'quote',
        parent_id: quoteNo,
        customer_name: customerName,
        subdir,
        originalname: f.originalname,
        buffer: f.buffer,
        content_type: f.mimetype,
        uploaded_by: req.user?.id || null
      });

      // if local driver, insert a row in sqlite attachments table; supabase driver already inserted
      if (meta.storage === 'local') {
        const stmt = db.prepare(`INSERT INTO attachments (id, parent_type, parent_id, label, object_key, content_type, size_bytes, sha256, uploaded_by, created_at, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 1)`);
        const id = uuidv4();
        stmt.run(id, 'quote', quoteNo, subdir, meta.object_key, meta.content_type, meta.size_bytes, meta.sha256, req.user?.id || null);
        attachments.push({ id, ...meta });
      } else {
        attachments.push(meta);
      }
    }

  // Return updated quote + attachments list for client to re-render folder tree
  const quote = db.prepare('SELECT * FROM quotes WHERE quote_no = ?').get(quoteNo);
  // expose unique labels for folder dropdowns
  const labels = [...new Set((attachments || []).map(a => a.label).filter(Boolean))];
  // ensure each attachment includes a usable absolute url (if not present)
  const baseForAttachments = process.env.EXTERNAL_API_BASE || `${req.protocol}://${req.get('host')}`;
  const attachmentsWithUrls = (attachments || []).map(a => {
    const filename = (a.object_key || a.filename || '').split('/').slice(-1)[0] || a.filename || a.name || '';
    const rel = `/files/${encodeURIComponent(safeFolderName(customerName))}/${encodeURIComponent(safeFolderName(quoteNo))}/${encodeURIComponent(a.label || '')}/${encodeURIComponent(filename)}`;
    const finalUrl = (a && typeof a.url === 'string' && a.url.startsWith('http')) ? a.url : new URL(rel, baseForAttachments).href;
    return {
      ...a,
      name: filename,
      url: finalUrl
    };
  });
  return res.json({ ok: true, quote, attachments: attachmentsWithUrls, labels });
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
