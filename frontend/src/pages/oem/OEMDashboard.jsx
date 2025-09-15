import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { API_BASE } from "../../api/base";

export default function OEMDashboard() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    activeQuotes: 0,
    pendingApprovals: 0,
    completedProjects: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    // Check authentication and load user data
    const checkAuth = async () => {
      console.log('OEMDashboard: Checking auth...');
      try {
        const token = localStorage.getItem('authToken');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/api/auth/check`, {
          method: 'GET',
          headers: headers,
          credentials: 'include'
        });
        const data = await response.json();
        console.log('OEMDashboard: Auth check response:', response.status, data);
        console.log('OEMDashboard: Response headers:', [...response.headers.entries()]);
        
        if (!data.authenticated) {
          console.log('OEMDashboard: Not authenticated, redirecting to login');
          nav('/oem/login');
          return;
        }
        
        if (data.user?.role !== 'oem') {
          console.log('OEMDashboard: User role is not OEM:', data.user?.role, 'redirecting to login');
          nav('/oem/login');
          return;
        }
        
        console.log('OEMDashboard: Auth check passed, setting user');
        setUser(data.user);
        
        // Load OEM dashboard data
        await loadDashboardData(data.user);
      } catch (err) {
        console.error('Auth check failed:', err);
        nav('/oem/login');
      }
    };
    
    checkAuth();
  }, [nav]);

  const loadDashboardData = async (userData) => {
    try {
      // For now, we'll use mock data
      // In a real implementation, this would fetch from your backend
      setStats({
        activeQuotes: 12,
        pendingApprovals: 3,
        completedProjects: 45,
        totalValue: 1250000
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setLoading(false);
    }
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    
    setAiLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/oem/ask-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ question: aiQuestion })
      });
      
      const data = await response.json();
      if (data.success) {
        setAiResponse(data.answer);
      } else {
        setAiResponse('Sorry, I encountered an error. Please try again.');
      }
    } catch (err) {
      console.error('AI chat error:', err);
      setAiResponse('Sorry, I encountered an error connecting to the AI service. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('oemUser');
      nav('/oem/login');
    } catch (err) {
      console.error('Logout failed:', err);
      nav('/oem/login');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e2e8f0",
            borderTop: "4px solid #667eea",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }}></div>
          <p style={{ color: "#64748b" }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <header style={{
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <div className="logo-section">
            <div className="logo-circle">BL</div>
            <div className="company-info">
              <div className="brand">BridgeLineUSA OEM Portal</div>
              <div className="sub">South Coast Manufacturing, LLC</div>
            </div>
          </div>
          {user && (
            <div>
              <p style={{ 
                margin: "4px 0 0 0", 
                color: "#64748b", 
                fontSize: "14px" 
              }}>
                Welcome back, {user.full_name || user.email}
                {user.company && ` • ${user.company}`}
              </p>
            </div>
          )}
          
          {/* Navigation Menu */}
          <nav style={{ display: "flex", gap: "24px" }}>
            <a href="#dashboard" style={{
              color: "#667eea",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "14px",
              padding: "8px 12px",
              borderRadius: "6px",
              background: "#f1f5f9",
              transition: "all 0.2s"
            }}>
              Dashboard
            </a>
            <a href="#quotes" style={{
              color: "#64748b",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "14px",
              padding: "8px 12px",
              borderRadius: "6px",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#f1f5f9";
              e.target.style.color = "#667eea";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#64748b";
            }}
            >
              My Quotes
            </a>
            <a href="#projects" style={{
              color: "#64748b",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "14px",
              padding: "8px 12px",
              borderRadius: "6px",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#f1f5f9";
              e.target.style.color = "#667eea";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#64748b";
            }}
            >
              Projects
            </a>
            <a href="#materials" style={{
              color: "#64748b",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "14px",
              padding: "8px 12px",
              borderRadius: "6px",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#f1f5f9";
              e.target.style.color = "#667eea";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#64748b";
            }}
            >
              Materials
            </a>
            <a href="#support" style={{
              color: "#64748b",
              textDecoration: "none",
              fontWeight: "500",
              fontSize: "14px",
              padding: "8px 12px",
              borderRadius: "6px",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#f1f5f9";
              e.target.style.color = "#667eea";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#64748b";
            }}
            >
              Support
            </a>
          </nav>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Notification Bell */}
          <div style={{
            position: "relative",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "50%",
            background: "#f8fafc",
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => e.target.style.background = "#e2e8f0"}
          onMouseOut={(e) => e.target.style.background = "#f8fafc"}
          >
            <span style={{ fontSize: "18px" }}>🔔</span>
            <span style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "8px",
              height: "8px",
              background: "#dc2626",
              borderRadius: "50%"
            }}></span>
          </div>
          
          {/* User Profile */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            background: "#f8fafc",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => e.target.style.background = "#e2e8f0"}
          onMouseOut={(e) => e.target.style.background = "#f8fafc"}
          >
            <div style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "14px",
              fontWeight: "600"
            }}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ fontSize: "14px", color: "#64748b" }}>▼</div>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              background: "#64748b",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              transition: "background 0.2s"
            }}
            onMouseOver={(e) => e.target.style.background = "#475569"}
            onMouseOut={(e) => e.target.style.background = "#64748b"}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: "24px" }}>
        {/* Welcome & Overview Section */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "12px",
          padding: "32px",
          color: "white",
          marginBottom: "24px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
            <div>
              <h2 style={{ margin: "0 0 8px 0", fontSize: "28px" }}>
                Welcome back, {user?.full_name || 'Valued Customer'}
                {user?.company && ` from ${user.company}`}
              </h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: "16px" }}>
                You have {stats.pendingApprovals} quotes awaiting approval, {stats.activeQuotes} active projects, and {stats.completedProjects} completed this year.
              </p>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "16px",
              backdropFilter: "blur(10px)"
            }}>
              <div style={{ fontSize: "14px", marginBottom: "8px", opacity: 0.9 }}>🤖 AI Concierge</div>
              <div style={{ fontSize: "16px", fontWeight: "500" }}>
                "Hello John, I am pleased to inform you that South Coast Mfg is on time to complete your urgent PO# 8024985. Let me know if you have any questions."
              </div>
            </div>
          </div>
          
          {/* Ask AI Button */}
          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <button
              onClick={() => setAiChatOpen(!aiChatOpen)}
              style={{
                padding: "10px 20px",
                background: "rgba(255,255,255,0.15)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s",
                backdropFilter: "blur(10px)"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(255,255,255,0.25)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(255,255,255,0.15)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              🤖 Ask AI {aiChatOpen ? '▼' : '▶'}
            </button>
          </div>
          
          {/* AI Chat Interface */}
          {aiChatOpen && (
            <div style={{
              marginTop: "16px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "20px",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
              <div style={{ marginBottom: "16px" }}>
                <textarea
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Ask me anything about BridgeLineUSA, your projects, or manufacturing processes..."
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.9)",
                    color: "#1e293b",
                    fontSize: "14px",
                    resize: "vertical",
                    outline: "none"
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskAI();
                    }
                  }}
                />
              </div>
              
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <button
                  onClick={handleAskAI}
                  disabled={aiLoading || !aiQuestion.trim()}
                  style={{
                    padding: "8px 16px",
                    background: aiLoading || !aiQuestion.trim() ? "rgba(255,255,255,0.3)" : "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: aiLoading || !aiQuestion.trim() ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "background 0.2s"
                  }}
                >
                  {aiLoading ? "Thinking..." : "Ask AI"}
                </button>
                <button
                  onClick={() => {
                    setAiQuestion('');
                    setAiResponse('');
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "rgba(255,255,255,0.2)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  Clear
                </button>
              </div>
              
              {aiResponse && (
                <div style={{
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: "8px",
                  padding: "16px",
                  border: "1px solid rgba(255,255,255,0.5)"
                }}>
                  <div style={{ 
                    fontSize: "14px", 
                    color: "#1e293b", 
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap"
                  }}>
                    {aiResponse}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Quick Links */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <button style={{
              padding: "12px 20px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
              backdropFilter: "blur(10px)"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateY(0)";
            }}
            >
              📋 Quotes
            </button>
            <button style={{
              padding: "12px 20px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
              backdropFilter: "blur(10px)"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateY(0)";
            }}
            >
              🔧 Jobs
            </button>
            <button style={{
              padding: "12px 20px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
              backdropFilter: "blur(10px)"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateY(0)";
            }}
            >
              ✅ QC
            </button>
            <button style={{
              padding: "12px 20px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
              backdropFilter: "blur(10px)"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateY(0)";
            }}
            >
              💬 Messages
            </button>
            <button style={{
              padding: "12px 20px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s",
              backdropFilter: "blur(10px)"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateY(0)";
            }}
            >
              📁 Files
            </button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "32px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #667eea"
          }}>
            <h3 style={{ 
              margin: "0 0 8px 0", 
              fontSize: "14px", 
              fontWeight: "500", 
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Active Quotes
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: "32px", 
              fontWeight: "700", 
              color: "#1e293b" 
            }}>
              {stats.activeQuotes}
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#059669" }}>
              +2 from last month
            </p>
          </div>

          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #dc2626"
          }}>
            <h3 style={{ 
              margin: "0 0 8px 0", 
              fontSize: "14px", 
              fontWeight: "500", 
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Pending Approvals
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: "32px", 
              fontWeight: "700", 
              color: "#dc2626" 
            }}>
              {stats.pendingApprovals}
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#dc2626" }}>
              Requires attention
            </p>
          </div>

          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #059669"
          }}>
            <h3 style={{ 
              margin: "0 0 8px 0", 
              fontSize: "14px", 
              fontWeight: "500", 
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Active Jobs
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: "32px", 
              fontWeight: "700", 
              color: "#059669" 
            }}>
              8
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#059669" }}>
              6 on track, 2 delayed
            </p>
          </div>

          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #f59e0b"
          }}>
            <h3 style={{ 
              margin: "0 0 8px 0", 
              fontSize: "14px", 
              fontWeight: "500", 
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              QC Reports
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: "32px", 
              fontWeight: "700", 
              color: "#f59e0b" 
            }}>
              3
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#f59e0b" }}>
              Awaiting review
            </p>
          </div>

          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #8b5cf6"
          }}>
            <h3 style={{ 
              margin: "0 0 8px 0", 
              fontSize: "14px", 
              fontWeight: "500", 
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Total Value YTD
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: "32px", 
              fontWeight: "700", 
              color: "#1e293b" 
            }}>
              ${stats.totalValue.toLocaleString()}
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#059669" }}>
              +15% vs last year
            </p>
          </div>
        </div>

        {/* Quotes Section */}
        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "24px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: "20px", 
              fontWeight: "600", 
              color: "#1e293b" 
            }}>
              Recent Quotes
            </h3>
            <button style={{
              padding: "8px 16px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              View All Quotes
            </button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Quote Item 1 */}
            <div style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600", color: "#1e293b" }}>Q-2024-101</span>
                  <span style={{ 
                    padding: "4px 8px", 
                    background: "#fef3c7", 
                    color: "#92400e", 
                    borderRadius: "12px", 
                    fontSize: "12px",
                    fontWeight: "500"
                  }}>
                    Pending Approval
                  </span>
                </div>
                <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>
                  Industrial Pipe Network - $125,000 • Created Dec 15, 2024
                </p>
                <p style={{ margin: "4px 0", color: "#059669", fontSize: "13px", fontStyle: "italic" }}>
                  🤖 AI Insight: Similar to your PO #1829 from last March
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{
                  padding: "6px 12px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}>
                  Approve
                </button>
                <button style={{
                  padding: "6px 12px",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}>
                  Reject
                </button>
                <button style={{
                  padding: "6px 12px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}>
                  Request Changes
                </button>
              </div>
            </div>

            {/* Quote Item 2 */}
            <div style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600", color: "#1e293b" }}>Q-2024-089</span>
                  <span style={{ 
                    padding: "4px 8px", 
                    background: "#dcfce7", 
                    color: "#166534", 
                    borderRadius: "12px", 
                    fontSize: "12px",
                    fontWeight: "500"
                  }}>
                    Approved
                  </span>
                </div>
                <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>
                  Manufacturing Plant Upgrade - $275,000 • Created Nov 28, 2024
                </p>
                <p style={{ margin: "4px 0", color: "#059669", fontSize: "13px", fontStyle: "italic" }}>
                  ✅ Converted to Sales Order S-2024-089
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{
                  padding: "6px 12px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}>
                  View Details
                </button>
                <button style={{
                  padding: "6px 12px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}>
                  Reorder
                </button>
              </div>
            </div>

            {/* Quote Item 3 */}
            <div style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600", color: "#1e293b" }}>Q-2024-067</span>
                  <span style={{ 
                    padding: "4px 8px", 
                    background: "#fee2e2", 
                    color: "#991b1b", 
                    borderRadius: "12px", 
                    fontSize: "12px",
                    fontWeight: "500"
                  }}>
                    Changes Requested
                  </span>
                </div>
                <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>
                  Chemical Processing Line - $450,000 • Created Oct 15, 2024
                </p>
                <p style={{ margin: "4px 0", color: "#dc2626", fontSize: "13px", fontStyle: "italic" }}>
                  ⚠️ Requires material specification updates
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{
                  padding: "6px 12px",
                  background: "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}>
                  Upload Revisions
                </button>
                <button style={{
                  padding: "6px 12px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}>
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs / Sales Orders Section */}
        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "24px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: "20px", 
              fontWeight: "600", 
              color: "#1e293b" 
            }}>
              Active Jobs
            </h3>
            <button style={{
              padding: "8px 16px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              View All Jobs
            </button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Job Card 1 */}
            <div style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "20px",
              background: "#f8fafc"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>S-2024-089</span>
                    <span style={{ 
                      padding: "4px 8px", 
                      background: "#dcfce7", 
                      color: "#166534", 
                      borderRadius: "12px", 
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      In Progress
                    </span>
                  </div>
                  <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>
                    PO #8168496-1 • Manufacturing Plant Upgrade • $275,000
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "4px 0", fontSize: "14px", color: "#64748b" }}>Est. Completion</p>
                  <p style={{ margin: "4px 0", fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>Feb 28, 2025</p>
                  <div style={{ 
                    width: "120px", 
                    height: "8px", 
                    background: "#e2e8f0", 
                    borderRadius: "4px",
                    marginTop: "8px"
                  }}>
                    <div style={{ 
                      width: "75%", 
                      height: "100%", 
                      background: "linear-gradient(90deg, #10b981 0%, #059669 100%)", 
                      borderRadius: "4px" 
                    }}></div>
                  </div>
                  <p style={{ margin: "4px 0", fontSize: "12px", color: "#059669" }}>75% Complete</p>
                </div>
              </div>
              
              {/* Router Breakdown */}
              <div style={{ marginTop: "16px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                  Router Breakdown
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  <div style={{ 
                    padding: "8px 12px", 
                    background: "#dcfce7", 
                    borderRadius: "6px",
                    border: "1px solid #bbf7d0"
                  }}>
                    <div style={{ fontSize: "12px", color: "#166534", fontWeight: "500" }}>Sawing</div>
                    <div style={{ fontSize: "14px", color: "#166534", fontWeight: "600" }}>Complete</div>
                  </div>
                  <div style={{ 
                    padding: "8px 12px", 
                    background: "#fef3c7", 
                    borderRadius: "6px",
                    border: "1px solid #fde68a"
                  }}>
                    <div style={{ fontSize: "12px", color: "#92400e", fontWeight: "500" }}>Fitting</div>
                    <div style={{ fontSize: "14px", color: "#92400e", fontWeight: "600" }}>In Progress</div>
                  </div>
                  <div style={{ 
                    padding: "8px 12px", 
                    background: "#fee2e2", 
                    borderRadius: "6px",
                    border: "1px solid #fecaca"
                  }}>
                    <div style={{ fontSize: "12px", color: "#991b1b", fontWeight: "500" }}>Welding</div>
                    <div style={{ fontSize: "14px", color: "#991b1b", fontWeight: "600" }}>Delayed</div>
                  </div>
                  <div style={{ 
                    padding: "8px 12px", 
                    background: "#e2e8f0", 
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1"
                  }}>
                    <div style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>QC</div>
                    <div style={{ fontSize: "14px", color: "#475569", fontWeight: "600" }}>Pending</div>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: "16px", padding: "12px", background: "#fef3c7", borderRadius: "6px", border: "1px solid #fde68a" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "#92400e" }}>
                  ⚠️ <strong>Delay Notification:</strong> Welding process rescheduled due to material delay. New ETA: Feb 15, 2025.
                </p>
              </div>
            </div>

            {/* Job Card 2 */}
            <div style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "20px",
              background: "#f8fafc"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>S-2024-101</span>
                    <span style={{ 
                      padding: "4px 8px", 
                      background: "#dcfce7", 
                      color: "#166534", 
                      borderRadius: "12px", 
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      In Progress
                    </span>
                  </div>
                  <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>
                    PO #PO-2024-045 • Industrial Pipe Network • $125,000
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "4px 0", fontSize: "14px", color: "#64748b" }}>Est. Completion</p>
                  <p style={{ margin: "4px 0", fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>Jan 15, 2025</p>
                  <div style={{ 
                    width: "120px", 
                    height: "8px", 
                    background: "#e2e8f0", 
                    borderRadius: "4px",
                    marginTop: "8px"
                  }}>
                    <div style={{ 
                      width: "60%", 
                      height: "100%", 
                      background: "linear-gradient(90deg, #10b981 0%, #059669 100%)", 
                      borderRadius: "4px" 
                    }}></div>
                  </div>
                  <p style={{ margin: "4px 0", fontSize: "12px", color: "#059669" }}>60% Complete</p>
                </div>
              </div>
              
              {/* Router Breakdown */}
              <div style={{ marginTop: "16px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                  Router Breakdown
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  <div style={{ 
                    padding: "8px 12px", 
                    background: "#dcfce7", 
                    borderRadius: "6px",
                    border: "1px solid #bbf7d0"
                  }}>
                    <div style={{ fontSize: "12px", color: "#166534", fontWeight: "500" }}>Cutting</div>
                    <div style={{ fontSize: "14px", color: "#166534", fontWeight: "600" }}>Complete</div>
                  </div>
                  <div style={{ 
                    padding: "8px 12px", 
                    background: "#dcfce7", 
                    borderRadius: "6px",
                    border: "1px solid #bbf7d0"
                  }}>
                    <div style={{ fontSize: "12px", color: "#166534", fontWeight: "500" }}>Assembly</div>
                    <div style={{ fontSize: "14px", color: "#166534", fontWeight: "600" }}>Complete</div>
                  </div>
                  <div style={{ 
                    padding: "8px 12px", 
                    background: "#fef3c7", 
                    borderRadius: "6px",
                    border: "1px solid #fde68a"
                  }}>
                    <div style={{ fontSize: "12px", color: "#92400e", fontWeight: "500" }}>Testing</div>
                    <div style={{ fontSize: "14px", color: "#92400e", fontWeight: "600" }}>In Progress</div>
                  </div>
                  <div style={{ 
                    padding: "8px 12px", 
                    background: "#e2e8f0", 
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1"
                  }}>
                    <div style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>QC</div>
                    <div style={{ fontSize: "14px", color: "#475569", fontWeight: "600" }}>Pending</div>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                <button style={{
                  padding: "6px 12px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}>
                  View Details
                </button>
                <button style={{
                  padding: "6px 12px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}>
                  Reorder Similar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Assurance (QC) Section */}
        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "24px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: "20px", 
              fontWeight: "600", 
              color: "#1e293b" 
            }}>
              Quality Assurance Reports
            </h3>
            <button style={{
              padding: "8px 16px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              View All QC Reports
            </button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* QC Report 1 */}
            <div style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600", color: "#1e293b" }}>QC-RPT-2024-089-001</span>
                  <span style={{ 
                    padding: "4px 8px", 
                    background: "#fef3c7", 
                    color: "#92400e", 
                    borderRadius: "12px", 
                    fontSize: "12px",
                    fontWeight: "500"
                  }}>
                    Pending Review
                  </span>
                </div>
                <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>
                  Weld Map Inspection • Job S-2024-089 • Completed Dec 18, 2024
                </p>
                <p style={{ margin: "4px 0", color: "#059669", fontSize: "13px", fontStyle: "italic" }}>
                  🤖 AI Insight: All measurements within ASME IX tolerances
                </p>
                <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                  <span style={{ 
                    padding: "2px 6px", 
                    background: "#e0f2fe", 
                    color: "#0277bd", 
                    borderRadius: "4px", 
                    fontSize: "11px",
                    fontWeight: "500"
                  }}>
                    Weld Map
                  </span>
                  <span style={{ 
                    padding: "2px 6px", 
                    background: "#e8f5e8", 
                    color: "#2e7d32", 
                    borderRadius: "4px", 
                    fontSize: "11px",
                    fontWeight: "500"
                  }}>
                    NDE Report
                  </span>
                  <span style={{ 
                    padding: "2px 6px", 
                    background: "#fff3e0", 
                    color: "#ef6c00", 
                    borderRadius: "4px", 
                    fontSize: "11px",
                    fontWeight: "500"
                  }}>
                    Hydro Test
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{
                    padding: "6px 12px",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}>
                    Approve
                  </button>
                  <button style={{
                    padding: "6px 12px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}>
                    NCR
                  </button>
                </div>
                <button style={{
                  padding: "4px 8px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px"
                }}>
                  View MTR
                </button>
              </div>
            </div>

            {/* QC Report 2 */}
            <div style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600", color: "#1e293b" }}>QC-RPT-2024-101-002</span>
                  <span style={{ 
                    padding: "4px 8px", 
                    background: "#dcfce7", 
                    color: "#166534", 
                    borderRadius: "12px", 
                    fontSize: "12px",
                    fontWeight: "500"
                  }}>
                    Approved
                  </span>
                </div>
                <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>
                  Dimensional Check • Job S-2024-101 • Completed Dec 15, 2024
                </p>
                <p style={{ margin: "4px 0", color: "#059669", fontSize: "13px", fontStyle: "italic" }}>
                  ✅ Digitally signed by John Smith, QC Inspector
                </p>
                <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                  <span style={{ 
                    padding: "2px 6px", 
                    background: "#fce4ec", 
                    color: "#c2185b", 
                    borderRadius: "4px", 
                    fontSize: "11px",
                    fontWeight: "500"
                  }}>
                    Dimensional
                  </span>
                  <span style={{ 
                    padding: "2px 6px", 
                    background: "#e8f5e8", 
                    color: "#2e7d32", 
                    borderRadius: "4px", 
                    fontSize: "11px",
                    fontWeight: "500"
                  }}>
                    Photos
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{
                    padding: "6px 12px",
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}>
                    View Report
                  </button>
                  <button style={{
                    padding: "6px 12px",
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}>
                    Download PDF
                  </button>
                </div>
                <button style={{
                  padding: "4px 8px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px"
                }}>
                  View MTR
                </button>
              </div>
            </div>

            {/* QC Report 3 */}
            <div style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600", color: "#1e293b" }}>QC-RPT-2024-067-003</span>
                  <span style={{ 
                    padding: "4px 8px", 
                    background: "#fee2e2", 
                    color: "#991b1b", 
                    borderRadius: "12px", 
                    fontSize: "12px",
                    fontWeight: "500"
                  }}>
                    NCR Open
                  </span>
                </div>
                <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>
                  Hydrostatic Test • Job S-2024-067 • Completed Dec 10, 2024
                </p>
                <p style={{ margin: "4px 0", color: "#dc2626", fontSize: "13px", fontStyle: "italic" }}>
                  ⚠️ Minor leak detected - Rework required
                </p>
                <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                  <span style={{ 
                    padding: "2px 6px", 
                    background: "#fff3e0", 
                    color: "#ef6c00", 
                    borderRadius: "4px", 
                    fontSize: "11px",
                    fontWeight: "500"
                  }}>
                    Hydro Test
                  </span>
                  <span style={{ 
                    padding: "2px 6px", 
                    background: "#fce4ec", 
                    color: "#c2185b", 
                    borderRadius: "4px", 
                    fontSize: "11px",
                    fontWeight: "500"
                  }}>
                    NCR Report
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{
                    padding: "6px 12px",
                    background: "#f59e0b",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}>
                    Review NCR
                  </button>
                  <button style={{
                    padding: "6px 12px",
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}>
                    View Report
                  </button>
                </div>
                <button style={{
                  padding: "4px 8px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px"
                }}>
                  View MTR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics & Insights Section */}
        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "24px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: "20px", 
              fontWeight: "600", 
              color: "#1e293b" 
            }}>
              Analytics & Insights
            </h3>
            <button style={{
              padding: "8px 16px",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              View Full Analytics
            </button>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "24px" }}>
            {/* Spend Summary */}
            <div style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "8px",
              padding: "20px",
              color: "white"
            }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", opacity: 0.9 }}>YTD Spend</h4>
              <p style={{ margin: "0 0 4px 0", fontSize: "28px", fontWeight: "700" }}>$1,250,000</p>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>↑ 15% vs last year</p>
            </div>

            {/* Lead Times */}
            <div style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              borderRadius: "8px",
              padding: "20px",
              color: "white"
            }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", opacity: 0.9 }}>Avg Lead Time</h4>
              <p style={{ margin: "0 0 4px 0", fontSize: "28px", fontWeight: "700" }}>14 days</p>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>↓ 2 days vs network avg</p>
            </div>

            {/* Efficiency */}
            <div style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              borderRadius: "8px",
              padding: "20px",
              color: "white"
            }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", opacity: 0.9 }}>On-Time Delivery</h4>
              <p style={{ margin: "0 0 4px 0", fontSize: "28px", fontWeight: "700" }}>92%</p>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>↑ 5% this quarter</p>
            </div>
          </div>

          {/* AI Insights */}
          <div style={{ 
            background: "#f0f9ff", 
            borderRadius: "8px", 
            padding: "16px",
            border: "1px solid #bae6fd"
          }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#1e293b" }}>
              🤖 AI Insights & Recommendations
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ 
                background: "white", 
                borderRadius: "6px", 
                padding: "12px",
                border: "1px solid #e0f2fe"
              }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#0277bd" }}>
                  📈 Forecasting
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                  You typically order 6" pipe every 3 months. Based on your current inventory, you might want to request a quote for additional stock.
                </p>
              </div>
              
              <div style={{ 
                background: "white", 
                borderRadius: "6px", 
                padding: "12px",
                border: "1px solid #e0f2fe"
              }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#059669" }}>
                  🎯 Optimization
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                  Your lead times are 14% faster than industry average. Consider consolidating smaller orders to reduce per-unit costs.
                </p>
              </div>
              
              <div style={{ 
                background: "white", 
                borderRadius: "6px", 
                padding: "12px",
                border: "1px solid #fef3c7"
              }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#d97706" }}>
                  ⚠️ Trend Alert
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                  Material costs for stainless steel have increased 8% this month. Consider locking in prices for upcoming projects.
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Notifications & Alerts Section */}
      <div style={{
        background: "white",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        margin: "0 24px 24px 24px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: "18px", 
            fontWeight: "600", 
            color: "#1e293b" 
          }}>
            🔔 Recent Notifications
          </h3>
          <button style={{
            padding: "6px 12px",
            background: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px"
          }}>
            View All
          </button>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ 
            padding: "12px", 
            background: "#fef3c7", 
            borderRadius: "6px",
            border: "1px solid #fde68a",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600", color: "#92400e" }}>
                QC Report Pending Review
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#92400e" }}>
                Job S-2024-089 weld inspection requires your approval
              </p>
            </div>
            <span style={{ fontSize: "12px", color: "#92400e" }}>2 hours ago</span>
          </div>
          
          <div style={{ 
            padding: "12px", 
            background: "#dcfce7", 
            borderRadius: "6px",
            border: "1px solid #bbf7d0",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{ fontSize: "16px" }}>✅</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600", color: "#166534" }}>
                Job Completed
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#166534" }}>
                S-2024-101 Industrial Pipe Network is ready for pickup
              </p>
            </div>
            <span style={{ fontSize: "12px", color: "#166534" }}>1 day ago</span>
          </div>
          
          <div style={{ 
            padding: "12px", 
            background: "#fee2e2", 
            borderRadius: "6px",
            border: "1px solid #fecaca",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{ fontSize: "16px" }}>🚨</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600", color: "#991b1b" }}>
                Delay Notification
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#991b1b" }}>
                Material shortage affecting Job S-2024-067 ETA
              </p>
            </div>
            <span style={{ fontSize: "12px", color: "#991b1b" }}>3 days ago</span>
          </div>
        </div>
      </div>

      {/* Add CSS animation for loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
      `}</style>
    </div>
  );
}