import React from 'react';

const TipCardSkeleton = () => (
  <div className="tip-card">
    <div className="tip-header">
      <div className="skeleton-placeholder" style={{ width: '60%', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
    </div>
    <div className="tip-body">
      <div className="skeleton-placeholder" style={{ width: '40%', height: '15px', marginBottom: '12px' }}></div>
      <div className="skeleton-placeholder" style={{ width: '80%', height: '24px', marginBottom: '20px' }}></div>
      <div className="skeleton-placeholder" style={{ width: '70%', height: '15px', marginBottom: '10px' }}></div>
      <div className="skeleton-placeholder" style={{ width: '70%', height: '15px', marginBottom: '10px' }}></div>
    </div>
  </div>
);

const TipsSkeleton = () => {
  return (
    <div className="tips-container">
      <div className="tips-header-actions" style={{ visibility: 'hidden' }}>
        <button className="theme-toggle-btn">🌙 Dark Mode</button>
      </div>
      <h2>Today's Racing Tips</h2>
      <div className="tips-grid">
        {[...Array(6)].map((_, i) => (
          <TipCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default TipsSkeleton;