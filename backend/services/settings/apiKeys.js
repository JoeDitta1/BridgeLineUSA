import { db } from '../../db.js';

export async function getActiveApiKey(provider) {
  try {
    const row = db.prepare(
      `SELECT key_value FROM api_keys
       WHERE provider=? AND active=1
       ORDER BY updated_at DESC LIMIT 1`
    ).get(provider);

    return row?.key_value || null;
  } catch {
    return null;
  }
}
