// frontend/src/pages/CustomerQuotes.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CustomerQuotes.css";
import { API_BASE } from "../api/base";

// ---- helpers (ui-friendly, no layout changes) ------------------------------
const fmtMoney = (n) =>
  typeof n === "number" && Number.isFinite(n)
    ? `$${n.toLocaleString()}`
    : "—";

const timeAgo = (ms) => {
  if (!ms) return "—";
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hours ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} days ago`;
  const mo = Math.floor(d / 30);
  return `${mo} mo ago`;
};

const statusFromUpdated = (ms) => {
  if (!ms) return "active";
  const days = (Date.now() - ms) / 86400000;
  if (days <= 3) return "active";
  if (days <= 14) return "pending";
  return "completed";
};

// ---------------------------------------------------------------------------

export default function CustomerQuotes() {
  const nav = useNavigate();

  // UI state (kept identical to your current page)
  const [view, setView] = useState("grid");
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Data
  const [rows, setRows] = useState([]);       // { name, slug, quoteCount, totalValue?, lastUpdated, status, lastActivity }
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Fetch customers from API; fall back to /api/quotes if needed (keeps UI)
  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErr("");

      // 1) Try dedicated endpoint
      try {
        const r = await fetch(`${API_BASE}/api/quotes/customers`, { credentials: "include" });
        if (r.ok) {
          const j = await r.json();
          if (!alive) return;
          if (j?.ok && Array.isArray(j.customers)) {
            // Filter out folders matching /^SCM[-_\s]*(?:Q)?\d{3,}$/i
            const isProbablyQuoteFolder = name =>
              /^SCM[-_\s]*(?:Q)?\d{3,}$/i.test(String(name || '').trim());
            const mapped = j.customers
              .filter(c => !isProbablyQuoteFolder(c.name))
              .map((c) => {
                const status = statusFromUpdated(c.lastUpdated);
                return {
                  name: c.name,
                  slug: c.slug || c.name,
                  quoteCount: c.quoteCount ?? 0,
                  totalValue: undefined,        // not available yet — shown as “—”
                  lastActivity: timeAgo(c.lastUpdated),
                  status,
                  lastUpdated: c.lastUpdated || 0,
                };
              });
            setRows(mapped);
            setLoading(false);
            return;
          }
        } else if (r.status !== 404) {
          console.warn("GET /api/quotes/customers error", r.status);
        }
      } catch (e) {
        console.warn("customers endpoint failed", e);
      }

      // 2) Fallback to /api/quotes and group by customer_name
      try {
        const r2 = await fetch(`${API_BASE}/api/quotes`, { credentials: "include" });
        if (!r2.ok) throw new Error(`GET /api/quotes ${r2.status}`);
        const body = await r2.json();
        if (!alive) return;

        const list = Array.isArray(body) ? body : Array.isArray(body?.quotes) ? body.quotes : [];
        const groups = new Map();
        for (const q of list) {
          const name = (q.customer_name || q.customerName || "Unknown").trim() || "Unknown";
          const arr = groups.get(name) || [];
          arr.push(q);
          groups.set(name, arr);
        }
        // Filter out folders matching /^SCM[-_\s]*(?:Q)?\d{3,}$/i
        const isProbablyQuoteFolder = name =>
          /^SCM[-_\s]*(?:Q)?\d{3,}$/i.test(String(name || '').trim());
        const mapped = Array.from(groups.entries())
          .filter(([name]) => !isProbablyQuoteFolder(name))
          .map(([name, arr]) => {
            const lastUpdated =
              arr.reduce(
                (mx, it) => Math.max(mx, Date.parse(it.date || it.created_at || 0) || 0),
                0
              ) || 0;
            const status = statusFromUpdated(lastUpdated);
            return {
              name,
              slug: name,
              quoteCount: arr.length,
              totalValue: undefined,            // no per-customer dollars yet
              lastActivity: timeAgo(lastUpdated),
              status,
              lastUpdated,
            };
          });
        setRows(mapped);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load customers");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  // Search + sort (kept same options)
  const data = useMemo(() => {
    let out = rows.filter((c) =>
      c.name.toLowerCase().includes(q.toLowerCase())
    );
    switch (sortBy) {
      case "quotes":
        out.sort((a, b) => (b.quoteCount || 0) - (a.quoteCount || 0));
        break;
      case "value":
        // until we have dollars, fall back to quotes
        out.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0) || (b.quoteCount || 0) - (a.quoteCount || 0));
        break;
      case "name":
      default:
        out.sort((a, b) => a.name.localeCompare(b.name));
    }
    return out;
  }, [rows, q, sortBy]);

  const openCustomer = (nameOrSlug) => {
    nav(`/quotes/customers/${encodeURIComponent(nameOrSlug)}`);
  };

  const askAI = () => {
    alert(
      "Ask AI — Customer Quotes\n\nTry prompts like:\n• “Summarize top 5 customers by quote value this quarter.”\n• “Show quotes pending review for ABC Manufacturing.”\n• “Suggest follow-ups for quotes older than 30 days.”\n\n(We’ll wire this to a real endpoint later.)"
    );
  };

  // ----------------------------- RENDER (same layout text) -------------------
  return (
    <>
      {/* Breadcrumb / header block preserved */}
      <div style={{ marginBottom: 12 }}>
        <div>Dashboard › Quotes › Customer Quotes</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <button onClick={() => nav("/quotes")} aria-label="Back to Quotes">
          ← Back to Quotes
        </button>
      </div>

      <h1 style={{ margin: "6px 0" }}>Customer Quotes</h1>
      <p>Browse quote folders organized by customer</p>

      {/* Toolbar preserved */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", margin: "12px 0" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="text"
          className="search-input"
          placeholder="Search customers..."
        />

        <div>
          <button onClick={() => setView("grid")} aria-pressed={view === "grid"}>
            Grid
          </button>
          <button onClick={() => setView("list")} aria-pressed={view === "list"}>
            List
          </button>
        </div>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="quotes">Sort by Quote Count</option>
          <option value="value">Sort by Total Value</option>
        </select>

        <button onClick={askAI}>Ask AI</button>
      </div>

      {/* States */}
      {loading && <div>Loading…</div>}
      {!loading && err && (
        <div style={{ color: "#b00020" }}>Failed to load: {String(err)}</div>
      )}

      {!loading && !err && data.length === 0 ? (
        <>
          <h2>No customer folders found</h2>
          <p>Customer folders will be automatically created when you save new quotes</p>
          <Link to="/quotes/new">Create Your First Quote</Link>
        </>
      ) : null}

      {!loading && !err && data.length > 0 ? (
        <>
          {view === "grid" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 12,
              }}
            >
              {data.map((c) => (
                <div
                  key={c.slug}
                  role="button"
                  onClick={() => openCustomer(c.slug)}
                  onKeyDown={(e) => e.key === "Enter" && openCustomer(c.slug)}
                  tabIndex={0}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    background: "#fff",
                    padding: 14,
                    cursor: "pointer",
                  }}
                  title={`Open ${c.name}`}
                >
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
                    {c.quoteCount} {c.quoteCount === 1 ? "quote" : "quotes"} • {fmtMoney(c.totalValue)}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12 }}>
                    <span className={`status-badge ${c.status}`}>{c.status?.toUpperCase()}</span>
                    <span>{c.lastActivity}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    <th style={{ textAlign: "left", padding: 8 }}>Customer Name</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Quotes</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Total Value</th>
                    <th style={{ textAlign: "left", padding: 8 }}>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((c) => (
                    <tr
                      key={c.slug}
                      role="button"
                      onClick={() => openCustomer(c.slug)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ padding: 8 }}>{c.name}</td>
                      <td style={{ padding: 8 }}>{c.quoteCount} {c.quoteCount === 1 ? "quote" : "quotes"}</td>
                      <td style={{ padding: 8 }}>{fmtMoney(c.totalValue)}</td>
                      <td style={{ padding: 8 }}>{c.lastActivity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </>
  );
}
