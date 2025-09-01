import * as dbModule from '../../src/db.js';
import fileServiceFactory from '../../src/fileService.js';
const db = dbModule.default ?? dbModule.db ?? dbModule;
const fileService = fileServiceFactory.createFileService();

// Wrapper to canonical attachments helper to avoid duplicate symbol exports.
import { getQuoteAttachmentsWithSignedUrls as _getQuoteAttachmentsWithSignedUrls } from '../files/attachmentsQuery.js';

export async function getQuoteAttachmentsForAI(quoteId, opts = {}) {
  // Reuse the canonical implementation and return its result. Named differently to avoid duplicate export name.
  return _getQuoteAttachmentsWithSignedUrls(quoteId, opts);
}
  return { attachments };
