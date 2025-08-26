// src/routes/quotesRoute.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { fileURLToPath } from 'url';
import * as dbModule from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure DB export compatibility
const db = dbModule.default ?? dbModule.db ?? dbModule;

const router = express.Router();

/* --------------------------------- Paths ---------------------------------- */
/**
 * Resolve the quote vault root. We support either QUOTE_VAULT_ROOT or QUOTE_ROOT.
 * Relative paths are resolved against the backend folder so Codespaces/Linux works.
 */
const resolveFromBackend = (p) =>
  path.isAbsolute(p) ? p : path.resolve(__dirname, '..', p);

// default to ./data/quotes inside backend if nothing set
const VAULT_ROOT = resolveFromBackend(
  process.env.QUOTE_VAULT_ROOT || process.env.QUOTE_ROOT || './data/quotes'
);

/* ----------------------------- Helper functions ---------------------------- */
// Accepts YYYY-MM-DD or MM/DD/YYYY; outputs YYYY-MM-DD
function toISO(d) {
  if (!d) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d);
  if (m) return `${m[3]}-${m[1]}-${m[2]}`;
  const dt = new Date(d);
  if (!isNaN(dt)) return dt.toISOString().slice(0, 10);
  return null;
}

// File/dir helpers
const slug = (s = '') =>
  String(s)
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

async function ensureDir(p) {
  await fsPromises.mkdir(p, { recursive: true });
}

async function listDirs(p) {
  try {
    const entries = await fsPromises.readdir(p, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }
}

// Pull next quote number from settings and increment sequence
function getNextQuoteNo() {
  const s = db
    .prepare(
      'SELECT org_prefix, system_abbr, quote_series, quote_pad, next_quote_seq FROM settings WHERE id=1'
    )
    .get();
  if (!s) throw new Error('Settings row missing (id=1).');

  const seq = Number(s.next_quote_seq) || 1;
  const padded = String(seq).padStart(Number(s.quote_pad) || 4, '0');
  const parts = [s.org_prefix, s.system_abbr, `${s.quote_series}${padded}`].filter(Boolean);
  const quoteNo = parts.join('-');

  db.prepare('UPDATE settings SET next_quote_seq = ? WHERE id=1').run(seq + 1);
  return quoteNo;
}

/**
 * Create customer + quote folder tree with automatic revisioning.
 * Returns { customerDir, quoteDir, folderName, revision }.
 */
async function createCustomerQuoteFolders({ customerName, quoteNo, description }) {
  const customerSafe = slug(customerName) || 'unknown';
  const baseName = `${quoteNo}-${slug(description || '')}`.replace(/-$/, '');
  const customerDir = path.join(VAULT_ROOT, customerSafe);
  await ensureDir(customerDir);

  // determine revision by existing folder names
  const dirs = await listDirs(customerDir);
  const matches = dirs.filter((d) => d === baseName || d.startsWith(`${baseName}-rev-`));

  let rev = 1;
  for (const d of matches) {
    const m = d.match(/-rev-(\d+)$/i);
    if (m) rev = Math.max(rev, Number(m[1]) + 1);
    else rev = Math.max(rev, 2);
  }

  const folderName = rev > 1 ? `${baseName}-rev-${rev}` : baseName;
  const quoteDir = path.join(customerDir, folderName);
  await ensureDir(quoteDir);

  // Desired subfolders
  const subfolders = [
    'Quote Form',
    'Vendor Quotes',
    'Drawings',
    'Customer Info',
    'Related Files',
  ];
  await Promise.all(subfolders.map((sf) => ensureDir(path.join(quoteDir, sf))));

  return { customerDir, quoteDir, folderName, revision: rev };
}

/**
 * Soft-archive a quote folder by moving it under _archived/.
 */
async function archiveCustomerQuoteFolder(customerName, folderName) {
  const customerSafe = slug(customerName) || 'unknown';
  const from = path.join(VAULT_ROOT, customerSafe, folderName);
  const archivedRoot = path.join(VAULT_ROOT, customerSafe, '_archived');
  await ensureDir(archivedRoot);
  const to = path.join(archivedRoot, folderName);
  await fsPromises.rename(from, to);
  return { archivedPath: to };
}

/* ------------------------------ Routes: GET all ---------------------------- */
router.get('/', (req, res) => {
  try {
    const rows = db
      .prepare(
        `
      SELECT id, quote_no, customer_name, description, requested_by, estimator, date,
             status, sales_order_no, rev, created_at
      FROM quotes
      ORDER BY date DESC, id DESC
    `
      )
      .all();
    res.json({ ok: true, quotes: rows });
  } catch (err) {
    console.error('Error fetching quotes:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch quotes' });
  }
});

