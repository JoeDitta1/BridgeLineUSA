// client/src/api/upload.js
const API_BASE = process.env.REACT_APP_API_BASE || '';

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
