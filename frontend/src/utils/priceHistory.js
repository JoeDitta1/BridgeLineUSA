// src/utils/priceHistory.js
const KEY = 'scm_price_history_v2';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}
function save(map) { localStorage.setItem(KEY, JSON.stringify(map)); }

// include grade + domesticOnly in the key
const k = ({ category, description, unit, grade, domesticOnly }) =>
  [category?.toUpperCase(), description?.toUpperCase(), unit, (grade||'').toUpperCase(), domesticOnly ? 'DOM' : 'ANY'].join('|');

export function getLastPrice({ category, description, unit, grade, domesticOnly }) {
  const map = load();
  return map[k({ category, description, unit, grade, domesticOnly })] || null;
}
export function setLastPrice({ category, description, unit, grade, domesticOnly, payload }) {
  const map = load();
  map[k({ category, description, unit, grade, domesticOnly })] = { ...payload, updatedAt: Date.now() };
  save(map);
}
