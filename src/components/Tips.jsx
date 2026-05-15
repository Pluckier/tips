import React, { useState, useMemo } from 'react'
import TipCard from './TipCard';
import { useFetchTips } from '../hooks/useFetchTips';
import TipsSkeleton from './TipsSkeleton';
import { useFilteredTips } from '../hooks/useFilteredTips';
import FilterControls from './FilterControls';
import { useTheme } from '../hooks/useTheme';
import { getTopHorseForRace, calculateAvgRating, calculatePeakRating } from '../utils/raceUtils';

// Import React DatePicker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// A custom header to trigger the picker, keeping your 📅 style
const CustomDateHeader = React.forwardRef(({ value, onClick }, ref) => (
  <h2 onClick={onClick} ref={ref} style={{ cursor: 'pointer' }} title="Click to change date">
    Racing Tips: {value} 📅
  </h2>
));

function Tips() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const { tips, loading, error } = useFetchTips(selectedDate);
  const { theme, toggleTheme } = useTheme();
  const [showHotTrainersOnly, setShowHotTrainersOnly] = useState(false);
  const [oddsFilter, setOddsFilter] = useState(0); // 0 means no filter, 1-20 is max odds
  const [minOddsFilter, setMinOddsFilter] = useState(0); // 0 means no filter, 5-20 is min odds
  const [selectedPlaces, setSelectedPlaces] = useState(new Set());
  const [sortByAvg, setSortByAvg] = useState(false);

  // Reset filters when the date changes to ensure we don't hide data from the new date
  React.useEffect(() => {
    setSelectedPlaces(new Set());
  }, [selectedDate]);

  const uniquePlaces = useMemo(() => {
    return [...new Set(tips.map(race => race.place))].sort();
  }, [tips]);

  // Convert YYYY-MM-DD string to Date object for the picker
  const pickerDate = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDate]);

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

  const filteredTips = useFilteredTips(tips, {
    selectedPlaces,
    showHotTrainersOnly,
    oddsFilter,
    minOddsFilter,
    sortByAvg
  });

  // Order the filtered tips chronologically by race time
  const sortedTips = useMemo(() => {
    return [...filteredTips].sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredTips]);

  if (loading) return <TipsSkeleton selectedDate={selectedDate} />;

  if (error) {
    return (
      <div className="tips-container">
        <FilterControls 
          showHotTrainersOnly={showHotTrainersOnly}
          setShowHotTrainersOnly={setShowHotTrainersOnly}
          minOddsFilter={minOddsFilter}
          setMinOddsFilter={setMinOddsFilter}
          oddsFilter={oddsFilter}
          setOddsFilter={setOddsFilter}
          theme={theme}
          toggleTheme={toggleTheme}
          uniquePlaces={uniquePlaces}
          selectedPlaces={selectedPlaces}
          togglePlace={togglePlace}
          sortByAvg={sortByAvg}
          setSortByAvg={setSortByAvg}
        />
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
    );
  }

  return (
    <div className="tips-container">
      <FilterControls 
        showHotTrainersOnly={showHotTrainersOnly}
        setShowHotTrainersOnly={setShowHotTrainersOnly}
        minOddsFilter={minOddsFilter}
        setMinOddsFilter={setMinOddsFilter}
        oddsFilter={oddsFilter}
        setOddsFilter={setOddsFilter}
        theme={theme}
        toggleTheme={toggleTheme}
        uniquePlaces={uniquePlaces}
        selectedPlaces={selectedPlaces}
        togglePlace={togglePlace}
        sortByAvg={sortByAvg}
        setSortByAvg={setSortByAvg}
      />

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

      {filteredTips.length === 0 ? (
        <p>No tips available for today yet.</p>
      ) : (
        <div className="tips-grid">
          {sortedTips.map((race) => (
            <TipCard 
              key={`${race.time}-${race.place.replace(/\s+/g, '')}`} 
              race={race} 
              selectedDate={selectedDate}
              sortByAvg={sortByAvg}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Tips
