// backend/src/routes/customersRoute.js
import { Router } from 'express';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { getQuotesRoot } from '../lib/quoteFolders.js';

const router = Router();

/** Accepts: "SCM-0008-Desc", "SCM-Q0008-Desc", "SCM - Q0008 - Desc", etc. */
function parseQuoteDirName(name) {
  const s = String(name || '').trim();

  // "SCM-0008-Desc" or "SCM-Q0008-Desc"
  let m = s.match(/^(SCM-(?:Q)?\d{3,})(?:-(.*))?$/i);
  if (m) return { quoteNo: m[1], description: (m[2] || '').trim() };

  // "SCM - Q0008 - Desc" / "SCM 0008 Desc"
  const m2 = s.match(/^(SCM)[-_ ]+(Q)?(\d{3,})(?:[-_ ]+(.*))?$/i);
  if (m2) {
    const q = `${m2[1]}-${m2[2] ? 'Q' : ''}${m2[3]}`;
    return { quoteNo: q, description: (m2[4] || '').trim() };
  }

  // Fallback: split on first hyphen
  const [first, ...rest] = s.split('-');
  return { quoteNo: first, description: rest.join('-').trim() };
}

/** GET /api/quotes/customers — list customer folders with counts */
router.get('/customers', async (_req, res) => {
  const ROOT = getQuotesRoot();
  try {
    await fsp.mkdir(ROOT, { recursive: true });

    const entries = await fsp.readdir(ROOT, { withFileTypes: true });
    const customers = [];

    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const name = ent.name;

      // Hide stray roots (quote folders accidentally created at root) and 'undefined'
      if (name.toLowerCase() === 'undefined') continue;
      if (/^SCM-/i.test(name)) continue;

      const cdir = path.join(ROOT, name);
      let quoteCount = 0;
      let lastUpdated = 0;

      try {
        const qents = await fsp.readdir(cdir, { withFileTypes: true });
        for (const q of qents) {
          if (!q.isDirectory()) continue;
          quoteCount++;
          const st = await fsp.stat(path.join(cdir, q.name));
          if (st.mtimeMs > lastUpdated) lastUpdated = st.mtimeMs;
        }
      } catch { /* ignore per-customer errors */ }

      customers.push({ name, slug: name, quoteCount, lastUpdated });
    }

    customers.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
    res.json({ ok: true, customers });
  } catch (err) {
    console.error('GET /customers error', err);
    res.status(500).json({ ok: false, error: 'Failed to list customers', detail: String(err?.message || err) });
  }
});

/** GET /api/quotes/customers/:slug — list quote folders for one customer */
router.get('/customers/:slug', async (req, res) => {
  const slug = req.params.slug; // express already decodes
  const ROOT = getQuotesRoot();
  const customerDir = path.join(ROOT, slug);

  try {
    // Never throw on a missing folder — create it and return empty list
    await fsp.mkdir(customerDir, { recursive: true });

    const entries = await fsp.readdir(customerDir, { withFileTypes: true });
    const quotes = [];

    for (const ent of entries) {
      if (!ent.isDirectory()) continue;

      const dirName = ent.name;
      const { quoteNo, description } = parseQuoteDirName(dirName);
      const st = await fsp.stat(path.join(customerDir, dirName));

      quotes.push({
        dirName,
        quoteNo,
        description,
        mtimeMs: st.mtimeMs,
        paths: {
          root:         path.join(customerDir, dirName),
          drawings:     path.join(customerDir, dirName, 'Drawings'),
          vendorQuotes: path.join(customerDir, dirName, 'Vendor Quotes'),
          qualityInfo:  path.join(customerDir, dirName, 'Quality Info'),
          customerNotes:path.join(customerDir, dirName, 'Customer Notes'),
          uploads:      path.join(customerDir, dirName, 'Uploads'),
        },
      });
    }

    quotes.sort((a, b) => b.mtimeMs - a.mtimeMs);
    res.json({ ok: true, customer: slug, quotes });
  } catch (err) {
    console.error('GET /customers/:slug error', customerDir, err);
    res.status(500).json({ ok: false, error: 'Failed to list customer quotes', detail: String(err?.message || err) });
  }
});

export default router;
