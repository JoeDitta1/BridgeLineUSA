// src/index.js
import express from 'express';
import cors from 'cors';
import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import quoteFilesRoute from './routes/quoteFilesRoute.js';

import uploadRoute from './uploadRoute.js';
import materialsRoute from './materialsRoute.js';
import quotesRoute from './routes/quotesRoute.js';
import settingsRoute from './routes/settingsRoute.js';
import * as dbModule from './db.js';

// --- ES module __dirname shim ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure DB export compatibility
const db = dbModule.default ?? dbModule.db ?? dbModule;

const app = express();
const PORT = process.env.PORT || 4000;

/** --- Idempotent migrations --- */
db.exec?.(`
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_no TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  description TEXT,
  requested_by TEXT,
  estimator TEXT,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  sales_order_no TEXT,
  rev INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_name);
`);

function ensureColumn(table, col, typeDefault) {
  const cols = db.prepare?.(`PRAGMA table_info(${table})`)?.all?.() ?? [];
  const exists = cols.some(c => c.name === col);
  if (!exists) db.exec?.(`ALTER TABLE ${table} ADD COLUMN ${col} ${typeDefault}`);
}
ensureColumn('quotes', 'description', 'TEXT');
ensureColumn('quotes', 'requested_by', 'TEXT');
ensureColumn('quotes', 'estimator', 'TEXT');
ensureColumn('quotes', 'rev', 'INTEGER NOT NULL DEFAULT 0');

db.exec?.(`
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  org_prefix TEXT NOT NULL DEFAULT 'SCM',
  system_abbr TEXT,
  quote_series TEXT NOT NULL DEFAULT 'Q',
  quote_pad INTEGER NOT NULL DEFAULT 4,
  next_quote_seq INTEGER NOT NULL DEFAULT 1,
  sales_series TEXT NOT NULL DEFAULT 'S',
  sales_pad INTEGER NOT NULL DEFAULT 3,
  next_sales_seq INTEGER NOT NULL DEFAULT 1
);
`);
const srow = db.prepare?.('SELECT id FROM settings WHERE id=1')?.get?.();
if (!srow) {
  db.prepare?.(`
    INSERT INTO settings (id, org_prefix, system_abbr, quote_series, quote_pad, next_quote_seq, sales_series, sales_pad, next_sales_seq)
    VALUES (1, 'SCM', NULL, 'Q', 4, 1, 'S', 3, 1)
  `)?.run?.();
}

/** --- Middleware --- */
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Serve uploaded files from /uploads  (from backend/data/uploads)
const UPLOADS_DIR = path.resolve(__dirname, '../data/uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve quote folders: /files/<CustomerName>/<QuoteNo>/<subdir>/<filename>
const QUOTES_FILES_ROOT = path.resolve(__dirname, '../data/quotes');
app.use('/files', express.static(QUOTES_FILES_ROOT));

/** --- API routes --- */
app.use('/api/upload', uploadRoute);
app.use('/api/materials', materialsRoute);
app.use('/api/quotes', quotesRoute);

// Mount file routes under /api/quotes to match frontend expectations
app.use('/api/quotes', quoteFilesRoute);

// (Optional) keep legacy mount if linked elsewhere
app.use('/api/quote-files', quoteFilesRoute);

app.use('/api/settings', settingsRoute);

/** --- Static serve for production (optional) ---
 * Build:  cd ..\frontend && npm run build
 * Serve:  npm run serve:prod   (sets SERVE_FRONTEND=true)
 */
const BACKEND_ROOT = path.resolve(__dirname, '..');          // C:\SCM-AI\backend
const MONO_ROOT    = path.resolve(BACKEND_ROOT, '..');       // C:\SCM-AI

const candidates = [
  path.resolve(MONO_ROOT, 'frontend', 'build'),  // C:\SCM-AI\frontend\build
  path.resolve(MONO_ROOT, 'client', 'build'),    // fallback if someone kept 'client'
];

const FRONTEND_BUILD_DIR = candidates.find(p => {
  try { return fs.existsSync(path.join(p, 'index.html')); } catch { return false; }
});

if (process.env.SERVE_FRONTEND === 'true' && FRONTEND_BUILD_DIR) {
  console.log(`[Static] Serving frontend from: ${FRONTEND_BUILD_DIR}`);
  app.use(express.static(FRONTEND_BUILD_DIR));
  // SPA fallback (exclude API, uploads, files)
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/files')
    ) return next();
    res.sendFile(path.join(FRONTEND_BUILD_DIR, 'index.html'));
  });
} else {
  console.log('[Static] Disabled or build not found. (Set SERVE_FRONTEND=true after building the frontend.)');
}

// Root test route
app.get('/', (req, res) => {
  res.send('SCM-AI backend is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
