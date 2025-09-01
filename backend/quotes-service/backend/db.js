import { Database } from 'sqlite3';
import { open } from 'sqlite';

const dbPromise = open({
  filename: './database.sqlite',
  driver: Database
});

export const db = dbPromise;