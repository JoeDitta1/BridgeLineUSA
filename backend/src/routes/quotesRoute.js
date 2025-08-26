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

// Sanitize for Windows folder names
const safe = (s = '') => String(s).replace(/[^a-z0-9\-_]/gi, '_').slice(0, 120);

// Pull next quote number from settings and increment sequence
function getNextQuoteNo() {
  const s = db.prepare('SELECT org_prefix, system_abbr, quote_series, quote_pad, next_quote_seq FROM settings WHERE id=1').get();
  if (!s) throw new Error('Settings row missing (id=1).');
  const seq = Number(s.next_quote_seq) || 1;
  const padded = String(seq).padStart(Number(s.quote_pad) || 4, '0');
  const parts = [s.org_prefix, s.system_abbr, `${s.quote_series}${padded}`].filter(Boolean);
  const quoteNo = parts.join('-');

  db.prepare('UPDATE settings SET next_quote_seq = ? WHERE id=1').run(seq + 1);
  return quoteNo;
}

// Create folder structure for a given quote number (non-fatal errors)
async function createQuoteFolders(quoteNo) {
  const base =
    process.env.QUOTE_ROOT ||
    path.resolve(__dirname, '../..', 'data', 'quotes'); // fallback in repo

  const root = path.join(base, safe(quoteNo));
  await fsPromises.mkdir(path.join(root, 'Files'), { recursive: true });
  await fsPromises.mkdir(path.join(root, 'Quote'), { recursive: true });
  await fsPromises.mkdir(path.join(root, 'Supplier Information'), { recursive: true });
  return root;
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

    // Insert row
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
      payload.rev
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

    // Try to create folders; don't fail the whole request if it errors
    try {
      if (process.env.QUOTE_FOLDERS_DISABLED !== '1') {
        await createQuoteFolders(created.quote_no);
        return res.status(201).json({ ok: true, quote: created });
      } else {
        return res.status(201).json({ ok: true, quote: created, warning: 'Folder creation disabled by env' });
      }
    } catch (folderErr) {
      console.error('Folder creation warning:', folderErr);
      return res.status(201).json({ ok: true, quote: created, warning: 'Folder creation failed; see server logs.' });
    }
  } catch (err) {
    console.error('Error creating quote:', err);
    res.status(500).json({ ok: false, error: 'Failed to create quote', detail: String(err?.message || err) });
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
      payload.request_by,
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
    res.status(500).json({ ok: false, error: 'Failed to update quote', detail: String(err?.message || err) });
  }
});

/* ------------------------------ Route: DELETE ------------------------------ */
router.delete('/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM quotes WHERE id = ?').run(req.params.id);
    res.json({ ok: true, deleted: info.changes > 0 });
  } catch (err) {
    console.error('Error deleting quote:', err);
    res.status(500).json({ ok: false, error: 'Failed to delete quote', detail: String(err?.message || err) });
  }
});

export default router;
