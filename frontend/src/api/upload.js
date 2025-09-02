// client/src/api/upload.js
// Prefer Vite-style env (import.meta.env.VITE_API_BASE) when available, fall back to CRA REACT_APP_API_BASE
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || (process.env.REACT_APP_API_BASE || '');

/**
 * Upload a single file to /api/upload (field name: "file")
 * @param {File} file
 * @returns {Promise<{message:string,fileName:string,originalName:string}>}
 */
export async function uploadOne(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Upload failed (${res.status}): ${txt}`);
  }
  return res.json();
}

/**
 * Upload multiple files to a quote-specific endpoint and subdir.
 * @param {string} quoteNo
 * @param {FileList|File[]} files
 * @param {string} subdir
 * @returns {Promise<Object>} response JSON from server (attachments/labels)
 */
export async function uploadFilesToQuote(quoteNo, files, subdir = 'uploads') {
  if (!quoteNo) throw new Error('quoteNo required for quote-scoped uploads');
  const fd = new FormData();
  const arr = Array.from(files || []);
  if (arr.length === 0) throw new Error('No files provided');
  for (const f of arr) fd.append('files', f);

  const url = `${API_BASE}/api/quotes/${encodeURIComponent(quoteNo)}/upload?subdir=${encodeURIComponent(subdir)}`;
  const res = await fetch(url, { method: 'POST', body: fd });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Upload failed (${res.status}): ${txt}`);
  }
  return res.json();
}
