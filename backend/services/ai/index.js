// backend/services/ai/index.js
// Provider-agnostic LLM wrapper (OpenAI / Ollama toggles)
import { getActiveApiKey } from '../settings/apiKeys.js';

let cachedOpenAiKey = null;
async function getOpenAiKey() {
  if (cachedOpenAiKey) return cachedOpenAiKey;
  const dbKey = await getActiveApiKey('openai');
  cachedOpenAiKey = dbKey || process.env.OPENAI_API_KEY || '';
  return cachedOpenAiKey;
}
const MODEL = process.env.AI_MODEL || 'gpt-4o-mini';
const USE_OLLAMA = ['1', 'true'].includes(String(process.env.USE_OLLAMA || '').toLowerCase());
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

async function fetchJson(url, init) {
  const r = await fetch(url, init);
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`LLM request failed ${r.status}: ${body}`);
  }
  return r.json();
}

export async function llmComplete(prompt = '') {
  // Use Ollama if enabled
  if (USE_OLLAMA) {
    const r = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, prompt })
    });
    return await r.text();
  }

  // Default: OpenAI Chat Completions
  const key = await getOpenAiKey();
  if (!key) throw new Error('No OpenAI API key configured (Admin > API Keys or OPENAI_API_KEY).');

  const j = await fetchJson('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Extract structured fabrication BOM and normalize materials.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    })
  });
  return j?.choices?.[0]?.message?.content || '';
}

export function bomPrompt({ textSnippets = [] }) {
  return `From the following documents, extract a structured BOM as JSON array with fields:\n  material, size, grade, thickness_or_wall, length, qty, unit, notes, confidence (0-1).\n  Only return JSON.\n  ---\n  ${textSnippets.join('\n---\n')}`;
}

export function materialSearchPrompt(query) {
  return `Normalize this material request into JSON with fields:\n  {category, grade, size, unit_type, weight_per_ft (if known), description, alt_names[]}.\n  Input: ${query}`;
}
