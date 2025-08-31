import { default as dbModule } from '../../src/db.js';
const db = dbModule.default ?? dbModule.db ?? dbModule;
import { createFileService } from '../../src/fileService.js';

export async function getQuoteAttachmentsWithSignedUrls(quoteId, { ttl = 600 } = {}) {
  // attachments table uses parent_type/parent_id
  const rows = db.prepare(`SELECT * FROM attachments WHERE parent_type = ? AND parent_id = ? ORDER BY created_at DESC`).all('quote', quoteId) || [];
  const fs = createFileService();
  const attachments = await Promise.all(rows.map(async (r) => {
    const signed = await fs.signedUrl?.(r.object_key, ttl).catch?.(() => ({ url: null })) || { url: null };
    return { ...r, signed_url: signed.url || null };
  }));
  return { attachments };
}

export default { getQuoteAttachmentsWithSignedUrls };
