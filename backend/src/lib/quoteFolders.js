// backend/src/lib/quoteFolders.js
import fs from 'fs/promises';
import path from 'path';

export const getQuotesRoot = () => {
  // Prefer explicit env vars. If none provided, resolve against the current
  // working directory (which is the backend folder when the server is started
  // from the backend). Avoid hard-coding an extra 'backend' path segment which
  // can lead to duplicated paths when process.cwd() is already the backend.
  const env = process.env.QUOTE_VAULT_ROOT || process.env.QUOTE_ROOT;
  if (env) return path.resolve(env);
  return path.resolve(process.cwd(), './data/quotes');
};

const slug = (s) =>
  String(s || '')
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export async function ensureQuoteFolders({ customerName, quoteNo, description }) {
  const ROOT = getQuotesRoot();
  const customerDir = path.join(ROOT, slug(customerName));
  const quoteDirName = `${slug(quoteNo)}-${slug(description)}`.replace(/-$/, '');
  const quoteDir = path.join(customerDir, quoteDirName);

  const toMake = [
    customerDir,
    quoteDir,
    path.join(quoteDir, 'Quote Form'),
    path.join(quoteDir, 'Drawings'),
    path.join(quoteDir, 'Vendor Quotes'),
    path.join(quoteDir, 'Quality Info'),
    path.join(quoteDir, 'Customer Notes'),
    path.join(quoteDir, 'Photos'),
    path.join(quoteDir, 'Exports'),
    path.join(quoteDir, 'Internal Notes'),
    path.join(quoteDir, 'Change Orders'),
    path.join(quoteDir, 'Uploads'),
  ];
  for (const d of toMake) await fs.mkdir(d, { recursive: true });

  return { root: ROOT, customerDir, quoteDir };
}

export async function archiveQuoteFolder(customerName, quoteFolderName) {
  const ROOT = getQuotesRoot();
  const from = path.join(ROOT, slug(customerName), quoteFolderName);
  const archived = path.join(ROOT, slug(customerName), '_archived');
  await fs.mkdir(archived, { recursive: true });
  const to = path.join(archived, quoteFolderName);
  await fs.rename(from, to);
  return { archivedPath: to };
}
