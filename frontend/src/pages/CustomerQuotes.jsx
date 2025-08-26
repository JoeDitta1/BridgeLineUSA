import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CustomerQuotes.css";

const SAMPLE_CUSTOMERS = [
  { name: "ABC Manufacturing",      quoteCount: 8,  totalValue: 245000, lastActivity: "2 hours ago", status: "active"   },
  { name: "XYZ Corporation",        quoteCount: 12, totalValue: 567000, lastActivity: "1 day ago",   status: "active"   },
  { name: "Industrial Partners LLC",quoteCount: 5,  totalValue: 189000, lastActivity: "3 days ago",  status: "pending"  },
  { name: "Steel Works Inc",        quoteCount: 15, totalValue: 892000, lastActivity: "1 week ago",  status: "active"   },
  { name: "Modern Fabrication",     quoteCount: 3,  totalValue: 67000,  lastActivity: "2 weeks ago", status: "completed"},
  { name: "Precision Manufacturing",quoteCount: 7,  totalValue: 334000, lastActivity: "3 days ago",  status: "active"   },
];

export default function CustomerQuotes() {
  const nav = useNavigate();
  const [view, setView] = useState("grid");
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const data = useMemo(() => {
    let rows = SAMPLE_CUSTOMERS.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
    switch (sortBy) {
      case "quotes": rows.sort((a,b)=>b.quoteCount-a.quoteCount); break;
      case "value":  rows.sort((a,b)=>b.totalValue-a.totalValue); break;
      case "name":   default: rows.sort((a,b)=>a.name.localeCompare(b.name));
    }
    return rows;
  }, [q, sortBy]);

  const openCustomer = (name) => {
    nav(`/quotes/customers/${encodeURIComponent(name)}`);
  };

  const askAI = () => {
    alert(
      "Ask AI — Customer Quotes\n\nTry prompts like:\n• “Summarize top 5 customers by quote value this quarter.”\n• “Show quotes pending review for ABC Manufacturing.”\n• “Suggest follow-ups for quotes older than 30 days.”\n\n(We’ll wire this to a real endpoint later.)"
    );
  };

  return (
    <>
      <header className="header">
        <div className="logo-section">
          <div className="logo" />
          <div className="breadcrumb">
            <Link to="/">Dashboard</Link>
            <span>›</span>
            <Link to="/quotes">Quotes</Link>
            <span>›</span>
            <span>Customer Quotes</span>
          </div>
        </div>
        <div className="nav-section">
          <Link to="/quotes" className="back-btn">← Back to Quotes</Link>
        </div>
      </header>

      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            <div className="page-icon">📁</div>
            Customer Quotes
          </h1>
          <p className="page-subtitle">Browse quote folders organized by customer</p>
        </div>

        <div className="toolbar">
          <div className="search-section">
            <input
              value={q}
              onChange={e=>setQ(e.target.value)}
              type="text"
              className="search-input"
              placeholder="Search customers..."
            />
          </div>

          <div className="view-controls">
            <div className="view-toggle">
              <button className={`view-btn ${view==="grid"?"active":""}`} onClick={()=>setView("grid")}>📊 Grid</button>
              <button className={`view-btn ${view==="list"?"active":""}`} onClick={()=>setView("list")}>📋 List</button>
            </div>
            <select className="sort-select" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="quotes">Sort by Quote Count</option>
              <option value="value">Sort by Total Value</option>
            </select>
            <button className="askai-btn" onClick={askAI}>🤖 Ask AI</button>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h2 className="empty-title">No customer folders found</h2>
            <p className="empty-subtitle">Customer folders will be automatically created when you save new quotes</p>
            <Link to="/quote/new" className="create-customer-btn">Create Your First Quote</Link>
          </div>
        ) : (
          <>
            {view === "grid" ? (
              <div className="folder-grid">
                {data.map(c=>(
                  <div key={c.name} className="folder-card" onClick={()=>openCustomer(c.name)}>
                    <div className="folder-icon">📁</div>
                    <div className="folder-name">{c.name}</div>
                    <div className="folder-stats">{c.quoteCount} quotes • ${c.totalValue.toLocaleString()}</div>
                    <div className="folder-meta">
                      <span className={`status-badge status-${c.status}`}>{c.status}</span>
                      <span>{c.lastActivity}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="folder-list">
                <div className="list-header">
                  <div></div><div>Customer Name</div><div>Quotes</div><div>Total Value</div><div>Last Activity</div>
                </div>
                <div id="listContent">
                  {data.map(c=>(
                    <div key={c.name} className="list-row" onClick={()=>openCustomer(c.name)}>
                      <div className="list-folder-icon">📁</div>
                      <div className="list-folder-name">{c.name}</div>
                      <div className="list-stats">{c.quoteCount} quotes</div>
                      <div className="list-stats">${c.totalValue.toLocaleString()}</div>
                      <div className="list-stats">{c.lastActivity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
