import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    // Check authentication and load user data
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/check`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.authenticated || data.user?.role !== 'oem') {
          nav('/oem/login');
          return;
        }
        
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
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: "24px", 
              fontWeight: "600",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              BridgeLineUSA OEM Portal
            </h1>
            {user && (
              <p style={{ 
                margin: "4px 0 0 0", 
                color: "#64748b", 
                fontSize: "14px" 
              }}>
                Welcome back, {user.full_name || user.email}
                {user.company && ` • ${user.company}`}
              </p>
            )}
          </div>
          
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
        {/* Welcome Section */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "12px",
          padding: "32px",
          color: "white",
          marginBottom: "24px"
        }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "28px" }}>
            Welcome to Your OEM Dashboard
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "16px" }}>
            Manage your projects, track quotes, and collaborate with the BridgeLineUSA team
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginBottom: "32px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
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
          </div>

          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
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
          </div>

          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ 
              margin: "0 0 8px 0", 
              fontSize: "14px", 
              fontWeight: "500", 
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Completed Projects
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: "32px", 
              fontWeight: "700", 
              color: "#059669" 
            }}>
              {stats.completedProjects}
            </p>
          </div>

          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ 
              margin: "0 0 8px 0", 
              fontSize: "14px", 
              fontWeight: "500", 
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              Total Project Value
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: "32px", 
              fontWeight: "700", 
              color: "#1e293b" 
            }}>
              ${stats.totalValue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "32px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ 
              margin: "0 0 16px 0", 
              fontSize: "18px", 
              fontWeight: "600", 
              color: "#1e293b" 
            }}>
              Recent Activity
            </h3>
            <div style={{ color: "#64748b" }}>
              <p style={{ margin: "8px 0", fontSize: "14px", padding: "8px", background: "#f1f5f9", borderRadius: "4px" }}>
                • Quote #2024-101 submitted for review - awaiting approval
              </p>
              <p style={{ margin: "8px 0", fontSize: "14px", padding: "8px", background: "#ecfdf5", borderRadius: "4px" }}>
                • Project "Industrial Piping System" completed successfully
              </p>
              <p style={{ margin: "8px 0", fontSize: "14px", padding: "8px", background: "#eff6ff", borderRadius: "4px" }}>
                • New materials catalog updated with 50+ items
              </p>
            </div>
          </div>

          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ 
              margin: "0 0 16px 0", 
              fontSize: "18px", 
              fontWeight: "600", 
              color: "#1e293b" 
            }}>
              Quick Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button style={{
                padding: "12px 16px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.target.style.background = "#5a67d8"}
              onMouseOut={(e) => e.target.style.background = "#667eea"}
              >
                View Active Quotes
              </button>
              <button style={{
                padding: "12px 16px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.target.style.background = "#059669"}
              onMouseOut={(e) => e.target.style.background = "#10b981"}
              >
                Request New Quote
              </button>
              <button style={{
                padding: "12px 16px",
                background: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.target.style.background = "#d97706"}
              onMouseOut={(e) => e.target.style.background = "#f59e0b"}
              >
                Browse Materials Catalog
              </button>
            </div>
          </div>
        </div>

        {/* Active Projects Table */}
        <div style={{
          background: "white",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "32px"
        }}>
          <h3 style={{ 
            margin: "0 0 20px 0", 
            fontSize: "18px", 
            fontWeight: "600", 
            color: "#1e293b" 
          }}>
            Active Projects
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Quote #</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Project Name</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Value</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "#475569" }}>Due Date</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px", color: "#1e293b" }}>Q-2024-101</td>
                  <td style={{ padding: "12px", color: "#1e293b" }}>Industrial Pipe Network</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      background: "#fef3c7", 
                      color: "#92400e", 
                      borderRadius: "12px", 
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      In Review
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "#1e293b", fontWeight: "600" }}>$125,000</td>
                  <td style={{ padding: "12px", color: "#64748b" }}>Jan 15, 2025</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px", color: "#1e293b" }}>Q-2024-089</td>
                  <td style={{ padding: "12px", color: "#1e293b" }}>Manufacturing Plant Upgrade</td>
                  <td style={{ padding: "12px" }}>
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
                  </td>
                  <td style={{ padding: "12px", color: "#1e293b", fontWeight: "600" }}>$275,000</td>
                  <td style={{ padding: "12px", color: "#64748b" }}>Feb 28, 2025</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px", color: "#1e293b" }}>Q-2024-067</td>
                  <td style={{ padding: "12px", color: "#1e293b" }}>Chemical Processing Line</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      background: "#fee2e2", 
                      color: "#991b1b", 
                      borderRadius: "12px", 
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      Needs Attention
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "#1e293b", fontWeight: "600" }}>$450,000</td>
                  <td style={{ padding: "12px", color: "#64748b" }}>Dec 20, 2024</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Metrics */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ 
              margin: "0 0 16px 0", 
              fontSize: "18px", 
              fontWeight: "600", 
              color: "#1e293b" 
            }}>
              Performance This Quarter
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#64748b" }}>Quote Approval Rate</span>
                <span style={{ fontWeight: "600", color: "#059669" }}>94%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#64748b" }}>Avg. Project Completion</span>
                <span style={{ fontWeight: "600", color: "#1e293b" }}>12 days</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#64748b" }}>Customer Satisfaction</span>
                <span style={{ fontWeight: "600", color: "#059669" }}>4.8/5</span>
              </div>
            </div>
          </div>

          <div style={{
            background: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ 
              margin: "0 0 16px 0", 
              fontSize: "18px", 
              fontWeight: "600", 
              color: "#1e293b" 
            }}>
              Support & Resources
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a href="#" style={{
                padding: "8px 0",
                color: "#667eea",
                textDecoration: "none",
                fontSize: "14px",
                borderBottom: "1px solid #e2e8f0"
              }}>
                📖 OEM Partner Documentation
              </a>
              <a href="#" style={{
                padding: "8px 0",
                color: "#667eea",
                textDecoration: "none",
                fontSize: "14px",
                borderBottom: "1px solid #e2e8f0"
              }}>
                💬 Contact Technical Support
              </a>
              <a href="#" style={{
                padding: "8px 0",
                color: "#667eea",
                textDecoration: "none",
                fontSize: "14px",
                borderBottom: "1px solid #e2e8f0"
              }}>
                📊 Download Monthly Reports
              </a>
              <a href="#" style={{
                padding: "8px 0",
                color: "#667eea",
                textDecoration: "none",
                fontSize: "14px"
              }}>
                🔧 API Integration Guide
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Add CSS animation for loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}