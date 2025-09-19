// src/index.js
import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path, { dirname } from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { fileURLToPath } from 'url';

import quoteFilesRoute from './routes/quoteFilesRoute.js';
import uploadRoute from './uploadRoute.js';
import materialsRoute from './routes/materialsRoute.js';
import quotesRoute from './routes/quotesRoute.js';
import settingsRoute from './routes/settingsRoute.js';
import * as dbModule from './db.js';
import customersRoute from './routes/customersRoute.js';
import quoteInitRoute from './routes/quoteInitRoute.js';
import adminRoute from './routes/adminRoute.js';
import equipmentRoute from './routes/equipmentRoute.js';
import systemMaterialsRoute from './routes/systemMaterialsRoute.js';
import salesOrdersRoute from './routes/salesOrdersRoute.js';
import backupRoute from './routes/backupRoute.js';
import authRoute from './routes/authRoute.js';
import oemRoute from './routes/oemRoute.js';

/* ------------------------- ES module __dirname shim ------------------------ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ----------------------------- DB compatibility --------------------------- */
const db = dbModule.default ?? dbModule.db ?? dbModule;

// Ensure migrations run on startup
try {
  if (typeof dbModule.migrate === 'function') {
    dbModule.migrate();
    try {
      const row = db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name='equipment'").get();
      console.log('[DB] migrate() executed; equipment table exists:', !!row);
    } catch (e) {
      console.warn('[DB] migrate verification failed:', e && e.message ? e.message : e);
    }
  } else {
    console.log('[DB] migrate() not found on db module');
  }
} catch (e) {
  console.error('[DB] migrate() failed:', e && e.stack ? e.stack : e);
}

const app = express();
const PORT = process.env.PORT || 4000;

/* ---------------------------------- Trust --------------------------------- */
// Helpful if you later use secure cookies behind Codespaces/NGINX, etc.
app.set('trust proxy', 1);

/* ------------------------------- Migrations ------------------------------- */

/* -------------------------------- Middleware ------------------------------ */
// CORS that works with Codespaces
// Loosen CORS for development: allow all origins with credentials
app.use(cors({ origin: true, credentials: true }));
app.options('*', cors({ origin: true, credentials: true }));

// Session middleware for authentication
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: 'localhost'
  }
}));

app.use(express.json({ limit: '5mb' }));
app.use('/api/quotes', customersRoute);

/* ------------------------ Resolve important directories ------------------- */
/**
 * Resolve relative paths against the backend folder so Linux/Codespaces works,
 * while still honoring absolute paths if provided in .env.
 */
const BACKEND_ROOT = path.resolve(__dirname, '..');     // .../backend
const MONO_ROOT = path.resolve(BACKEND_ROOT, '..');     // repo root

const resolveFromBackend = (p) =>
  path.isAbsolute(p) ? p : path.resolve(BACKEND_ROOT, p);

// DATA_ROOT is optional; QUOTE_ROOT/UPLOADS_DIR take precedence where used
const DATA_ROOT = resolveFromBackend(process.env.DATA_ROOT || './data');

