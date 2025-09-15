import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../api/base";

// BridgeLineUSA — Marketing + Sign‑In Landing (integrated with existing auth system)
// Removed CSS import to avoid build errors. Styles are now inlined.
// Integrated with existing Supabase authentication and React Router navigation.

export default function MarketingSignInLanding() {
  const nav = useNavigate();
  const location = useLocation();
  
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const emailInputRef = useRef(null);

  useEffect(() => {
    if (open && emailInputRef.current) emailInputRef.current.focus();
  }, [open]);

  // Check if user is already logged in as OEM
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/check`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.authenticated) {
          if (data.user?.role === 'oem') {
            nav('/oem/dashboard', { replace: true });
          } else if (data.user?.role === 'manufacturer' || data.user?.role === 'admin') {
            nav('/dashboard', { replace: true });
          }
        }
      } catch (err) {
        console.log('Auth check failed:', err);
      }
    };
    
    checkAuth();
  }, [nav]);

  function validateEmail(e) {
    return /[^@\s]+@[^@\s]+\.[^@\s]+/.test((e || "").trim());
  }

  async function handleLogin(e) {
    e.preventDefault();
    console.log('Login attempt:', { email, password: password ? '***' : '' });
    setError(null);
    if (!validateEmail(email)) {
      console.log('Email validation failed');
      return setError("Please enter a valid email address.");
    }
    if (!password) {
      console.log('Password validation failed');
      return setError("Please enter your password.");
    }

    console.log('Starting login request...');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      console.log('Login response:', response.status, response.ok);
      const data = await response.json();
      console.log('Login data:', data);

      if (response.ok && data.success) {
        console.log('Login successful, user role:', data.user?.role);
        // Store JWT token
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          console.log('Stored JWT token');
        }
        // Redirect based on user role
        if (data.user?.role === 'oem') {
          const from = location.state?.from?.pathname || '/oem/dashboard';
          console.log('Redirecting OEM to:', from);
          nav(from, { replace: true });
        } else if (data.user?.role === 'manufacturer' || data.user?.role === 'admin') {
          const from = location.state?.from?.pathname || '/dashboard';
          console.log('Redirecting manufacturer/admin to:', from);
          nav(from, { replace: true });
        } else {
          console.log('Invalid user role:', data.user?.role);
          setError('Access denied. Invalid user role.');
        }
      } else {
        console.log('Login failed:', data.message);
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="marketing-page">
      <StyleTag />

      {/* Top Nav */}
      <header className="nav">
        <div className="logo-section">
          <div className="logo-circle">BL</div>
          <div className="company-info">
            <div className="brand">BridgeLineUSA</div>
            <div className="sub">South Coast Manufacturing, LLC</div>
          </div>
        </div>
        <nav className="links">
          <a href="#modules">Modules</a>
          <a href="#audiences">Who it's for</a>
          <a href="#security">Security</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="actions">
          <a href="#request" className="req">Request Access</a>
          <button onClick={() => setOpen(true)} className="btn">Sign In</button>
        </div>
      </header>

      {/* Sign In Modal */}
      {open && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-content">
            <h2>Admin‑approved Sign In</h2>
            <form onSubmit={handleLogin} noValidate>
              <label className="lbl">Email</label>
              <div className="input-wrap">
                <span className="input-ico" aria-hidden>✉</span>
                <input
                  type="email"
                  ref={emailInputRef}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              <label className="lbl">Password</label>
              <div className="input-wrap">
                <span className="input-ico" aria-hidden>🔒</span>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="toggle"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  title={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {error && <div className="error">⚠ {error}</div>}
              <button type="submit" className="btn" disabled={loading || !validateEmail(email)}>
                {loading ? <><span className="spin" aria-hidden /> Working…</> : <>Sign In →</>}
              </button>
              <p className="hint">Need an account? Request access below. Admin approval required.</p>
            </form>
            <button onClick={() => setOpen(false)} className="close" aria-label="Close">Close</button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="hero">
        <div className="hero-text">
          <h1>
            <span className="hero-title-main">The First AI-Powered MES</span>
            <br />
            <span className="hero-title-bridge">Connecting OEMs and Manufacturers in Real Time</span>
          </h1>
          <p className="hero-subtitle">Revolutionary manufacturing platform that creates direct lines between OEMs and shop floors. From quotes to quality assurance — all powered by AI intelligence and real-time collaboration.</p>
          <div className="hero-actions">
            <a href="#request" className="btn">Request Access</a>
            <button onClick={() => setOpen(true)} className="btn-outline">Admin‑approved Sign In</button>
          </div>
          <div className="features">
            <span>🛡️ MFA + role‑based access</span>
            <span>🤖 Embedded AI agent</span>
            <span>📋 Audit‑ready quality</span>
          </div>
        </div>
        <AvatarPanel />
      </section>

      {/* Modules Overview */}
      <section id="modules" className="modules">
        <h2>One OS for Manufacturing</h2>
        <div className="module-grid">
          <ModuleCard icon="💰" title="Quote Builder" desc="Dynamic pricing with AI material suggestions and margin targets. Export to routers, update inventory, track revisions." />
          <ModuleCard icon="🤖" title="Router Generator" desc="Prompt‑driven toolpath with feeds/speeds optimization. Links directly to shop floor and quality checks." />
          <ModuleCard icon="📅" title="AI Scheduling" desc="Understands machine capacity, material lead times, and priority jobs. Adapts to real‑time delays." />
          <ModuleCard icon="📊" title="Inventory OS" desc="Material tracking from order to scrap. API hooks to suppliers. Knows what's on‑hand vs. allocated." />
          <ModuleCard icon="⏱️" title="Time Tracking" desc="Clock in/out with geofences. Links time to job ops for actual vs. estimated costing." />
          <ModuleCard icon="🔍" title="Quality (ISO/ASME)" desc="Digital forms, inspection photos, deviation tracking. Audit trails for certifications." />
        </div>
      </section>

      {/* Request Access */}
      <section id="request" className="request">
        <h2>Request Access</h2>
        <p>Tell us who you are and how you plan to use BridgeLineUSA. An admin will review and approve.</p>
        <RequestAccessForm />
      </section>

      {/* Footer */}
      <footer className="footer">
        <div>© {new Date().getFullYear()} South Coast Manufacturing, LLC — BridgeLineUSA</div>
        <div className="footer-links">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Status</a>
        </div>
      </footer>
    </div>
  );
}

function AvatarPanel() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  function enableAudio() {
    setAudioEnabled(true);
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(err => {
        console.log('Video play failed:', err);
        setVideoError(true);
      });
    }
  }

  function handleVideoEnded() {
    setAudioEnabled(false); // Show play button again
  }

  function handleVideoError() {
    setVideoError(true);
  }

  return (
    <div className="avatar-panel">
      <div className="video-container">
        <video
          ref={videoRef}
          className="avatar-video"
          poster="/assets/avatar-poster.jpg"
          muted
          preload="auto"
          onError={handleVideoError}
          onEnded={handleVideoEnded}
        >
          <source src="/assets/avatar-intro.mp4" type="video/mp4" />
          <source src="/assets/avatar-intro.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
        {!audioEnabled && (
          <button onClick={enableAudio} className="play-button" aria-label="Play avatar introduction">
            <div className="play-icon">▶</div>
          </button>
        )}
      </div>
    </div>
  );
}

function ModuleCard({ icon, title, desc }) {
  return (
    <div className="module-card">
      <div className="module-icon">{icon}</div>
      <h3 className="module-title">{title}</h3>
      <p className="module-desc">{desc}</p>
    </div>
  );
}

function RequestAccessForm() {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // TODO: Replace with actual endpoint when backend is ready
      const response = await fetch(`${API_BASE}/api/access-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, company, role, email, notes })
      });
      
      if (response.ok) {
        alert("Request sent! Admin will review and contact you.");
        setName("");
        setCompany("");
        setRole("");
        setEmail("");
        setNotes("");
      } else {
        alert("Error sending request. Please try again.");
      }
    } catch (err) {
      console.error('Access request error:', err);
      alert("Error sending request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="req-form" noValidate>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Full Name" 
        required 
      />
      <input 
        value={company} 
        onChange={(e) => setCompany(e.target.value)} 
        placeholder="Company" 
        required 
      />
      <input 
        value={role} 
        onChange={(e) => setRole(e.target.value)} 
        placeholder="Role (Owner / Estimator / OEM PM)" 
        required 
      />
      <input 
        type="email"
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email" 
        required 
      />
      <input 
        value={notes} 
        onChange={(e) => setNotes(e.target.value)} 
        placeholder="What problems are you solving?" 
        className="notes-input"
      />
      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? "Sending…" : "Submit Request"}
      </button>
    </form>
  );
}

