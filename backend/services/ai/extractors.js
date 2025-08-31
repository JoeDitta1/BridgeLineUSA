// backend/services/ai/extractors.js
export function parseJsonSafe(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}
