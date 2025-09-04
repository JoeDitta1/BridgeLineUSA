import express from 'express';
import { loadTextForQuote } from '../../services/ai/prepareDocs.js';
import { llmComplete, bomPrompt, materialSearchPrompt } from '../../services/ai/index.js';
import { parseJsonSafe } from '../../services/ai/extractors.js';

const router = express.Router();

// POST /api/quotes/:id/ai/extract-bom
router.post('/quotes/:id/ai/extract-bom', async (req, res) => {
  try {
    const quoteId = req.params.id;
    const snippets = await loadTextForQuote(quoteId);
    const prompt = bomPrompt({ textSnippets: snippets });
    const raw = await llmComplete(prompt);
    const json = parseJsonSafe(raw) || { suggestions: [] };
    const suggestions = Array.isArray(json) ? json : (json.suggestions || []);
    res.json({ ok: true, suggestions });
  } catch (e) {
    console.error('[AI:BOM]', e);
    res.status(500).json({ ok: false, error: 'bom_extract_failed' });
  }
});

// POST /api/materials/ai/search  { query }
router.post('/materials/ai/search', async (req, res) => {
  try {
    const { query } = req.body || {};
    const raw = await llmComplete(materialSearchPrompt(query || ''));
    const parsed = parseJsonSafe(raw) || {};
    res.json({ ok: true, candidates: Array.isArray(parsed) ? parsed : [parsed] });
  } catch (e) {
    console.error('[AI:MaterialSearch]', e);
    res.status(500).json({ ok: false, error: 'material_search_failed' });
  }
});

export default router;
