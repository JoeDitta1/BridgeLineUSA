import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USE_SUPABASE = String(process.env.USE_SUPABASE || '').toLowerCase() === '1' ||
  String(process.env.USE_SUPABASE || '').toLowerCase() === 'true';

const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;
const supabase = (USE_SUPABASE && SUPA_URL && SUPA_KEY) ? createClient(SUPA_URL, SUPA_KEY) : null;

class LocalFsDriver {
  constructor(opts = {}) {
    this.base = opts.base || path.resolve(process.cwd(), 'data', 'quotes');
    // canonical root where quote folders live (matches server log)
    this.quoteRoot = opts.quoteRoot || this.base; // e.g. /workspaces/BridgeLineUSA/backend/data/quotes
    if (!this._loggedRoot) {
      console.log('[localfs] quoteRoot =', this.quoteRoot);
      this._loggedRoot = true;
    }
  }

  _absPathFor({ customer_name, parent_id, subdir, leaf = "" } = {}) {
    const cust = sanitize(customer_name || "Unknown");
    const q = sanitize(parent_id || "");
  const sd = sanitize(subdir || "uploads");
  // filesystem layout: <quoteRoot>/<Customer>/<QuoteNo>/<subdir>/<leaf>
  return path.join(this.quoteRoot || this.base, cust, q, sd, leaf);
  }

