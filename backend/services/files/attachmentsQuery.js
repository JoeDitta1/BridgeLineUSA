import { db } from '../../src/db.js';
import { createFileService } from '../../src/fileService.js';

export async function getQuoteAttachmentsWithSignedUrls(quoteId, { ttl = 600 } = {}) {
  // attachments table may use parent_type/parent_id in Postgres or quote_id in sqlite
  let rows = [];
  try {
    // try sqlite-style column first
    rows = db.prepare('SELECT * FROM attachments WHERE quote_id = ? ORDER BY created_at DESC').all(quoteId) || [];
  } catch (e) {
    // fallback: parent_type/parent_id
    try {
      rows = db.prepare('SELECT * FROM attachments WHERE parent_type = ? AND parent_id = ? ORDER BY created_at DESC').all('quote', quoteId) || [];
    } catch (_) {
      rows = [];
    }
  }

  const fs = createFileService();
  const attachments = await Promise.all(rows.map(async (r) => {
    let signed_url = null;
    try {
      const s = await fs.signedUrl?.(r.object_key || r.storage_key, ttl);
      signed_url = s?.url || null;
    } catch (e) { signed_url = null; }
    return { ...r, signed_url };
  }));

  return { attachments };
}
