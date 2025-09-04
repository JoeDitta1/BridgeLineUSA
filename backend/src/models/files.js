import crypto from 'crypto';
import { db } from '../db.js';

// Minimal helper for Phase 1: create files, file_versions, and quote_files entries.
// Uses ULID-like uuid via random bytes for simplicity; replace with ULID library if desired.
function genId() {
  return crypto.randomBytes(16).toString('hex');
}

export function createFile({ customer_id = null, quote_id = null, kind = 'drawing', title = null, created_by = null }) {
  const id = genId();
  const stmt = db.prepare(`INSERT INTO files (id, customer_id, quote_id, kind, title, created_by) VALUES (?, ?, ?, ?, ?, ?)`);
  stmt.run(id, customer_id, quote_id, kind, title, created_by);
  return id;
}

export function addFileVersion({ file_id, object_key, mime_type = null, ext = null, size_bytes = null, sha256 = null, width_px = null, height_px = null, page_count = null, source_tool = null }) {
  const stmt = db.prepare(`INSERT INTO file_versions (file_id, object_key, mime_type, ext, size_bytes, sha256, width_px, height_px, page_count, source_tool) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(file_id, object_key, mime_type, ext, size_bytes, sha256, width_px, height_px, page_count, source_tool);
  // return newly inserted row id
  return db.prepare('SELECT * FROM file_versions WHERE id = ?').get(info.lastInsertRowid);
}

export function linkFileToQuote({ quote_id, file_id, role = null }) {
  const stmt = db.prepare(`INSERT INTO quote_files (quote_id, file_id, role) VALUES (?, ?, ?)`);
  stmt.run(quote_id, file_id, role);
}

export function getLatestVersionForFile(file_id) {
  return db.prepare(`SELECT * FROM file_versions WHERE file_id = ? ORDER BY datetime(created_at) DESC LIMIT 1`).get(file_id);
}

export function getFilesForQuote(quote_id) {
  return db.prepare(`SELECT f.*, fv.* FROM files f
    LEFT JOIN file_versions fv ON fv.id = (
      SELECT id FROM file_versions vv WHERE vv.file_id = f.id ORDER BY datetime(created_at) DESC LIMIT 1
    )
    WHERE f.quote_id = ?`).all(quote_id);
}

export default { createFile, addFileVersion, linkFileToQuote, getLatestVersionForFile, getFilesForQuote };
