import fsPromises from 'fs/promises';
import path from 'path';
import getSupabase from '../lib/supabaseClient.js';
import * as dbModule from '../db.js';

const db = dbModule.default ?? dbModule.db ?? dbModule;
const supabase = getSupabase();

const MAX_ATTEMPTS = parseInt(process.env.QUOTE_SYNC_MAX_ATTEMPTS || '5', 10);

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function retry(fn, { tries = 5, base = 250 } = {}) {
  let attempt = 0;
  while (true) {
    try { return await fn(); }
    catch (e) {
      if (++attempt >= tries) throw e;
      const ms = Math.round((base * 2 ** (attempt - 1)) + Math.random() * 100);
      await sleep(ms);
    }
  }
}

async function processOne() {
  const row = db.prepare("SELECT * FROM quote_sync_queue WHERE status = 'pending' ORDER BY created_at LIMIT 1").get();
  if (!row) return false;

  // Prevent infinite retries: if attempts exceeded, mark failed
  if ((row.attempts || 0) >= 5) {
    db.prepare('UPDATE quote_sync_queue SET status = ?, last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('failed', 'max attempts reached', row.id);
    return true;
  }

  // mark processing and increment attempts
  db.prepare('UPDATE quote_sync_queue SET status = ?, attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('processing', row.id);

  try {
    if (!supabase) {
      // nothing to do; mark done as noop
      db.prepare('UPDATE quote_sync_queue SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('done', row.id);
      return true;
    }

    // Read local meta JSON if meta_path present
    let jsonBuffer = null;
    if (row.meta_path) {
      try {
        jsonBuffer = await fsPromises.readFile(row.meta_path);
      } catch (e) {
        if (row.payload_json) jsonBuffer = Buffer.from(row.payload_json);
      }
    } else if (row.payload_json) {
      jsonBuffer = Buffer.from(row.payload_json);
    }

    const bucket = process.env.SUPABASE_QUOTES_BUCKET || 'quotes';
    const customerSafe = (row.customer_name || 'unknown').replace(/[^\w-]/g, '_');
    // canonical: quotes/{CustomerSlug}/Q-{QuoteNo}/00-Quote-Form/quote.v{ts}.json
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const quoteNoKey = String(row.quote_no || '').trim();
  const basePath = `quotes/${customerSafe}/${quoteNoKey}/00-Quote-Form`;
    const objectKey = `${basePath}/quote.v${ts}.json`;

    if (jsonBuffer) {
      await retry(async () => {
        const { error: upErr } = await supabase.storage.from(bucket).upload(objectKey, jsonBuffer, { upsert: true });
        if (upErr) throw upErr;
        return true;
      }, { tries: 4, base: 300 });
    }

    // Update manifest.json in same folder (read existing, append)
    try {
      const manifestKey = `${basePath}/manifest.json`;
      // fetch existing manifest if present
      const { data: existing, error: getErr } = await retry(async () => {
        const res = await supabase.storage.from(bucket).download(manifestKey).catch(() => ({ data: null, error: null }));
        if (res?.error) throw res.error;
        return res;
      }, { tries: 3, base: 200 });

      let manifest = { latest_version: null, files: [] };
      if (existing && typeof existing.arrayBuffer === 'function') {
        try {
          const buf = Buffer.from(await existing.arrayBuffer());
          manifest = JSON.parse(buf.toString() || '{}');
        } catch {}
      }

      const entry = { key: objectKey, uploaded_at: new Date().toISOString() };
      manifest.files = manifest.files || [];
      manifest.files.push(entry);
      manifest.latest_version = entry.uploaded_at;

      const manifestBuf = Buffer.from(JSON.stringify(manifest, null, 2));
      await retry(async () => {
        const { error: mErr } = await supabase.storage.from(bucket).upload(manifestKey, manifestBuf, { upsert: true });
        if (mErr) throw mErr;
        return true;
      }, { tries: 4, base: 300 });
    } catch (me) {
      console.warn('manifest update warning:', me?.message || me);
    }

    // Upsert metadata in Postgres via Supabase (quotes table). Use quote_no as key.
    const meta = jsonBuffer ? JSON.parse(jsonBuffer.toString()) : null;
    const metadataRow = {
      quote_no: row.quote_no,
      customer_name: row.customer_name,
      storage_key_root: `quotes/${customerSafe}/${quoteNoKey}`,
      version_current: meta?.quote?.rev || null,
      totals: meta?.form?.totals || null,
      qc: meta?.form?.qc || null,
      updated_at: new Date().toISOString()
    };

    await retry(async () => {
      const { data, error } = await supabase.from('quotes').upsert([metadataRow], { onConflict: 'quote_no' });
      if (error) throw error;
      return data;
    }, { tries: 4, base: 250 });

    // mark done
    db.prepare('UPDATE quote_sync_queue SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('done', row.id);
    return true;
  } catch (err) {
    const lastError = String(err?.message || err);
    console.error('quoteSyncWorker error:', lastError);
    // increment attempts already done; if attempts < 5 leave as pending for retry, else mark failed
    const current = db.prepare('SELECT attempts FROM quote_sync_queue WHERE id = ?').get(row.id);
    const attempts = (current?.attempts || 0);
    if (attempts < MAX_ATTEMPTS) {
      // set back to pending to retry later
      db.prepare('UPDATE quote_sync_queue SET status = ?, last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('pending', lastError, row.id);
    } else {
      db.prepare('UPDATE quote_sync_queue SET status = ?, last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('failed', lastError, row.id);
      // attempt to write to DLQ table for manual inspection
      try {
        let payload = row.payload_json || null;
        if (!payload && row.meta_path) {
          try { payload = String(await fsPromises.readFile(row.meta_path)); } catch {}
        }
        db.prepare('INSERT INTO worker_dlq (queue_id, payload_json, error_text, attempts, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
          .run(row.id, payload || '{}', lastError, attempts);
      } catch (dlqErr) {
        console.error('failed to write DLQ row:', dlqErr?.message || dlqErr);
      }
    }
    return true;
  }
}

async function runLoop() {
  while (true) {
    try {
      const did = await processOne();
      if (!did) await sleep(2000);
    } catch (e) {
      console.error('quoteSyncWorker loop error:', e?.message || e);
      await sleep(5000);
    }
  }
}

import { pathToFileURL } from 'url';

// ESM-compatible "main" check: compare import.meta.url to the executed script path
const entry = process.argv && process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (entry && import.meta.url === entry) {
  console.log('Starting quoteSyncWorker...');
  runLoop();
}

export { processOne, runLoop };
