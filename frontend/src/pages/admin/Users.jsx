import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

export default function Users() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  async function load() {
    try {
      setErr(""); setBusy(true);
      const r = await fetch(`${API_BASE}/api/admin/users`, { credentials: "include" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Failed");
      setRows(Array.isArray(j) ? j : (j.users || []));
    } catch (e) { setErr(String(e.message || e)); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}><Link to="/admin">← Back to Admin</Link></div>
      <h1>Users</h1>
      {busy && <div>Loading…</div>}
      {err && <div style={{ color: "#b00020" }}>{err}</div>}
      {!busy && rows.length === 0 && <div>No users found.</div>}
      {rows.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", background: "#f3f4f6" }}>
              <th style={{ padding:8 }}>ID</th>
              <th style={{ padding:8 }}>Name</th>
              <th style={{ padding:8 }}>Email</th>
              <th style={{ padding:8 }}>Role</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id}>
                <td style={{ padding:8 }}>{u.id}</td>
                <td style={{ padding:8 }}>{u.name || u.username || "-"}</td>
                <td style={{ padding:8 }}>{u.email || "-"}</td>
                <td style={{ padding:8 }}>{u.role || "user"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
