import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const CFG_PATH = path.resolve(process.cwd(), 'config', 'dev-db.json');

async function loadCfg() {
  try {
    const txt = await fs.readFile(CFG_PATH, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    console.error('Failed to load config/dev-db.json:', e && e.message ? e.message : e);
    process.exit(2);
  }
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function main() {
  const cfg = await loadCfg();
  const devDb = path.resolve(process.cwd(), cfg.devDb || './backend/data/blu_main.sqlite');
  const backupsDir = path.resolve(process.cwd(), cfg.backupsDir || './backend/data/dev_db_backups');

  if (!existsSync(devDb)) {
    console.error('Dev DB not found:', devDb);
    process.exit(3);
  }

  await fs.mkdir(backupsDir, { recursive: true });
  const name = `blu_main.${stamp()}.sqlite`;
  const dest = path.join(backupsDir, name);
  await fs.copyFile(devDb, dest);
  console.log(`Backed up: ${devDb} -> ${dest}`);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node scripts/backup-db.js');
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}` || typeof process !== 'undefined') {
  main().catch((e) => {
    console.error('Backup failed:', e && e.stack ? e.stack : e);
    process.exit(1);
  });
}
