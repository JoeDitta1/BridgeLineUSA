import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <>
      <header className="header">
        <div className="logo-section">
          <div className="logo"></div>
          <div className="company-info">
            <h1>BridgeLineUSA</h1>
            <div className="tagline">AI-Assisted Manufacturing Platform</div>
          </div>
        </div>
        <div className="user-section">
          <div className="user-info">
            <div className="user-name">Admin User</div>
            <div className="user-role">System Administrator</div>
          </div>
          <div className="user-avatar">AU</div>
        </div>
      </header>

      <main className="main-content">
        <section className="welcome-section">
          <h2>Welcome to BridgeLineUSA Dashboard</h2>
          <p>
            Your comprehensive manufacturing operations platform. Navigate through the modules below to manage quotes,
            track jobs, monitor production, and maintain quality standards.
          </p>
        </section>

        <section className="nav-grid">
          <Link to="/quotes" className="nav-card quotes">
            <div className="card-icon">💼</div>
            <div className="card-title">Quotes</div>
            <div className="card-description">
              Manage customer quotes, pricing, and proposals. AI-assisted quote generation and material calculations.
            </div>
            <div className="card-stats">
              <div className="stat">
                <div className="stat-number">24</div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat">
                <div className="stat-number">12</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat">
                <div className="stat-number">8</div>
                <div className="stat-label">This Week</div>
              </div>
            </div>
          </Link>

          {/* Route Jobs to Production for now */}
          <Link to="/production" className="nav-card jobs">
            <div className="card-icon">🏗️</div>
            <div className="card-title">Jobs</div>
            <div className="card-description">
              Track active jobs, monitor progress, and manage task assignments with real-time efficiency scoring.
            </div>
            <div className="card-stats">
              <div className="stat">
                <div className="stat-number">16</div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat">
                <div className="stat-number">5</div>
                <div className="stat-label">Behind</div>
              </div>
              <div className="stat">
                <div className="stat-number">92%</div>
                <div className="stat-label">On Time</div>
              </div>
            </div>
          </Link>

          <Link to="/production" className="nav-card production">
            <div className="card-icon">⚙️</div>
            <div className="card-title">Production</div>
            <div className="card-description">
              Monitor shop floor operations, resource planning, and detailed production instructions with time tracking.
            </div>
            <div className="card-stats">
              <div className="stat">
                <div className="stat-number">8</div>
                <div className="stat-label">Running</div>
              </div>
              <div className="stat">
                <div className="stat-number">3</div>
                <div className="stat-label">Queued</div>
              </div>
              <div className="stat">
                <div className="stat-number">85%</div>
                <div className="stat-label">Efficiency</div>
              </div>
            </div>
          </Link>

          <Link to="/sales-orders" className="nav-card sales-orders">
            <div className="card-icon">🧾</div>
            <div className="card-title">Sales Orders</div>
            <div className="card-description">
              Manage sales orders (SCM-S###), POs, and work order forms.
            </div>
          </Link>

          <Link to="/quality" className="nav-card quality">
            <div className="card-icon">✅</div>
            <div className="card-title">Quality Control</div>
            <div className="card-description">
              Digital quality forms, compliance tracking, inspection management, and automated documentation.
            </div>
            <div className="card-stats">
              <div className="stat">
                <div className="stat-number">15</div>
                <div className="stat-label">Inspections</div>
              </div>
              <div className="stat">
                <div className="stat-number">2</div>
                <div className="stat-label">Issues</div>
              </div>
              <div className="stat">
                <div className="stat-number">98.5%</div>
                <div className="stat-label">Pass Rate</div>
              </div>
            </div>
          </Link>

          <Link to="/equipment" className="nav-card cnc">
            <div className="card-icon">🔧</div>
            <div className="card-title">CNC Operations</div>
            <div className="card-description">
              Bodor laser tracking, machine scheduling, operator assignments, and equipment maintenance logs.
            </div>
            <div className="card-stats">
              <div className="stat">
                <div className="stat-number">4</div>
                <div className="stat-label">Machines</div>
              </div>
              <div className="stat">
                <div className="stat-number">6.2</div>
                <div className="stat-label">Avg Hours</div>
              </div>
              <div className="stat">
                <div className="stat-number">1</div>
                <div className="stat-label">Maintenance</div>
              </div>
            </div>
          </Link>

          <Link to="/admin" className="nav-card admin">
            <div className="card-icon">👤</div>
            <div className="card-title">Admin Portal</div>
            <div className="card-description">
              User management, system settings, data archival, and advanced configuration options.
            </div>
            <div className="card-stats">
              <div className="stat">
                <div className="stat-number">12</div>
                <div className="stat-label">Users</div>
              </div>
              <div className="stat">
                <div className="stat-number">3</div>
                <div className="stat-label">Roles</div>
              </div>
              <div className="stat">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
            </div>
          </Link>
        </section>

        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link className="action-btn" to="/quotes/new">➕ New Quote</Link>
            <Link className="action-btn" to="/production">🏗️ Create Job</Link>
            <Link className="action-btn secondary" to="/quotes">📊 View Reports</Link>
            <Link className="action-btn secondary" to="/quotes">🔍 Search Files</Link>
          </div>
        </section>
      </main>
    </>
  );
}
