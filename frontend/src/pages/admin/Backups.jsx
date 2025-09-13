import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Backups = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
        headers: { 'Content-Type': 'application/json' }
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
        
      <div style={{ background: "#f9fafb", padding: 20, borderRadius: 8 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Create Backup</h2>
          <p style={{ color: "#666", marginBottom: 12 }}>
            Create a complete backup of the system including code, data, and user uploads. 
            The backup will create a new Git branch and generate both a Git bundle and ZIP archive.
          </p>
          <p style={{ fontSize: 14, color: "#1976d2", marginBottom: 16 }}>
            ✅ <strong>Safe Operation:</strong> Your working branch will be preserved and unchanged.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <button 
            onClick={runBackup}
            disabled={isRunning}
            style={{ 
              padding: "10px 20px", 
              background: isRunning ? "#ccc" : "#1976d2", 
              color: "white", 
              border: "none", 
              borderRadius: 6,
              cursor: isRunning ? "not-allowed" : "pointer",
              opacity: isRunning ? 0.6 : 1
            }}
          >
            {isRunning ? 'Creating Backup...' : 'Create Backup'}
          </button>
          
          {isRunning && (
            <div style={{ display: "flex", alignItems: "center", color: "#666" }}>
              <div style={{ 
                display: "inline-block",
                width: 16, 
                height: 16, 
                border: "2px solid #f3f3f3",
                borderTop: "2px solid #1976d2",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginRight: 8
              }}></div>
              Backup in progress...
            </div>
          )}
        </div>

        <div style={{ fontSize: 14, color: "#666" }}>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>What gets backed up:</h3>
          <ul style={{ paddingLeft: 20, marginTop: 0 }}>
            <li>All source code and configuration files</li>
            <li>SQLite databases and user data</li>
            <li>Quote files and customer data</li>
            <li>User uploads and assets</li>
            <li>Complete Git history (in bundle format)</li>
          </ul>
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