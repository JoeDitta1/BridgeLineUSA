// backend/src/lib/quoteFolders.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getQuotesRoot = () => {
  // Resolve relative to the backend folder (repo/.../backend) so this
  // matches src/index.js and the routes which expect backend/data/quotes.
  const BACKEND_ROOT = path.resolve(__dirname, '..', '..');
  const env = process.env.QUOTE_VAULT_ROOT || process.env.QUOTE_ROOT;
  if (!env) return path.resolve(BACKEND_ROOT, 'data', 'quotes');
  return path.isAbsolute(env) ? env : path.resolve(BACKEND_ROOT, env);
};

const safeFolderName = (s) =>
  String(s || '')
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim();

export { safeFolderName };

export async function ensureQuoteFolders({ customerName, quoteNo, description }) {
  const ROOT = getQuotesRoot();
  const customerDir = path.join(ROOT, safeFolderName(customerName));
  const quoteDirName = `${safeFolderName(quoteNo)}-${safeFolderName(description)}`.replace(/-$/, '');
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
  const from = path.join(ROOT, safeFolderName(customerName), quoteFolderName);
  const archived = path.join(ROOT, safeFolderName(customerName), '_archived');
  await fs.mkdir(archived, { recursive: true });
  const to = path.join(archived, quoteFolderName);
  await fs.rename(from, to);
  return { archivedPath: to };
}
