// backend/src/routes/quoteInitRoute.js
import { Router } from 'express';
import * as dbModule from '../db.js';
import { ensureQuoteFolders } from '../lib/quoteFolders.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;
const router = Router();

/**
 * POST /api/quotes/:quoteNo/init-folders
 * Body (optional): { customer_name, description }
 *
 * Looks up the quote in DB if customer_name is not provided,
 * then ensures the full folder tree exists for that quote.
 */
router.post('/:quoteNo/init-folders', async (req, res) => {
  const quoteNo = req.params.quoteNo;
  let { customer_name, description } = req.body || {};

  try {
    if (!customer_name && db?.prepare) {
      const row = db.prepare('SELECT customer_name, description FROM quotes WHERE quote_no = ?')
                    .get(quoteNo);
      if (row) {
        customer_name = row.customer_name;
        if (!description) description = row.description || '';
      }
    }

    if (!customer_name) {
      return res.status(400).json({ ok: false, error: 'customer_name required' });
    }

    const out = await ensureQuoteFolders({
      customerName: customer_name,
      quoteNo,
      description: description || ''
    });

    res.json({ ok: true, ...out });
  } catch (e) {
    console.error('init-folders error', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

export default router;
