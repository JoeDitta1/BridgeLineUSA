import React from 'react';
import UploadButton from './UploadButton';

// FileUploadPad - wrapper around UploadButton for compatibility
export default function FileUploadPad({ quoteNo, subdir, accept, multiple, customerName, onComplete, onError }) {
  console.log('FileUploadPad: Props:', { quoteNo, subdir, accept, multiple, customerName });
  
  const handleComplete = (items) => {
    console.log('FileUploadPad: Upload complete, items:', items);
    if (onComplete) {
      console.log('FileUploadPad: Calling onComplete');
      onComplete(items);
    }
  };

  return (
    <div style={{ 
      border: '2px dashed #ccc', 
      borderRadius: 10, 
      padding: 20, 
      textAlign: 'center', 
      background: '#f9f9f9',
      minHeight: '120px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <div style={{ marginBottom: 10, color: '#666' }}>
        Drop files here or click to upload
      </div>
      <UploadButton
        quoteNo={quoteNo}
        subdir={subdir}
        multiple={multiple}
        onUploaded={handleComplete}
      />
      <div style={{ marginTop: 10, fontSize: '12px', color: '#999' }}>
        {accept || 'All file types supported'}
      </div>
    </div>
  );
}
