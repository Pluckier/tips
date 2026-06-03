import React, { useState, useMemo, useEffect } from 'react'
import TipCard from './TipCard';
import Chatter from './Chatter';
import AuthGuard from './AuthGuard';
import { useFetchTips } from '../hooks/useFetchTips';
import TipsSkeleton from './TipsSkeleton';
import { useFilteredTips } from '../hooks/useFilteredTips';
import FilterControls from './FilterControls';
import { useTheme } from '../hooks/useTheme';
import { getTipRunnersForRace } from '../utils/raceUtils';

// Import React DatePicker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// A custom header to trigger the picker, keeping your 📅 style
const CustomDateHeader = React.forwardRef(({ value, onClick }, ref) => (
  <h2 
    onClick={onClick} 
    ref={ref} 
    style={{ cursor: 'pointer', fontSize: 'clamp(1.1rem, 5vw, 1.5rem)', margin: '10px 0' }} 
    title="Click to change date"
  >
    Racing Info: {value} 📅
  </h2>
));

const SYMBOL_DESCRIPTIONS = {
  '✨': 'Favourite',
  '⭐': 'Top Rated (3 Runs)',
  '🌟': '2nd Rated (3 runs)',
  '📊': 'Top Spike on chart',
  '📈': '2nd Top Spike',
  '🏃': 'Only last run',
  '💀': 'Bottom rated',
  '💎': 'Massive spike',
  '🎯': 'Handicap newbie',
  '🔥': 'Hot trainer',
  '🚀': 'Improving',
  '🟣': 'Light Today'
};

// Define the exact order requested for the toggle buttons
const PREFERRED_SYMBOL_ORDER = ['✨', '⭐', '🌟', '📊', '📈', '🏃', '🔥', '💎', '🟣', '🚀', '🎯', '💀'];

//  SET TO 'false' TO DISABLE AUTH GUARD
const AUTH_ACTIVE = false;

