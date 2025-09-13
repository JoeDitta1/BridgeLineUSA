const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const slug = (s = '') =>
  String(s)
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

const VAULT_ROOT = path.resolve(__dirname, '..', 'backend', 'data', 'quotes');
const legacyRoot = path.resolve(__dirname, '..', 'backend', 'src', 'data', 'quotes');
const quoteNo = 'SCM-Q0029';
const row = { customer_name: 'Hot Dog', description: 'Standard Pipe', rev: 0 };
const expectedFolderName = row.rev > 1 ? `${quoteNo}-${slug(row.description)}-rev-${row.rev}` : `${quoteNo}-${slug(row.description)}`;

(async () => {
  console.log('expectedFolderName', expectedFolderName);
  console.log('canonicalRoot', VAULT_ROOT);
  try {
    const rootEntries = await fsp.readdir(VAULT_ROOT).catch(() => []);
    console.log('canonical root entries sample', rootEntries.slice(0, 20));
    const candidates = [row.customer_name, slug(row.customer_name)];
    for (const c of candidates) {
      const p = path.join(VAULT_ROOT, c, expectedFolderName);
      if (fs.existsSync(p)) console.log('found canonical path', p);
      const customerDir = path.join(VAULT_ROOT, c);
      const entries = await fsp.readdir(customerDir).catch(() => []);
      const match = entries.find((d) => String(d).toLowerCase().startsWith(quoteNo.toLowerCase()));
      if (match) console.log('scan match:', match, 'under', customerDir);
    }
  } catch (e) {
    console.error('canonical scan error', e);
  }

  console.log('legacyRoot', legacyRoot);
  try {
    const legacyEntries = await fsp.readdir(legacyRoot).catch(() => []);
    console.log('legacy entries sample', legacyEntries.slice(0, 20));
    const candidates = [row.customer_name, slug(row.customer_name)];
    for (const c of candidates) {
      const p = path.join(legacyRoot, c, expectedFolderName);
      if (fs.existsSync(p)) console.log('found legacy path', p);
      const customerDir = path.join(legacyRoot, c);
      const entries = await fsp.readdir(customerDir).catch(() => []);
      const match = entries.find((d) => String(d).toLowerCase().startsWith(quoteNo.toLowerCase()));
      if (match) console.log('legacy scan match:', match, 'under', customerDir);
    }
  } catch (e) {
    console.error('legacy scan error', e);
  }
})();
