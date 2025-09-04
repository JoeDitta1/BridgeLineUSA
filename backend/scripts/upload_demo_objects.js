import fs from 'fs';
import path from 'path';
import { supabase } from '../lib/supabaseClient.js';

if (!supabase) {
  console.error('Supabase client not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local and restart.');
  process.exit(1);
}

const BUCKET = process.env.SUPABASE_BUCKET_UPLOADS || 'blusa-uploads-prod';

const originalPath = 'customers/ACME/quotes/SCM-Q-0001/drawings/12345678/original/assy.pdf';
const previewPath = 'customers/ACME/quotes/SCM-Q-0001/drawings/12345678/previews/256.webp';

// small placeholder binary contents
const pdfPlaceholder = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 55 >>\nstream\nBT /F1 24 Tf 72 120 Td (Demo PDF) Tj ET\nendstream\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
const webpPlaceholder = Buffer.from([0x52,0x49,0x46,0x46,0x26,0x00,0x00,0x00,0x57,0x45,0x42,0x50]); // small RIFF header placeholder

async function upload(buffer, key, contentType) {
  console.log('Uploading', key, '-> bucket', BUCKET);
  const { data, error } = await supabase.storage.from(BUCKET).upload(key, buffer, { contentType, upsert: true });
  if (error) {
    console.error('Upload error for', key, error.message || error);
    return false;
  }
  console.log('Uploaded', key);
  return true;
}

(async function main(){
  try {
    const ok1 = await upload(pdfPlaceholder, originalPath, 'application/pdf');
    const ok2 = await upload(webpPlaceholder, previewPath, 'image/webp');

    // list objects under the demo folder to confirm
    const listPrefix = 'customers/ACME/quotes/SCM-Q-0001/drawings/12345678/';
    const { data: listData, error: listErr } = await supabase.storage.from(BUCKET).list('customers/ACME/quotes/SCM-Q-0001/drawings/12345678', { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });
    if (listErr) {
      console.warn('List error:', listErr.message || listErr);
    } else {
      console.log('Bucket listing under', listPrefix);
      for (const item of listData) {
        console.log('-', item.name, item.metadata?.mimetype || '(no mime)');
      }
    }

    if (!ok1 || !ok2) process.exit(1);
    console.log('Demo upload complete.');
  } catch (e) {
    console.error('Upload failed:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
