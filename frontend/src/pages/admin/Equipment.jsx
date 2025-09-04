import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "";

export default function Equipment() {
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ id: null, name: "", type: "", status: "", location: "", capabilities_json: "" });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setErr(""); setBusy(true);
      const res = await fetch(`${API_BASE}/api/equipment`);
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setList(j.equipment || []);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally { setBusy(false); }
  }

  function resetForm() {
    setForm({ id: null, name: "", type: "", status: "", location: "", capabilities_json: "" });
    setSelectedFile(null);
  }

  async function save(e) {
    e?.preventDefault();
    try {
      setBusy(true); setErr("");
      const payload = {
        name: form.name,
        type: form.type,
        status: form.status,
        location: form.location,
        capabilities_json: form.capabilities_json
      };
      const url = form.id ? `${API_BASE}/api/equipment/${form.id}` : `${API_BASE}/api/equipment`;
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Save failed");
      await load();
      resetForm();
    } catch (err) {
      setErr(String(err?.message || err));
    } finally { setBusy(false); }
  }

  function editItem(it) {
    setForm({
      id: it.id,
      name: it.name || "",
      type: it.type || "",
      status: it.status || "",
      location: it.location || "",
      capabilities_json: it.capabilities_json || ""
    });
    setSelectedFile(null);
  }

  async function removeItem(id) {
    if (!window.confirm("Delete equipment?")) return;
    try {
      setBusy(true);
      const res = await fetch(`${API_BASE}/api/equipment/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await load();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally { setBusy(false); }
  }

  async function uploadManual(e) {
    e.preventDefault();
    if (!form.id) { setErr("Save equipment first to upload manual"); return; }
    if (!selectedFile) { setErr("Select a file to upload"); return; }
    try {
      setBusy(true); setErr("");
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("label", selectedFile.name);
      const res = await fetch(`${API_BASE}/api/equipment/${form.id}/manual`, { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Upload failed");
      await load();
      setSelectedFile(null);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally { setBusy(false); }
  }

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/">← Back to Dashboard</Link>
      </div>
      <h1>Equipment</h1>

      {err && <div style={{ color: "#b00020" }}>{err}</div>}
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>Equipment List</div>
          {busy && <div>Loading…</div>}
          {!busy && list.length === 0 && <div>No equipment found.</div>}
          <div style={{ maxHeight: 420, overflow: "auto", border: "1px solid #eee", padding: 8, borderRadius: 6 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ padding: 8, textAlign: "left" }}>ID</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Type</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Status</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Location</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(it => (
                  <tr key={it.id}>
                    <td style={{ padding: 8 }}>{it.id}</td>
                    <td style={{ padding: 8 }}>{it.name}</td>
                    <td style={{ padding: 8 }}>{it.type}</td>
                    <td style={{ padding: 8 }}>{it.status}</td>
                    <td style={{ padding: 8 }}>{it.location}</td>
                    <td style={{ padding: 8 }}>
                      <button onClick={() => editItem(it)} style={{ marginRight: 6 }}>Edit</button>
                      <button onClick={() => removeItem(it.id)} style={{ color: "#b00020" }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ width: 420 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{form.id ? "Edit Equipment" : "Add Equipment"}</div>
          <form onSubmit={save}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12 }}>Name</div>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: "100%" }} required />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12 }}>Type</div>
              <input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ width: "100%" }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12 }}>Status</div>
              <input value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ width: "100%" }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12 }}>Location</div>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} style={{ width: "100%" }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12 }}>Capabilities (JSON)</div>
              <textarea value={form.capabilities_json} onChange={e => setForm(f => ({ ...f, capabilities_json: e.target.value }))} rows={4} style={{ width: "100%" }} />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" disabled={busy}>{busy ? "Saving…" : (form.id ? "Save" : "Create")}</button>
              <button type="button" onClick={resetForm}>Clear</button>
            </div>
          </form>

          <hr style={{ margin: "12px 0" }} />

          <div style={{ fontWeight: 700 }}>Upload Manual / Doc</div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12 }}>Selected equipment ID</div>
            <div style={{ marginBottom: 8 }}>{form.id ? form.id : "None (save/create first)"}</div>

            <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
            <div style={{ marginTop: 8 }}>
              <button onClick={uploadManual} disabled={!form.id || !selectedFile || busy}>{busy ? "Uploading…" : "Upload Manual"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
