import React, { useState, useEffect } from 'react';
import TrackWorker from './TrackWorker';

const FilterControls = ({
  theme,
  toggleTheme,
  uniquePlaces,
  selectedPlaces,
  togglePlace,
  showUpcomingOnly,
  setShowUpcomingOnly,
  isChatVisible,
  setIsChatVisible,
  showHandicapsOnly,
  setShowHandicapsOnly
}) => {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  // Sync local state if fullscreen is toggled via Escape key or browser controls
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <>
      <div className="tips-header-actions">
        <TrackWorker />

        <button
          onClick={() => setIsChatVisible(prev => !prev)}
          className={`filter-toggle-btn symbol-toggle ${isChatVisible ? 'active' : ''}`}
          title="Toggle live chat for these races"
        >
          💬
        </button>
        <button
          onClick={() => setShowUpcomingOnly(prev => !prev)}
          className={`filter-toggle-btn symbol-toggle ${showUpcomingOnly ? 'active' : ''}`}
          title="Show only races that haven't run yet"
        >
          🕒 Upcoming
        </button>
        <button
          onClick={toggleFullscreen}
          className={`filter-toggle-btn ${isFullscreen ? 'active' : ''}`}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? '⛶ Windowed' : '⛶ Fullscreen'}
        </button>
        <button 
          onClick={toggleTheme}
          className="theme-toggle-btn"
        >
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      
      {uniquePlaces.length > 0 && (
        <div className="place-filters-row">
          <button
            onClick={() => setShowHandicapsOnly(prev => !prev)}
            className={`filter-toggle-btn symbol-toggle ${showHandicapsOnly ? 'active' : ''}`}
            title="Show only Handicaps, Class 1 or Nursery races"
          >
            🏆 Handicaps
          </button>
          {uniquePlaces.map(place => (
            <button
              key={place}
              onClick={() => togglePlace(place)}
              className={`filter-toggle-btn ${selectedPlaces.has(place) ? 'active' : ''}`}
            >
              {place}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default FilterControls;