function StyleTag() {
  // Inlined CSS to avoid missing file errors
  return (
    <style data-bl-inline="true">{`
/***** Layout *****/
:root { 
  --slate-50:#f8fafc; 
  --slate-100:#f1f5f9; 
  --slate-200:#e2e8f0; 
  --slate-400:#94a3b8; 
  --slate-600:#475569; 
  --slate-700:#334155;
  --slate-800:#1e293b;
  --ink:#0f172a; 
}
*{box-sizing:border-box}
body{margin:0}
.marketing-page{
  min-height:100vh;
  background:linear-gradient(135deg,var(--slate-50),#fff);
  color:var(--ink);
  font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial;
  line-height:1.6;
}

/***** Nav *****/
.nav{
  position:sticky;
  top:0;
  background:rgba(255,255,255,.85);
  backdrop-filter:saturate(180%) blur(8px);
  border-bottom:1px solid var(--slate-200);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  padding:12px 24px;
  z-index:40;
}
.logo-section{display:flex;align-items:center;gap:1rem}
.logo-circle{
  width:50px;
  height:50px;
  background:#1e3a5f;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  position:relative;
  font-weight:bold;
  font-size:18px;
  color:#fff;
}
.logo-circle::after{
  content:'✓';
  position:absolute;
  bottom:-2px;
  right:-2px;
  background:#00a884;
  color:#fff;
  width:18px;
  height:18px;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:10px;
  border:2px solid #fff;
}
.company-info{display:flex;flex-direction:column}
.brand{font-weight:600;font-size:16px}
.sub{font-size:12px;color:#64748b}
.links{display:flex;gap:24px}
.links a{color:var(--slate-700);text-decoration:none;font-size:14px}
.links a:hover{color:var(--ink)}
.actions{display:flex;gap:12px;align-items:center}
.req{text-decoration:none;color:var(--slate-700);font-size:14px}
.req:hover{text-decoration:underline}
.btn{
  background:var(--ink);
  color:#fff;
  border:none;
  border-radius:8px;
  padding:8px 16px;
  cursor:pointer;
  font-size:14px;
  font-weight:500;
  text-decoration:none;
  display:inline-flex;
  align-items:center;
  justify-content:center;
}
.btn:hover{background:var(--slate-800)}
.btn:disabled{background:var(--slate-400);cursor:not-allowed}
.btn-outline{
  background:#fff;
  color:var(--ink);
  border:1px solid var(--slate-200);
  border-radius:8px;
  padding:8px 16px;
  cursor:pointer;
  font-size:14px;
  text-decoration:none;
}
.btn-outline:hover{background:var(--slate-50)}

/***** Hero *****/
.hero{
  max-width:1200px;
  margin:48px auto;
  display:grid;
  grid-template-columns:1fr;
  gap:32px;
  padding:0 24px;
  align-items:center;
}
@media(min-width:1024px){.hero{grid-template-columns:1.1fr .9fr}}
.hero h1{
  font-size:clamp(28px, 5vw, 48px);
  line-height:1.1;
  font-weight:700;
  margin:0 0 16px 0;
}
.hero-title-main{
  display:block;
  background:linear-gradient(90deg, var(--ink), #6366f1, var(--ink));
  background-size:200% 200%;
  background-clip:text;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  animation:heroGradient 3s ease-in-out infinite;
}
.hero-title-bridge{
  display:block;
  color:var(--ink);
  font-weight:600;
  opacity:0;
  animation:slideInUp 0.8s ease-out 0.3s forwards;
}
.hero-subtitle{
  margin:0 0 24px 0;
  color:var(--slate-600);
  font-size:18px;
  opacity:0;
  animation:slideInUp 0.8s ease-out 0.6s forwards;
}
@keyframes heroGradient{
  0%, 100%{background-position:0% 50%}
  50%{background-position:100% 50%}
}
@keyframes slideInUp{
  from{opacity:0;transform:translateY(20px)}
  to{opacity:1;transform:translateY(0)}
}
.hero-actions{
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  margin-bottom:24px;
  opacity:0;
  animation:slideInUp 0.8s ease-out 0.9s forwards;
}
.features{
  display:flex;
  gap:16px;
  flex-wrap:wrap;
  color:var(--slate-600);
  font-size:14px;
  opacity:0;
  animation:slideInUp 0.8s ease-out 1.2s forwards;
}

/***** Avatar *****/
.avatar-panel{position:relative}
.video-container{
  position:relative;
  width:100%;
}
.avatar-video{
  width:100% !important;
  height:100% !important;
  object-fit:cover !important;
  display:block !important;
  margin:0 !important;
  padding:0 !important;
  border:none !important;
  outline:none !important;
  background:transparent !important;
}
.avatar-content{text-align:center}
.avatar-icon{font-size:48px;margin-bottom:16px}
.avatar-title{font-size:18px;font-weight:500;margin-bottom:4px}
.avatar-subtitle{font-size:14px;opacity:0.75}
.play-button{
  position:absolute;
  top:50%;
  left:50%;
  transform:translate(-50%, -50%);
  height:64px;
  width:64px;
  border-radius:50%;
  border:none;
  background:rgba(255,255,255,0.95);
  backdrop-filter:blur(8px);
  color:#1e3a5f;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  box-shadow:0 8px 32px rgba(0,0,0,0.3);
  transition:all 0.3s ease;
}
.play-button:hover{
  transform:translate(-50%, -50%) scale(1.1);
  background:rgba(255,255,255,1);
}
.play-icon{
  font-size:24px;
  margin-left:4px;
}
  box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border:1px solid var(--slate-200);
  background:linear-gradient(135deg, #1f2937 0%, #111827 100%);
  display:flex;
  align-items:center;
  justify-content:center;
  color:white;
}
.avatar-content{text-align:center}
.avatar-icon{font-size:48px;margin-bottom:16px}
.avatar-title{font-size:18px;font-weight:500;margin-bottom:4px}
.avatar-subtitle{font-size:14px;opacity:0.75}
.avatar-description{
  margin-top:8px;
  font-size:14px;
  color:var(--slate-600);
}
.play{
  position:absolute;
  top:50%;
  left:50%;
  transform:translate(-50%, -50%);
  height:56px;
  width:56px;
  border-radius:50%;
  border:none;
  background:rgba(255,255,255,0.9);
  color:var(--ink);
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);
  cursor:pointer;
  font-size:16px;
}

/***** Modules *****/
.modules{
  max-width:1200px;
  margin:48px auto;
  padding:0 24px;
}
.modules h2{
  font-size:32px;
  font-weight:600;
  text-align:center;
  margin-bottom:32px;
}
.module-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));
  gap:24px;
}
.module-card{
  background:white;
  padding:24px;
  border-radius:8px;
  border:1px solid var(--slate-200);
  box-shadow:0 1px 3px 0 rgba(0, 0, 0, 0.1);
}
.module-icon{font-size:32px;margin-bottom:12px}
.module-title{
  font-size:18px;
  font-weight:600;
  margin:0 0 8px 0;
}
.module-desc{
  font-size:14px;
  color:var(--slate-600);
  margin:0;
}

/***** Modal *****/
.modal{
  position:fixed;
  inset:0;
  z-index:60;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:16px;
  background:rgba(15,23,42,.5);
}
.modal-content{
  width:min(92vw,400px);
  background:#fff;
  border-radius:12px;
  box-shadow:0 20px 60px rgba(2,6,23,.25);
  border:1px solid var(--slate-200);
  padding:24px;
}
.modal-content h2{
  font-size:18px;
  font-weight:600;
  margin:0 0 16px 0;
}
.lbl{
  display:block;
  margin:16px 0 4px 0;
  font-size:14px;
  font-weight:500;
  color:var(--ink);
}
.lbl:first-of-type{margin-top:0}
.input-wrap{
  position:relative;
  display:flex;
  align-items:center;
}
.input-ico{
  position:absolute;
  left:10px;
  z-index:1;
}
.input-wrap input{
  width:100%;
  border:1px solid var(--slate-200);
  border-radius:6px;
  padding:8px 12px 8px 32px;
  font-size:14px;
}
.input-wrap input:focus{
  outline:none;
  border-color:#3b82f6;
  box-shadow:0 0 0 3px rgba(59, 130, 246, 0.1);
}
.toggle{
  position:absolute;
  right:8px;
  background:#fff;
  border:1px solid var(--slate-200);
  border-radius:4px;
  padding:4px 8px;
  cursor:pointer;
  font-size:12px;
  z-index:1;
}
.error{
  margin:12px 0;
  background:#fef2f2;
  color:#dc2626;
  border:1px solid #fecaca;
  border-radius:6px;
  padding:12px;
  font-size:14px;
}
.hint{
  font-size:12px;
  color:#64748b;
  margin:8px 0 0 0;
}
.close{
  margin-top:16px;
  background:#fff;
  border:1px solid var(--slate-200);
  border-radius:6px;
  padding:6px 12px;
  cursor:pointer;
  font-size:14px;
}
.spin{
  display:inline-block;
  width:14px;
  height:14px;
  border-radius:50%;
  border:2px solid var(--slate-200);
  border-top-color:var(--ink);
  margin-right:6px;
  animation:spin 0.6s linear infinite;
  vertical-align:-2px;
}
@keyframes spin{to{transform:rotate(360deg)}}

/***** Request Access *****/
.request{
  max-width:1200px;
  margin:48px auto;
  padding:0 24px;
  text-align:center;
}
.request h2{
  font-size:28px;
  font-weight:600;
  margin-bottom:8px;
}
.request p{
  color:var(--slate-600);
  margin-bottom:32px;
}
.req-form{
  display:grid;
  grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));
  gap:16px;
  max-width:800px;
  margin:0 auto;
}
.req-form input{
  border:1px solid var(--slate-200);
  border-radius:6px;
  padding:10px 12px;
  font-size:14px;
}
.req-form input:focus{
  outline:none;
  border-color:#3b82f6;
  box-shadow:0 0 0 3px rgba(59, 130, 246, 0.1);
}
.notes-input{
  grid-column:1 / -1;
}
.req-form button{
  grid-column:1 / -1;
  justify-self:center;
  max-width:200px;
}

/***** Footer *****/
.footer{
  border-top:1px solid var(--slate-200);
  padding:32px 24px;
  margin-top:48px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  flex-wrap:wrap;
  gap:16px;
  font-size:14px;
  color:var(--slate-600);
  max-width:1200px;
  margin-left:auto;
  margin-right:auto;
}
.footer-links{
  display:flex;
  gap:16px;
}
.footer-links a{
  color:var(--slate-600);
  text-decoration:none;
}
.footer-links a:hover{
  text-decoration:underline;
}

/***** Responsive *****/
@media (max-width: 768px) {
  .nav{
    flex-direction:column;
    gap:12px;
    padding:16px;
  }
  .links{
    gap:16px;
  }
  .hero{
    margin:24px auto;
    padding:0 16px;
  }
  .modules, .request{
    margin:32px auto;
    padding:0 16px;
  }
  .req-form{
    grid-template-columns:1fr;
  }
  .footer{
    flex-direction:column;
    text-align:center;
  }
}
`}</style>
  );
}

  