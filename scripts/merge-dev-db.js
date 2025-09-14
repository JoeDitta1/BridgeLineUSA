import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const CFG_PATH = path.resolve(process.cwd(), 'config', 'dev-db.json');

function loadCfg() {
  if (!fs.existsSync(CFG_PATH)) throw new Error('config/dev-db.json not found');
  return JSON.parse(fs.readFileSync(CFG_PATH, 'utf8'));
}

function safeQuote(s) {
  return `"${String(s).replace(/"/g, '""')}"`;
}

function tableExists(db, schema, table) {
  const row = db.prepare(`SELECT count(1) as cnt FROM ${schema}.sqlite_master WHERE type='table' AND name = ?`).get(table);
  return row && row.cnt > 0;
}

function mergeTable(db, table) {
  const q1 = `INSERT OR IGNORE INTO main.${table} SELECT * FROM dev.${table};`;
  const q2 = `INSERT OR REPLACE INTO main.${table} SELECT * FROM dev.${table};`;
  db.exec('BEGIN');
  try {
    db.exec(q1);
    db.exec(q2);
    db.exec('COMMIT');
    console.log(`Merged table: ${table}`);
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

function attachDev(db, devPath) {
  db.exec(`ATTACH DATABASE '${devPath.replace(/'/g, "''")}' AS dev;`);
}

function detachDev(db) {
  db.exec('DETACH DATABASE dev;');
}

function backupBeforeMerge(cfg) {
  const main = path.resolve(process.cwd(), cfg.mainDb);
  if (!fs.existsSync(main)) {
    console.warn('Main DB does not exist, skipping main backup:', main);
    return;
  }
  const backupsDir = path.resolve(process.cwd(), cfg.backupsDir || './backend/data/dev_db_backups');
  fs.mkdirSync(backupsDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(backupsDir, `app.db.before-merge.${ts}.sqlite`);
  fs.copyFileSync(main, dest);
  console.log('Backed up main DB ->', dest);
}

function main() {
  const cfg = loadCfg();
  const mainDb = path.resolve(process.cwd(), cfg.mainDb || './backend/data/app.db');
  const devDb = path.resolve(process.cwd(), cfg.devDb || './backend/data/blu_main.sqlite');

  if (!fs.existsSync(devDb)) throw new Error(`Dev DB missing: ${devDb}`);
  if (!fs.existsSync(mainDb)) throw new Error(`Main DB missing: ${mainDb}`);

  backupBeforeMerge(cfg);

  const db = new Database(mainDb);
  try {
    attachDev(db, devDb);

    const tables = Array.isArray(cfg.tables) && cfg.tables.length ? cfg.tables : [
      'materials',
      'material_families',
      'material_specs',
      'material_sizes',
      'parts',
      'price_history',
      'settings',
      'equipment',
      'equipment_docs'
    ];

    for (const t of tables) {
      const devHas = tableExists(db, 'dev', t);
      const mainHas = tableExists(db, 'main', t);
      if (!devHas) {
        console.warn(`dev.${t} does not exist — skipping`);
        continue;
      }
      if (!mainHas) {
        console.warn(`main.${t} does not exist — creating table by copying schema from dev`);
        const row = db.prepare(`SELECT sql FROM dev.sqlite_master WHERE type='table' AND name = ?`).get(t);
        if (row && row.sql) {
          db.exec(row.sql.replace(new RegExp(`CREATE TABLE\\s+${t}`, 'i'), `CREATE TABLE IF NOT EXISTS ${t}`));
        } else {
          console.warn(`Could not find CREATE for ${t}, skipping`);
          continue;
        }
      }
      mergeTable(db, t);
    }

    detachDev(db);
    db.close();
    console.log('Merge complete. Inspect backups and run tests.');
  } catch (e) {
    try { detachDev(db); } catch (er) {}
    try { db.close(); } catch (er) {}
    console.error('Merge failed:', e && e.stack ? e.stack : e);
    process.exit(1);
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node scripts/merge-dev-db.js');
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}` || typeof process !== 'undefined') {
  main();
}