  async save({ parent_type, parent_id, customer_name, subdir = 'uploads', originalname, buffer, content_type, uploaded_by }) {
    if (!parent_id) throw new Error('parent_id (quoteNo) required');

    // folder structure: <quoteRoot>/<customer>/quotes/<quote>/<subdir>/<uuid>/original/<filename>
    const file_uuid = crypto.randomUUID ? crypto.randomUUID() : uuidv4();
    const relKeyDir = `customers/${sanitize(customer_name || 'Unknown')}/quotes/${sanitize(parent_id)}/${sanitize(subdir)}/${file_uuid}/original`;
    const absDir = this._absPathFor({ customer_name, parent_id, subdir, leaf: file_uuid });
    const absOrig = path.join(absDir, 'original');
    const absFile = path.join(absOrig, originalname);

    await fs.mkdir(absOrig, { recursive: true });
    await fs.writeFile(absFile, buffer);

    console.log('[localfs] save path', { absDir: absOrig, file: originalname });

    // optional: record attachment in sqlite attachments table if available
    try {
      await this.db?.run?.(
        `insert into attachments
          (parent_type, parent_id, subdir, label, object_key, content_type, size_bytes, uploaded_by, created_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          'quote',
          parent_id,
          subdir,
          originalname,
          `${relKeyDir}/${originalname}`,
          content_type || '',
          buffer?.length || 0,
          uploaded_by || null
        ]
      );
    } catch (e) {
      console.warn('[localfs] attachments insert skipped:', e?.message || e);
    }

    return {
      object_key: `${relKeyDir}/${originalname}`,
      content_type: content_type || '',
      size_bytes: buffer?.length || 0,
    };
  }

  // generate a download URL (local: direct file path served by express static)
  async signedUrl(object_key, ttl = 60) {
  // For local fs we serve under /files/<object_key>
  const rel = `/files/${object_key}`;
    const base = process.env.EXTERNAL_API_BASE || null;
    return base ? new URL(rel, base).href : rel;
  }

  // list objects for the given quote/subdir/customer
  async list(opts = {}) {
    const prefix = buildPrefix(opts); // e.g. customers/ACME/quotes/123/drawings/

    // If no customer supplied, scan all customers to find a matching quote folder
    const hasCustomer = !!(opts.customer_name && String(opts.customer_name).trim());
    if (!hasCustomer) {
      const base = this.quoteRoot || this.base;
      let customers = [];
      try { customers = await fs.readdir(base); } catch (e) { customers = []; }
      for (const cust of customers) {
        const probe = this._absPathFor({ customer_name: cust, parent_id: opts.parent_id, subdir: opts.subdir });
        const exists = await fs.stat(probe).then(s => s.isDirectory()).catch(() => false);
        if (exists) { opts.customer_name = cust; break; }
      }
    }

    // Try DB-backed attachments first (if available)
    try {
      if (this.db && typeof this.db.select === 'function') {
        const rows = await this.db.select(
          "select id, label, object_key, content_type, size_bytes, subdir, created_at " +
          "from attachments where parent_type='quote' and parent_id=? " +
          (opts.subdir ? "and subdir=? " : "") +
          "and deleted_at is null order by created_at desc",
          opts.subdir ? [opts.parent_id, opts.subdir] : [opts.parent_id]
        );
        return rows || [];
      }
    } catch (e) {
      // fall through to filesystem scan
    }

    // Filesystem fallback: list files under <quoteRoot>/<customer>/quotes/<quoteNo>/<subdir>/<uuid>/original/<name>
    const baseDir = this._absPathFor({ customer_name: opts.customer_name, parent_id: opts.parent_id, subdir: opts.subdir });
    console.log('[localfs] list dir', { baseDir });

    // pattern 1: <base>/<uuid>/original/<name>
    let uuidDirs = [];
    try { uuidDirs = await fs.readdir(baseDir); } catch { uuidDirs = []; }
    const out = [];

    for (const ud of uuidDirs) {
      const orig = path.join(baseDir, ud, 'original');
      let files = [];
      try { files = await fs.readdir(orig); } catch {}
      for (const name of files) {
        const full = path.join(orig, name);
    const stat = await fs.stat(full).catch(() => null) || {};
        const relKey = path.relative(this.quoteRoot, full).split(path.sep).join('/');
        const base = path.basename(full);
        const nice = base.includes('__') ? base.split('__').slice(-1)[0] : base;

        out.push({
          object_key: relKey,
          label: nice,
          name: base,
          subdir: opts.subdir || "",
          sizeBytes: stat.size || 0,
          relUrl: `/files/${relKey}`,
          createdAt: stat.birthtime?.toISOString?.() || new Date(stat.mtime || Date.now()).toISOString(),
          contentType: undefined
        });
      }
    }

    // pattern 2 (fallback): flat files directly under <base>
  let flatFiles = [];
  try { flatFiles = await fs.readdir(baseDir); } catch {}
    for (const name of flatFiles) {
      if (name === '.' || name === '..') continue;
      const full = path.join(baseDir, name);
  const stat = await fs.stat(full).catch(() => null);
      if (stat && stat.isFile()) {
        const relKey = path.relative(this.quoteRoot, full).split(path.sep).join('/');
        const base = path.basename(full);
        const nice = base.includes('__') ? base.split('__').slice(-1)[0] : base;
        out.push({
          object_key: relKey,
          label: nice,
          name: base,
          subdir: opts.subdir || "",
          sizeBytes: stat.size || 0,
          relUrl: `/files/${relKey}`,
          createdAt: stat.birthtime?.toISOString?.() || new Date(stat.mtime || Date.now()).toISOString(),
          contentType: undefined
        });
      }
    }

    return out;
  }
}

class SupabaseStorageDriver {
  constructor(opts = {}) {
    // accept client via opts.client for testability, else use top-level supabase
    this.client = opts.client || supabase;
    if (!this.client) throw new Error('Supabase not configured');
    this.bucket = opts.bucket || process.env.SUPABASE_BUCKET_UPLOADS || 'blusa-uploads-prod';
    this.supabase = this.client;
  }

  async save({ parent_type, parent_id, customer_name, subdir = 'uploads', originalname, buffer, content_type, uploaded_by }) {
    const safeName = String(originalname || '').replace(/[^^\w.\-]+/g, '_');
    const uuid = crypto.randomUUID ? crypto.randomUUID() : uuidv4();
    const ymd = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const object_key = `customers/${sanitize(customer_name||'Unknown')}/quotes/${sanitize(parent_id)}/${sanitize(subdir)}/${ymd}/${uuid}__${safeName}`;
    // upload
    const res = await this.supabase.storage.from(this.bucket).upload(object_key, buffer, {
      upsert: false,
      contentType: content_type || undefined
    });
    if (res.error) throw res.error;
    const size = buffer.length;
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    // Optionally insert metadata row into Supabase Postgres attachments table.
    if (String(process.env.SUPABASE_INSERT_ATTACHMENTS || '').toLowerCase() === '1' ||
        String(process.env.SUPABASE_INSERT_ATTACHMENTS || '').toLowerCase() === 'true') {
      const insert = await this.supabase.from('attachments').insert([{
        parent_type,
        parent_id,
        label: subdir,
        object_key,
        content_type: content_type || null,
        size_bytes: size,
        sha256,
        uploaded_by: uploaded_by || null
      }]);
      if (insert.error) {
        await this.supabase.storage.from(this.bucket).remove([object_key]).catch(()=>{});
        throw insert.error;
      }
    } else {
      console.warn('[supabase] skipping Postgres attachments insert (SUPABASE_INSERT_ATTACHMENTS not set)');
    }

    return {
      object_key,
      content_type: content_type || 'application/octet-stream',
      size_bytes: size,
      sha256,
      storage: 'supabase',
      filename: originalname
    };
  }

  async signedUrl(object_key, ttl = 60) {
    const { data, error } = await this.supabase.storage.from(this.bucket).createSignedUrl(object_key, ttl);
    if (error) throw error;
    return data.signedUrl;
  }

  // list attachments or storage objects for a given quote/subdir/customer
  async list(opts = {}) {
    const prefix = buildPrefix(opts);
    // Prefer querying attachments table in Postgres if available via Supabase client
    try {
      if (this.supabase && this.supabase.from) {
        let q = this.supabase.from('attachments').select('*').eq('parent_type', 'quote').eq('parent_id', opts.parent_id);
        if (opts.subdir) q = q.eq('label', opts.subdir);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(r => ({
            id: r.id || null,
            label: r.label || '',
            object_key: r.object_key || null,
            content_type: r.content_type || r.mime_type || '',
            size_bytes: r.size_bytes || r.size || 0,
            subdir: r.label || opts.subdir || '',
            created_at: r.created_at || r.createdAt || null
          }));
        }
      }
    } catch (e) {
      // fall through to storage list
    }

    // Storage list fallback
    // We need to recursively traverse folders returned by storage.list, because
    // Supabase may return directory names (e.g. '20250903') at the prefix level.
    const out = [];
    const queue = [prefix];
    while (queue.length) {
      const p = queue.shift();
      const { data, error } = await this.supabase.storage.from(this.bucket).list(p, { limit: 1000, offset: 0, search: '' });
      if (error) throw error;
      console.log('[supabase] list prefix=', p, 'returned', (data||[]).length, 'entries');
      for (const f of (data || [])) {
        // debug small-entry preview
        if (f && f.name) console.log('[supabase] entry:', { name: f.name, size: f.size, meta: f.metadata ? Object.keys(f.metadata) : undefined });
  // Heuristic: treat as folder only when neither size nor metadata.size/contentLength exist.
  const hasSize = (typeof f.size !== 'undefined' && f.size !== null) || (f.metadata && (f.metadata.size || f.metadata.contentLength || f.metadata.contentLength === 0));
  const isFolder = !hasSize && !(f.name || '').endsWith('/');
        if (isFolder) {
          // push the deeper prefix (ensure trailing slash)
          const next = p + f.name + (f.name.endsWith('/') ? '' : '/');
          queue.push(next);
          continue;
        }
        out.push({
          id: null,
          label: f.name,
          object_key: p + f.name,
          content_type: (f.metadata && f.metadata.mimetype) || '',
          size_bytes: (f.metadata && f.metadata.size) || f.size || 0,
          subdir: opts.subdir || '',
          created_at: f.created_at || null
        });
      }
    }
    return out;
  }
}

function sanitize(s) {
  return String(s || '').replace(/[\\/:*?"<>|]/g, '_');
}

// Build a canonical prefix for storage keys:
function buildPrefix({ customer_name, parent_id, subdir } = {}) {
  // customers/<Customer>/quotes/<QuoteNo>/<subdir>/
  const c = (customer_name || "Unknown").toString();
  const q = (parent_id || "").toString();
  const s = (subdir || "uploads").toString();
  return `customers/${sanitize(c)}/quotes/${sanitize(q)}/${sanitize(s)}/`;
}

export function createFileService() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY;
  const bucket = process.env.SUPABASE_BUCKET_UPLOADS || 'blusa-uploads-prod';

  if (url && key && supabase) {
    console.log('[files] driver=SupabaseStorageDriver bucket=', bucket);
    return new SupabaseStorageDriver({ client: supabase, bucket });
  }

  // Fallback to LocalFsDriver so the rest of the app remains usable in dev
  const quoteRoot = path.resolve(process.cwd(), 'data', 'quotes');
  try { fsSync.mkdirSync(quoteRoot, { recursive: true }); } catch (e) { /* ignore */ }
  console.warn('[files] driver=LocalFsDriver (Supabase not configured); quoteRoot=', quoteRoot);
  return new LocalFsDriver({ quoteRoot });
}

// Named exports for direct driver usage (dual-write scenarios)
export { LocalFsDriver, SupabaseStorageDriver };

export default { createFileService, LocalFsDriver, SupabaseStorageDriver };
