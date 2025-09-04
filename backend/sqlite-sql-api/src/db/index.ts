import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { join } from 'path';
import { promises as fs } from 'fs';

const DB_FILE = join(__dirname, 'database.db');

export async function initializeDatabase() {
  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });

  const migrationSQL = await fs.readFile(join(__dirname, '../../migrations/sqlite/024_create_api_keys.sql'), 'utf8');
  await db.exec(migrationSQL);

  return db;
}