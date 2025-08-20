import express from 'express';
import { db } from '../db.js';

const router = express.Router();

/* Helpers */
function normalizeDate(s) {
  if (!s) return null;
  // already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // MM/DD/YYYY or MM-DD-YYYY -> YYYY-MM-DD
  const m = String(s).match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (m) {
    const [, mm, dd, yyyy] = m;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  return s; // fallback: store as-is
}

function nextQuoteNo() {
  const row = db.prepare(`SELECT quote_no FROM quotes ORDER BY id DESC LIMIT 1`).get();
  let lastNum = 0;
  if (row?.quote_no) {
    const m = String(row.quote_no).match(/(\d+)(?!.*\d)/); // last number in the string
    if (m) lastNum = parseInt(m[1], 10) || 0;
  }
  const next = lastNum + 1;
  return `Q-${String(next).padStart(4, '0')}`; // e.g., Q-0001, Q-0002, ...
}

/* GET /api/quotes */
router.get('/', (req, res) => {
  try {
    const rows = db
      .prepare(`SELECT * FROM quotes ORDER BY date DESC, created_at DESC`)
      .all();
    res.json({ ok: true, quotes: rows });
  } catch (e) {
    console.error('[quotes:get] error:', e);
    res.status(500).json({ ok: false, error: 'Failed to fetch quotes' });
  }
});

/* POST /api/quotes  (quote_no is OPTIONAL now) */
router.post('/', (req, res) => {
  try {
    let {
      quote_no,
      customer_name,
      description = null,
      requested_by = null,
      estimator = null,
      date,                             // can be 'YYYY-MM-DD' OR 'MM/DD/YYYY'
      status = 'Draft',
      sales_order_no = null,
      rev = 0
    } = req.body || {};

    date = normalizeDate(date);

    // Only require customer_name and date
    if (!customer_name || !date) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // Auto-generate quote_no if blank
    if (!quote_no || !String(quote_no).trim()) {
      quote_no = nextQuoteNo();
    }

    const insert = db.prepare(`
      INSERT INTO quotes
        (quote_no, customer_name, description, requested_by, estimator, date, status, sales_order_no, rev, created_at)
      VALUES
        (?,        ?,             ?,           ?,            ?,        ?,    ?,      ?,              ?,  datetime('now'))
    `);

    const info = insert.run(
      quote_no,
      customer_name,
      description,
      requested_by,
      estimator,
      date,
      status,
      sales_order_no,
      Number(rev || 0)
    );

    const quote = db.prepare(`SELECT * FROM quotes WHERE id = ?`).get(info.lastInsertRowid);
    res.json({ ok: true, quote });
  } catch (e) {
    console.error('[quotes:post] error:', e);
    res.status(500).json({ ok: false, error: 'Failed to save quote' });
  }
});

export default router;
