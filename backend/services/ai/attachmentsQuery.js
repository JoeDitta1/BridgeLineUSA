import * as dbModule from '../../src/db.js';
import fileServiceFactory from '../../src/fileService.js';
const db = dbModule.default ?? dbModule.db ?? dbModule;
const fileService = fileServiceFactory.createFileService();

export async function getQuoteAttachmentsWithSignedUrls(quoteId, { ttl = 60 } = {}) {
  const rows = db.prepare('SELECT * FROM attachments WHERE parent_type = ? AND parent_id = ? ORDER BY created_at DESC').all('quote', quoteId) || [];
  const attachments = [];
  for (const r of rows) {
    const signed = await fileService.signedUrl(r.object_key, ttl).catch(() => ({ url: null }));
    attachments.push({ id: r.id, filename: (r.object_key || '').split('/').slice(-1)[0], label: r.label, path: r.object_key, mime_type: r.content_type, size: r.size_bytes, signedUrl: signed.url });
  }
  return { attachments };
}
