import { getQuoteAttachmentsWithSignedUrls } from '../files/attachmentsQuery.js';

export async function loadTextForQuote(quoteId, { limit = 5 } = {}) {
  const { attachments } = await getQuoteAttachmentsWithSignedUrls(quoteId);
  const take = attachments.slice(0, limit);
  return take.map(a => [
    `FILE: ${a.filename}`,
    `LABEL: ${a.label}`,
    `PATH: ${a.path}`,
    `MIME: ${a.mime_type || 'unknown'}`
  ].join('\n'));
}