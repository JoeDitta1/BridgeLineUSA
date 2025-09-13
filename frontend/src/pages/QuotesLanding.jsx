import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./QuotesLanding.css";

export default function QuotesLanding() {
  const navigate = useNavigate();

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="logo-section">
          <div className="logo"></div>
          <div className="breadcrumb">
            <Link to="/">Dashboard</Link>
            <span>›</span>
            <span>Quotes</span>
          </div>
        </div>
        <div className="nav-section">
          <Link to="/" className="back-btn">← Back to Dashboard</Link>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            <div className="page-icon">💼</div>
            Quotes Management
          </h1>
          <p className="page-subtitle">
            Manage customer quotes, pricing, and proposals with AI-assisted calculations
          </p>
        </div>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="quick-buttons">
            <Link className="quick-btn" to="/quote/new">➕ New Quote</Link>
            <Link className="quick-btn secondary" to="/quotes/log">📋 View Quote Log</Link>
            <Link className="quick-btn secondary" to="/quotes/log">🔍 Search Quotes</Link>
            {/* Renamed from “Export Data” → “Customer Folders” */}
            <Link className="quick-btn secondary" to="/quotes/customers">📁 Customer Folders</Link>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">24</div>
            <div className="stat-label">Active Quotes</div>
            <div className="stat-change positive">+3 this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">12</div>
            <div className="stat-label">Pending Review</div>
            <div className="stat-change negative">2 overdue</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">$847K</div>
            <div className="stat-label">Total Quote Value</div>
            <div className="stat-change positive">+12% vs last month</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">68%</div>
            <div className="stat-label">Win Rate</div>
            <div className="stat-change positive">+5% this quarter</div>
          </div>
        </section>

        {/* Action Cards */}
        <section className="action-grid">
          <div className="action-card new-quote" onClick={() => navigate("/quote/new")}>
            <div className="action-icon">➕</div>
            <div className="action-title">Create New Quote</div>
            <div className="action-description">
              Start a new customer quote with AI-assisted material calculations and pricing
            </div>
            <div className="action-meta">
              <span>Average time: 15 min</span>
              <span>Last used: 2 hours ago</span>
            </div>
          </div>

          <div className="action-card quote-log" onClick={() => navigate("/quotes/log")}>
            <div className="action-icon">📋</div>
            <div className="action-title">Quote Log</div>
            <div className="action-description">
              View all quotes with sorting, filtering, and status tracking capabilities
            </div>
            <div className="action-meta">
              <span>24 active quotes</span>
              <span>Updated: Just now</span>
            </div>
          </div>

          <div
            className="action-card ai-quote"
            onClick={() =>
              alert(
                "AI Quote Assistant (stub)\n\nUpload drawings/specs for BOM extraction and quote generation.\n• Drawing analysis\n• BOM extraction\n• Material identification\n• Cost estimation\n• Quote generation"
              )
            }
          >
            <div className="action-icon">🤖</div>
            <div className="action-title">AI Quote Assistant</div>
            <div className="action-description">
              Upload drawings and let AI extract BOMs and generate quotes automatically
            </div>
            <div className="action-meta">
              <span>Beta feature</span>
              <span>95% accuracy</span>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="recent-section">
          <div className="section-header">
            <h3 className="section-title">Recent Quote Activity</h3>
            <Link to="/quotes/log" className="view-all-btn">View All →</Link>
          </div>

          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon quote">💼</div>
              <div className="activity-content">
                <div className="activity-title">SCM-Q2025-0143 - Steel Fabrication</div>
                <div className="activity-details">ABC Manufacturing • $45,230 • Material + Labor</div>
              </div>
              <div className="activity-time">2 hours ago</div>
            </div>

            <div className="activity-item">
              <div className="activity-icon approved">✅</div>
              <div className="activity-content">
                <div className="activity-title">SCM-Q2025-0142 - Approved</div>
                <div className="activity-details">XYZ Corp • $28,750 • Converting to Job #J2025-089</div>
              </div>
              <div className="activity-time">4 hours ago</div>
            </div>

            <div className="activity-item">
              <div className="activity-icon revision">📝</div>
              <div className="activity-content">
                <div className="activity-title">SCM-Q2025-0141 - Revision Requested</div>
                <div className="activity-details">Industrial Partners • $67,890 • Material grade change</div>
              </div>
              <div className="activity-time">1 day ago</div>
            </div>

            <div className="activity-item">
              <div className="activity-icon quote">💼</div>
              <div className="activity-content">
                <div className="activity-title">SCM-Q2025-0140 - Under Review</div>
                <div className="activity-details">Steel Works Inc • $156,420 • Complex assembly project</div>
              </div>
              <div className="activity-time">2 days ago</div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
