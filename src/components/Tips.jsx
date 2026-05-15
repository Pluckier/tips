import React, { useState, useMemo } from 'react'
import TipCard from './TipCard';
import { useFetchTips } from '../hooks/useFetchTips';
import TipsSkeleton from './TipsSkeleton';
import { useFilteredTips } from '../hooks/useFilteredTips';
import FilterControls from './FilterControls';
import { useTheme } from '../hooks/useTheme';

function Tips() {
  const { tips, loading, error } = useFetchTips();
  const { theme, toggleTheme } = useTheme();
  const [showHotTrainersOnly, setShowHotTrainersOnly] = useState(false);
  const [oddsFilter, setOddsFilter] = useState(0); // 0 means no filter, 1-20 is max odds
  const [minOddsFilter, setMinOddsFilter] = useState(0); // 0 means no filter, 5-20 is min odds
  const [selectedPlaces, setSelectedPlaces] = useState(new Set());

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

  const filteredTips = useFilteredTips(tips, {
    selectedPlaces,
    showHotTrainersOnly,
    oddsFilter,
    minOddsFilter
  });

  if (loading) return <TipsSkeleton />;
  if (error) return <div className="tips-error">Error: {error}</div>;

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
      />

      <h2>Today's Racing Tips</h2>
      {filteredTips.length === 0 ? (
        <p>No tips available for today yet.</p>
      ) : (
        <div className="tips-grid">
          {filteredTips.map((race) => (
            <TipCard 
              key={`${race.time}-${race.place.replace(/\s+/g, '')}`} 
              race={race} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Tips
