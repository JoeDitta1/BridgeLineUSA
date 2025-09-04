import express from 'express';
import { supabase } from '../../lib/supabaseClient.js';
import { db } from '../db.js';

const router = express.Router();
const BUCKET = process.env.SUPABASE_BUCKET_UPLOADS || 'blusa-uploads-prod';

async function signPath(path, expires = 90) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expires);
    if (error) {
      console.warn('[files] sign error', error.message, path);
      return null;
    }
    return data?.signedUrl || null;
  } catch (e) {
    console.warn('[files] sign exception', e && e.message ? e.message : e);
    return null;
  }
}

/** GET /api/files/quote/:quoteId */
router.get('/quote/:quoteId', async (req, res) => {
  try {
    let quoteIdParam = req.params.quoteId;

    // Allow callers to pass either the numeric quote_id or the human quote_no (like SCM-Q-0001).
    // If a non-numeric value is provided, resolve it to the numeric id via the quotes table.
    let quoteId = null;
    if (/^\d+$/.test(String(quoteIdParam))) {
      quoteId = Number(quoteIdParam);
    } else {
      const q = db.prepare('SELECT id FROM quotes WHERE quote_no = ?').get(quoteIdParam);
      if (!q) return res.json({ ok: true, files: [] });
      quoteId = q.id;
    }

    // Query to select latest version per file for this quote
    const rows = db.prepare(`
      SELECT f.id as file_id, f.quote_id, f.kind, f.title,
             fv.id as version_id, fv.object_key, fv.mime_type, fv.ext, fv.size_bytes, fv.sha256
      FROM files f
      LEFT JOIN file_versions fv ON fv.id = (
        SELECT id FROM file_versions vv WHERE vv.file_id = f.id ORDER BY datetime(created_at) DESC LIMIT 1
      )
      WHERE f.quote_id = ?
    `).all(quoteId);

    if (!rows || rows.length === 0) return res.json({ ok: true, files: [] });

    // Fetch previews for these versions
    const versionIds = rows.map(r => r.version_id).filter(Boolean);
    let previewsByVersion = {};
    if (versionIds.length && supabase) {
      const placeholders = versionIds.map(()=>'?').join(',');
      const pRows = db.prepare(`SELECT * FROM file_previews WHERE file_version_id IN (${placeholders})`).all(...versionIds);
      previewsByVersion = pRows.reduce((acc, p) => { (acc[p.file_version_id] ||= []).push(p); return acc; }, {});
    }

    const baseForUrls = process.env.EXTERNAL_API_BASE || null;
    const files = await Promise.all(rows.map(async (r) => {
      // Try to sign the exact object_key stored in the DB. Do not transform the key.
      const originalSigned = r.object_key ? await signPath(r.object_key) : null;
      // Fallback to serving via the backend's /files handler so callers always get a usable URL
      const originalFallback = r.object_key ? (baseForUrls ? new URL(`/files/${r.object_key}`, baseForUrls).href : `/files/${r.object_key}`) : null;
      const pv = (previewsByVersion[r.version_id] || []).sort((a,b)=>String(a.size_key).localeCompare(String(b.size_key)));
      const previews = await Promise.all(pv.map(async p => {
        const signed = await signPath(p.object_key).catch(()=>null);
        const fallback = p.object_key ? (baseForUrls ? new URL(`/files/${p.object_key}`, baseForUrls).href : `/files/${p.object_key}`) : null;
        return { id: p.id, size_key: p.size_key, width_px: p.width_px, height_px: p.height_px, url: signed || fallback };
      }));
      return {
        file_id: r.file_id,
        quote_id: r.quote_id,
        kind: r.kind,
        title: r.title,
        version_id: r.version_id,
        mime_type: r.mime_type,
        ext: r.ext,
        size_bytes: r.size_bytes,
        original_url: originalSigned || originalFallback,
        previews
      };
    }));

    res.json({ ok: true, files });
  } catch (e) {
    console.error('[files:list] exception', e && e.stack ? e.stack : e);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

export default router;
