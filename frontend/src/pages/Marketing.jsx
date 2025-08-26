import React from "react";
import { Link } from "react-router-dom";
import "./Marketing.css";

export default function Marketing() {
  return (
    <div className="mkt-wrap">
      <header className="mkt-header">
        <div className="mkt-brand">BridgeLineUSA</div>
        <nav className="mkt-nav">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#impact">Impact</a>
          <Link className="mkt-cta" to="/login">Sign in</Link>
        </nav>
      </header>

      <section className="mkt-hero">
        <h1>AI-Assisted Manufacturing, Built for Real Shops</h1>
        <p>Quotes to shipping—one platform. Faster planning, fewer surprises, happier customers.</p>
        <div className="mkt-hero-actions">
          <Link className="mkt-cta" to="/login">Sign in to Portal</Link>
          <a className="mkt-secondary" href="#features">Explore Features</a>
        </div>
      </section>

      <section id="features" className="mkt-grid">
        <article><h3>Quotes</h3><p>AI-assisted costing, materials, files & revisions.</p></article>
        <article><h3>Production</h3><p>Scheduling, timers, operator/supervisor efficiency.</p></article>
        <article><h3>Quality</h3><p>Digital inspections, docs, and traceability.</p></article>
        <article><h3>Shipping</h3><p>Labels, pick/pack lists, and schedules.</p></article>
      </section>

      <section id="how" className="mkt-split">
        <div>
          <h2>How it works</h2>
          <ul>
            <li>Connect quotes, jobs, and resources in one flow.</li>
            <li>AI assistance for repetitive, error-prone tasks.</li>
            <li>Role-based portals for customers and shop floor.</li>
          </ul>
        </div>
        <div className="mkt-card">One-of-a-kind AI platform tailored to your operation.</div>
      </section>

      <section id="impact" className="mkt-kpis">
        <div><strong>35%</strong><span>faster quoting</span></div>
        <div><strong>15–25%</strong><span>schedule adherence lift</span></div>
        <div><strong>↓ errors</strong><span>with AI reviews</span></div>
      </section>

      <footer className="mkt-footer">
        <span>© {new Date().getFullYear()} BridgeLineUSA</span>
        <Link to="/login">Customer Sign in</Link>
      </footer>
    </div>
  );
}
