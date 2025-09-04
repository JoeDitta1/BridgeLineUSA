// src/routes/settingsRoute.js
import express from 'express';
import * as dbModule from '../db.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;
const router = express.Router();

/**
 * Ensure settings row exists (singleton id=1) with defaults.
 */
function ensureSettings() {
  db.exec?.(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      org_prefix TEXT NOT NULL DEFAULT 'SCM',   -- e.g., "SCM"
      system_abbr TEXT,                         -- optional, e.g., "AI"
      quote_series TEXT NOT NULL DEFAULT 'Q',   -- e.g., "Q"
      quote_pad INTEGER NOT NULL DEFAULT 4,     -- digits for quote, e.g., 4 -> 0001
      next_quote_seq INTEGER NOT NULL DEFAULT 1,
      sales_series TEXT NOT NULL DEFAULT 'S',   -- reserved for later
      sales_pad INTEGER NOT NULL DEFAULT 3,
      next_sales_seq INTEGER NOT NULL DEFAULT 1
    );
  `);

  const row = db.prepare?.('SELECT * FROM settings WHERE id=1')?.get?.();
  if (!row) {
    db.prepare?.(`
      INSERT INTO settings (id, org_prefix, system_abbr, quote_series, quote_pad, next_quote_seq, sales_series, sales_pad, next_sales_seq)
      VALUES (1, 'SCM', NULL, 'Q', 4, 1, 'S', 3, 1)
    `)?.run?.();
  }
}

/**
 * GET /api/settings
 * Returns the single settings row
 */
router.get('/', (req, res) => {
  try {
    ensureSettings();
    const row = db.prepare?.('SELECT * FROM settings WHERE id=1')?.get?.();
    return res.json({ ok: true, settings: row });
  } catch (err) {
    console.error('GET /api/settings error:', err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

/**
 * POST /api/settings/quote-seed
 * Body: { start_from: "SCM-Q0123", org_prefix?, system_abbr?, quote_series?, quote_pad? }
 * - Parses start_from and sets next_quote_seq accordingly (one after the number)
 * - Optionally updates prefixes/pad at the same time
 */
router.post('/quote-seed', (req, res) => {
  try {
    ensureSettings();
    const { start_from, org_prefix, system_abbr, quote_series, quote_pad } = req.body || {};

    if (!start_from || typeof start_from !== 'string') {
      return res.status(400).json({ ok: false, error: 'start_from (e.g., "SCM-Q0000") is required' });
    }

    // Extract the trailing number from start_from
    const match = start_from.match(/(\d+)\s*$/);
    if (!match) {
      return res.status(400).json({ ok: false, error: 'Could not find a trailing number in start_from' });
    }

    const numStr = match[1];
    const nextSeq = Number(numStr) + 1;
    if (!Number.isFinite(nextSeq) || nextSeq < 1) {
      return res.status(400).json({ ok: false, error: 'Parsed sequence invalid' });
    }

    const pad = Number.isInteger(quote_pad) ? quote_pad : numStr.length;

    // Update settings row
    db.prepare?.(`
      UPDATE settings
      SET org_prefix = COALESCE(?, org_prefix),
          system_abbr = COALESCE(?, system_abbr),
          quote_series = COALESCE(?, quote_series),
          quote_pad = ?,
          next_quote_seq = ?
      WHERE id=1
    `)?.run?.(
      org_prefix ?? null,
      system_abbr ?? null,
      quote_series ?? null,
      pad,
      nextSeq
    );

    const row = db.prepare?.('SELECT * FROM settings WHERE id=1')?.get?.();
    return res.json({ ok: true, settings: row });
  } catch (err) {
    console.error('POST /api/settings/quote-seed error:', err);
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});

export default router;
