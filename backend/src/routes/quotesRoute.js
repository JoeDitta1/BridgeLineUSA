// src/routes/quotesRoute.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { fileURLToPath } from 'url';
import * as dbModule from '../db.js';
import { ensureQuoteFolders } from '../lib/quoteFolders.js';
import { getQuoteFilesFromSupabase, getOpenAIApiKey, ensureSupabaseQuotesTable } from '../utils/supabaseClient.js';
import { getSupabaseClient } from '../utils/supabaseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure DB export compatibility
const db = dbModule.default ?? dbModule.db ?? dbModule;

// Compute canonical quotes root relative to backend folder (same as index.js)
// Resolve against backend root so relative env values map to backend/data/quotes
const BACKEND_ROOT = path.resolve(__dirname, '..', '..');
const QUOTES_FILES_ROOT = path.resolve(BACKEND_ROOT, 'data', 'quotes');

// Helper function to sanitize folder names
const safeFolderName = (input) => String(input).replace(/[\\/:*?"<>|]/g, '_').trim();

/** Extract text content from PDF files using pdfjs-dist */
async function extractPdfText(filePath) {
  try {
    // Dynamic import to avoid Node.js compatibility issues
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    // Read the PDF file
    const dataBuffer = await fsPromises.readFile(filePath);
    
    // Convert Buffer to Uint8Array for pdfjs-dist compatibility
    const uint8Array = new Uint8Array(dataBuffer);
    
    // Parse the PDF document
    const pdf = await pdfjs.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      disableFontFace: true
    }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    // Clean up the extracted text
    let text = fullText.trim();
    
    // Remove excessive whitespace and normalize
    text = text.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n');
    
    // Limit text length to prevent token limit issues
    if (text.length > 4000) {
      text = text.substring(0, 4000) + '... [truncated]';
    }
    
    console.log(`Successfully extracted ${text.length} characters from PDF: ${path.basename(filePath)}`);
    
    // If no meaningful text was extracted, return null
    if (text.length < 10) {
      console.warn(`PDF appears to be image-only or has minimal text: ${path.basename(filePath)}`);
      return null;
    }
    
    return text;
    
  } catch (error) {
    console.warn(`PDF extraction failed for ${filePath}:`, error.message);
    return null;
  }
}

/** Extract text content from PDF buffer (for Supabase files) using pdfjs-dist */
async function extractPdfTextFromBuffer(dataBuffer) {
  try {
    // Dynamic import to avoid Node.js compatibility issues
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    // Convert Buffer to Uint8Array for pdfjs-dist compatibility
    const uint8Array = new Uint8Array(dataBuffer);
    
    // Parse the PDF document
    const pdf = await pdfjs.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      disableFontFace: true
    }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    // Clean up the extracted text
    let text = fullText.trim();
    
    // Remove excessive whitespace and normalize
    text = text.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n');
    
    // Limit text length to prevent token limit issues
    if (text.length > 4000) {
      text = text.substring(0, 4000) + '... [truncated]';
    }
    
    console.log(`Successfully extracted ${text.length} characters from PDF buffer`);
    
    // If no meaningful text was extracted, return null
    if (text.length < 10) {
      console.warn(`PDF buffer appears to be image-only or has minimal text`);
      return null;
    }
    
    return text;
    
  } catch (error) {
    console.warn(`PDF buffer extraction failed:`, error.message);
    return null;
  }
}

