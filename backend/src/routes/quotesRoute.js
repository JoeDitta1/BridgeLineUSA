// src/routes/quotesRoute.js
import express from 'express';
import path from 'path';
import { getSupabase } from '../lib/supabaseClient.js';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { fileURLToPath } from 'url';
import * as dbModule from '../db.js';
import { ensureQuoteFolders } from '../lib/quoteFolders.js';

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
// Use process.cwd() (backend root when server started from backend) to resolve
// the quote vault path consistently with other helpers.
const resolveFromBackend = (p) =>
  path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);

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

/**
 * GET /api/quotes/:quoteNo/meta
 * Return the saved _meta.json (if present) for a given quote number.
 */
router.get('/:quoteNo/meta', async (req, res) => {
  try {
    const quoteNo = req.params.quoteNo;
    if (!quoteNo) return res.status(400).json({ ok: false, error: 'quoteNo required' });

    // Lookup customer name from DB
    const row = db.prepare('SELECT customer_name, description FROM quotes WHERE quote_no = ?').get(quoteNo);
    if (!row || !row.customer_name) return res.status(404).json({ ok: false, error: 'Quote not found' });

    const customerSafe = slug(row.customer_name || 'unknown');
    const customerDir = path.join(VAULT_ROOT, customerSafe);

    // Find folder that starts with the quoteNo (handles revisions)
    const dirs = await listDirs(customerDir);
    const match = dirs.find(d => d === quoteNo || d.startsWith(`${quoteNo}-`));
    if (!match) return res.status(404).json({ ok: false, error: 'Quote folder not found' });

    const quoteDir = path.join(customerDir, match);
    const metaCandidates = [
      path.join(quoteDir, 'Quote Form', '_meta.json'),
      path.join(quoteDir, '_meta.json')
    ];

    for (const p of metaCandidates) {
      try {
        const txt = await fsPromises.readFile(p, 'utf8');
        const json = JSON.parse(txt || '{}');
        return res.json({ ok: true, meta: json });
      } catch (e) {
        // try next
      }
    }

    return res.status(404).json({ ok: false, error: 'Meta not found' });
  } catch (err) {
    console.error('Error reading meta:', err);
    res.status(500).json({ ok: false, error: String(err?.message || err) });
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
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // lookup row so we can remove filesystem folder(s)
    const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ ok: false, error: 'Quote not found' });

  // attempt to locate the customer directory under VAULT_ROOT in a tolerant way
    try {
      const wantedCustomerSlug = slug(row.customer_name || 'unknown');
      const customers = await listDirs(VAULT_ROOT);
      // find the actual directory name whose slug matches the customer slug
      const actualCustomerDirName = customers.find((d) => slug(d) === wantedCustomerSlug) || wantedCustomerSlug;
      const customerDir = path.join(VAULT_ROOT, actualCustomerDirName);

      const dirs = await listDirs(customerDir);
      const match = dirs.find((d) => d === row.quote_no || d.startsWith(`${row.quote_no}-`));
      if (match) {
        const quoteDir = path.join(customerDir, match);
        try {
          await fsPromises.rm(quoteDir, { recursive: true, force: true });
          console.debug('Removed quote folder:', quoteDir);
        } catch (e) {
          console.warn('Failed to remove quote folder', quoteDir, e?.message || e);
        }
      } else {
        console.debug('No matching quote folder found for', row.quote_no, 'under', customerDir);
      }
    } catch (e) {
      console.warn('Error while removing quote folders', e?.message || e);
    }

    // If Supabase is configured, attempt to remove storage objects and Postgres attachments rows
    try {
      const supa = getSupabase();
      const useSup = String(process.env.USE_SUPABASE || '').toLowerCase() === '1' && supa;
      const bucket = process.env.SUPABASE_BUCKET_UPLOADS || process.env.SUPABASE_QUOTES_BUCKET || 'blusa-uploads-prod';
      if (useSup) {
        // build prefix used by fileService: customers/<Customer>/quotes/<QuoteNo>/
        const prefix = `customers/${slug(row.customer_name || 'Unknown')}/quotes/${row.quote_no}/`;
        try {
          // list objects under prefix (may need to traverse folders)
          const listRes = await supa.storage.from(bucket).list(prefix, { limit: 1000, offset: 0, search: '' });
          if (listRes.error) {
            console.warn('[supabase delete] list error', listRes.error.message || listRes.error);
          } else {
            const items = (listRes.data || []).map(f => prefix + f.name).filter(Boolean);
            if (items.length) {
              try {
                await supa.storage.from(bucket).remove(items);
                console.debug('[supabase delete] removed objects', items.length, 'prefix=', prefix);
              } catch (re) {
                console.warn('[supabase delete] remove failed', re?.message || re);
              }
            } else {
              console.debug('[supabase delete] no objects found under', prefix);
            }
          }
        } catch (e) {
          console.warn('[supabase delete] error listing/removing objects', e?.message || e);
        }

        // remove Postgres attachments rows in Supabase (best-effort)
        try {
          const attDel = await supa.from('attachments').delete().match({ parent_type: 'quote', parent_id: row.quote_no });
          if (attDel.error) console.warn('[supabase delete] attachments delete error', attDel.error.message || attDel.error);
          else console.debug('[supabase delete] deleted attachments rows for', row.quote_no, 'count?', attDel.data?.length || 0);
        } catch (e) {
          console.warn('[supabase delete] attachments delete failed', e?.message || e);
        }
      }
    } catch (e) {
      console.warn('Supabase removal attempt failed:', e?.message || e);
    }

    // remove attachments rows (DB cleanup)
    try {
      db.prepare('DELETE FROM attachments WHERE parent_type = ? AND parent_id = ?').run('quote', row.quote_no);
    } catch (e) {
      console.warn('Failed to delete attachments rows for quote', row.quote_no, e?.message || e);
    }

    const info = db.prepare('DELETE FROM quotes WHERE id = ?').run(id);
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

// Move the /save-meta handler logic into a named async function
async function saveMeta(req, res) {
  try {
  const idemKey = req.get('X-Idempotency-Key') || req.body?.idempotency_key || null;
    const b = req.body || {};

    // Normalize incoming payload keys (support front-end variants)
    const quoteNoIn = (b.quoteNo || b.quote_no || b.quote || '').toString().trim() || undefined;
    const customerName = (b.customerName || b.customer_name || b.customer || '').toString().trim();
    const description = (b.description || '').toString();
    const date = (b.date || new Date().toISOString().slice(0, 10)).toString();
    const status = (b.status || 'Draft').toString();
    const rev = Number.isFinite(+b.rev) ? +b.rev : 0;

    if (!customerName) return res.status(400).json({ ok: false, error: 'customer_name required' });

    // Upsert quote row: if quote_no provided, try update; else INSERT new and return generated quote_no
    let finalQuoteNo = quoteNoIn;
    if (!finalQuoteNo) {
      // Generate next quote number
      finalQuoteNo = getNextQuoteNo();
      const stmt = db.prepare(`INSERT INTO quotes (quote_no, customer_name, description, requested_by, estimator, date, status, sales_order_no, rev) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      const info = stmt.run(finalQuoteNo, customerName, description || null, b.requested_by || null, b.estimator || null, date, status, b.sales_order_no || null, rev);
      // Fetch created row
    } else {
      // If exists, update; otherwise insert with provided quote_no
      const existing = db.prepare('SELECT id FROM quotes WHERE quote_no = ?').get(finalQuoteNo);
      if (existing) {
        db.prepare(`UPDATE quotes SET customer_name = ?, description = ?, requested_by = ?, estimator = ?, date = ?, status = ?, sales_order_no = ?, rev = ? WHERE quote_no = ?`).run(
          customerName, description || null, b.requested_by || null, b.estimator || null, date, status, b.sales_order_no || null, rev, finalQuoteNo
        );
      } else {
        db.prepare(`INSERT INTO quotes (quote_no, customer_name, description, requested_by, estimator, date, status, sales_order_no, rev) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          finalQuoteNo, customerName, description || null, b.requested_by || null, b.estimator || null, date, status, b.sales_order_no || null, rev
        );
      }
    }

    const saved = db.prepare('SELECT * FROM quotes WHERE quote_no = ?').get(finalQuoteNo);

    // Ensure folder tree
    try {
      await ensureQuoteFolders({ customerName, quoteNo: finalQuoteNo, description: description || '' });
    } catch (e) {
      console.warn('ensureQuoteFolders warning:', e?.message || e);
    }

    // Optional: If an idempotency key is present, check for an existing saved revision
    try {
      if (idemKey) {
        const existingRev = db.prepare('SELECT * FROM quote_revisions WHERE idempotency_key = ?').get(idemKey);
        if (existingRev) {
          return res.json({ ok: true, quoteNo: finalQuoteNo, customerName, revision: existingRev.version, existing: true });
        }
      }
    } catch (e) {
      console.warn('idem check failed:', e?.message || e);
    }

    // Write _meta.json under Quote Form folder for client-side hydration
    try {
  const customerSafe = slug(customerName) || 'unknown';
  const baseName = `${finalQuoteNo}-${slug(description || '')}`.replace(/-$/, '');
  const customerDir = path.join(VAULT_ROOT, customerSafe);
  // Find existing folder (handles revisions like -rev-2) or fall back to baseName
  const dirs = await listDirs(customerDir);
  const match = dirs.find((d) => d === baseName || d === finalQuoteNo || d.startsWith(`${finalQuoteNo}-`));
  const folderName = match || baseName;
  const quoteDir = path.join(customerDir, folderName);
  const quoteFormDir = path.join(quoteDir, 'Quote Form');
  await ensureDir(quoteFormDir);
      const metaPath = path.join(quoteFormDir, '_meta.json');
      const form = {
        saved_at: new Date().toISOString(),
        quote: saved,
        form: b.appState || { appState: b.appState || b }
      };
      await fsPromises.writeFile(metaPath, JSON.stringify(form, null, 2), 'utf8');

      // Record a new revision row (if revisions table present)
      try {
        const qrow = db.prepare('SELECT id,quote_no FROM quotes WHERE quote_no = ?').get(finalQuoteNo);
        if (qrow) {
          // determine version number
          const last = db.prepare('SELECT MAX(version) as v FROM quote_revisions WHERE quote_id = ?').get(qrow.id);
          const nextVer = (last?.v || 0) + 1;
          db.prepare(`INSERT INTO quote_revisions (quote_id, version, label, storage_key_json, snapshot_json, created_at, idempotency_key) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`)
            .run(qrow.id, nextVer, description || null, null, JSON.stringify(form), idemKey);
        }
      } catch (revErr) {
        console.warn('Failed to write quote_revisions row:', revErr?.message || revErr);
      }

      // Try to write small marker files and a manifest to Supabase storage (best-effort)
      try {
        const sup = await import('../lib/supabaseClient.js');
        const getSupabase = sup.default ?? sup.getSupabase ?? sup;
        const supa = getSupabase();
        if (supa) {
          const bucket = process.env.SUPABASE_QUOTES_BUCKET || 'quotes';
          const customerSafe = slug(customerName || 'unknown');
          const basePath = `quotes/${customerSafe}/${finalQuoteNo}`;
          const formDirKey = `${basePath}/00-Quote-Form`;
          // .keep markers
          try {
            await supa.storage.from(bucket).upload(`${basePath}/.keep`, Buffer.from(''), { upsert: true, contentType: 'application/octet-stream' });
            await supa.storage.from(bucket).upload(`${formDirKey}/.keep`, Buffer.from(''), { upsert: true, contentType: 'application/octet-stream' });
          } catch (e) {
            // ignore
          }
          // manifest placeholder
          try {
            const manifestKey = `${formDirKey}/manifest.json`;
            const manifest = { latest_version: null, files: [] };
            await supa.storage.from(bucket).upload(manifestKey, Buffer.from(JSON.stringify(manifest, null, 2)), { upsert: true, contentType: 'application/json' });
          } catch (e) {
            // ignore
          }
        }
      } catch (sErr) {
        // ignore supabase failures, it's best-effort
      }

  // enqueue sync job (non-blocking)
      try {
        const insert = db.prepare('INSERT INTO quote_sync_queue (quote_no, customer_name, quote_dir, meta_path, payload_json) VALUES (?, ?, ?, ?, ?)');
        insert.run(finalQuoteNo, customerName, quoteDir, metaPath, JSON.stringify(form));
      } catch (qe) {
        console.warn('Failed to enqueue quote sync job:', qe?.message || qe);
      }

      return res.json({ ok: true, quoteNo: finalQuoteNo, customerName, metaPath, quoteDir });
    } catch (e) {
      console.warn('Failed to write _meta.json:', e?.message || e);
      return res.json({ ok: true, quoteNo: finalQuoteNo, customerName });
    }
  } catch (err) {
    console.error('saveMeta error:', err && err.stack ? err.stack : err);
    res.status(500).json({ ok: false, error: 'Failed to save meta', detail: String(err?.message || err) });
  }
}

router.post('/save-meta', saveMeta);
router.post('/save', saveMeta);

export default router;
