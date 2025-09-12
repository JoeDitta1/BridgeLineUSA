import React, { useState } from 'react';
import Button from '../../components/ui/Button';

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
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">System Backup</h1>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Create Backup</h2>
            <p className="text-gray-600 mb-4">
              Create a complete backup of the system including code, data, and user uploads. 
              The backup will create a new Git branch and generate both a Git bundle and ZIP archive.
            </p>
            <p className="text-sm text-blue-600 mb-4">
              ✅ <strong>Safe Operation:</strong> Your working branch will be preserved and unchanged.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={runBackup}
              disabled={isRunning}
              className={`px-6 py-2 rounded-lg font-medium ${
                isRunning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isRunning ? 'Creating Backup...' : 'Create Backup'}
            </Button>
            
            {isRunning && (
              <div className="flex items-center text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Backup in progress...
              </div>
            )}
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <h3 className="font-medium mb-2">What gets backed up:</h3>
            <ul className="list-disc list-inside space-y-1">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Backup Progress</h3>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm max-h-96 overflow-auto">
                  {logs.length === 0 ? (
                    <div className="text-gray-400">Starting backup...</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className={`mb-1 ${
                        log.status === 'error' ? 'text-red-400' :
                        log.status === 'warning' ? 'text-yellow-400' :
                        log.status === 'done' ? 'text-green-400' :
                        'text-gray-100'
                      }`}>
                        <span className="text-gray-500 text-xs">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>{' '}
                        {log.message}
                      </div>
                    ))
                  )}
                </div>

                {result && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.success ? '✅ Backup Completed Successfully!' : '❌ Backup Failed'}
                    </div>
                    <div className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                      {result.message}
                    </div>
                    
                    {result.success && (
                      <div className="mt-4 space-y-2">
                        <div className="text-sm text-green-700">
                          <strong>Branch:</strong> {result.branch}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => downloadFile(result.bundle, `BridgeLineUSA-${result.branch}.bundle`)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm rounded"
                          >
                            Download Bundle
                          </Button>
                          <Button
                            onClick={() => downloadFile(result.zip, `BridgeLineUSA-${result.branch}.zip`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded"
                          >
                            Download ZIP
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t flex justify-end">
                <Button
                  onClick={closeModal}
                  disabled={isRunning}
                  className={`px-4 py-2 rounded ${
                    isRunning 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  {isRunning ? 'Please Wait...' : 'Close'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Backups;