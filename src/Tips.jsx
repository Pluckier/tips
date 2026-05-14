import React, { useState, useEffect, useMemo } from 'react'
import './Tips.css'

export const HOT_TRAINERS = [
  "A P O'Brien", "T D Easterby", "L Russell & M Scudamore",
  "W P Mullins", "G Elliott", "R Hannon", "G P Cromwell",
  "G & J Moore", "R A Fahey", "Ian Williams", "A W Carroll",
  "K R Burke", "E Bolger", "James Owen", "J P O'Brien", "P Twomey",
  "D Skelton", "P F Nicholls", "A M Balding", "W J Haggas", "N P Mulholland"
];

const getTopHorseForRace = (race) => {
  let topHorse = null;
  let highestRating = -1;

  race.horses?.forEach(horse => {
    const lastOdd = horse.odds?.[horse.odds.length - 1];
    if (lastOdd === "null" || lastOdd === "NR") return;

    const ratings = (horse.past || []).map(p => parseFloat(p.name)).filter(r => !isNaN(r));
    const peak = ratings.length > 0 ? Math.max(...ratings) : 0;

    if (peak > highestRating) {
      highestRating = peak;
      topHorse = horse;
    }
  });
  return topHorse;
};

function Tips() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('tips-theme') || 'dark');
  const [showHotTrainersOnly, setShowHotTrainersOnly] = useState(false);
  const [oddsFilter, setOddsFilter] = useState(0); // 0 means no filter, 1-20 is max odds
  const [minOddsFilter, setMinOddsFilter] = useState(0); // 0 means no filter, 5-20 is min odds
  const [selectedPlaces, setSelectedPlaces] = useState(new Set());

  const oddsSteps = [0, 20, 15, 10, 5];
  const minOddsSteps = [0, 5, 10, 15, 20];

  const uniquePlaces = useMemo(() => {
    return [...new Set(tips.map(race => race.place))].sort();
  }, [tips]);

  const togglePlace = (place) => {
    setSelectedPlaces(prev => {
      const next = new Set(prev);
      if (next.has(place)) next.delete(place);
      else next.add(place);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tips-theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchTodayTips = async () => {
      try {
        // Generate today's date in DD-MM-YYYY format
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateStr = `${day}-${month}-${year}`;

        const url = `https://www.pluckier.co.uk/${dateStr}-races.json`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Could not fetch tips for ${dateStr}`);
        }

        const data = await response.json();
        setTips(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayTips();
  }, []);

  const filteredTips = useMemo(() => {
    return tips.filter(race => {
      // Race Place filter
      if (selectedPlaces.size > 0 && !selectedPlaces.has(race.place)) {
        return false;
      }

      // Existing FORM filter
      const formMatch = race.detail?.match(/FORM\s+(\d+)%/i);
      const formValue = formMatch ? parseInt(formMatch[1], 10) : 0;
      if (formValue <=-1) return false;

      // Determine topHorse for this race to apply new filters
      const currentRaceTopHorse = getTopHorseForRace(race);

      if (!currentRaceTopHorse) {
        return false; // No valid horse found for this race
      }

      // Hot Trainers filter
      const isHotTrainerMatch = HOT_TRAINERS.some(hot => 
        currentRaceTopHorse.trainer?.toLowerCase().includes(hot.toLowerCase())
      );
      if (showHotTrainersOnly && !isHotTrainerMatch) {
        return false;
      }

      // Odds filter
      const currentOddsValue = parseFloat(currentRaceTopHorse.odds?.[currentRaceTopHorse.odds.length - 1]);
      if (oddsFilter > 0 && (isNaN(currentOddsValue) || currentOddsValue > oddsFilter)) {
        return false;
      }
      if (minOddsFilter > 0 && (isNaN(currentOddsValue) || currentOddsValue < minOddsFilter)) {
        return false;
      }

      return true; // If all filters pass
    });
  }, [tips, selectedPlaces, showHotTrainersOnly, oddsFilter, minOddsFilter]);

  if (loading) {
    return (
      <div className="tips-container">
        <div className="tips-header-actions" style={{ visibility: 'hidden' }}>
          <button className="theme-toggle-btn">🌙 Dark Mode</button>
        </div>
        <h2>Today's Racing Tips</h2>
        <div className="tips-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="tip-card">
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
          ))}
        </div>
      </div>
    );
  }
  if (error) return <div className="tips-error">Error: {error}</div>;

  return (
    <div className="tips-container">
      <div className="tips-header-actions">
        <button
          onClick={() => setShowHotTrainersOnly(prev => !prev)}
          className={`filter-toggle-btn ${showHotTrainersOnly ? 'active' : ''}`}
          title="Show only tips from trainers on the 'Hot Trainers' list"
        >
          🔥 Hot Trainers
        </button>
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
        <button 
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          className="theme-toggle-btn"
        >
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
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

      <h2>Today's Racing Tips</h2>
      {filteredTips.length === 0 ? (
        <p>No tips available for today yet.</p>
      ) : (
        <div className="tips-grid">
          {filteredTips.map((race) => {
            const formMatch = race.detail?.match(/FORM\s+(\d+)%/i);
            const formValue = formMatch ? parseInt(formMatch[1], 10) : 0;

            // Find the horse with the highest peak rating in its history
            const topHorse = getTopHorseForRace(race);

            const currentOdds = topHorse?.odds?.[topHorse.odds.length - 1];
            const displayOdds = currentOdds === "null" ? "NR" : (currentOdds || "N/A");

            const isHotTrainer = topHorse && HOT_TRAINERS.some(hot => 
              topHorse.trainer?.toLowerCase().includes(hot.toLowerCase())
            );

            const raceId = `${race.time}-${race.place.replace(/\s+/g, '')}`;

            return (
              <div key={raceId} className="tip-card">
                <div className="tip-header">
                  <div style={{ flex: 1 }}>
                    <div className="tip-header-top">
                      <span className="tip-time">{race.time}</span>
                      <span className="tip-place">{race.place}</span>
                    </div>
                    <div className="tip-race-info">{race.detail} • {race.horses?.length || 0} Runners</div>
                    {topHorse && (
                      <div className="tip-horse-header">
                        {topHorse.silks && (
                          <a
                            href={`https://pluckier.github.io/racing/#${race.time}${race.place.replace(/\s+/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`View ${topHorse.name} in ${race.place} at ${race.time}`}
                          >
                            <img src={topHorse.silks} alt="silks" className="tip-silks-inline" />
                          </a>
                        )}
                        <span className="tip-horse-identity-group">
                          <span className="tip-horse-identity">{topHorse.number}. {topHorse.name}</span>
                          <span className="tip-odds-inline">{displayOdds}</span>
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="tip-form-percentage"> ({formValue}%)</span>
                </div>
                <div className="tip-body">
                  {topHorse ? (
                    <>
                      <div className="tip-info"><strong>J:</strong> {topHorse.jockey}</div>
                      <div className="tip-info"><strong>T:</strong> {topHorse.trainer}</div>
                      <details className="tip-details">
                        <summary className="tip-summary">Pedigree & Owner</summary>
                        <div className="tip-info"><strong>Owner:</strong> {topHorse.owner}</div>
                        <div className="tip-info"><strong>Breeding:</strong> {topHorse.breeding}</div>
                        <div className="tip-info"><strong>Foaled:</strong> {topHorse.foaled}</div>
                      </details>
                      {isHotTrainer && <div className="tip-hot-match">🔥 HOT TRAINER MATCH</div>}
                    </>
                  ) : (
                    <div className="tip-detail">{race.detail}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Tips
