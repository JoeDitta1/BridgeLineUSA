import React, { useState } from 'react';
import { Link } from "react-router-dom";

const Backups = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSwitchingBranch, setIsSwitchingBranch] = useState(false);

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

  const switchToDevBranch = async () => {
    try {
      setIsSwitchingBranch(true);
      const response = await fetch('/api/backups/switch-to-dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to switch branch');
      }

      const result = await response.json();
      alert('Successfully switched to dev branch');
      // Optionally reload the page to reflect any changes
      window.location.reload();
    } catch (error) {
      console.error('Error switching branch:', error);
      alert(`Error switching branch: ${error.message}`);
    } finally {
      setIsSwitchingBranch(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/admin">← Back to Admin</Link>
      </div>
      <h1>System Backup</h1>
        
      <div style={{ background: "#f9fafb", padding: 20, borderRadius: 8, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Create Backup</h2>
        <p style={{ color: "#6b7280", marginBottom: 16 }}>
          Create a complete backup of the system including code, data, and user uploads. 
          The backup will create a new Git branch and generate both a Git bundle and ZIP archive.
        </p>
        <p style={{ color: "#2563eb", marginBottom: 16, fontSize: "14px" }}>
          ✅ <strong>Safe Operation:</strong> Your working branch will be preserved and unchanged.
        </p>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button 
            onClick={runBackup}
            disabled={isRunning}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              fontWeight: 600,
              cursor: isRunning ? "not-allowed" : "pointer",
              backgroundColor: isRunning ? "#9ca3af" : "#2563eb",
              color: "white"
            }}
          >
            {isRunning ? 'Creating Backup...' : 'Create Backup'}
          </button>

          <button 
            onClick={switchToDevBranch}
            disabled={isSwitchingBranch || isRunning}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              fontWeight: 600,
              cursor: (isSwitchingBranch || isRunning) ? "not-allowed" : "pointer",
              backgroundColor: (isSwitchingBranch || isRunning) ? "#9ca3af" : "#16a34a",
              color: "white"
            }}
          >
            {isSwitchingBranch ? 'Switching...' : 'Return to Dev Branch'}
          </button>
          
          {isRunning && (
            <div style={{ color: "#6b7280", fontSize: "14px" }}>
              Backup in progress...
            </div>
          )}
        </div>
      </div>

      <div style={{ background: "#f9fafb", padding: 20, borderRadius: 8 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>What gets backed up:</h3>
        <ul style={{ color: "#6b7280", fontSize: "14px", marginLeft: 20 }}>
          <li>All source code and configuration files</li>
          <li>SQLite databases and user data</li>
          <li>Quote files and customer data</li>
          <li>User uploads and assets</li>
          <li>Complete Git history (in bundle format)</li>
        </ul>
      </div>

      {/* Progress Modal */}
      {showModal && (
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: "rgba(0,0,0,0.5)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          zIndex: 1000 
        }}>
          <div style={{ 
            background: "white", 
            borderRadius: 8, 
            maxWidth: "600px", 
            width: "90%", 
            maxHeight: "80vh", 
            display: "flex", 
            flexDirection: "column" 
          }}>
            <div style={{ padding: 20, borderBottom: "1px solid #e5e7eb" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>Backup Progress</h3>
            </div>
            
            <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
              <div style={{ 
                background: "#1f2937", 
                color: "#f3f4f6", 
                padding: 16, 
                borderRadius: 6, 
                fontFamily: "monospace", 
                fontSize: "14px", 
                maxHeight: "300px", 
                overflow: "auto" 
              }}>
                {logs.length === 0 ? (
                  <div style={{ color: "#9ca3af" }}>Starting backup...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} style={{ 
                      marginBottom: 4, 
                      color: log.status === 'error' ? '#f87171' :
                             log.status === 'warning' ? '#fbbf24' :
                             log.status === 'done' ? '#34d399' :
                             '#f3f4f6'
                    }}>
                      <span style={{ color: "#9ca3af", fontSize: "12px" }}>
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
                  backgroundColor: result.success ? '#f0fdf4' : '#fef2f2',
                  border: result.success ? '1px solid #bbf7d0' : '1px solid #fecaca'
                }}>
                  <div style={{ 
                    fontWeight: 600, 
                    color: result.success ? '#166534' : '#991b1b' 
                  }}>
                    {result.success ? '✅ Backup Completed Successfully!' : '❌ Backup Failed'}
                  </div>
                  <div style={{ 
                    fontSize: "14px", 
                    marginTop: 4, 
                    color: result.success ? '#15803d' : '#dc2626' 
                  }}>
                    {result.message}
                  </div>
                  
                  {result.success && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: "14px", color: "#15803d", marginBottom: 8 }}>
                        <strong>Branch:</strong> {result.branch}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => downloadFile(result.bundle, `BridgeLineUSA-${result.branch}.bundle`)}
                          style={{
                            backgroundColor: "#16a34a",
                            color: "white",
                            padding: "8px 16px",
                            fontSize: "14px",
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
                            backgroundColor: "#2563eb",
                            color: "white",
                            padding: "8px 16px",
                            fontSize: "14px",
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
            
            <div style={{ padding: 20, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={closeModal}
                disabled={isRunning}
                style={{
                  padding: "8px 16px",
                  borderRadius: 4,
                  border: "none",
                  cursor: isRunning ? "not-allowed" : "pointer",
                  backgroundColor: isRunning ? "#d1d5db" : "#6b7280",
                  color: isRunning ? "#9ca3af" : "white"
                }}
              >
                {isRunning ? 'Please Wait...' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backups;