// backend/db_pg.js — Supabase Postgres client (safe, separate from SQLite)
import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required by Supabase
});

// Simple helper: run a query and return rows
export async function q(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

// Optional helper (we’ll use later for tenant-scoped queries via user profile)
export async function one(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}