/* ----------------------------- Route: GET by ID ---------------------------- */
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ ok: false, error: 'Quote not found' });
    res.json({ ok: true, quote: row });
  } catch (err) {
    console.error('Error fetching quote:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch quote' });
  }
});

/* ----------------------------- Route: CREATE ------------------------------- */
router.post('/', async (req, res) => {
  try {
    const b = req.body || {};
    const payload = {
      quote_no: (b.quote_no && String(b.quote_no).trim()) || null,
      customer_name: b.customer_name ? String(b.customer_name).trim() : null,
      description: b.description ? String(b.description).trim() : null,
      requested_by: b.requested_by ? String(b.requested_by).trim() : null,
      estimator: b.estimator ? String(b.estimator).trim() : null,
      date: toISO(b.date) || new Date().toISOString().slice(0, 10),
      status: b.status ? String(b.status).trim() : 'Draft',
      sales_order_no: b.sales_order_no ? String(b.sales_order_no).trim() : null,
      rev: Number.isFinite(+b.rev) ? +b.rev : 0,
    };

    if (!payload.customer_name) {
      return res.status(400).json({ ok: false, error: 'customer_name required' });
    }

    // Generate quote_no if missing
    let finalQuoteNo = payload.quote_no;
    if (!finalQuoteNo) finalQuoteNo = getNextQuoteNo();

    // Create folder structure first to know revision
    let folderInfo = null;
    try {
      if (process.env.QUOTE_FOLDERS_DISABLED !== '1') {
        folderInfo = await createCustomerQuoteFolders({
          customerName: payload.customer_name,
          quoteNo: finalQuoteNo,
          description: payload.description || 'quote',
        });
        // use revision we computed
        payload.rev = folderInfo.revision ?? 0;
      }
    } catch (folderErr) {
      console.error('Folder creation warning:', folderErr);
    }

    // Insert DB row
    const stmt = db.prepare(
      `
      INSERT INTO quotes (quote_no, customer_name, description, requested_by, estimator, date, status, sales_order_no, rev)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    );
    const result = stmt.run(
      finalQuoteNo,
      payload.customer_name,
      payload.description,
      payload.requested_by,
      payload.estimator,
      payload.date,
      payload.status,
      payload.sales_order_no,
      Number.isFinite(+payload.rev) ? +payload.rev : 0
    );

    // Fetch created
    const created = db
      .prepare(
        `
      SELECT id, quote_no, customer_name, description, requested_by, estimator, date,
             status, sales_order_no, rev, created_at
      FROM quotes
      WHERE id = ?
    `
      )
      .get(result.lastInsertRowid);

    const response = { ok: true, quote: created };
    if (folderInfo) {
      response.folder = {
        customerDir: folderInfo.customerDir,
        folderPath: folderInfo.quoteDir,
        folderName: folderInfo.folderName,
        revision: folderInfo.revision,
      };
    } else if (process.env.QUOTE_FOLDERS_DISABLED === '1') {
      response.warning = 'Folder creation disabled by env';
    } else {
      response.warning = 'Folder creation failed; see server logs.';
    }
    return res.status(201).json(response);
  } catch (err) {
    console.error('Error creating quote:', err);
    res
      .status(500)
      .json({ ok: false, error: 'Failed to create quote', detail: String(err?.message || err) });
  }
});

/* ------------------------------ Route: UPDATE ------------------------------ */
router.put('/:id', (req, res) => {
  try {
    const b = req.body || {};
    const payload = {
      quote_no: b.quote_no ? String(b.quote_no).trim() : null,
      customer_name: b.customer_name ? String(b.customer_name).trim() : null,
      description: b.description ? String(b.description).trim() : null,
      requested_by: b.requested_by ? String(b.requested_by).trim() : null,
      estimator: b.estimator ? String(b.estimator).trim() : null,
      date: toISO(b.date) || null,
      status: b.status ? String(b.status).trim() : null,
      sales_order_no: b.sales_order_no ? String(b.sales_order_no).trim() : null,
      rev: Number.isFinite(+b.rev) ? +b.rev : 0,
    };

    const row = db.prepare('SELECT id FROM quotes WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ ok: false, error: 'Quote not found' });

    db.prepare(
      `
      UPDATE quotes
      SET quote_no = ?, customer_name = ?, description = ?, requested_by = ?, estimator = ?, date = ?, status = ?, sales_order_no = ?, rev = ?
      WHERE id = ?
    `
    ).run(
      payload.quote_no,
      payload.customer_name,
      payload.description,
      payload.requested_by, // ← fix: was request_by
      payload.estimator,
      payload.date,
      payload.status,
      payload.sales_order_no,
      payload.rev ?? 0,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
    res.json({ ok: true, quote: updated });
  } catch (err) {
    console.error('Error updating quote:', err);
    res
      .status(500)
      .json({ ok: false, error: 'Failed to update quote', detail: String(err?.message || err) });
  }
});

/* ------------------------------ Route: DELETE ------------------------------ */
/**
 * Hard delete (DB row). We keep this for now.
 * For "remove from log but keep files", use the archive endpoint below.
 */
router.delete('/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM quotes WHERE id = ?').run(req.params.id);
    res.json({ ok: true, deleted: info.changes > 0 });
  } catch (err) {
    console.error('Error deleting quote:', err);
    res
      .status(500)
      .json({ ok: false, error: 'Failed to delete quote', detail: String(err?.message || err) });
  }
});

/* ------------------------------ Route: ARCHIVE ----------------------------- */
/**
 * Soft-delete: move quote folder to _archived/ and mark DB status = 'Archived'.
 * Body can be empty; we’ll compute folder name from DB row.
 * Optionally you may POST { customer_name, folder_name } to override.
 */
router.post('/:id/archive', async (req, res) => {
  try {
    const id = req.params.id;
    const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ ok: false, error: 'Quote not found' });

    const customerName = (req.body?.customer_name || row.customer_name || '').toString();
    const baseName = `${row.quote_no}-${slug(row.description || '')}`.replace(/-$/, '');
    const folderName = row.rev > 1 ? `${baseName}-rev-${row.rev}` : baseName;

    // Try to move the folder; if it doesn't exist, we just continue
    let archivedPath = null;
    try {
      const result = await archiveCustomerQuoteFolder(customerName, folderName);
      archivedPath = result.archivedPath;
    } catch (e) {
      // log but don't fail — DB status archiving still applies
      console.warn('Archive move warning:', e?.message || e);
    }

    // Mark DB row as Archived
    db.prepare('UPDATE quotes SET status = ? WHERE id = ?').run('Archived', id);
    const updated = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);

    res.json({ ok: true, archivedPath, quote: updated });
  } catch (err) {
    console.error('Error archiving quote:', err);
    res
      .status(500)
      .json({ ok: false, error: 'Failed to archive quote', detail: String(err?.message || err) });
  }
});

export default router;
