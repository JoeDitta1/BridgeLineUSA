import { getQuoteAttachmentsWithSignedUrls } from './attachmentsQuery.js';

export async function loadTextForQuote(quoteId, { limit = 5 } = {}) {
  // Minimal MVP: return filename/label/path/mime as text snippets for the LLM prompt
  const { attachments } = await getQuoteAttachmentsWithSignedUrls(quoteId);
  const take = (attachments || []).slice(0, limit);
  const snippets = take.map((a) => [
    `FILE: ${a.filename}`,
    `LABEL: ${a.label}`,
    `PATH: ${a.path}`,
    `MIME: ${a.mime_type || 'unknown'}`
  ].join('\n'));
  return snippets;
}
