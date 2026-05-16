import { useMemo } from 'react';
import { HOT_TRAINERS, getTopHorseForRace } from '../utils/raceUtils';

export const useFilteredTips = (tips, { selectedPlaces, showHotTrainersOnly, oddsFilter, minOddsFilter, sortByAvg }) => {
  return useMemo(() => {
    return tips.filter(race => {
      // Race Place filter
      if (selectedPlaces.size > 0 && !selectedPlaces.has(race.place)) {
        return false;
      }

      // Existing FORM filter
      const formMatch = race.detail?.match(/FORM\s+(\d+)%/i);
      const formValue = formMatch ? parseInt(formMatch[1], 10) : 0;
      if (formValue <= -1) return false;

      // Determine topHorse for this race to apply new filters
      const currentRaceTopHorse = getTopHorseForRace(race, sortByAvg);

      if (!currentRaceTopHorse) {
        return false; // No valid horse found for this race
      }

      // Hot Trainers filter
      const isHotTrainerMatch = 
        HOT_TRAINERS.some(hot => currentRaceTopHorse.trainer?.includes(hot)) || 
        currentRaceTopHorse.owner?.startsWith("STAR");

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
  }, [tips, selectedPlaces, showHotTrainersOnly, oddsFilter, minOddsFilter, sortByAvg]);
};