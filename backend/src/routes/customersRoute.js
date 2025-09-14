// backend/src/routes/customersRoute.js
import { Router } from 'express';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { getQuotesRoot } from '../lib/quoteFolders.js';
import * as dbModule from '../db.js';

// Ensure DB export compatibility
const db = dbModule.default ?? dbModule.db ?? dbModule;

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
      let totalQuoteCount = 0; // Count all quotes, including deleted ones
      let lastUpdated = 0;
      let shouldSkipCustomer = false; // Flag to skip this customer

      try {
        const qents = await fsp.readdir(cdir, { withFileTypes: true });
        for (const q of qents) {
          if (!q.isDirectory()) continue;
          totalQuoteCount++; // Count all filesystem quotes
          
          // Check if this quote is soft-deleted in database
          const { quoteNo } = parseQuoteDirName(q.name);
          try {
            const dbQuote = db.prepare('SELECT deleted_at FROM quotes WHERE quote_no = ? LIMIT 1').get(quoteNo);
            // Only count if not found in DB (old quotes) or not soft-deleted
            if (!dbQuote || !dbQuote.deleted_at) {
              quoteCount++;
              const st = await fsp.stat(path.join(cdir, q.name));
              if (st.mtimeMs > lastUpdated) lastUpdated = st.mtimeMs;
            }
          } catch {
            // If DB query fails, count the quote (fail-safe)
            quoteCount++;
            const st = await fsp.stat(path.join(cdir, q.name));
            if (st.mtimeMs > lastUpdated) lastUpdated = st.mtimeMs;
          }
        }
        // Additional check: if customer has quotes but all are soft-deleted, 
        // check if customer was explicitly soft-deleted
        if (totalQuoteCount > 0 && quoteCount === 0) {
          try {
            // Check multiple potential customer name variations to handle case sensitivity
            const customerVariations = [
              name,
              name.toLowerCase(),
              name.toUpperCase(),
              decodeURIComponent(name),
              decodeURIComponent(name.toLowerCase())
            ];
            
            let foundDeletedQuote = false;
            for (const variation of customerVariations) {
              const customerDeletedQuote = db.prepare(
                'SELECT deleted_at FROM quotes WHERE customer_name = ? AND deleted_at IS NOT NULL LIMIT 1'
              ).get(variation);
              
              if (customerDeletedQuote) {
                console.log(`[DEBUG] Customer "${name}" (matched as "${variation}") has all quotes soft-deleted, hiding customer`);
                foundDeletedQuote = true;
                break;
              }
            }
            
            if (foundDeletedQuote) {
              shouldSkipCustomer = true; // Mark for skipping
            }
          } catch (err) {
            console.warn(`[DEBUG] Failed to check customer deletion status for "${name}":`, err);
          }
        }
        
      } catch { /* ignore per-customer errors */ }

      // Only include customers that have active (non-deleted) quotes and aren't marked for skipping
      if (!shouldSkipCustomer && quoteCount > 0) {
        customers.push({ name, slug: name, quoteCount, lastUpdated });
      }
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
    const allQuotes = [];

    // First, get all quote folders from filesystem
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;

      const dirName = ent.name;
      const { quoteNo, description } = parseQuoteDirName(dirName);
      const st = await fsp.stat(path.join(customerDir, dirName));

      allQuotes.push({
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

    // Filter out quotes that are soft-deleted in the database
    const activeQuotes = [];
    for (const quote of allQuotes) {
      try {
        const dbQuote = db.prepare('SELECT deleted_at FROM quotes WHERE quote_no = ? LIMIT 1').get(quote.quoteNo);
        // Only include if not found in DB (old quotes) or not soft-deleted
        if (!dbQuote || !dbQuote.deleted_at) {
          activeQuotes.push(quote);
        }
      } catch (err) {
        // If DB query fails, include the quote (fail-safe)
        activeQuotes.push(quote);
      }
    }

    activeQuotes.sort((a, b) => b.mtimeMs - a.mtimeMs);
    res.json({ ok: true, customer: slug, quotes: activeQuotes });
  } catch (err) {
    console.error('GET /customers/:slug error', customerDir, err);
    res.status(500).json({ ok: false, error: 'Failed to list customer quotes', detail: String(err?.message || err) });
  }
});

export default router;
