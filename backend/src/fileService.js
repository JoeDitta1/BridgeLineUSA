import path from 'path';
import fs from 'fs/promises';
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
  }

  async save({ parent_type, parent_id, customer_name, subdir = 'uploads', originalname, buffer, content_type, uploaded_by }) {
    const ext = path.extname(originalname || '') || '';
    const file_uuid = uuidv4();
    const canonical_dir = path.join(this.base, 'customers', sanitize(customer_name), 'quotes', sanitize(parent_id), sanitize(subdir), file_uuid, 'original');
    await fs.mkdir(canonical_dir, { recursive: true });
    const fullPath = path.join(canonical_dir, originalname);
    await fs.writeFile(fullPath, buffer);
    const size = buffer.length;
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const object_key = `customers/${sanitize(customer_name)}/quotes/${sanitize(parent_id)}/${sanitize(subdir)}/${file_uuid}/original/${originalname}`;
    const relUrl = `/files/${object_key}`;
    const base = process.env.EXTERNAL_API_BASE || null;
    return {
      object_key,
      content_type: content_type || 'application/octet-stream',
      size_bytes: size,
      sha256,
      storage: 'local',
      filename: originalname,
      url: base ? new URL(relUrl, base).href : relUrl
    };
  }

  // generate a download URL (local: direct file path served by express static)
  async signedUrl(object_key, ttl = 60) {
  const rel = `/files/${object_key}`;
  const base = process.env.EXTERNAL_API_BASE || null;
  return { url: base ? new URL(rel, base).href : rel };
  }
}

class SupabaseStorageDriver {
  constructor(opts = {}) {
  if (!supabase) throw new Error('Supabase not configured');
  this.bucket = opts.bucket || process.env.SUPABASE_BUCKET_UPLOADS || 'blusa-uploads-prod';
    this.supabase = supabase;
  }

  async save({ parent_type, parent_id, customer_name, subdir = 'uploads', originalname, buffer, content_type, uploaded_by }) {
    const ext = path.extname(originalname || '') || '';
    const file_uuid = uuidv4();
    const object_key = `customers/${sanitize(customer_name)}/quotes/${sanitize(parent_id)}/${sanitize(subdir)}/${file_uuid}/original/${originalname}`;
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
    return { url: data.signedUrl };
  }
}

function sanitize(s) {
  return String(s || '').replace(/[\\/:*?"<>|]/g, '_');
}

export function createFileService() {
  if (USE_SUPABASE) return new SupabaseStorageDriver({});
  return new LocalFsDriver({});
}

// Named exports for direct driver usage (dual-write scenarios)
export { LocalFsDriver, SupabaseStorageDriver };

export default { createFileService, LocalFsDriver, SupabaseStorageDriver };