// UPLOADS (env wins; else ./uploads)
const uploadsEnv = process.env.UPLOADS_DIR || './uploads';
const UPLOADS_DIR = resolveFromBackend(uploadsEnv);
await fsPromises.mkdir(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

// QUOTE FOLDERS (support either QUOTE_VAULT_ROOT or QUOTE_ROOT; default ./data/quotes)
const quoteEnv = (process.env.QUOTE_VAULT_ROOT || process.env.QUOTE_ROOT || './data/quotes');
const QUOTES_FILES_ROOT = resolveFromBackend(quoteEnv);
await fsPromises.mkdir(QUOTES_FILES_ROOT, { recursive: true });
app.use('/files', express.static(QUOTES_FILES_ROOT));

// ARCHIVES (for backup downloads)
const ARCHIVES_DIR = '/workspaces/_archives';
await fsPromises.mkdir(ARCHIVES_DIR, { recursive: true });
app.use('/archives', express.static(ARCHIVES_DIR));

// Expose resolved paths to routes if needed
app.locals.paths = {
  uploadsDir: UPLOADS_DIR,
  quotesRoot: QUOTES_FILES_ROOT,
  dataRoot: DATA_ROOT
};

/* --------------------------------- Routes -------------------------------- */
app.use('/api/auth', authRoute); // authentication endpoints
app.use('/api/upload', uploadRoute);
app.use('/api/materials', materialsRoute);
app.use('/api/quotes', quotesRoute);
app.use('/api/quotes', quoteInitRoute);
app.use('/api/settings', settingsRoute); // <— mounted (was imported but not used)
app.use('/api/admin', adminRoute); // admin endpoints
app.use('/api/equipment', equipmentRoute); // equipment endpoints
app.use('/api/system-materials', systemMaterialsRoute);
app.use('/api/sales-orders', salesOrdersRoute);
app.use('/api/backups', backupRoute); // backup system
app.use('/api/oem', oemRoute); // OEM portal endpoints

// File routes mounted under /api/quotes to match frontend expectations
app.use('/api/quotes', quoteFilesRoute);
// Optional legacy mount
app.use('/api/quote-files', quoteFilesRoute);

/* --------------------------------- Health -------------------------------- */
app.get('/api/health', (req, res) => {
  let version = 'unknown';
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(MONO_ROOT, 'package.json'), 'utf8')
    );
    version = pkg.version || version;
  } catch {}
  res.json({
    ok: true,
    service: 'SCM-AI API',
    version,
    time: new Date().toISOString(),
    env: {
      PORT: process.env.PORT,
      QUOTE_ROOT: process.env.QUOTE_ROOT,
      QUOTE_VAULT_ROOT: process.env.QUOTE_VAULT_ROOT,
      UPLOADS_DIR: process.env.UPLOADS_DIR,
      DATA_ROOT: process.env.DATA_ROOT
    },
    resolved: {
      quoteRoot: QUOTES_FILES_ROOT,
      uploadsDir: UPLOADS_DIR,
      dataRoot: DATA_ROOT
    }
  });
});

// Optional: folder smoke test to verify permissions/paths quickly
app.get('/api/_test_folders', async (req, res) => {
  try {
    const testRoot = path.join(QUOTES_FILES_ROOT, 'TEST');
    await fsPromises.mkdir(path.join(testRoot, 'Files'), { recursive: true });
    await fsPromises.mkdir(path.join(testRoot, 'Quote'), { recursive: true });
    await fsPromises.mkdir(path.join(testRoot, 'Supplier Information'), { recursive: true });
    res.json({ ok: true, base: QUOTES_FILES_ROOT });
  } catch (e) {
    console.error('Folder test failed:', e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

/* ------------------------- Static serve for production -------------------- */
/**
 * Build:  (from repo root) cd frontend && npm run build
 * Serve:  set SERVE_FRONTEND=true then start backend
 */
const candidates = [
  path.resolve(MONO_ROOT, 'frontend', 'build'),
  path.resolve(MONO_ROOT, 'client', 'build'),
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

/* ------------------------------- Root route ------------------------------- */
app.get('/', (_req, res) => {
  res.send('SCM-AI backend is running');
});

/* --------------------------------- Start --------------------------------- */
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Uploads: ${UPLOADS_DIR}`);
  console.log(`Quote folders: ${QUOTES_FILES_ROOT}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close((err) => {
    if (err) {
      console.error('Error during server close:', err);
      process.exit(1);
    }
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully');
  server.close((err) => {
    if (err) {
      console.error('Error during server close:', err);
      process.exit(1);
    }
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close((closeErr) => {
    if (closeErr) {
      console.error('Error during server close:', closeErr);
    }
    process.exit(1);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close((err) => {
    if (err) {
      console.error('Error during server close:', err);
    }
    process.exit(1);
  });
});
