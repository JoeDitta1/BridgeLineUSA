import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Form state for API key management
  const [openaiKey, setOpenaiKey] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [supabaseServiceKey, setSupabaseServiceKey] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, { credentials: "include" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      const data = j.settings || j;
      setSettings(data);
      
      // Populate form fields
      setOpenaiKey(data.OPENAI_API_KEY || "");
      setSupabaseUrl(data.SUPABASE_URL || "");
      setSupabaseAnonKey(data.SUPABASE_ANON_KEY || "");
      setSupabaseServiceKey(data.SUPABASE_SERVICE_KEY || "");
    } catch (e) {
      setErr(String(e.message || e));
    }
  };

  const saveSettings = async () => {
    setBusy(true);
    setErr("");
    setSuccessMsg("");
    
    try {
      const payload = {
        OPENAI_API_KEY: openaiKey.trim(),
        SUPABASE_URL: supabaseUrl.trim(),
        SUPABASE_ANON_KEY: supabaseAnonKey.trim(),
        SUPABASE_SERVICE_KEY: supabaseServiceKey.trim()
      };

      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to save settings");
      
      setSuccessMsg("Settings saved successfully!");
      await loadSettings(); // Reload to confirm
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  const testOpenAI = async () => {
    if (!openaiKey.trim()) {
      setErr("Please enter an OpenAI API key first");
      return;
    }
    
    setBusy(true);
    setErr("");
    setSuccessMsg("");
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/test-openai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({ apiKey: openaiKey.trim() })
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to test API key");
      
      setSuccessMsg("OpenAI API key is valid and working!");
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/admin">← Back to Admin</Link>
      </div>
      <h1>System Settings</h1>
      
      {err && <div style={{ color: "#b00020", padding: 12, background: "#ffebee", borderRadius: 6, marginBottom: 12 }}>{err}</div>}
      {successMsg && <div style={{ color: "#2e7d32", padding: 12, background: "#e8f5e8", borderRadius: 6, marginBottom: 12 }}>{successMsg}</div>}
      
      {!settings && !err && <div>Loading…</div>}
      
      {settings && (
        <div style={{ marginTop: 12 }}>
          <div style={{ background: "#f9fafb", padding: 20, borderRadius: 8, marginBottom: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>API Configuration</h2>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={e => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  border: "1px solid #ddd", 
                  borderRadius: 4,
                  fontFamily: "monospace"
                }}
              />
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                Required for AI BOM extraction and material matching
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                Supabase URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  border: "1px solid #ddd", 
                  borderRadius: 4,
                  fontFamily: "monospace"
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                Supabase Anon Key
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={e => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJ..."
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  border: "1px solid #ddd", 
                  borderRadius: 4,
                  fontFamily: "monospace"
                }}
              />
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                Public anon key for client-side operations
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                Supabase Service Role Key
              </label>
              <input
                type="password"
                value={supabaseServiceKey}
                onChange={e => setSupabaseServiceKey(e.target.value)}
                placeholder="eyJ..."
                style={{ 
                  width: "100%", 
                  padding: 8, 
                  border: "1px solid #ddd", 
                  borderRadius: 4,
                  fontFamily: "monospace"
                }}
              />
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                <strong>Service role key required for file uploads and bucket creation</strong> - Has elevated permissions to bypass RLS policies
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={saveSettings}
                disabled={busy}
                style={{ 
                  padding: "10px 20px", 
                  background: "#1976d2", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 6,
                  cursor: busy ? "not-allowed" : "pointer",
                  opacity: busy ? 0.6 : 1
                }}
              >
                {busy ? "Saving..." : "Save Settings"}
              </button>
              
              <button
                onClick={testOpenAI}
                disabled={busy || !openaiKey.trim()}
                style={{ 
                  padding: "10px 20px", 
                  background: "#4caf50", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 6,
                  cursor: (busy || !openaiKey.trim()) ? "not-allowed" : "pointer",
                  opacity: (busy || !openaiKey.trim()) ? 0.6 : 1
                }}
              >
                Test OpenAI API
              </button>
            </div>
          </div>

          <div style={{ background: "#f9fafb", padding: 20, borderRadius: 8 }}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Current Settings</h3>
            <pre style={{ 
              whiteSpace: "pre-wrap", 
              background: "white", 
              padding: 12, 
              borderRadius: 6,
              fontSize: 12,
              border: "1px solid #e0e0e0",
              overflow: "auto"
            }}>
              {JSON.stringify(settings, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
