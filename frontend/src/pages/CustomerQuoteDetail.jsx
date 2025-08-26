import React, { useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./CustomerQuoteDetail.css";

const SAMPLE_FOLDERS = [
  { quoteNumber:"SCM-Q2025-0143", revision:2, description:"Steel Fabrication",  dateCreated:"2025-01-15", status:"active",    value:45230,  subfolders:["Quote Form","Vendor Quotes","Drawings","Customer Info"] },
  { quoteNumber:"SCM-Q2025-0138", revision:1, description:"Pump Assembly",      dateCreated:"2025-01-10", status:"completed", value:28750,  subfolders:["Quote Form","Vendor Quotes","Drawings","Customer Info"] },
  { quoteNumber:"SCM-Q2025-0135", revision:3, description:"Tank Project",       dateCreated:"2025-01-08", status:"revision",  value:67890,  subfolders:["Quote Form","Vendor Quotes","Drawings","Customer Info"] },
  { quoteNumber:"SCM-Q2025-0132", revision:1, description:"Conveyor System",    dateCreated:"2025-01-05", status:"pending",   value:156420, subfolders:["Quote Form","Vendor Quotes","Drawings","Customer Info"] },
];

export default function CustomerQuoteDetail() {
  const { customerName } = useParams();
  const nav = useNavigate();
  const folders = useMemo(()=>SAMPLE_FOLDERS,[]);

  const totalQuotes = folders.length;
  const totalValue  = folders.reduce((s,f)=>s+f.value,0);
  const activeCount = folders.filter(f=>f.status==="active").length;

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
            <Link to="/quotes/customers">Customer Quotes</Link>
            <span>›</span>
            <span className="customer-name">{decodeURIComponent(customerName)}</span>
          </div>
        </div>
        <div className="nav-section">
          <button className="back-btn" onClick={()=>nav("/quotes/customers")}>← Back to Customers</button>
        </div>
      </header>

      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            <div className="customer-icon">🏢</div>
            <span>{decodeURIComponent(customerName)}</span>
          </h1>
          <p className="page-subtitle">Quote folders and project documentation</p>
        </div>

        <div className="quick-actions">
          <div className="action-buttons">
            <Link className="action-btn" to={`/quote/new?customer=${encodeURIComponent(customerName)}`}>➕ New Quote</Link>
            <Link className="action-btn secondary" to={`/quotes/log?customer=${encodeURIComponent(customerName)}`}>📋 Quote Log</Link>
            <button className="action-btn secondary" onClick={()=>alert("Export (stub)")}>📊 Export Data</button>
          </div>
          <div className="customer-stats">
            <div className="stat"><div className="stat-number">{totalQuotes}</div><div className="stat-label">Total Quotes</div></div>
            <div className="stat"><div className="stat-number">${Math.round(totalValue/1000)}K</div><div className="stat-label">Total Value</div></div>
            <div className="stat"><div className="stat-number">{activeCount}</div><div className="stat-label">Active</div></div>
          </div>
        </div>

        {folders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h2 className="empty-title">No quote folders yet</h2>
            <p className="empty-subtitle">Quote folders will be created when you save new quotes for this customer</p>
            <Link className="create-quote-btn" to={`/quote/new?customer=${encodeURIComponent(customerName)}`}>Create First Quote</Link>
          </div>
        ) : (
          <div className="quote-folders">
            {folders.map(f=>(
              <div key={f.quoteNumber} className="quote-folder-card" onClick={() => alert(`Open folder ${f.quoteNumber} Rev ${f.revision} (stub)`)} >
                {f.revision>1 && <div className="revision-badge">Rev {f.revision}</div>}
                <div className="quote-folder-header">
                  <div className="quote-folder-icon">📁</div>
                  <div className="quote-folder-info">
                    <div className="quote-number">{f.quoteNumber}</div>
                    <div className="quote-description">{f.description}</div>
                    <div className="quote-date">Created: {new Date(f.dateCreated).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}</div>
                  </div>
                </div>
                <div className="quote-subfolders">
                  {f.subfolders.map(s=>(
                    <div key={s} className="subfolder-chip">📄 {s}</div>
                  ))}
                </div>
                <div className="quote-actions">
                  <div className={`quote-status status-${f.status}`}>{f.status}</div>
                  <div className="quote-value">${f.value.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
