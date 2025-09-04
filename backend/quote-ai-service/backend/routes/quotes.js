import express from 'express';
import { getQuote, createQuote, updateQuote, deleteQuote } from '../controllers/quotesController.js';

const router = express.Router();

// Route to get a quote by ID
router.get('/:id', async (req, res) => {
  try {
    const quote = await getQuote(req.params.id);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to create a new quote
router.post('/', async (req, res) => {
  try {
    const newQuote = await createQuote(req.body);
    res.status(201).json(newQuote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to update a quote by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedQuote = await updateQuote(req.params.id, req.body);
    res.json(updatedQuote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to delete a quote by ID
router.delete('/:id', async (req, res) => {
  try {
    await deleteQuote(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;