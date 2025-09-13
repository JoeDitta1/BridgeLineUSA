import fs from 'fs/promises';
import path from 'path';
import { safeFolderName } from './quoteFolders.js';

const slug = (s) =>
  String(s || '')
    .replace(/[\\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const getSalesOrdersRoot = () => {
  const env = process.env.SALES_ORDERS_ROOT || process.env.QUOTE_VAULT_ROOT || process.env.QUOTE_ROOT;
  return path.resolve(env || path.join(process.cwd(), 'backend', 'data', 'sales_orders'));
};

export async function ensureSalesOrderFolders({ customerName, orderNo, description }) {
  if (!customerName || !orderNo) throw new Error('customerName and orderNo required');
  const ROOT = getSalesOrdersRoot();
  const customerDir = path.join(ROOT, safeFolderName(customerName));
  const orderDirName = `${slug(orderNo)}-${slug(description || '')}`.replace(/-$/, '');
  const orderDir = path.join(customerDir, orderDirName || slug(orderNo));

  const toMake = [
    customerDir,
    orderDir,
    path.join(orderDir, 'Order Form'),
    path.join(orderDir, 'Production'),
    path.join(orderDir, 'Vendor Quotes'),
    path.join(orderDir, 'Drawings'),
    path.join(orderDir, 'Customer Notes'),
    path.join(orderDir, 'Exports'),
  ];

  for (const d of toMake) {
    try { await fs.mkdir(d, { recursive: true }); } catch (e) { /* noop */ }
  }

  return { root: ROOT, customerDir, orderDir, folderName: orderDirName };
}

export async function archiveSalesOrderFolder(customerName, orderFolderName) {
  const ROOT = getSalesOrdersRoot();
  const from = path.join(ROOT, safeFolderName(customerName), orderFolderName);
  const archived = path.join(ROOT, safeFolderName(customerName), '_archived');
  await fs.mkdir(archived, { recursive: true });
  const to = path.join(archived, orderFolderName);
  await fs.rename(from, to);
  return { archivedPath: to };
}
