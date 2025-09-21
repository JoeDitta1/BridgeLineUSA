import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../../api/base";

function getAuthHeaders() {
  const token = localStorage.getItem("jwt_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

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

  // QuickBooks settings state
  const [qbSettings, setQbSettings] = useState(null);
  const [qbEnabled, setQbEnabled] = useState(false);
  const [qbConnectionType, setQbConnectionType] = useState("desktop");
  const [qbCompanyFilePath, setQbCompanyFilePath] = useState("");
  const [qbAppPath, setQbAppPath] = useState("");
  const [qbConnectionMode, setQbConnectionMode] = useState("single_user");
  const [qbUsername, setQbUsername] = useState("");
  const [qbPassword, setQbPassword] = useState("");
  const [qbCompanyId, setQbCompanyId] = useState("");
  const [qbClientId, setQbClientId] = useState("");
  const [qbClientSecret, setQbClientSecret] = useState("");
  const [qbIsSandbox, setQbIsSandbox] = useState(true);
  const [qbSearchItemTypes, setQbSearchItemTypes] = useState("inventory,non_inventory,service");
  const [qbSearchFields, setQbSearchFields] = useState("name,description,manufacturer_part_number");
  const [qbPreferredVendors, setQbPreferredVendors] = useState("");
  const [qbConnectionTimeout, setQbConnectionTimeout] = useState(30);
  const [qbSearchLimit, setQbSearchLimit] = useState(50);

  useEffect(() => {
    loadSettings();
    loadQbSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, { 
        headers: getAuthHeaders(),
        credentials: "include" 
      });
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

  const loadQbSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/qb-settings`, { 
        headers: getAuthHeaders(),
        credentials: "include" 
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      const data = j.qbSettings || {};
      setQbSettings(data);
      
      // Populate QB form fields
      setQbEnabled(Boolean(data.enabled));
      setQbConnectionType(data.connection_type || "desktop");
      setQbCompanyFilePath(data.company_file_path || "");
      setQbAppPath(data.qb_app_path || "");
      setQbConnectionMode(data.connection_mode || "single_user");
      setQbUsername(data.username || "");
      setQbPassword(""); // Don't populate password for security
      setQbCompanyId(data.company_id || "");
      setQbClientId(data.client_id || "");
      setQbClientSecret(""); // Don't populate client secret for security
      setQbIsSandbox(Boolean(data.is_sandbox));
      setQbSearchItemTypes(data.search_item_types || "inventory,non_inventory,service");
      setQbSearchFields(data.search_fields || "name,description,manufacturer_part_number");
      setQbPreferredVendors(data.preferred_vendors || "");
      setQbConnectionTimeout(data.connection_timeout || 30);
      setQbSearchLimit(data.search_limit || 50);
    } catch (e) {
      console.warn('Failed to load QB settings:', e);
      // Don't set error since QB settings are optional
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
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
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

  const saveQbSettings = async () => {
    setBusy(true);
    setErr("");
    setSuccessMsg("");
    
    try {
      const payload = {
        enabled: qbEnabled ? 1 : 0,
        connection_type: qbConnectionType,
        company_file_path: qbCompanyFilePath.trim() || null,
        qb_app_path: qbAppPath.trim() || null,
        connection_mode: qbConnectionMode,
        username: qbUsername.trim() || null,
        password: qbPassword.trim() || null,
        company_id: qbCompanyId.trim() || null,
        client_id: qbClientId.trim() || null,
        client_secret: qbClientSecret.trim() || null,
        is_sandbox: qbIsSandbox ? 1 : 0,
        search_item_types: qbSearchItemTypes,
        search_fields: qbSearchFields,
        preferred_vendors: qbPreferredVendors.trim() || null,
        connection_timeout: qbConnectionTimeout,
        search_limit: qbSearchLimit
      };

      const res = await fetch(`${API_BASE}/api/admin/qb-settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to save QuickBooks settings");
      
      setSuccessMsg("QuickBooks settings saved successfully!");
      await loadQbSettings(); // Reload to confirm
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  const testQbConnection = async () => {
    setBusy(true);
    setErr("");
    setSuccessMsg("");
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/qb-settings/test-connection`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        credentials: "include"
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to test QuickBooks connection");
      
      setSuccessMsg(j.message || "QuickBooks connection test completed!");
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
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
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

          <div style={{ background: "#f9fafb", padding: 20, borderRadius: 8, marginBottom: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>QuickBooks Integration</h2>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", fontWeight: 600, marginBottom: 8 }}>
                <input
                  type="checkbox"
                  checked={qbEnabled}
                  onChange={e => setQbEnabled(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                Enable QuickBooks Integration for AI BOM
              </label>
              <div style={{ fontSize: 12, color: "#666", marginLeft: 24 }}>
                When enabled, AI Auto BOM will search QuickBooks for materials before falling back to online search
              </div>
            </div>

            {qbEnabled && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                    Connection Type
                  </label>
                  <select
                    value={qbConnectionType}
                    onChange={e => setQbConnectionType(e.target.value)}
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ddd", 
                      borderRadius: 4 
                    }}
                  >
                    <option value="desktop">QuickBooks Desktop</option>
                    <option value="online">QuickBooks Online</option>
                  </select>
                </div>

                {qbConnectionType === "desktop" && (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                        Company File Path
                      </label>
                      <input
                        type="text"
                        value={qbCompanyFilePath}
                        onChange={e => setQbCompanyFilePath(e.target.value)}
                        placeholder="C:\Users\YourUser\Documents\QuickBooks\Company.QBW"
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
                        QuickBooks Application Path (Optional)
                      </label>
                      <input
                        type="text"
                        value={qbAppPath}
                        onChange={e => setQbAppPath(e.target.value)}
                        placeholder="C:\Program Files (x86)\QuickBooks\qbw.exe"
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
                        Connection Mode
                      </label>
                      <select
                        value={qbConnectionMode}
                        onChange={e => setQbConnectionMode(e.target.value)}
                        style={{ 
                          width: "100%", 
                          padding: 8, 
                          border: "1px solid #ddd", 
                          borderRadius: 4 
                        }}
                      >
                        <option value="single_user">Single User</option>
                        <option value="multi_user">Multi User</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                          Username (If Required)
                        </label>
                        <input
                          type="text"
                          value={qbUsername}
                          onChange={e => setQbUsername(e.target.value)}
                          style={{ 
                            width: "100%", 
                            padding: 8, 
                            border: "1px solid #ddd", 
                            borderRadius: 4 
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                          Password (If Required)
                        </label>
                        <input
                          type="password"
                          value={qbPassword}
                          onChange={e => setQbPassword(e.target.value)}
                          style={{ 
                            width: "100%", 
                            padding: 8, 
                            border: "1px solid #ddd", 
                            borderRadius: 4 
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {qbConnectionType === "online" && (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                        Company ID
                      </label>
                      <input
                        type="text"
                        value={qbCompanyId}
                        onChange={e => setQbCompanyId(e.target.value)}
                        placeholder="Your QuickBooks Online Company ID"
                        style={{ 
                          width: "100%", 
                          padding: 8, 
                          border: "1px solid #ddd", 
                          borderRadius: 4,
                          fontFamily: "monospace"
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                          Client ID
                        </label>
                        <input
                          type="text"
                          value={qbClientId}
                          onChange={e => setQbClientId(e.target.value)}
                          style={{ 
                            width: "100%", 
                            padding: 8, 
                            border: "1px solid #ddd", 
                            borderRadius: 4,
                            fontFamily: "monospace"
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                          Client Secret
                        </label>
                        <input
                          type="password"
                          value={qbClientSecret}
                          onChange={e => setQbClientSecret(e.target.value)}
                          style={{ 
                            width: "100%", 
                            padding: 8, 
                            border: "1px solid #ddd", 
                            borderRadius: 4,
                            fontFamily: "monospace"
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "flex", alignItems: "center", fontWeight: 600, marginBottom: 4 }}>
                        <input
                          type="checkbox"
                          checked={qbIsSandbox}
                          onChange={e => setQbIsSandbox(e.target.checked)}
                          style={{ marginRight: 8 }}
                        />
                        Use Sandbox Environment
                      </label>
                      <div style={{ fontSize: 12, color: "#666", marginLeft: 24 }}>
                        Enable for testing, disable for production
                      </div>
                    </div>
                  </>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                    Item Types to Search
                  </label>
                  <input
                    type="text"
                    value={qbSearchItemTypes}
                    onChange={e => setQbSearchItemTypes(e.target.value)}
                    placeholder="inventory,non_inventory,service"
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ddd", 
                      borderRadius: 4,
                      fontFamily: "monospace"
                    }}
                  />
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    Comma-separated list of QuickBooks item types to search
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                    Search Fields
                  </label>
                  <input
                    type="text"
                    value={qbSearchFields}
                    onChange={e => setQbSearchFields(e.target.value)}
                    placeholder="name,description,manufacturer_part_number"
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ddd", 
                      borderRadius: 4,
                      fontFamily: "monospace"
                    }}
                  />
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    QuickBooks fields to search for material matches
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                    Preferred Vendors (Optional)
                  </label>
                  <input
                    type="text"
                    value={qbPreferredVendors}
                    onChange={e => setQbPreferredVendors(e.target.value)}
                    placeholder="Steel Supply LP,McMaster-Carr,Grainger"
                    style={{ 
                      width: "100%", 
                      padding: 8, 
                      border: "1px solid #ddd", 
                      borderRadius: 4 
                    }}
                  />
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    Comma-separated list of vendor names to prioritize
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                      Connection Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="120"
                      value={qbConnectionTimeout}
                      onChange={e => setQbConnectionTimeout(parseInt(e.target.value) || 30)}
                      style={{ 
                        width: "100%", 
                        padding: 8, 
                        border: "1px solid #ddd", 
                        borderRadius: 4 
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
                      Search Result Limit
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={qbSearchLimit}
                      onChange={e => setQbSearchLimit(parseInt(e.target.value) || 50)}
                      style={{ 
                        width: "100%", 
                        padding: 8, 
                        border: "1px solid #ddd", 
                        borderRadius: 4 
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={saveQbSettings}
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
                    {busy ? "Saving..." : "Save QB Settings"}
                  </button>
                  
                  <button
                    onClick={testQbConnection}
                    disabled={busy}
                    style={{ 
                      padding: "10px 20px", 
                      background: "#4caf50", 
                      color: "white", 
                      border: "none", 
                      borderRadius: 6,
                      cursor: busy ? "not-allowed" : "pointer",
                      opacity: busy ? 0.6 : 1
                    }}
                  >
                    Test QB Connection
                  </button>
                </div>
              </>
            )}
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
