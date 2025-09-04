// backend/src/routes/customersRoute.js
import { Router } from 'express';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { getQuotesRoot } from '../lib/quoteFolders.js';
import * as dbModule from '../db.js';
import { getSupabase } from '../lib/supabaseClient.js';

// Ensure DB export compatibility
const db = dbModule.default ?? dbModule.db ?? dbModule;

// small helpers copied/compatible with quotesRoute
const slug = (s = '') =>
  String(s)
    .normalize('NFKD')
  .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

async function listDirs(p) {
  try {
    const entries = await fsp.readdir(p, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }
}

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

/** DELETE /api/quotes/customers/:slug — remove customer folder and DB rows */
router.delete('/customers/:slug', async (req, res) => {
  const slugParam = req.params.slug;
  const ROOT = getQuotesRoot();

  try {
    const wanted = slug(slugParam || '');
    const customers = await listDirs(ROOT);
    const actualDir = customers.find((d) => slug(d) === wanted) || slugParam;
    const customerDir = path.join(ROOT, actualDir);

    // Remove on-disk folder tree (best-effort)
    try {
      await fsp.rm(customerDir, { recursive: true, force: true });
      console.debug('Removed customer folder:', customerDir);
    } catch (e) {
      console.warn('Failed to remove customer folder', customerDir, e?.message || e);
    }

    // Find quote_no values for that customer (DB rows)
    let quoteNos = [];
    try {
      const rows = db.prepare('SELECT quote_no FROM quotes WHERE customer_name = ?').all(actualDir);
      quoteNos = Array.isArray(rows) ? rows.map(r => r.quote_no) : [];
    } catch (e) {
      console.warn('Failed to query quotes for customer', actualDir, e?.message || e);
    }

    // Remove attachments rows for each quote_no
    try {
      for (const q of quoteNos) {
        db.prepare('DELETE FROM attachments WHERE parent_type = ? AND parent_id = ?').run('quote', q);
      }
    } catch (e) {
      console.warn('Failed to delete attachments rows for customer', actualDir, e?.message || e);
    }

    // Delete quotes rows
    try {
      db.prepare('DELETE FROM quotes WHERE customer_name = ?').run(actualDir);
    } catch (e) {
      console.warn('Failed to delete quotes rows for customer', actualDir, e?.message || e);
    }

    // Attempt Supabase cleanup if configured (best-effort)
    try {
      const supa = getSupabase();
      const useSup = String(process.env.USE_SUPABASE || '').toLowerCase() === '1' && supa;
      const bucket = process.env.SUPABASE_BUCKET_UPLOADS || process.env.SUPABASE_QUOTES_BUCKET || 'blusa-uploads-prod';
      if (useSup) {
        const prefix = `customers/${slug(actualDir)}/quotes/`;
        try {
          const listRes = await supa.storage.from(bucket).list(prefix, { limit: 1000, offset: 0, search: '' });
          if (!listRes.error) {
            const items = (listRes.data || []).map(f => prefix + f.name).filter(Boolean);
            if (items.length) {
              await supa.storage.from(bucket).remove(items);
              console.debug('[supabase delete] removed objects', items.length, 'prefix=', prefix);
            } else {
              console.debug('[supabase delete] no objects under', prefix);
            }
          } else {
            console.warn('[supabase delete] list error', listRes.error.message || listRes.error);
          }
        } catch (e) {
          console.warn('[supabase delete] error listing/removing', e?.message || e);
        }

        // Remove attachments rows in Supabase Postgres (best-effort)
        try {
          if (quoteNos.length) {
            const del = await supa.from('attachments').delete().in('parent_id', quoteNos).match({ parent_type: 'quote' });
            if (del.error) console.warn('[supabase delete] attachments delete error', del.error.message || del.error);
            else console.debug('[supabase delete] supa attachments deleted count?', del.data?.length || 0);
          }
        } catch (e) {
          console.warn('[supabase delete] attachments delete failed', e?.message || e);
        }
      }
    } catch (e) {
      console.warn('Supabase cleanup attempt failed', e?.message || e);
    }

    res.json({ ok: true, deleted: true, customer: actualDir });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ ok: false, error: 'Failed to delete customer', detail: String(err?.message || err) });
  }
});

export default router;
