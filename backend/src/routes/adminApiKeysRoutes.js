import express from 'express';
import * as dbModule from '../db.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;
const router = express.Router();

// GET active keys list (masked)
router.get('/api-keys', (req, res) => {
  const rows = db.prepare(`SELECT id, provider, substr(key_value,1,4)||'••••' AS key_preview, active, created_at, updated_at FROM api_keys ORDER BY updated_at DESC`).all();
  res.json({ ok: true, keys: rows });
});

// POST upsert/rotate key
// body: { provider:'openai', key_value:'sk-...', active:true }
router.post('/api-keys', (req, res) => {
  const { provider, key_value, active = true } = req.body || {};
  if (!provider || !key_value) return res.status(400).json({ ok:false, error:'missing_fields' });

  const deactivate = db.prepare(`UPDATE api_keys SET active=0 WHERE provider=?`).run(provider);
  const insert = db.prepare(`INSERT INTO api_keys (provider, key_value, active) VALUES (?,?,?)`)
    .run(provider, key_value, active ? 1 : 0);
  res.json({ ok: true, rotated: deactivate.changes, inserted: insert.lastInsertRowid });
});

// PATCH activate/deactivate key
// body: { active: false }
router.patch('/api-keys/:id', (req, res) => {
  const id = Number(req.params.id);
  const { active } = req.body || {};
  const upd = db.prepare(`UPDATE api_keys SET active=? WHERE id=?`).run(active ? 1 : 0, id);
  res.json({ ok: true, updated: upd.changes });
});

export default router;
