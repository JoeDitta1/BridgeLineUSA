import express from "express";
import path from "path";
import fs from "fs";
import * as dbModule from "../db.js";

const router = express.Router();
const db = dbModule.default ?? dbModule.db ?? dbModule;

router.get('/stats', (req, res) => {
  try {
    const qRow = db.prepare?.("SELECT COUNT(*) as c FROM quotes")?.get?.() || { c: 0 };
    const quotes = Number(qRow.c || 0);

    let users = 0;
    try {
      const uRow = db.prepare?.("SELECT COUNT(*) as c FROM users")?.get?.();
      users = Number(uRow?.c || 0);
    } catch {}

    let materials = 0;
    try {
      const JSON_PATH = path.resolve(process.cwd(), '..', 'frontend', 'src', 'data', 'materials.json');
      const text = fs.readFileSync(JSON_PATH, 'utf8');
      const data = JSON.parse(text || '[]');
      const list = Array.isArray(data) ? data : (Array.isArray(data?.materials) ? data.materials : []);
      materials = list.length;
    } catch {}

    res.json({ ok: true, quotes, users, materials });
  } catch (e) {
    console.error('[admin:stats] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

router.get('/settings', (req, res) => {
  try {
    let row = db.prepare?.("SELECT * FROM settings WHERE id=1")?.get?.();
    if (!row) {
      row = {
        id: 1,
        org_prefix: "SCM",
        system_abbr: null,
        quote_series: "Q",
        quote_pad: 4,
        next_quote_seq: 1,
        sales_series: "S",
        sales_pad: 3,
        next_sales_seq: 1
      };
    }
    res.json({ ok: true, settings: row });
  } catch (e) {
    console.error('[admin:settings] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

router.get('/users', (req, res) => {
  try {
    let rows = [];
    try {
      rows = db.prepare?.("SELECT id, username AS name, email, role FROM users ORDER BY id DESC")?.all?.() || [];
    } catch (_) {
      rows = [];
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json([]);
  }
});

router.get('/equipment', (req, res) => {
  try {
    let rows = [];
    try {
      rows = db.prepare?.("SELECT id, name, location, notes FROM equipment ORDER BY id DESC")?.all?.() || [];
    } catch (_) {
      rows = [];
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json([]);
  }
});

// List quote sync queue
router.get('/quote-sync-queue', (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM quote_sync_queue ORDER BY created_at DESC LIMIT 200").all();
    res.json({ ok: true, items: rows });
  } catch (e) {
    console.error('[admin:queue] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// Retry a failed queue item by id
router.post('/quote-sync-queue/:id/retry', (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = db.prepare('SELECT * FROM quote_sync_queue WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ ok: false, error: 'Not found' });
    db.prepare("UPDATE quote_sync_queue SET status = 'pending', last_error = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
    res.json({ ok: true });
  } catch (e) {
    console.error('[admin:queue:retry] error:', e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

export default router;
