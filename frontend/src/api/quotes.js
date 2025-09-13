const API = import.meta?.env?.VITE_API_BASE || process.env.REACT_APP_API_BASE;

export async function createQuote(payload) {
  const r = await fetch(`${API}/api/quotes`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function archiveQuote({ id, customerName, folderName }) {
  const r = await fetch(`${API}/api/quotes/${encodeURIComponent(id)}`, {
    method: "DELETE", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerName, quoteFolderName: folderName })
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
