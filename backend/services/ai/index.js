// backend/services/ai/index.js
// Provider-agnostic LLM wrapper (OpenAI / Ollama toggles)
const MODEL = process.env.AI_MODEL || 'gpt-4o-mini';
const USE_OLLAMA = String(process.env.USE_OLLAMA || '').toLowerCase() === '1' || process.env.USE_OLLAMA === 'true';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

async function llmComplete(prompt) {
  // Use Ollama if enabled
  if (USE_OLLAMA) {
    const r = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, prompt })
    });
    if (!r.ok) throw new Error(`Ollama error ${r.status}`);
    const text = await r.text();
    return text;
  }

  // Default: OpenAI Chat Completions
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You extract structured BOM and materials.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    })
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`OpenAI error ${r.status}: ${txt}`);
  }
  const j = await r.json();
  return j?.choices?.[0]?.message?.content || '';
}

function bomPrompt({ textSnippets = [] }) {
  return `From the following documents, extract a structured BOM as JSON array with fields:\n  material, size, grade, thickness_or_wall, length, qty, unit, notes, confidence (0-1).\n  Only return JSON.\n  ---\n  ${textSnippets.join('\n---\n')}`;
}

function materialSearchPrompt(query) {
  return `Normalize this material request into JSON with fields:\n  {category, grade, size, unit_type, weight_per_ft (if known), description, alt_names[]}.\n  Input: ${query}`;
}

export { llmComplete, bomPrompt, materialSearchPrompt };
