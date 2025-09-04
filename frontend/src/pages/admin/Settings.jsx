import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/settings`, { credentials: "include" });
        const j = await res.json();
        if (!alive) return;
        if (!res.ok) throw new Error(j?.error || "Failed");
        setSettings(j.settings || j);
      } catch (e) {
        setErr(String(e.message || e));
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/admin">← Back to Admin</Link>
      </div>
      <h1>System Settings</h1>
      {err && <div style={{ color: "#b00020" }}>{err}</div>}
      {!settings && !err && <div>Loading…</div>}
      {settings && (
        <div style={{ marginTop: 12 }}>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f9fafb", padding: 12, borderRadius: 6 }}>
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
