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
// Now scans uploads/drawings/vendors/notes/exports
router.get('/:quoteNo/files', async (req, res) => {
  try {
    const { quoteNo } = req.params;
    const customerName = getCustomerByQuoteNo(quoteNo);
    if (!customerName) return res.status(404).json([]);

    const { dir, subdirs } = await ensureQuoteTree(customerName, quoteNo);
    const rows = [];

    for (const s of subdirs) {
      const p = path.join(dir, s);
      if (!fs.existsSync(p)) continue;
      const names = await fsp.readdir(p);
      for (const name of names) {
        const full = path.join(p, name);
        const st = await fsp.stat(full);
        if (!st.isFile()) continue;
        rows.push({
          name,
          subdir: s,
          size: st.size,
          modifiedAt: st.mtime,
          mime: mime.lookup(name) || 'application/octet-stream',
          url: `/files/${encodeURIComponent(safeFolderName(customerName))}/${encodeURIComponent(safeFolderName(quoteNo))}/${encodeURIComponent(s)}/${encodeURIComponent(name)}`
        });
      }
    }

    rows.sort((a, b) => b.modifiedAt - a.modifiedAt);
    res.json(rows);
  } catch (e) {
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
    res.json({ ok: true, quote, attachments });
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

    res.json({
      uploaded: (req.files || []).map(f => ({
        name: f.originalname,
        size: f.size,
        storedAs: f.filename,
        url: `/files/${encodeURIComponent(safeFolderName(customerName))}/${encodeURIComponent(safeFolderName(quoteNo))}/uploads/${encodeURIComponent(f.filename)}`
      }))
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
