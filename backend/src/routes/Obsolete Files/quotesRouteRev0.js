// src/routes/quotesRoute.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as dbModule from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = dbModule.default ?? dbModule.db ?? dbModule;

const router = express.Router();

// --- Get all quotes ---
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, quote_no, customer_name, description, requested_by, estimator, date,
             status, sales_order_no, rev, created_at, updated_at
      FROM quotes
      ORDER BY date DESC, id DESC
    `).all();
    // Frontend expects this shape:
    res.json({ ok: true, quotes: rows });
  } catch (err) {
    console.error('Error fetching quotes:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch quotes' });
  }
});

// --- Get quote by ID ---
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Quote not found' });
    res.json(row);
  } catch (err) {
    console.error('Error fetching quote:', err);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// --- Create new quote ---
router.post('/', (req, res) => {
  try {
    const { quote_no, customer_name, description, requested_by, estimator, date, status, sales_order_no, rev } = req.body;
    db.prepare(`
      INSERT INTO quotes (quote_no, customer_name, description, requested_by, estimator, date, status, sales_order_no, rev)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(quote_no, customer_name, description, requested_by, estimator, date, status, sales_order_no, rev ?? 0);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error creating quote:', err);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

// --- Update existing quote ---
router.put('/:id', (req, res) => {
  try {
    const { quote_no, customer_name, description, requested_by, estimator, date, status, sales_order_no, rev } = req.body;
    db.prepare(`
      UPDATE quotes
      SET quote_no = ?, customer_name = ?, description = ?, requested_by = ?, estimator = ?, date = ?, status = ?, sales_order_no = ?, rev = ?
      WHERE id = ?
    `).run(quote_no, customer_name, description, requested_by, estimator, date, status, sales_order_no, rev ?? 0, req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error updating quote:', err);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// --- Delete quote ---
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM quotes WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting quote:', err);
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

export default router;