function Tips() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const { tips, loading, error, refresh, lastRefreshTime } = useFetchTips(selectedDate);
  const { theme, toggleTheme } = useTheme();
  const [selectedPlaces, setSelectedPlaces] = useState(new Set());
  const [selectedSymbols, setSelectedSymbols] = useState(new Set());
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [hasInitializedSymbols, setHasInitializedSymbols] = useState(false);

  // Heartbeat to trigger re-renders for the "Upcoming" filter
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Prevent the main page (body) from scrolling to ensure our fixed-header 
  // layout works correctly without triggering a secondary window scrollbar.
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    const root = document.getElementById('root');
    if (root) root.style.height = '100%';
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
      if (root) root.style.height = '';
    };
  }, []);

  // Auto-refresh logic: trigger a refresh every 15 minutes
  useEffect(() => {
    const AUTO_REFRESH_MS = 15 * 60 * 1000;
    if (lastRefreshTime > 0) {
      const timeSinceUpdate = currentTime.getTime() - lastRefreshTime;
      if (timeSinceUpdate >= AUTO_REFRESH_MS) {
        refresh();
      }
    }
  }, [currentTime, lastRefreshTime, refresh]);

  // Reset filters when the date changes to ensure we don't hide data from the new date
  React.useEffect(() => {
    setSelectedPlaces(new Set());
    setSelectedSymbols(new Set());
    setHasInitializedSymbols(false);
  }, [selectedDate]);

  const uniquePlaces = useMemo(() => {
    return [...new Set(tips.map(race => race.place))].sort();
  }, [tips]);

  // Convert YYYY-MM-DD string to Date object for the picker
  const pickerDate = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDate]);

  const uniqueSymbols = useMemo(() => {
    const symbols = new Set();
    tips.forEach(race => {
      const runners = getTipRunnersForRace(race);
      runners.forEach(runner => {
        if (runner.reasons) {
          Array.from(runner.reasons).forEach(reason => {
            const sym = reason.split(' ')[0];
            if (sym) symbols.add(sym);
          });
        }
      });
    });
    return [...symbols].sort((a, b) => {
      const aIdx = PREFERRED_SYMBOL_ORDER.indexOf(a);
      const bIdx = PREFERRED_SYMBOL_ORDER.indexOf(b);
      // Ensure unknown symbols (if any) are pushed to the end
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
    });
  }, [tips]);

  // Auto-select all symbols by default once they are discovered in the tips data
  useEffect(() => {
    if (!loading && tips.length > 0 && uniqueSymbols.length > 0 && !hasInitializedSymbols) {
      setSelectedSymbols(new Set(uniqueSymbols));
      setHasInitializedSymbols(true);
    }
  }, [loading, tips, uniqueSymbols, hasInitializedSymbols]);

  const handleDateChange = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const togglePlace = (place) => {
    setSelectedPlaces(prev => {
      const next = new Set(prev);
      if (next.has(place)) next.delete(place);
      else next.add(place);
      return next;
    });
  };

  const toggleSymbol = (symbol) => {
    setSelectedSymbols(prev => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  };

  // Calculate the time for the "Upcoming" filter (Current time minus 5 minutes)
  // This provides a 5-minute grace period before a race is filtered away
  const filterReferenceTime = useMemo(() => {
    const time = new Date(currentTime);
    time.setMinutes(time.getMinutes() - 8);
    return time;
  }, [currentTime]);

  const filteredTips = useFilteredTips(tips, {
    selectedPlaces,
    showUpcomingOnly,
    selectedDate,
    currentTime: filterReferenceTime
  });

  useEffect(() => {
    // If the "Upcoming" filter is hiding all results for a day that has data, turn it off automatically.
    if (!loading && tips.length > 0 && showUpcomingOnly && filteredTips.length === 0) {
      setShowUpcomingOnly(false);
    }
  }, [loading, tips.length, showUpcomingOnly, filteredTips.length]);

  // Order the filtered tips chronologically by race time
  const sortedTips = useMemo(() => {
    return [...filteredTips].sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredTips]);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderContent = (authData = {}) => {
    // Only show the full skeleton if we are loading AND have no data to show.
    if (loading && tips.length === 0) return <TipsSkeleton selectedDate={selectedDate} />;

    if (error) {
      return (
        <div className="tips-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <div className="tips-header-section">
            <DatePicker
              selected={pickerDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              customInput={<CustomDateHeader />}
              withPortal
              portalId="root"
            />
          </div>
        <details className="timeline-details">
          <summary className="timeline-summary">⏱️ {formattedTime}</summary>
          <FilterControls 
            theme={theme}
            toggleTheme={toggleTheme}
            uniquePlaces={uniquePlaces}
            selectedPlaces={selectedPlaces}
            togglePlace={togglePlace}
            showUpcomingOnly={showUpcomingOnly}
            setShowUpcomingOnly={setShowUpcomingOnly}
            isChatVisible={isChatVisible}
            setIsChatVisible={setIsChatVisible}
          />
        </details>

        {uniqueSymbols.length > 0 && (
          <div className="place-filters-row">
            {uniqueSymbols.map(symbol => (
              <button
                key={symbol}
                onClick={() => toggleSymbol(symbol)}
                className={`filter-toggle-btn ${selectedSymbols.has(symbol) ? 'active' : ''}`}
                title={SYMBOL_DESCRIPTIONS[symbol] || `Filter by ${symbol}`}
              >
                {symbol}
              </button>
            ))}
          </div>
        )}
          
          <div className="tips-scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '10px 4px 120px 4px' }}>
            <div className="tips-error-content">
              <div className="tips-error-card">
                <h3>No Data Available</h3>
                <p>We couldn't retrieve any racing tips for this date. It's possible there are no meetings scheduled or the data isn't available yet.</p>
                <button 
                  onClick={() => {
                    const now = new Date();
                    const y = now.getFullYear();
                    const m = String(now.getMonth() + 1).padStart(2, '0');
                    const d = String(now.getDate()).padStart(2, '0');
                    setSelectedDate(`${y}-${m}-${d}`);
                  }} 
                  className="filter-toggle-btn active"
                  style={{ marginTop: '20px', padding: '12px 24px', fontSize: '1rem' }}
                >
                  📅 Get Today's Tips...
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="tips-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div className="tips-header-section">
          <DatePicker
            selected={pickerDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            customInput={<CustomDateHeader />}
            withPortal
            portalId="root"
          />
        </div>

        <details className="timeline-details">
          <summary className="timeline-summary">⏱️ {formattedTime}</summary>
          <FilterControls 
            theme={theme}
            toggleTheme={toggleTheme}
            uniquePlaces={uniquePlaces}
            selectedPlaces={selectedPlaces}
            togglePlace={togglePlace}
            showUpcomingOnly={showUpcomingOnly}
            setShowUpcomingOnly={setShowUpcomingOnly}
            isChatVisible={isChatVisible}
            setIsChatVisible={setIsChatVisible}
          />
        </details>

        {uniqueSymbols.length > 0 && (
          <div className="place-filters-row">
            {uniqueSymbols.map(symbol => (
              <button
                key={symbol}
                onClick={() => toggleSymbol(symbol)}
                className={`filter-toggle-btn ${selectedSymbols.has(symbol) ? 'active' : ''}`}
                title={SYMBOL_DESCRIPTIONS[symbol] || `Filter by ${symbol}`}
              >
                {symbol}
              </button>
            ))}
          </div>
        )}

        <div className="tips-scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '10px 4px 120px 4px' }}>
          {isChatVisible && <Chatter onClose={() => setIsChatVisible(false)} />}

          {filteredTips.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: '40px', opacity: 0.7 }}>No tips available for today yet.</p>
          ) : (
            <div className="tips-grid">
              {sortedTips.map((race) => (
                <TipCard 
                  key={`${race.time}-${race.place.replace(/\s+/g, '')}`} 
                  race={race} 
                  selectedDate={selectedDate}
                  showUpcomingOnly={showUpcomingOnly}
                  selectedSymbols={selectedSymbols}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!AUTH_ACTIVE) return renderContent();

  return (
    <AuthGuard>
      {(authData) => renderContent(authData)}
    </AuthGuard>
  );
}

export default Tips
