import React from 'react';
import { API_BASE } from '../api/base';

// Simple FileViewerModal component  
export default function FileViewerModal({ open, onClose, file, quoteNo }) {
  if (!open) return null;

  const fileName = file?.name || file?.originalname || 'Unknown file';
  let fileUrl = file?.url || '#';
  
  // Ensure we have a full URL by prepending the backend URL if it's a relative path
  if (fileUrl && fileUrl.startsWith('/files/')) {
    fileUrl = API_BASE + fileUrl;
  }
  
  console.log('FileViewerModal: Opening file:', fileName, 'URL:', fileUrl);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.8)', 
      zIndex: 1000,
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        maxWidth: '90%', 
        maxHeight: '90%',
        minWidth: '400px',
        minHeight: '300px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>{fileName}</h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '20px', 
              cursor: 'pointer' 
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          {fileUrl !== '#' ? (
            <div>
              {/* Show PDF inline if it's a PDF file */}
              {fileName.toLowerCase().endsWith('.pdf') ? (
                <div style={{ marginBottom: '20px' }}>
                  <iframe
                    src={fileUrl}
                    style={{
                      width: '100%',
                      height: '500px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    title={fileName}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📄</div>
                  <div style={{ fontWeight: 'bold' }}>{fileName}</div>
                </div>
              )}
              
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  marginRight: '10px'
                }}
              >
                Open in New Tab
              </a>
              
              <a 
                href={fileUrl} 
                download={fileName}
                style={{ 
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px'
                }}
              >
                Download
              </a>
              
              <div style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                Quote: {quoteNo || 'N/A'}
              </div>
            </div>
          ) : (
            <div style={{ color: '#666' }}>
              File preview not available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