// Ensure a uniqueness index to prevent creating multiple quote rows for the same
// customer/date/description triplet in race conditions. This index is idempotent
// and will be created if missing.
try {
  db.prepare(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_customer_date_description ON quotes(customer_name, date, description)`
  ).run();
} catch (e) {
  console.warn('Could not ensure unique index idx_quotes_customer_date_description:', e?.message || e);
}

const router = express.Router();

/* --------------------------------- Paths ---------------------------------- */
/**
 * Resolve the quote vault root. We support either QUOTE_VAULT_ROOT or QUOTE_ROOT.
 * Relative paths are resolved against the backend folder so Codespaces/Linux works.
 */
// Resolve relative env paths against the backend root so routes and helpers
// consistently target the same on-disk location used by src/index.js
const VAULT_ROOT = (() => {
  const env = process.env.QUOTE_VAULT_ROOT || process.env.QUOTE_ROOT;
  if (!env) return QUOTES_FILES_ROOT;
  if (path.isAbsolute(env)) return env;
  return path.resolve(BACKEND_ROOT, env);
})();

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
  const customerSafe = safeFolderName(customerName) || 'unknown';
  const baseName = `${quoteNo}-${safeFolderName(description || '')}`.replace(/-$/, '');
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
  const customerSafe = safeFolderName(customerName) || 'unknown';
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
      WHERE deleted_at IS NULL
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
    if (!finalQuoteNo) {
      // try to read nested appState meta (some callers send the meta under appState.meta)
      try {
        const nested = (payload.appState && payload.appState.meta) || null;
        if (nested) {
          finalQuoteNo = (nested.quoteNo || nested.quote_no || '').toString().trim() || null;
        }
      } catch (e) {
        // ignore
      }
    }
    if (!finalQuoteNo) {
      finalQuoteNo = getNextQuoteNo();
      console.log('[quotes:create] generated quoteNo:', finalQuoteNo);
    } else {
      console.log('[quotes:create] using provided quoteNo:', finalQuoteNo);
    }

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

    // Insert DB row in an idempotent way. Use INSERT OR IGNORE and then select
    // the row by (customer_name, date, description) so concurrent inserts don't
    // create duplicates. We still use the provided finalQuoteNo as the primary
    // quote identifier.
  const insert = db.prepare(
        `INSERT OR IGNORE INTO quotes (quote_no, customer_name, description, requested_by, estimator, date, status, sales_order_no, rev)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      const info = insert.run(
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

      let created = null;
      if (info.changes && info.lastInsertRowid) {
        created = db
          .prepare(
            `SELECT id, quote_no, customer_name, description, requested_by, estimator, date,
                    status, sales_order_no, rev, created_at
             FROM quotes WHERE id = ?`
          )
          .get(info.lastInsertRowid);
      } else {
        // Insert was ignored because a matching row exists (unique idx may have fired).
        created = db
          .prepare(
            `SELECT id, quote_no, customer_name, description, requested_by, estimator, date,
                    status, sales_order_no, rev, created_at
             FROM quotes WHERE customer_name = ? AND date = ? AND (description IS NULL OR description = ? ) LIMIT 1`
          )
          .get(payload.customer_name, payload.date, payload.description || null);
      }

    // Sync to Supabase after successful local DB insert
    try {
      console.log(`[quotes:create] Starting Supabase sync check...`);
      const supabase = getSupabaseClient();
      console.log(`[quotes:create] Supabase client result:`, !!supabase);
      console.log(`[quotes:create] Created quote result:`, !!created);
      
      if (supabase && created) {
        console.log(`[quotes:create] ✅ Syncing new quote to Supabase: ${created.quote_no}`);
        
        // Prepare data for Supabase - only include fields that exist in Supabase schema
        const supabaseData = {
          quote_no: created.quote_no,
          customer_name: created.customer_name,
          description: created.description,
          requested_by: created.requested_by,
          estimator: created.estimator,
          date: created.date,
          status: created.status,
          sales_order_no: created.sales_order_no,
          rev: created.rev,
          customer: created.customer_name, // Map to 'customer' field in Supabase
          updated_at: new Date().toISOString(),
          // Note: removed deleted_at, created_at, tenant_id - let Supabase handle these
        };
        
        console.log(`[quotes:create] Attempting Supabase sync for ${created.quote_no}`);
        
        const { data: insertedData, error: supabaseError } = await supabase
          .from('quotes')
          .insert(supabaseData)
          .select();
          
        if (supabaseError) {
          console.error(`[quotes:create] ❌ Supabase sync FAILED for ${created.quote_no}`);
          console.error(`[quotes:create] Error:`, supabaseError.message);
          if (supabaseError.details) {
            console.error(`[quotes:create] Details:`, supabaseError.details);
          }
          if (supabaseError.hint) {
            console.error(`[quotes:create] Hint:`, supabaseError.hint);
          }
        } else {
          console.log(`[quotes:create] ✅ Successfully synced ${created.quote_no} to Supabase`);
          if (insertedData && insertedData.length > 0) {
            console.log(`[quotes:create] Supabase record ID: ${insertedData[0].id}`);
          }
        }
      } else {
        console.warn(`[quotes:create] ❌ Supabase sync skipped - client: ${!!supabase}, created: ${!!created}`);
      }
    } catch (supabaseErr) {
      console.error('[quotes:create] Supabase sync exception:', supabaseErr.message);
    }

    // Ensure folder structure after DB save
    try {
      await ensureQuoteFolders({
        quoteNo: created?.quote_no || req.body?.quote_no,
        customerName: created?.customer_name || req.body?.customer_name,
        description: created?.description || req.body?.description || '',
      });
    } catch (e) {
      console.warn('ensureQuoteFolders warning:', e?.message || e);
    }

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
router.put('/:id', async (req, res) => {
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

    // Fetch existing DB row
    const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ ok: false, error: 'Quote not found' });

    // Determine on-disk folder for this quote (search VAULT_ROOT)
    const quoteNo = payload.quote_no || row.quote_no;
    const customerCandidates = [row.customer_name, safeFolderName(row.customer_name), slug(row.customer_name), (row.customer_name || '').trim()];
    let quoteDirOnDisk = null;
    for (const cust of customerCandidates) {
      if (!cust) continue;
      const candidateDir = path.join(VAULT_ROOT, cust);
      try {
        const entries = await fsPromises.readdir(candidateDir).catch(() => []);
        const match = (entries || []).find(d => String(d).toLowerCase().startsWith(String(quoteNo).toLowerCase()));
        if (match) {
          quoteDirOnDisk = path.join(candidateDir, match);
          break;
        }
      } catch (e) {
        // ignore and try next candidate
      }
    }

    // If we didn't find an existing folder under VAULT_ROOT, fall back to
    // constructing the expected folder name from DB (older behavior).
    if (!quoteDirOnDisk) {
      const baseName = `${quoteNo}-${slug(row.description || '')}`.replace(/-$/, '');
      const folderName = row.rev > 1 ? `${baseName}-rev-${row.rev}` : baseName;
      quoteDirOnDisk = path.join(VAULT_ROOT, row.customer_name || '', folderName);
    }

    // Perform update
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
      payload.requested_by,
      payload.estimator,
      payload.date,
      payload.status,
      payload.sales_order_no,
      payload.rev ?? 0,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);

    // Ensure folder structure after update
    try {
      await ensureQuoteFolders({
        quoteNo: updated?.quote_no || req.body?.quote_no,
        customerName: updated?.customer_name || req.body?.customer_name,
        description: updated?.description || req.body?.description || '',
      });
    } catch (e) {
      console.warn('ensureQuoteFolders warning:', e?.message || e);
    }

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

/* ------------------------------ Route: META ------------------------------- */
// GET /api/quotes/:quoteNo/meta  -> returns { ok: true, meta: <parsed json> }
router.get('/:quoteNo/meta', async (req, res) => {
  try {
    const quoteNo = req.params.quoteNo;
    const forceLocal = req.query.forceLocal === 'true';
    
    // TODO: Re-enable Supabase quotes loading once table schema is fixed
    // Currently disabled due to schema mismatch (missing app_state column)
    // Try Supabase first (unless forced to use local)
    const useSupabaseQuotes = !forceLocal; // Skip Supabase if forceLocal=true
    const supabase = useSupabaseQuotes ? getSupabaseClient() : null;
    if (supabase) {
      console.log('[quotes:meta] Attempting to load from Supabase for quote:', quoteNo);
      
      // Ensure quotes table exists
      await ensureSupabaseQuotesTable();
      
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .eq('quote_no', quoteNo)
          .maybeSingle();

        if (!error && data) {
          console.log('[quotes:meta] Successfully loaded from Supabase');
          // Convert Supabase format to expected format
          const meta = {
            quoteNo: data.quote_no,
            customerName: data.customer_name,
            description: data.description,
            requestedBy: data.requested_by,
            estimator: data.estimator,
            date: data.date,
            status: data.status,
            rev: data.rev || 0,
            savedAt: data.updated_at || data.created_at,
            form: {
              appState: data.app_state ? JSON.parse(data.app_state) : null
            }
          };
          return res.json({ ok: true, meta, source: 'supabase' });
        } else if (error) {
          console.log('[quotes:meta] Supabase load error, falling back to local:', error.message);
          if (error.message.includes('app_state') || error.message.includes('column')) {
            console.warn('[quotes:meta] Schema mismatch detected. The Supabase quotes table may need to be updated.');
          }
        } else {
          console.log('[quotes:meta] Quote not found in Supabase, trying local');
        }
      } catch (supabaseError) {
        console.warn('[quotes:meta] Supabase load error, falling back to local:', supabaseError.message);
      }
    }

    // Fallback to local SQLite + filesystem lookup
    console.log('[quotes:meta] Loading from local SQLite for quote:', quoteNo);
    const row = db.prepare('SELECT * FROM quotes WHERE quote_no = ?').get(quoteNo);
    if (!row) return res.status(404).json({ ok: false, error: 'Quote not found' });

    console.log('[quotes:meta] Found quote in SQLite:', row);

    // Parse appState from database if available
    let appState = null;
    if (row.app_state) {
      try {
        appState = JSON.parse(row.app_state);
      } catch (e) {
        console.warn('[quotes:meta] Failed to parse app_state:', e.message);
      }
    }

    // Create meta response
    const meta = {
      quoteNo: row.quote_no,
      customerName: row.customer_name,
      description: row.description,
      requestedBy: row.requested_by,
      estimator: row.estimator,
      date: row.date,
      status: row.status,
      rev: row.rev || 0,
      savedAt: row.created_at,
      form: {
        appState: appState
      }
    };

    console.log('[quotes:meta] Returning meta for quote:', quoteNo);
    return res.json({ ok: true, meta });
  } catch (e) {
    console.error('Error reading meta:', e);
    return res.status(500).json({ ok: false, error: 'Failed to read meta' });
  }
});

// Debug-only: GET /api/quotes/:quoteNo/_debug_scan -> returns candidate folder scan results
// debug scan route removed in cleanup

// Move the /save-meta handler logic into a named async function
async function saveMeta(req, res) {
  try {
    const b = req.body || {};
    // Normalize inputs
    const payload = {
      quote_no: (b.quoteNo || b.quote_no || '').toString().trim() || null,
      customer_name: (b.customerName || b.customer_name || '').toString().trim() || null,
      description: (b.description || '').toString().trim() || null,
      requested_by: (b.requested_by || b.requestedBy || '').toString().trim() || null,
      estimator: (b.estimator || '').toString().trim() || null,
      date: toISO(b.date || b.dt) || new Date().toISOString().slice(0, 10),
      status: (b.status || 'Draft').toString(),
      rev: Number.isFinite(+b.rev) ? +b.rev : 0,
      appState: b.appState || null,
    };

    if (!payload.customer_name) return res.status(400).json({ ok: false, error: 'customer_name required' });

    // Ensure we have a quote number; if missing, try to find a matching existing quote
    let finalQuoteNo = payload.quote_no;
    if (!finalQuoteNo) {
      try {
        const found = db.prepare(
          `SELECT quote_no FROM quotes WHERE customer_name = ? AND date = ? AND (description IS NULL OR description = ? ) LIMIT 1`
        ).get(payload.customer_name, payload.date, payload.description || null);
        if (found && found.quote_no) {
          finalQuoteNo = found.quote_no;
          console.log('[saveMeta] matched existing quote by customer+date+description:', finalQuoteNo);
        }
      } catch (e) {
        console.warn('[saveMeta] duplicate lookup failed:', e?.message || e);
      }
    }
    if (!finalQuoteNo) {
      console.log('[saveMeta] generating new quote no via getNextQuoteNo()');
      finalQuoteNo = getNextQuoteNo();
    }

    // Enable Supabase sync for new quotes
    const useSupabaseQuotes = true; // Re-enabled with fixed schema
    const supabase = useSupabaseQuotes ? getSupabaseClient() : null;
    if (supabase) {
      console.log('[saveMeta] Attempting to save to Supabase quotes table');
      
      // Ensure quotes table exists
      await ensureSupabaseQuotesTable();

      // Prepare the data for Supabase (matching actual schema)
      const completeAppState = {
        meta: payload.appState?.meta || {},
        rows: payload.appState?.rows || [],
        nde: payload.appState?.nde || [],
        // Future: Add quote page data here
        // quote: payload.appState?.quote || {},
        
        // Metadata for revision tracking
        lastSaved: new Date().toISOString(),
        dataVersion: '1.0', // For future schema migrations
        pages: {
          meta: payload.appState?.meta ? Object.keys(payload.appState.meta).length > 0 : false,
          materials: payload.appState?.rows ? payload.appState.rows.length > 0 : false,
          nde: payload.appState?.nde ? payload.appState.nde.length > 0 : false,
          // quote: false // Future fourth page
        }
      };

      const supabaseData = {
        quote_no: finalQuoteNo,
        customer_name: payload.customer_name,
        description: payload.description,
        requested_by: payload.requested_by,
        estimator: payload.estimator,
        date: payload.date,
        status: payload.status,
        sales_order_no: null, // Add missing field
        rev: payload.rev || 0,
        customer: payload.customer_name, // Map to customer field
        app_state: JSON.stringify(completeAppState), // Complete structured form data!
        updated_at: new Date().toISOString()
        // Removed: deleted_at, created_at, tenant_id (auto-handled by Supabase)
      };

      // Try to insert to Supabase (regular insert, not upsert)
      try {
        console.log(`[saveMeta] Syncing quote ${finalQuoteNo} to Supabase`);
        
        const { data, error } = await supabase
          .from('quotes')
          .upsert(supabaseData, { onConflict: 'quote_no' })
          .select();

        if (error) {
          console.error(`[saveMeta] ❌ Supabase sync FAILED for ${finalQuoteNo}:`, error.message);
          if (error.details) console.error(`[saveMeta] Details:`, error.details);
          if (error.hint) console.error(`[saveMeta] Hint:`, error.hint);
        } else {
          console.log(`[saveMeta] ✅ Successfully synced ${finalQuoteNo} to Supabase`);
          if (data && data.length > 0) {
            console.log(`[saveMeta] Supabase record ID: ${data[0].id}`);
          }
        }
      } catch (supabaseError) {
        console.error('[saveMeta] Supabase sync exception:', supabaseError.message);
      }
    }

    // Use local SQLite storage (current working solution)

    // Check if quote exists
    let existing = db.prepare('SELECT * FROM quotes WHERE quote_no = ?').get(finalQuoteNo);

    if (existing) {
      // For revision management: Instead of updating, we should ideally create new revision records
      // However, to maintain compatibility with current system, we'll update for now
      // TODO: Implement proper revision management with (quote_no, rev) composite keys
      
      // Store the complete form state including all pages
      const completeAppState = {
        meta: payload.appState?.meta || {},
        rows: payload.appState?.rows || [],
        nde: payload.appState?.nde || [],
        // Future: Add quote page data here
        // quote: payload.appState?.quote || {},
        
        // Metadata for revision tracking
        lastSaved: new Date().toISOString(),
        dataVersion: '1.0', // For future schema migrations
        pages: {
          meta: payload.appState?.meta ? Object.keys(payload.appState.meta).length > 0 : false,
          materials: payload.appState?.rows ? payload.appState.rows.length > 0 : false,
          nde: payload.appState?.nde ? payload.appState.nde.length > 0 : false,
          // quote: false // Future fourth page
        }
      };

      // Update existing record with complete app state
      db.prepare(
        `UPDATE quotes SET customer_name = ?, description = ?, requested_by = ?, estimator = ?, date = ?, status = ?, rev = ?, app_state = ? WHERE quote_no = ?`
      ).run(
        payload.customer_name, 
        payload.description, 
        payload.requested_by || null, 
        payload.estimator || null, 
        payload.date, 
        payload.status, 
        payload.rev || 0, 
        JSON.stringify(completeAppState), 
        finalQuoteNo
      );
      existing = db.prepare('SELECT * FROM quotes WHERE quote_no = ?').get(finalQuoteNo);
    } else {
      // Insert new record with complete form state
      const completeAppState = {
        meta: payload.appState?.meta || {},
        rows: payload.appState?.rows || [],
        nde: payload.appState?.nde || [],
        // Future: Add quote page data here
        // quote: payload.appState?.quote || {},
        
        // Metadata for revision tracking
        lastSaved: new Date().toISOString(),
        dataVersion: '1.0', // For future schema migrations
        pages: {
          meta: payload.appState?.meta ? Object.keys(payload.appState.meta).length > 0 : false,
          materials: payload.appState?.rows ? payload.appState.rows.length > 0 : false,
          nde: payload.appState?.nde ? payload.appState.nde.length > 0 : false,
          // quote: false // Future fourth page
        }
      };

      const insertStmt = db.prepare(
        `INSERT OR IGNORE INTO quotes (quote_no, customer_name, description, requested_by, estimator, date, status, sales_order_no, rev, app_state)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      const info = insertStmt.run(
        finalQuoteNo, 
        payload.customer_name, 
        payload.description, 
        payload.requested_by || null, 
        payload.estimator || null, 
        payload.date, 
        payload.status || 'Draft', 
        null, 
        payload.rev || 0, 
        JSON.stringify(completeAppState)
      );
      if (info.changes && info.lastInsertRowid) {
        existing = db.prepare('SELECT * FROM quotes WHERE id = ?').get(info.lastInsertRowid);
      } else {
        // Another process likely inserted; fetch by customer/date/description
        existing = db.prepare(`SELECT * FROM quotes WHERE customer_name = ? AND date = ? AND (description IS NULL OR description = ?) LIMIT 1`).get(payload.customer_name, payload.date, payload.description || null);
      }
    }

    // Determine folder path to write meta into. Use the DB row's rev so we
    // write into the same folder the create flow uses (don't auto-increment
    // revision here).
    let folderInfo = null;
    try {
      // Use existing DB row info (if present) to compute folder name and path.
      const customerSafe = safeFolderName(payload.customer_name) || 'unknown';
      const baseName = `${finalQuoteNo}-${safeFolderName(payload.description || '')}`.replace(/-$/, '');
      // prefer the rev from the DB 'existing' row if present, otherwise payload.rev
      const revToUse = (existing && typeof existing.rev === 'number') ? existing.rev : (Number.isFinite(+payload.rev) ? +payload.rev : 0);
      const folderName = revToUse > 1 ? `${baseName}-rev-${revToUse}` : baseName;
      const quoteDir = path.join(VAULT_ROOT, customerSafe, folderName);
      // Ensure directory exists (create if missing)
      await ensureDir(path.join(quoteDir, 'Quote Form'));
      folderInfo = { customerDir: path.join(VAULT_ROOT, customerSafe), quoteDir, folderName };
    } catch (e) {
      console.warn('folder ensure warning:', e?.message || e);
    }

    // Write _meta.json into Quote Form folder
    try {
      if (folderInfo && folderInfo.quoteDir) {
        const quoteFormDir = path.join(folderInfo.quoteDir, 'Quote Form');
        await ensureDir(quoteFormDir);
        const metaPath = path.join(quoteFormDir, '_meta.json');
        const content = {
          ok: true,
          quoteNo: finalQuoteNo,
          customerName: payload.customer_name,
          savedAt: new Date().toISOString(),
          form: {
            appState: payload.appState || null,
          },
        };
        await fsPromises.writeFile(metaPath, JSON.stringify(content, null, 2), 'utf8');

        return res.json({ ok: true, quoteNo: finalQuoteNo, customerName: payload.customer_name, metaPath, quoteDir: folderInfo.quoteDir });
      }
    } catch (e) {
      console.warn('write meta warning:', e?.message || e);
    }

    // If we couldn't write meta, still return success with DB info
    return res.json({ ok: true, quoteNo: finalQuoteNo, customerName: payload.customer_name, quoteDir: folderInfo?.quoteDir || null });
  } catch (err) {
    console.error('Error in saveMeta:', err);
    res.status(500).json({ ok: false, error: 'Failed to save meta', detail: String(err?.message || err) });
  }
}

router.post('/save-meta', saveMeta);
router.post('/save', saveMeta);

/**
 * Enhanced material matching function for AI BOM extraction
 * Attempts to match extracted AI items with existing Supabase materials
 */
async function matchAIItemWithSupabaseMaterial(aiItem) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('Supabase not configured, skipping material matching');
      return { ...aiItem, matched: false, matchSource: 'none' };
    }

    // Normalize the AI item description for matching
    const itemDesc = aiItem.item?.toLowerCase() || '';
    const size = aiItem.size?.toLowerCase() || '';
    
    // Different matching strategies based on item type
    let matchQueries = [];
    
    // Strategy 1: Exact size match for specific families
    if (itemDesc.includes('pipe') || (aiItem.schedule && aiItem.schedule.includes('sch'))) {
      // For pipes: combine size + schedule to match Supabase format "2 SCH 40"
      const pipeSize = aiItem.size || '';
      const pipeSchedule = aiItem.schedule || '';
      const combinedSize = pipeSchedule ? `${pipeSize} ${pipeSchedule}` : pipeSize;
      
      matchQueries.push({
        type: 'Pipe',
        size: combinedSize,
        strategy: 'exact_pipe_size_schedule'
      });
      
      console.log(`🔍 Pipe matching: size="${pipeSize}" + schedule="${pipeSchedule}" = "${combinedSize}"`);
    }
    
    if (itemDesc.includes('channel') || itemDesc.includes('c-channel') || size.match(/^c\d+/i)) {
      // For C-Channels: try to match size like "C3x4.1"  
      matchQueries.push({
        type: 'C-Channel',
        size: aiItem.size,
        strategy: 'exact_channel_size'
      });
    }
    
    if (itemDesc.includes('angle') || size.match(/^l\d+/i)) {
      // For Angles: try to match size like "L4x3x1/4"
      matchQueries.push({
        type: 'Angle', 
        size: aiItem.size,
        strategy: 'exact_angle_size'
      });
    }
    
    if (itemDesc.includes('flange')) {
      // For Flanges: try to match size like "2 WN RF"
      matchQueries.push({
        type: 'Flange',
        size: aiItem.size, 
        strategy: 'exact_flange_size'
      });
    }
    
    // Strategy 2: Fuzzy matching for plates and other items
    if (itemDesc.includes('plate') || itemDesc.includes('sheet')) {
      matchQueries.push({
        type: 'Plate',
        strategy: 'fuzzy_plate'
      });
    }
    
    // Try each matching strategy
    for (const query of matchQueries) {
      let supabaseQuery = supabase.from('materials').select('*');
      
      if (query.type) {
        supabaseQuery = supabaseQuery.eq('type', query.type);
      }
      
      if (query.size && query.strategy.includes('exact')) {
        // Try exact size match first
        const { data: exactMatches, error } = await supabaseQuery.eq('size', query.size);
        
        if (!error && exactMatches && exactMatches.length > 0) {
          const bestMatch = exactMatches[0];
          console.log(`✅ Exact match found for "${aiItem.item}": ${bestMatch.type} ${bestMatch.size}`);
          
          // For pipes, extract the schedule from the matched size back to separate fields
          let resultSchedule = aiItem.schedule;
          let resultSize = aiItem.size;
          
          if (bestMatch.type === 'Pipe' && bestMatch.pipe_schedule) {
            resultSchedule = bestMatch.pipe_schedule_num ? `SCH ${bestMatch.pipe_schedule_num}` : bestMatch.pipe_schedule;
            resultSize = bestMatch.description || bestMatch.size?.split(' ')[0] || aiItem.size;
          }
          
          return {
            ...aiItem,
            matched: true,
            matchSource: 'supabase_exact',
            matchStrategy: query.strategy,
            supabaseMaterial: bestMatch,
            // Override with Supabase data - properly structured for pipes
            material: bestMatch.type || aiItem.material,
            item: bestMatch.type || aiItem.item,
            size: resultSize,
            schedule: resultSchedule,
            grade: bestMatch.grade || aiItem.grade,
            unit: bestMatch.unit_type || aiItem.unit,
            pricePerUnit: bestMatch.price_per_unit,
            weightPerFt: bestMatch.weight_per_ft
          };
        }
      }
      
      // If exact match failed, try fuzzy matching within the type
      if (query.type) {
        const { data: typeMatches, error } = await supabaseQuery.limit(50);
        
        if (!error && typeMatches && typeMatches.length > 0) {
          // Score matches by similarity
          const scoredMatches = typeMatches.map(material => {
            let score = 0;
            const matSize = (material.size || '').toLowerCase();
            const matDesc = (material.description || '').toLowerCase();
            
            // Size similarity
            if (size && matSize.includes(size)) score += 0.5;
            if (size && size.includes(matSize)) score += 0.3;
            
            // Description similarity  
            if (itemDesc && matDesc.includes(itemDesc.substring(0, 8))) score += 0.3;
            
            return { material, score };
          });
          
          const bestMatch = scoredMatches.sort((a, b) => b.score - a.score)[0];
          
          if (bestMatch.score > 0.4) {
            console.log(`🔍 Fuzzy match found for "${aiItem.item}": ${bestMatch.material.type} ${bestMatch.material.size} (score: ${bestMatch.score})`);
            
            // For pipes, extract the schedule from the matched size back to separate fields
            let resultSchedule = aiItem.schedule;
            let resultSize = aiItem.size;
            
            if (bestMatch.material.type === 'Pipe' && bestMatch.material.pipe_schedule) {
              resultSchedule = bestMatch.material.pipe_schedule_num ? `SCH ${bestMatch.material.pipe_schedule_num}` : bestMatch.material.pipe_schedule;
              resultSize = bestMatch.material.description || bestMatch.material.size?.split(' ')[0] || aiItem.size;
            }
            
            return {
              ...aiItem,
              matched: true,
              matchSource: 'supabase_fuzzy',
              matchStrategy: query.strategy,
              matchScore: bestMatch.score,
              supabaseMaterial: bestMatch.material,
              // Blend AI and Supabase data - properly structured for pipes
              material: bestMatch.material.type || aiItem.material,
              item: bestMatch.material.type || aiItem.item,
              size: resultSize,
              schedule: resultSchedule,
              grade: bestMatch.material.grade || aiItem.grade,
              unit: bestMatch.material.unit_type || aiItem.unit,
              pricePerUnit: bestMatch.material.price_per_unit,
              weightPerFt: bestMatch.material.weight_per_ft
            };
          }
        }
      }
    }
    
    // No match found
    console.log(`❌ No Supabase match found for "${aiItem.item}"`);
    return { ...aiItem, matched: false, matchSource: 'none' };
    
  } catch (error) {
    console.error('Error matching AI item with Supabase:', error);
    return { ...aiItem, matched: false, matchSource: 'error', matchError: error.message };
  }
}

/* ---------------------------- AI BOM Extraction ---------------------------- */
/**
 * POST /api/quotes/:quoteNo/ai/extract-bom
 * Extracts BOM items from drawings stored in Supabase or local filesystem
 */
router.post('/:quoteNo/ai/extract-bom', async (req, res) => {
  try {
    const { quoteNo } = req.params;
    console.log(`AI BOM extraction requested for quote: ${quoteNo}`);

    // Get OpenAI API key from settings
    const openaiApiKey = getOpenAIApiKey();
    if (!openaiApiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'OpenAI API key not configured. Please set it in Admin Settings.' 
      });
    }

    let drawingFiles = [];
    let source = 'unknown';

    // Try to get files from Supabase first
    try {
      const allFiles = await getQuoteFilesFromSupabase(quoteNo);
      drawingFiles = allFiles.filter(file => 
        file.subdir === 'drawings' && (
          file.name.toLowerCase().endsWith('.pdf') || 
          file.name.toLowerCase().endsWith('.dwg') || 
          file.name.toLowerCase().endsWith('.dxf')
        )
      );
      
      if (drawingFiles.length > 0) {
        source = 'supabase';
        console.log(`Found ${drawingFiles.length} drawing files in Supabase for quote ${quoteNo}`);
      }
    } catch (supabaseError) {
      console.warn('Failed to get files from Supabase:', supabaseError);
    }

    // Fallback to local filesystem if no Supabase files found
    if (drawingFiles.length === 0) {
      console.log('No drawings found in Supabase, checking local filesystem...');
      
      // Get customer name from database
      const quoteRow = db.prepare('SELECT customer_name FROM quotes WHERE quote_no = ?').get(quoteNo);
      if (!quoteRow) {
        return res.status(404).json({ success: false, error: 'Quote not found' });
      }

      // Find the quote's drawings folder
      const customerDir = path.join(QUOTES_FILES_ROOT, safeFolderName(quoteRow.customer_name));
      const quoteFolders = await listDirs(customerDir);
      let quoteDir = null;
      
      for (const folder of quoteFolders) {
        if (folder.toLowerCase().startsWith(quoteNo.toLowerCase())) {
          quoteDir = path.join(customerDir, folder);
          break;
        }
      }
      
      if (!quoteDir) {
        return res.status(404).json({ 
          success: false, 
          error: 'Quote folder not found and no files in Supabase' 
        });
      }

      const drawingsDir = path.join(quoteDir, 'drawings');
      
      // Check if local drawings folder exists and has files
      try {
        const localDrawingFiles = await fsPromises.readdir(drawingsDir);
        const localFiles = localDrawingFiles.filter(file => 
          file.toLowerCase().endsWith('.pdf') || 
          file.toLowerCase().endsWith('.dwg') || 
          file.toLowerCase().endsWith('.dxf')
        ).map(filename => ({ name: filename, source: 'local' }));
        
        drawingFiles = localFiles;
        source = 'local';
        console.log(`Found ${drawingFiles.length} drawing files in local filesystem`);
        
      } catch (localError) {
        console.warn('Failed to read local drawings folder:', localError);
      }
    }

    // Check if we have any files to process
    if (drawingFiles.length === 0) {
      return res.json({ 
        success: true, 
        extraction: {
          extractedItems: [],
          confidence: 0,
          sourceFiles: [],
          source: 'none'
        },
        message: 'No drawing files found (PDF, DWG, DXF) in Supabase or local folder. Please upload technical drawings first.'
      });
    }

    // Actually process the drawing files by extracting PDF text content
    console.log(`Starting AI BOM extraction for quote ${quoteNo} with PDF text analysis`);
    
    let allExtractedItems = [];
    
    // Process each drawing file and extract actual PDF content
    for (const drawingFile of drawingFiles) {
      console.log(`Processing drawing: ${drawingFile.name}`);
      
      let pdfText = '';
      
      if (source === 'local') {
        // For local files, construct the full path and extract PDF text
        const quoteRow = db.prepare('SELECT customer_name FROM quotes WHERE quote_no = ?').get(quoteNo);
        const customerDir = path.join(QUOTES_FILES_ROOT, safeFolderName(quoteRow.customer_name));
        const quoteFolders = await fsPromises.readdir(customerDir);
        let quoteDir = null;
        
        for (const folder of quoteFolders) {
          if (folder.toLowerCase().startsWith(quoteNo.toLowerCase())) {
            quoteDir = path.join(customerDir, folder);
            break;
          }
        }
        
        const filePath = path.join(quoteDir, 'drawings', drawingFile.name);
        
        // Extract actual text content from the PDF
        if (drawingFile.name.toLowerCase().endsWith('.pdf')) {
          console.log(`Extracting PDF text from: ${filePath}`);
          pdfText = await extractPdfText(filePath);
        }
      } else if (source === 'supabase') {
        // For Supabase files, download and extract PDF text
        if (drawingFile.name.toLowerCase().endsWith('.pdf')) {
          console.log(`Downloading and extracting PDF text from Supabase: ${drawingFile.name}`);
          try {
            // Download PDF from Supabase
            const response = await fetch(drawingFile.url);
            if (!response.ok) {
              throw new Error(`Failed to download PDF: ${response.statusText}`);
            }
            
            const pdfBuffer = await response.arrayBuffer();
            
            // Extract text from the PDF buffer
            pdfText = await extractPdfTextFromBuffer(Buffer.from(pdfBuffer));
            console.log(`Successfully extracted ${pdfText.length} characters from Supabase PDF`);
          } catch (error) {
            console.warn(`Failed to extract text from Supabase PDF ${drawingFile.name}:`, error.message);
            continue;
          }
        }
      }
      
      if (!pdfText || pdfText.length < 10) {
        console.log(`No meaningful PDF text extracted from ${drawingFile.name}, skipping`);
        continue;
      }
      
      console.log(`Extracted ${pdfText.length} characters from ${drawingFile.name}`);
      console.log(`PDF content preview: ${pdfText.substring(0, 200)}...`);
      
      // Create a BOM extraction prompt using the actual PDF text content
      const bomPrompt = `You are an expert engineering AI that extracts materials from technical drawings with dimensional cross-validation.

DRAWING: ${drawingFile.name}
QUOTE: ${quoteNo}

PDF TEXT CONTENT:
${pdfText}

ENGINEERING ANALYSIS STEPS:
1. Parse BOM table (columns: ITEM, DESCRIPTION, QTY, LENGTH, SIZE)
2. Find technical details for each item elsewhere in drawing
3. Cross-validate dimensions between BOM and details
4. Extract complete dimensional data with units
5. **CRITICAL**: Clean and standardize material descriptions
6. **QUANTITY VALIDATION**: Double-check quantities using multiple methods

**QUANTITY EXTRACTION & VALIDATION**:
- **Primary Method**: Extract from QTY column in BOM table (NOT item sequence numbers)
- **Validation Method**: Count occurrences in detail views, sections, and callouts
- **Cross-Check**: If BOM says QTY=7, verify there are 7 instances shown in details
- **Flag Discrepancies**: If BOM QTY ≠ detail count, note the mismatch
- **Examples**:
  * BOM Table: "ITEM 1, CHANNEL C 3X4.1, QTY 7" → qty: 7 (not 1!)
  * Detail Views: Count actual instances of "Channel C 3x4.1" in drawing
  * Callouts: Look for quantity indicators like "7 PLACES", "(7) TYP"

**MATERIAL DESCRIPTION CLEANUP & STANDARDIZATION**:
- **Remove non-standard terms**: "Black", "White", "Regular", "Standard", "Normal"
- **Fix common engineer errors**:
  * "Pipe, Black, 2\"" → "Pipe, Carbon Steel, 2\""
  * "Steel Angle, Black" → "Steel Angle"  
  * "Channel, Regular" → "Channel"
  * "Plate, Standard" → "Plate"
- **Standardize pipe specifications**:
  * Add proper schedule if missing: "Pipe 2\"" → "Pipe 2\" SCH 40"
  * Add material grade: "Pipe 2\" SCH 40" → "Pipe, Carbon Steel, 2\" SCH 40"
- **Ensure proper ASTM grades**:
  * Carbon Steel → "A36" for structural, "A53" for pipe
  * Stainless → "304" or "316" if determinable

**CRITICAL: SUPABASE DATABASE FORMAT MATCHING**:
Your descriptions MUST match the existing Supabase database format EXACTLY:
- **C-Channels**: Use "C3x4.1" format (NOT "Channel C 3 x 4.1")
  * Examples: "C3x4.1", "C4x5.4", "C6x8.2", "C8x11.5"
  * Family: "C-Channel", Size: "C3x4.1"
- **Angles**: Use "L4x3x1/4" format (NOT "Steel Angle L 4 x 3 x 1/4")  
  * Examples: "L4x3x1/4", "L3-1/2x2-1/2x1/4", "L6x4x3/8"
  * Family: "Angle", Size: "L4x3x1/4"
- **Pipes**: CRITICAL - Separate pipe size from schedule!
  * Material: "Pipe" (NOT "Pipe, Carbon Steel" or "Carbon Steel Pipe")
  * Size: "2" (pipe size ONLY, no schedule)
  * Schedule: "SCH 40" (separate field for schedule)
  * Examples: size="1/2" + schedule="SCH 40", size="3" + schedule="SCH 80"
- **Flanges**: Use "2 WN RF" format (NOT "2\" Weld Neck Flange")
  * Examples: "2 WN RF", "3 SO RF", "4 BL RF"
  * Family: "Flange", Size: "2 WN RF"

**FORMAT EXAMPLES FOR JSON OUTPUT**:
- Channel: {"item": "C-Channel", "material": "C-Channel", "size": "C3x4.1", "schedule": null}
- Angle: {"item": "Angle", "material": "Angle", "size": "L4x3x1/4", "schedule": null}
- Pipe: {"item": "Pipe", "material": "Pipe", "size": "2", "schedule": "SCH 40"}

**NEVER** create new format variations - ALWAYS match existing database format!

DIMENSIONAL EXTRACTION REQUIREMENTS:
**PLATES/SHEETS**: Extract length, width, AND thickness (never just length for plates!)
- "PLATE 12X8X0.5" → length: 12, width: 8, thickness: 0.5
- "SHEET 24X16X1/4" → length: 24, width: 16, thickness: 0.25
- "BASE PLATE 10X10X0.75" → length: 10, width: 10, thickness: 0.75

**LINEAR ITEMS**: Extract length only (pipes, channels, angles, beams)
- Convert to feet if length >12 inches

**CIRCULAR ITEMS**: Extract diameter and thickness (flanges, rings)

REQUIRED JSON FORMAT:
[
  {
    "item": "C-Channel",
    "material": "C-Channel", 
    "size": "C3x4.1",
    "grade": "A36",
    "schedule": null,
    "qty": 7,
    "unit": "Each",
    "specification": "ASTM A36",
    "length": 32.50,
    "lengthUnit": "in",
    "width": null,
    "thickness": null,
    "diameter": null,
    "bomDimension": "32.50 IN",
    "detailDimension": "32.50 IN", 
    "dimensionMatch": true,
    "bomQty": 7,
    "detailCount": 7,
    "qtyValidated": true,
    "notes": "QTY validated: BOM table shows 7, detail views confirm 7 instances",
    "confidence": 0.95
  },
  {
    "item": "Pipe",
    "material": "Pipe", 
    "size": "2",
    "grade": "A53",
    "schedule": "SCH 40",
    "qty": 6,
    "unit": "Each",
    "specification": "ASTM A53",
    "length": 67.0,
    "lengthUnit": "in",
    "width": null,
    "thickness": null,
    "diameter": 2.0,
    "bomDimension": "67.00 IN",
    "detailDimension": "67.00 IN", 
    "dimensionMatch": true,
    "bomQty": 6,
    "detailCount": 6,
    "qtyValidated": true,
    "notes": "CRITICAL: Pipe size and schedule separated for Supabase matching",
    "confidence": 0.90
  },
  {
    "item": "Plate 12 x 8 x 1/2",
    "material": "Carbon Steel", 
    "size": "12 x 8 x 1/2",
    "grade": "A36",
    "qty": 1,
    "unit": "Each",
    "specification": "ASTM A36",
    "length": 12.0,
    "lengthUnit": "in",
    "width": 8.0,
    "thickness": 0.5,
    "diameter": null,
    "bomDimension": "12X8X1/2",
    "detailDimension": "12.00X8.00X0.50", 
    "dimensionMatch": true,
    "notes": "Plate dims validated - L x W x T",
    "confidence": 0.95
  }
]

CRITICAL REQUIREMENTS:
✓ Extract QTY from QTY column (not item sequence)
✓ Find dimensions in BOM table
✓ Look for same item in detail views/sections
✓ Compare BOM vs detail dimensions
✓ Use detail dimension if more accurate
✓ Flag mismatches with dimensionMatch: false
✓ Keep dimensions in INCHES (Quote Form expects inches)
✓ **CLEAN MATERIAL DESCRIPTIONS**: Remove "Black", "White", "Regular", "Standard", "Normal"
✓ **STANDARDIZE PIPES**: "Pipe Black 2\"" → "Pipe, Carbon Steel, 2\" SCH 40"
✓ **ADD PROPER GRADES**: A36 for structural, A53 for pipe, 304/316 for stainless

JSON array only:`;

      // Make OpenAI API call with timeout using the actual PDF content
      try {
        const openaiResponse = await Promise.race([
          fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4o',  // Use full GPT-4o for better accuracy than mini
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert mechanical engineer specializing in industrial BOM extraction from technical drawings. Extract only the items that are clearly mentioned in the provided text content. Be precise and accurate. Always use complete industry-standard descriptions.'
                },
                {
                  role: 'user',
                  content: bomPrompt
                }
              ],
              max_tokens: 1500,
              temperature: 0.0  // Zero temperature for maximum precision and consistency
            })
          }),
          // 30 second timeout for enhanced AI analysis
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('OpenAI API timeout')), 30000)
          )
        ]);

        if (openaiResponse.ok) {
          const aiResult = await openaiResponse.json();
          const aiContent = aiResult.choices?.[0]?.message?.content;
          
          if (aiContent) {
            console.log(`AI response for ${drawingFile.name}: ${aiContent.substring(0, 300)}...`);
            
            // Parse JSON from AI response
            try {
              let jsonText = aiContent;
              const jsonMatch = aiContent.match(/```(?:json)?\s*(\[.*?\])\s*```/s);
              if (jsonMatch) {
                jsonText = jsonMatch[1];
              } else if (aiContent.includes('[') && aiContent.includes(']')) {
                const startIdx = aiContent.indexOf('[');
                const endIdx = aiContent.lastIndexOf(']') + 1;
                jsonText = aiContent.substring(startIdx, endIdx);
              }

              const extractedItems = JSON.parse(jsonText);
              if (Array.isArray(extractedItems) && extractedItems.length > 0) {
                // Add source information to each item
                const itemsWithSource = extractedItems.map(item => ({
                  ...item,
                  notes: `${item.notes || ''} - From ${drawingFile.name} (${source})`.trim()
                }));
                allExtractedItems = allExtractedItems.concat(itemsWithSource);
                console.log(`Successfully extracted ${extractedItems.length} items from ${drawingFile.name}`);
              } else {
                console.log(`AI returned empty array for ${drawingFile.name}`);
              }
            } catch (parseError) {
              console.error(`Failed to parse AI JSON response for ${drawingFile.name}:`, parseError);
              console.log('Raw AI content:', aiContent);
            }
          } else {
            console.log(`No AI content returned for ${drawingFile.name}`);
          }
        } else {
          console.error(`OpenAI API error for ${drawingFile.name}: ${openaiResponse.status}`);
        }
      } catch (apiError) {
        console.error(`API call failed for ${drawingFile.name}:`, apiError.message);
      }
    }
    
    if (allExtractedItems.length === 0) {
      console.log('No items extracted from PDF analysis, returning empty result');
      return res.json({
        success: true,
        extraction: {
          extractedItems: [],
          confidence: 0,
          sourceFiles: drawingFiles.map(f => f.name),
          source: source
        },
        message: `No BOM items could be extracted from the PDF content. The drawing may not contain a clear bill of materials or may be image-based.`
      });
    }
    
    console.log(`Total extracted items from all files: ${allExtractedItems.length}`);

    // ENHANCED: Match extracted AI items with existing Supabase materials
    console.log('🔍 Starting Supabase material matching for extracted items...');
    const matchedItems = [];
    
    for (let i = 0; i < allExtractedItems.length; i++) {
      const aiItem = allExtractedItems[i];
      console.log(`Processing item ${i + 1}/${allExtractedItems.length}: "${aiItem.item}"`);
      
      const matchedItem = await matchAIItemWithSupabaseMaterial(aiItem);
      matchedItems.push(matchedItem);
      
      // Add small delay to avoid overwhelming Supabase
      if (i < allExtractedItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const matchStats = {
      total: matchedItems.length,
      exactMatches: matchedItems.filter(item => item.matchSource === 'supabase_exact').length,
      fuzzyMatches: matchedItems.filter(item => item.matchSource === 'supabase_fuzzy').length,
      noMatches: matchedItems.filter(item => item.matchSource === 'none').length,
      errors: matchedItems.filter(item => item.matchSource === 'error').length
    };
    
    console.log('📊 Material matching results:', matchStats);

    // Transform items to match frontend format with dynamic confidence
    const transformedItems = matchedItems.map(item => {
      // Calculate confidence based on description completeness
      let itemConfidence = 1.0; // Start with perfect confidence
      
      // Reduce confidence for incomplete descriptions
      if (!item.item || item.item.length < 8) itemConfidence -= 0.3;
      if (!item.size) itemConfidence -= 0.2;
      if (!item.unit) itemConfidence -= 0.1;
      if (!item.material || item.material === 'Unknown') itemConfidence -= 0.1;
      if (!item.grade && (item.item.toLowerCase().includes('flange') || item.item.toLowerCase().includes('pipe'))) itemConfidence -= 0.1;
      
      // Boost confidence for complete descriptions
      if (item.item.length > 15 && item.size && item.grade) itemConfidence = 1.0;
      
      // ENHANCED: Boost confidence for Supabase matches
      if (item.matchSource === 'supabase_exact') {
        itemConfidence = Math.max(itemConfidence + 0.2, 0.95); // Exact matches get high confidence
      } else if (item.matchSource === 'supabase_fuzzy' && item.matchScore > 0.6) {
        itemConfidence = Math.max(itemConfidence + 0.1, 0.85); // Good fuzzy matches get boost
      }
      
      // Ensure minimum confidence of 0.6
      itemConfidence = Math.max(0.6, itemConfidence);
      
      return {
        material: item.material,
        item: item.item,
        quantity: `${item.qty} ${item.unit}`,
        specification: item.specification || '',
        size: item.size || '',
        grade: item.grade || '',
        schedule: item.schedule || null, // ENHANCED: Include separate schedule field
        qty: item.qty,
        unit: item.unit,
        notes: item.notes,
        confidence: itemConfidence,
        // ENHANCED: Add Supabase matching information
        matched: item.matched || false,
        matchSource: item.matchSource || 'none',
        matchStrategy: item.matchStrategy || null,
        matchScore: item.matchScore || null,
        supabaseMaterial: item.supabaseMaterial || null,
        pricePerUnit: item.pricePerUnit || null,
        weightPerFt: item.weightPerFt || null,
        // Include all dimensional fields from cross-validation analysis
        length: item.length,
        lengthUnit: item.lengthUnit,
        width: item.width,
        thickness: item.thickness,
        diameter: item.diameter,
        bomDimension: item.bomDimension,
        detailDimension: item.detailDimension,
        dimensionMatch: item.dimensionMatch
      };
    });
    
    // Calculate overall confidence as average of item confidences
    const overallConfidence = transformedItems.length > 0 
      ? transformedItems.reduce((sum, item) => sum + item.confidence, 0) / transformedItems.length
      : 0.6;
    
    return res.json({
      success: true,  // Frontend expects 'success' instead of 'ok'
      extraction: {
        extractedItems: transformedItems,
        confidence: Math.round(overallConfidence * 100) / 100, // Round to 2 decimal places
        sourceFiles: drawingFiles.map(f => f.name),
        source: source,
        // ENHANCED: Include material matching statistics
        materialMatching: matchStats
      },
      message: `AI BOM extraction completed. Found ${transformedItems.length} items from ${drawingFiles.length} drawings (${source}). Material matching: ${matchStats.exactMatches} exact, ${matchStats.fuzzyMatches} fuzzy, ${matchStats.noMatches} unmatched.`
    });
    
  } catch (err) {
    console.error('AI BOM extraction error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to extract BOM from drawings', 
      detail: String(err?.message || err) 
    });
  }
});

/* ------------------------------ REVISION MANAGEMENT (Future) ------------------------------ */
// These endpoints prepare for proper revision management while maintaining current compatibility

// GET /api/quotes/:quoteNo/revisions - List all revisions of a quote
router.get('/:quoteNo/revisions', async (req, res) => {
  try {
    const quoteNo = req.params.quoteNo;
    
    // For now, return single revision (current behavior)
    // Future: Query for all revisions WHERE quote_no = ? ORDER BY rev DESC
    const quotes = db.prepare('SELECT * FROM quotes WHERE quote_no = ? ORDER BY rev DESC').all(quoteNo);
    
    const revisions = quotes.map(q => ({
      quote_no: q.quote_no,
      rev: q.rev,
      status: q.status,
      date: q.date,
      created_at: q.created_at,
      updated_at: q.updated_at || q.created_at,
      customer_name: q.customer_name,
      description: q.description,
      estimator: q.estimator,
      hasFormData: q.app_state ? true : false,
      pages: q.app_state ? JSON.parse(q.app_state).pages || {} : {}
    }));
    
    res.json({ ok: true, revisions });
  } catch (err) {
    console.error('Error fetching revisions:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch revisions' });
  }
});

// GET /api/quotes/:quoteNo/revisions/:rev - Get specific revision
router.get('/:quoteNo/revisions/:rev', async (req, res) => {
  try {
    const { quoteNo, rev } = req.params;
    
    // Query specific revision
    const quote = db.prepare('SELECT * FROM quotes WHERE quote_no = ? AND rev = ?').get(quoteNo, parseInt(rev));
    
    if (!quote) {
      return res.status(404).json({ ok: false, error: 'Revision not found' });
    }
    
    // Parse appState
    let appState = null;
    if (quote.app_state) {
      try {
        appState = JSON.parse(quote.app_state);
      } catch (e) {
        console.warn('Failed to parse app_state for revision:', e.message);
      }
    }
    
    const meta = {
      quoteNo: quote.quote_no,
      customerName: quote.customer_name,
      description: quote.description,
      requestedBy: quote.requested_by,
      estimator: quote.estimator,
      date: quote.date,
      status: quote.status,
      rev: quote.rev,
      savedAt: quote.updated_at || quote.created_at,
      form: {
        appState: appState
      }
    };
    
    res.json({ ok: true, meta, source: 'local', revision: parseInt(rev) });
  } catch (err) {
    console.error('Error fetching specific revision:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch revision' });
  }
});

export default router;
