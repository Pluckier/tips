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

const TipsSkeleton = ({ selectedDate }) => {
  const displayDate = selectedDate ? selectedDate.split('-').reverse().join('/') : '...';

  return (
    <div className="tips-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="tips-header-actions" style={{ visibility: 'hidden' }}>
        <button className="theme-toggle-btn">🌙 Dark Mode</button>
      </div>
      <h2 style={{ fontSize: 'clamp(1.1rem, 5vw, 1.5rem)', margin: '10px 0' }}>Racing Info: {displayDate} 📅</h2>
      <div className="tips-scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '10px 4px 120px 4px' }}>
        <div className="tips-grid">
          {[...Array(6)].map((_, i) => (
            <TipCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TipsSkeleton;