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
    const filename = `${uuidv4()}${ext}`;
    const destDir = path.join(this.base, sanitize(customer_name || 'unknown'), sanitize(parent_id), sanitize(subdir));
    await fs.mkdir(destDir, { recursive: true });
    const fullPath = path.join(destDir, filename);
    await fs.writeFile(fullPath, buffer);
    const size = buffer.length;
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const object_key = path.relative(this.base, fullPath).replaceAll('\\', '/');
    const relUrl = `/files/${encodeURIComponent(sanitize(customer_name))}/${encodeURIComponent(sanitize(parent_id))}/${encodeURIComponent(sanitize(subdir))}/${encodeURIComponent(filename)}`;
    const base = process.env.EXTERNAL_API_BASE || null;
    return {
      object_key,
      content_type: content_type || 'application/octet-stream',
      size_bytes: size,
      sha256,
      storage: 'local',
      filename,
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
    this.bucket = opts.bucket || 'attachments';
    this.supabase = supabase;
  }

  async save({ parent_type, parent_id, customer_name, subdir = 'uploads', originalname, buffer, content_type, uploaded_by }) {
    const ext = path.extname(originalname || '') || '';
    const filename = `${uuidv4()}${ext}`;
    const object_key = `quotes/${parent_id}/${subdir}/${filename}`;
    // upload
    const res = await this.supabase.storage.from(this.bucket).upload(object_key, buffer, {
      upsert: false,
      contentType: content_type || undefined
    });
    if (res.error) throw res.error;
    const size = buffer.length;
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    // insert metadata row into Postgres via Supabase client
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
      // attempt to clean up uploaded object
      await this.supabase.storage.from(this.bucket).remove([object_key]).catch(()=>{});
      throw insert.error;
    }

    return {
      object_key,
      content_type: content_type || 'application/octet-stream',
      size_bytes: size,
      sha256,
      storage: 'supabase',
      filename
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

export default { createFileService };
