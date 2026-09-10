import React from 'react';

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
      <div className="loading"></div>
    </div>
  );
}

export default LoadingSpinner;