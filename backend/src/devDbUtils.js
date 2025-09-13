import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const CFG_PATH = path.resolve(process.cwd(), 'config', 'dev-db.json');

export function loadDevCfg() {
  try {
    const txt = fs.readFileSync(CFG_PATH, 'utf8');
    return JSON.parse(txt);
  } catch (e) {
    throw new Error(`Failed to load ${CFG_PATH}: ${e && e.message ? e.message : e}`);
  }
}

export function devDbPath() {
  const cfg = loadDevCfg();
  return path.resolve(process.cwd(), cfg.devDb || './backend/data/blu_main.sqlite');
}

export function backupDevDbSync(targetDir) {
  const cfg = loadDevCfg();
  const dev = devDbPath();
  const backups = path.resolve(process.cwd(), targetDir || cfg.backupsDir || './backend/data/dev_db_backups');
  if (!fs.existsSync(dev)) throw new Error('Dev DB not found: ' + dev);
  fs.mkdirSync(backups, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(backups, `blu_main.${ts}.sqlite`);
  fs.copyFileSync(dev, dest);
  return dest;
}

export function openDevAsAttached(alias = 'dev') {
  const cfg = loadDevCfg();
  const main = path.resolve(process.cwd(), cfg.mainDb || './backend/data/app.db');
  const dev = path.resolve(process.cwd(), cfg.devDb || './backend/data/blu_main.sqlite');
  if (!fs.existsSync(main)) throw new Error('Main DB not found: ' + main);
  if (!fs.existsSync(dev)) throw new Error('Dev DB not found: ' + dev);
  const d = new Database(main);
  d.exec(`ATTACH DATABASE '${dev.replace(/'/g, "''")}' AS ${alias};`);
  return { db: d, devPath: dev };
}

export function detachAndClose(attached, alias = 'dev') {
  if (!attached || !attached.db) return;
  try {
    attached.db.exec(`DETACH DATABASE ${alias};`);
  } catch (e) {}
  try { attached.db.close(); } catch (e) {}
}
