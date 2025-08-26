import fs from "fs/promises";
import path from "path";

const VAULT_ROOT = (() => {
  const v = process.env.QUOTE_VAULT_ROOT || process.env.QUOTE_ROOT || "./data/quotes";
  return path.resolve(process.cwd(), v);
})();

const slug = s => s.toString().normalize("NFKD").replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-").replace(/-+/g,"-").toLowerCase();
const ensureDir = p => fs.mkdir(p, { recursive: true });

async function listDirs(p) {
  try { return (await fs.readdir(p, { withFileTypes: true })).filter(d=>d.isDirectory()).map(d=>d.name); }
  catch { return []; }
}

export async function createQuoteFolders({ customerName, quoteNo, description }) {
  const customerSafe = slug(customerName) || "unknown";
  const baseName = `${quoteNo}-${slug(description)}`;
  const customerDir = path.join(VAULT_ROOT, customerSafe);
  await ensureDir(customerDir);

  const dirs = await listDirs(customerDir);
  const matches = dirs.filter(d => d.startsWith(baseName));
  let rev = 1;
  for (const d of matches) {
    const m = d.match(/rev-(\d+)$/i);
    if (m) rev = Math.max(rev, Number(m[1]) + 1);
    else rev = Math.max(rev, 2);
  }
  const revSuffix = rev > 1 ? `-rev-${rev}` : "";
  const quoteFolderName = `${baseName}${revSuffix}`;
  const quoteDir = path.join(customerDir, quoteFolderName);

  await ensureDir(quoteDir);
  for (const sf of ["Quote Form","Vendor Quotes","Drawings","Customer Info","Related Files"]) {
    await ensureDir(path.join(quoteDir, sf));
  }
  return { customerDir, quoteDir, quoteFolderName, revision: rev };
}

export async function archiveQuoteFolder(customerName, quoteFolderName) {
  const customerSafe = slug(customerName) || "unknown";
  const from = path.join(VAULT_ROOT, customerSafe, quoteFolderName);
  const archived = path.join(VAULT_ROOT, customerSafe, "_archived");
  await ensureDir(archived);
  const to = path.join(archived, quoteFolderName);
  await fs.rename(from, to);
  return { archivedPath: to };
}
