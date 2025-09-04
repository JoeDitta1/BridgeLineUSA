import { db } from '../db.js';

// Get all quotes
export const getQuotes = (req, res) => {
  const quotes = db.prepare('SELECT * FROM quotes').all();
  res.json(quotes);
};

// Get a specific quote by ID
export const getQuoteById = (req, res) => {
  const quoteId = Number(req.params.id);
  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(quoteId);
  
  if (!quote) {
    return res.status(404).json({ error: 'Quote not found' });
  }
  
  res.json(quote);
};

// Create a new quote
export const createQuote = (req, res) => {
  const { title, description, amount } = req.body;
  const insert = db.prepare('INSERT INTO quotes (title, description, amount) VALUES (?, ?, ?)');
  const info = insert.run(title, description, amount);
  
  res.status(201).json({ id: info.lastInsertRowid, title, description, amount });
};

// Update an existing quote
export const updateQuote = (req, res) => {
  const quoteId = Number(req.params.id);
  const { title, description, amount } = req.body;
  const update = db.prepare('UPDATE quotes SET title = ?, description = ?, amount = ? WHERE id = ?');
  const result = update.run(title, description, amount, quoteId);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Quote not found' });
  }
  
  res.json({ id: quoteId, title, description, amount });
};

// Delete a quote
export const deleteQuote = (req, res) => {
  const quoteId = Number(req.params.id);
  const del = db.prepare('DELETE FROM quotes WHERE id = ?');
  const result = del.run(quoteId);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Quote not found' });
  }
  
  res.status(204).send();
};