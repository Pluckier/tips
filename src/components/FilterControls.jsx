import React from 'react';
import TrackWorker from './TrackWorker';

const FilterControls = ({
  showHotTrainersOnly,
  setShowHotTrainersOnly,
  minOddsFilter,
  setMinOddsFilter,
  oddsFilter,
  setOddsFilter,
  theme,
  toggleTheme,
  uniquePlaces,
  selectedPlaces,
  togglePlace,
  sortByAvg,
  setSortByAvg,
  showUpcomingOnly,
  setShowUpcomingOnly,
  isChatVisible,
  setIsChatVisible,
  notificationCount = 0,
  onReleaseNotifications
}) => {
  const oddsSteps = [0, 20, 15, 10, 5];
  const minOddsSteps = [0, 5, 10, 15, 20];

  return (
    <>
      <div className="tips-header-actions">
        <button
          onClick={() => setShowHotTrainersOnly(prev => !prev)}
          className={`filter-toggle-btn ${showHotTrainersOnly ? 'active' : ''}`}
          title="Show only tips from trainers on the 'Hot Trainers' list"
        >
          🔥 Hot Trainers
        </button>
        <button
          onClick={() => setSortByAvg(prev => !prev)}
          className={`filter-toggle-btn ${sortByAvg ? 'active' : ''}`}
          title="Toggle between Trainer/Peak strategy and Average L3 strategy"
        >
          📊 {sortByAvg ? 'Recent' : 'Highest'}
        </button>
        <TrackWorker />

        <button
          onClick={() => setIsChatVisible(prev => !prev)}
          className={`filter-toggle-btn ${isChatVisible ? 'active' : ''}`}
          title="Toggle live chat for these races"
        >
          💬
        </button>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            className={`filter-toggle-btn ${notificationCount > 0 ? 'active' : 'disabled'}`}
            disabled={notificationCount === 0}
            onClick={onReleaseNotifications}
            style={{ cursor: notificationCount > 0 ? 'pointer' : 'default' }}
            title={notificationCount > 0 ? `Show ${notificationCount} notifications` : "Data updates automatically every 15 mins"}
          >
            ↻
            {notificationCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#e53e3e',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '0.65rem',
                fontWeight: '800',
                zIndex: 2
              }}>
                {notificationCount}
              </span>
            )}
          </button>
        </div>
        <button
          onClick={() => setShowUpcomingOnly(prev => !prev)}
          className={`filter-toggle-btn ${showUpcomingOnly ? 'active' : ''}`}
          title="Show only races that haven't run yet"
        >
          🕒 Upcoming
        </button>
        <button 
          onClick={toggleTheme}
          className="theme-toggle-btn"
        >
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="tips-header-actions" style={{ justifyContent: 'center', marginTop: '10px' }}>
        <div className="odds-filter-group">
          <span className="odds-filter-label">Min Odds: {minOddsFilter === 0 ? 'Show All' : `>${minOddsFilter}/1`}</span>
          <input
            type="range"
            min="0"
            max={minOddsSteps.length - 1}
            step="1"
            value={minOddsSteps.indexOf(minOddsFilter)}
            onChange={(e) => setMinOddsFilter(minOddsSteps[parseInt(e.target.value, 10)])}
            className="odds-slider"
            title={minOddsFilter === 0 ? 'Show all odds' : `Show odds from ${minOddsFilter}/1`}
          />
        </div>
        <div className="odds-filter-group">
          <span className="odds-filter-label">Max Odds: {oddsFilter === 0 ? 'Show All' : `<${oddsFilter}/1`}</span>
          <input
            type="range"
            min="0"
            max={oddsSteps.length - 1}
            step="1"
            value={oddsSteps.indexOf(oddsFilter)}
            onChange={(e) => setOddsFilter(oddsSteps[parseInt(e.target.value, 10)])}
            className="odds-slider"
            title={oddsFilter === 0 ? 'Show all odds' : `Show odds up to ${oddsFilter}/1`}
          />
        </div>
      </div>
      
      {uniquePlaces.length > 0 && (
        <div className="place-filters-row">
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