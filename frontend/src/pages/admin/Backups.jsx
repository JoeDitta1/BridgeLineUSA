import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function getAuthHeaders() {
  const token = localStorage.getItem("jwt_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

const Backups = () => {
  // Browser Version State
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState(null);

  // Desktop Version State
  const [isRunningDesktop, setIsRunningDesktop] = useState(false);
  const [logsDesktop, setLogsDesktop] = useState([]);
  const [resultDesktop, setResultDesktop] = useState(null);
  const [showModalDesktop, setShowModalDesktop] = useState(false);
  const [isPushingDesktop, setIsPushingDesktop] = useState(false);
  const [pushResultDesktop, setPushResultDesktop] = useState(null);

  const runBackup = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setLogs([]);
    setResult(null);
    setShowModal(true);
    
    try {
      // Start the backup job
      const response = await fetch('/api/backups/run', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start backup');
      }
      
      const { jobId } = await response.json();
      
      // Stream progress via SSE
      const eventSource = new EventSource(`/api/backups/stream?jobId=${jobId}`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLogs(prev => [...prev, data]);
        
        if (data.status === 'done') {
          setResult({
            success: true,
            branch: data.branch,
            bundle: data.bundle,
            zip: data.zip,
            message: data.message
          });
          setIsRunning(false);
          eventSource.close();
        } else if (data.status === 'error') {
          setResult({
            success: false,
            message: data.message,
            step: data.step
          });
          setIsRunning(false);
          eventSource.close();
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setResult({
          success: false,
          message: 'Connection to backup stream lost'
        });
        setIsRunning(false);
        eventSource.close();
      };
      
    } catch (error) {
      console.error('Backup error:', error);
      setResult({
        success: false,
        message: error.message
      });
      setIsRunning(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setLogs([]);
    setResult(null);
  };

  const pushToGitHub = async () => {
    if (isPushing) return;
    
    setIsPushing(true);
    setPushResult(null);
    
    try {
      const response = await fetch('/api/backups/push-github', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPushResult({
          success: true,
          message: data.message,
          branch: data.branch,
          commits: data.commits
        });
      } else {
        setPushResult({
          success: false,
          message: data.error || 'Failed to push to GitHub'
        });
      }
    } catch (error) {
      console.error('GitHub push error:', error);
      setPushResult({
        success: false,
        message: error.message
      });
    } finally {
      setIsPushing(false);
    }
  };

  // Desktop Backup Functions
  const runDesktopBackup = async () => {
    if (isRunningDesktop) return;
    
    setIsRunningDesktop(true);
    setLogsDesktop([]);
    setResultDesktop(null);
    setShowModalDesktop(true);
    
    try {
      // Start the desktop backup job
      const response = await fetch('/api/backups/run-desktop', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start desktop backup');
      }
      
      const { jobId } = await response.json();
      
      // Stream progress via SSE
      const eventSource = new EventSource(`/api/backups/stream-desktop?jobId=${jobId}`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLogsDesktop(prev => [...prev, data]);
        
        if (data.status === 'done') {
          setResultDesktop({
            success: true,
            branch: data.branch,
            bundle: data.bundle,
            zip: data.zip,
            message: data.message
          });
          setIsRunningDesktop(false);
          eventSource.close();
        } else if (data.status === 'error') {
          setResultDesktop({
            success: false,
            message: data.message,
            step: data.step
          });
          setIsRunningDesktop(false);
          eventSource.close();
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('Desktop SSE error:', error);
        setResultDesktop({
          success: false,
          message: 'Connection to desktop backup stream lost'
        });
        setIsRunningDesktop(false);
        eventSource.close();
      };
      
    } catch (error) {
      console.error('Desktop backup error:', error);
      setResultDesktop({
        success: false,
        message: error.message
      });
      setIsRunningDesktop(false);
    }
  };

  const closeDesktopModal = () => {
    setShowModalDesktop(false);
    setLogsDesktop([]);
    setResultDesktop(null);
  };

  const pushToGitHubDesktop = async () => {
    if (isPushingDesktop) return;
    
    setIsPushingDesktop(true);
    setPushResultDesktop(null);
    
    try {
      const response = await fetch('/api/backups/push-github-desktop', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPushResultDesktop({
          success: true,
          message: data.message,
          branch: data.branch,
          commits: data.commits
        });
      } else {
        setPushResultDesktop({
          success: false,
          message: data.error || 'Failed to push to GitHub from desktop'
        });
      }
    } catch (error) {
      console.error('Desktop GitHub push error:', error);
      setPushResultDesktop({
        success: false,
        message: error.message
      });
    } finally {
      setIsPushingDesktop(false);
    }
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 12 }}>
          <Link to="/admin">← Back to Admin</Link>
        </div>
        <h1>System Backup</h1>
        <p style={{ color: "#666", marginBottom: 20 }}>Create a complete backup of the system including code, data, and user uploads.</p>
        
        {/* Dual Backup Sections */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          
          {/* VS Code Browser Version */}
          <div style={{ background: "#f9fafb", padding: 20, borderRadius: 8, border: "2px solid #e0e0e0" }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ marginTop: 0, marginBottom: 8, color: "#1976d2" }}>VS Code Browser Version</h2>
              <p style={{ color: "#666", marginBottom: 12, fontSize: 14 }}>
                For GitHub Codespaces and browser-based development environments.
                Uses Codespaces-specific paths and Linux commands.
              </p>
              <p style={{ fontSize: 12, color: "#f57c00", marginBottom: 16 }}>
                ⚠️ <strong>Codespaces Only:</strong> Will not work on desktop VS Code.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <button 
                onClick={runBackup}
                disabled={isRunning || isRunningDesktop}
                style={{ 
                  padding: "8px 16px", 
                  background: isRunning ? "#ccc" : "#1976d2", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 6,
                  cursor: isRunning ? "not-allowed" : "pointer",
                  opacity: isRunning ? 0.6 : 1,
                  fontWeight: 500,
                  fontSize: 14
                }}
              >
                {isRunning ? 'Creating...' : 'Create Browser Backup'}
              </button>
              
              <button 
                onClick={pushToGitHub}
                disabled={isPushing || isRunning || isPushingDesktop || isRunningDesktop}
                style={{ 
                  padding: "8px 16px", 
                  background: isPushing ? "#ccc" : "#4caf50", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 6,
                  cursor: isPushing ? "not-allowed" : "pointer",
                  opacity: isPushing ? 0.6 : 1,
                  fontWeight: 500,
                  fontSize: 14
                }}
              >
                {isPushing ? 'Pushing...' : 'Push to GitHub (Browser)'}
              </button>
            </div>

            {/* Browser Status Indicators */}
            {isRunning && (
              <div style={{ display: "flex", alignItems: "center", color: "#666", fontSize: 12 }}>
                <div style={{ 
                  display: "inline-block", width: 12, height: 12, 
                  border: "2px solid #f3f3f3", borderTop: "2px solid #1976d2",
                  borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: 6
                }}></div>
                Browser backup in progress...
              </div>
            )}
            
            {isPushing && (
              <div style={{ display: "flex", alignItems: "center", color: "#666", fontSize: 12 }}>
                <div style={{ 
                  display: "inline-block", width: 12, height: 12,
                  border: "2px solid #f3f3f3", borderTop: "2px solid #4caf50",
                  borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: 6
                }}></div>
                Pushing from browser environment...
              </div>
            )}

            {/* Browser GitHub Push Result */}
            {pushResult && (
              <div style={{ 
                marginTop: 12, padding: 10, borderRadius: 4, fontSize: 12,
                background: pushResult.success ? "#e8f5e8" : "#fee",
                border: `1px solid ${pushResult.success ? "#4caf50" : "#f44336"}`
              }}>
                <div style={{ fontWeight: 600, color: pushResult.success ? "#2e7d32" : "#d32f2f" }}>
                  {pushResult.success ? '✅ Browser Push Successful!' : '❌ Browser Push Failed'}
                </div>
                <div style={{ color: pushResult.success ? "#2e7d32" : "#d32f2f", marginTop: 2 }}>
                  {pushResult.message}
                </div>
              </div>
            )}
          </div>

          {/* VS Code Desktop Version */}
          <div style={{ background: "#f0f8ff", padding: 20, borderRadius: 8, border: "2px solid #2196f3" }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ marginTop: 0, marginBottom: 8, color: "#2196f3" }}>VS Code Desktop Version</h2>
              <p style={{ color: "#666", marginBottom: 12, fontSize: 14 }}>
                For local desktop development on Windows, Mac, or Linux.
                Uses your actual desktop folder paths and system commands.
              </p>
              <p style={{ fontSize: 12, color: "#4caf50", marginBottom: 16 }}>
                ✅ <strong>Desktop Ready:</strong> Works with your local VS Code environment.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <button 
                onClick={runDesktopBackup}
                disabled={isRunningDesktop || isRunning}
                style={{ 
                  padding: "8px 16px", 
                  background: isRunningDesktop ? "#ccc" : "#2196f3", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 6,
                  cursor: isRunningDesktop ? "not-allowed" : "pointer",
                  opacity: isRunningDesktop ? 0.6 : 1,
                  fontWeight: 500,
                  fontSize: 14
                }}
              >
                {isRunningDesktop ? 'Creating...' : 'Create Desktop Backup'}
              </button>
              
              <button 
                onClick={pushToGitHubDesktop}
                disabled={isPushingDesktop || isRunningDesktop || isPushing || isRunning}
                style={{ 
                  padding: "8px 16px", 
                  background: isPushingDesktop ? "#ccc" : "#4caf50", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 6,
                  cursor: isPushingDesktop ? "not-allowed" : "pointer",
                  opacity: isPushingDesktop ? 0.6 : 1,
                  fontWeight: 500,
                  fontSize: 14
                }}
              >
                {isPushingDesktop ? 'Pushing...' : 'Push to GitHub (Desktop)'}
              </button>
            </div>

            {/* Desktop Status Indicators */}
            {isRunningDesktop && (
              <div style={{ display: "flex", alignItems: "center", color: "#666", fontSize: 12 }}>
                <div style={{ 
                  display: "inline-block", width: 12, height: 12,
                  border: "2px solid #f3f3f3", borderTop: "2px solid #2196f3",
                  borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: 6
                }}></div>
                Desktop backup in progress...
              </div>
            )}
            
            {isPushingDesktop && (
              <div style={{ display: "flex", alignItems: "center", color: "#666", fontSize: 12 }}>
                <div style={{ 
                  display: "inline-block", width: 12, height: 12,
                  border: "2px solid #f3f3f3", borderTop: "2px solid #4caf50",
                  borderRadius: "50%", animation: "spin 1s linear infinite", marginRight: 6
                }}></div>
                Pushing from desktop environment...
              </div>
            )}

            {/* Desktop GitHub Push Result */}
            {pushResultDesktop && (
              <div style={{ 
                marginTop: 12, padding: 10, borderRadius: 4, fontSize: 12,
                background: pushResultDesktop.success ? "#e8f5e8" : "#fee",
                border: `1px solid ${pushResultDesktop.success ? "#4caf50" : "#f44336"}`
              }}>
                <div style={{ fontWeight: 600, color: pushResultDesktop.success ? "#2e7d32" : "#d32f2f" }}>
                  {pushResultDesktop.success ? '✅ Desktop Push Successful!' : '❌ Desktop Push Failed'}
                </div>
                <div style={{ color: pushResultDesktop.success ? "#2e7d32" : "#d32f2f", marginTop: 2 }}>
                  {pushResultDesktop.message}
                </div>
              </div>
            )}
          </div>
        </div>

      <div style={{ background: "#f9fafb", padding: 20, borderRadius: 8 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Backup Information</h2>
          <p style={{ color: "#666", marginBottom: 12 }}>
            Both backup types create a complete backup including code, data, and user uploads. 
            Choose the version that matches your development environment.
          </p>
        </div>

        {/* Backup Logs Section */}
        {logs.length > 0 && (
          <div style={{ 
            background: "#f9fafb", 
            padding: 16, 
            borderRadius: 6, 
            marginBottom: 16,
            border: "1px solid #e0e0e0"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>Browser Backup Logs</h3>
            <div style={{ 
              background: "#000", 
              color: "#0f0", 
              padding: 12, 
              borderRadius: 4, 
              fontFamily: "monospace", 
              fontSize: 12,
              maxHeight: 300,
              overflowY: "auto"
            }}>
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Backup Logs Section */}
        {logsDesktop.length > 0 && (
          <div style={{ 
            background: "#f0f8ff", 
            padding: 16, 
            borderRadius: 6, 
            marginBottom: 16,
            border: "1px solid #2196f3"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>Desktop Backup Logs</h3>
            <div style={{ 
              background: "#000", 
              color: "#0f0", 
              padding: 12, 
              borderRadius: 4, 
              fontFamily: "monospace", 
              fontSize: 12,
              maxHeight: 300,
              overflowY: "auto"
            }}>
              {logsDesktop.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize: 14, color: "#666" }}>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>What gets backed up:</h3>
          <ul style={{ paddingLeft: 20, marginTop: 0 }}>
            <li>All source code and configuration files</li>
            <li>SQLite databases and user data</li>
            <li>Quote files and customer data</li>
            <li>User uploads and assets</li>
            <li>Complete Git history (in bundle format)</li>
          </ul>
          
          <h3 style={{ fontWeight: 600, marginBottom: 8, marginTop: 16 }}>Push to GitHub:</h3>
          <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
            The "Push to GitHub" button syncs your current working branch ({window.location.hostname === 'localhost' ? 'dev' : 'main'}) 
            with GitHub. Use this to save your latest changes to the remote repository.
          </p>
        </div>
      </div>

        {/* Progress Modal */}
        {showModal && (
          <div style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: "rgba(0, 0, 0, 0.5)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            zIndex: 50 
          }}>
            <div style={{ 
              background: "white", 
              borderRadius: 8, 
              maxWidth: "700px", 
              width: "100%", 
              margin: "0 16px", 
              maxHeight: "80vh", 
              display: "flex", 
              flexDirection: "column" 
            }}>
              <div style={{ padding: "20px", borderBottom: "1px solid #e0e0e0" }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Backup Progress</h3>
              </div>
              
              <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
                <div style={{ 
                  background: "#1a1a1a", 
                  color: "#e0e0e0", 
                  padding: 16, 
                  borderRadius: 6, 
                  fontFamily: "monospace", 
                  fontSize: 13, 
                  maxHeight: "400px", 
                  overflow: "auto" 
                }}>
                  {logs.length === 0 ? (
                    <div style={{ color: "#999" }}>Starting backup...</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} style={{ 
                        marginBottom: 4,
                        color: log.status === 'error' ? '#ff6b6b' :
                               log.status === 'warning' ? '#ffd93d' :
                               log.status === 'done' ? '#51cf66' :
                               '#e0e0e0'
                      }}>
                        <span style={{ color: "#999", fontSize: 11 }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>{' '}
                        {log.message}
                      </div>
                    ))
                  )}
                </div>

                {result && (
                  <div style={{ 
                    marginTop: 16, 
                    padding: 16, 
                    borderRadius: 6,
                    background: result.success ? "#e8f5e9" : "#ffebee",
                    border: result.success ? "1px solid #c8e6c9" : "1px solid #ffcdd2"
                  }}>
                    <div style={{ 
                      fontWeight: 600,
                      color: result.success ? "#2e7d32" : "#c62828"
                    }}>
                      {result.success ? '✅ Backup Completed Successfully!' : '❌ Backup Failed'}
                    </div>
                    <div style={{ 
                      fontSize: 14, 
                      marginTop: 4,
                      color: result.success ? "#388e3c" : "#d32f2f"
                    }}>
                      {result.message}
                    </div>
                    
                    {result.success && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 14, color: "#388e3c", marginBottom: 8 }}>
                          <strong>Branch:</strong> {result.branch}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => downloadFile(result.bundle, `BridgeLineUSA-${result.branch}.bundle`)}
                            style={{ 
                              background: "#4caf50", 
                              color: "white", 
                              padding: "8px 16px", 
                              fontSize: 14, 
                              borderRadius: 4,
                              border: "none",
                              cursor: "pointer"
                            }}
                          >
                            Download Bundle
                          </button>
                          <button
                            onClick={() => downloadFile(result.zip, `BridgeLineUSA-${result.branch}.zip`)}
                            style={{ 
                              background: "#1976d2", 
                              color: "white", 
                              padding: "8px 16px", 
                              fontSize: 14, 
                              borderRadius: 4,
                              border: "none",
                              cursor: "pointer"
                            }}
                          >
                            Download ZIP
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div style={{ padding: 20, borderTop: "1px solid #e0e0e0", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={closeModal}
                  disabled={isRunning}
                  style={{ 
                    padding: "10px 16px", 
                    background: isRunning ? "#ccc" : "#666", 
                    color: "white", 
                    border: "none", 
                    borderRadius: 4,
                    cursor: isRunning ? "not-allowed" : "pointer",
                    opacity: isRunning ? 0.6 : 1
                  }}
                >
                  {isRunning ? 'Please Wait...' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Backups;