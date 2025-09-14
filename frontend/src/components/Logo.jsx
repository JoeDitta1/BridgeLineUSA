import React from 'react';

const Logo = ({ 
  size = 'medium', 
  showCompanyInfo = true, 
  companyText = 'BridgeLineUSA',
  subText = 'South Coast Manufacturing, LLC',
  style = {} 
}) => {
  const sizes = {
    small: { width: 32, height: 32, fontSize: 12, checkmarkSize: 12 },
    medium: { width: 50, height: 50, fontSize: 18, checkmarkSize: 18 },
    large: { width: 64, height: 64, fontSize: 24, checkmarkSize: 24 }
  };
  
  const currentSize = sizes[size] || sizes.medium;

  const logoCircleStyle = {
    width: currentSize.width,
    height: currentSize.height,
    background: '#1e3a5f',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    fontWeight: 'bold',
    fontSize: currentSize.fontSize,
    color: '#fff'
  };

  const checkmarkStyle = {
    content: '✓',
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    background: '#00a884',
    color: '#fff',
    width: currentSize.checkmarkSize,
    height: currentSize.checkmarkSize,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: currentSize.checkmarkSize - 8,
    border: '2px solid #fff'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', ...style }}>
      <div style={logoCircleStyle}>
        BL
        <div style={checkmarkStyle}>✓</div>
      </div>
      {showCompanyInfo && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 600, fontSize: '16px' }}>{companyText}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{subText}</div>
        </div>
      )}
    </div>
  );
};

export default Logo;