import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'app.db');

const db = new Database(DB_PATH);

try {
  const tables = db.prepare('SELECT name FROM sqlite_master WHERE type = ?').all('table');
  console.log('Existing tables:');
  tables.forEach(t => console.log(' -', t.name));
  
  console.log('\nChecking for specific tables:');
  const checkTable = db.prepare('SELECT name FROM sqlite_master WHERE type = ? AND name = ?');
  
  const filesExists = checkTable.get('table', 'files');
  const kvStoreExists = checkTable.get('table', 'kv_store');
  
  console.log(` - files table: ${filesExists ? 'EXISTS' : 'MISSING'}`);
  console.log(` - kv_store table: ${kvStoreExists ? 'EXISTS' : 'MISSING'}`);
  
} catch (e) {
  console.error('Error:', e.message);
} finally {
  db.close();
}
