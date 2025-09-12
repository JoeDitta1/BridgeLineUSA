import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/stats`, { credentials: "include" });
        const j = await res.json();
        if (!alive) return;
        if (!res.ok) throw new Error(j?.error || "Failed");
        setStats(j);
      } catch (e) {
        setErr(String(e.message || e));
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/" style={{ textDecoration: "none", color: "#111" }}>← Back to Dashboard</Link>
      </div>
      <h1>Admin Dashboard</h1>
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <Link to="/admin/settings" style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>Settings</Link>
        <Link to="/admin/users" style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>Users</Link>
        <Link to="/admin/equipment" style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>Equipment</Link>
        <Link to="/admin/materials" style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>Materials</Link>
        <Link to="/admin/backups" style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, backgroundColor: "#e3f2fd" }}>Backups</Link>
        <Link to="/admin/deleted" style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8, backgroundColor: "#fff3cd" }}>Soft Deletes</Link>
      </div>

      {err && <div style={{ color: "#b00020" }}>Error: {err}</div>}

      {!stats && !err && <div>Loading...</div>}

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 12 }}>
          <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Quotes</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.quotes || 0}</div>
          </div>
          <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Users</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.users || 0}</div>
          </div>
          <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Materials</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.materials || 0}</div>
          </div>
        </div>
      )}
    </div>
  );
}
