import React, { useState, useEffect } from 'react';
import { HOT_TRAINERS, getNapAndNextBestForRace, calculateAvgRating, calculatePeakRating } from '../utils/raceUtils';

const TipCard = ({ race, selectedDate, sortByAvg, showUpcomingOnly }) => {
  const [isVanishing, setIsVanishing] = useState(false);

  // Monitor the race time to trigger the "vanish" animation just before 
  // the parent component filters it out (at the 8 minute mark)
  useEffect(() => {
    const [hours, mins] = race.time.split(':').map(Number);
    const [y, m, d] = selectedDate.split('-').map(Number);
    const raceDate = new Date(y, m - 1, d);
    raceDate.setHours(hours, mins, 0, 0);

    const checkVanishStatus = () => {
      const now = new Date();
      const isToday = now.getFullYear() === y && (now.getMonth() + 1) === m && now.getDate() === d;

      // Guard: Only animate if "Upcoming" filter is active and we're looking at today.
      // This prevents cards from appearing vanished on past dates or when filtering is off.
      if (!showUpcomingOnly || !isToday) {
        if (isVanishing) setIsVanishing(false);
        return;
      }

      const diffMinutes = (now - raceDate) / 60000;

      // Parent filters at 8.0 mins. We start the "death throes" just before (~7m 59s)
      if (diffMinutes >= 7.98 && !isVanishing) {
        setIsVanishing(true);
      }
    };

    const timer = setInterval(checkVanishStatus, 1000);
    return () => clearInterval(timer);
  }, [race.time, selectedDate, isVanishing, showUpcomingOnly]);

  const formMatch = race.detail?.match(/FORM\s+(\d+)%/i);
  const formValue = formMatch ? formMatch[1] : '0';

  // Get both the NAP and the Next Best horse for the race
  const { nap, nextBest } = getNapAndNextBestForRace(race, sortByAvg);

  const currentOdds = nap?.odds?.[nap.odds.length - 1];
  const displayOdds = currentOdds === "null" ? "NR" : (currentOdds || "N/A");

  const nbOdds = nextBest?.odds?.[nextBest.odds.length - 1];
  const displayNbOdds = nbOdds === "null" ? "NR" : (nbOdds || "N/A");

  const napScore = nap ? (sortByAvg ? calculateAvgRating(nap) : calculatePeakRating(nap)) : 0;

  const isHotTrainer = nap && (
    HOT_TRAINERS.some(hot => nap.trainer?.includes(hot)) || 
    nap.owner?.startsWith("STAR")
  );

  return (
    <div className={`tip-card ${isVanishing ? 'vanishing' : ''}`}>
      <div className="tip-header">
        <div style={{ flex: 1 }}>
          <div className="tip-header-top">
            <span className="tip-time">{race.time}</span>
            <span className="tip-place">{race.place}</span>
          </div>
          <div className="tip-race-info">{race.detail} • {race.horses?.length || 0} Runners</div>
          {nap && (
            <div className="tip-horse-header">
              {nap.silks && (
                <a
                  href={`https://pluckier.github.io/racing/#${selectedDate}@${race.time}${race.place.replace(/\s+/g, '')}`} // Assuming NAP is the one linked
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`View ${nap.name} in ${race.place} at ${race.time}`}
                >
                  <img src={nap.silks} alt="silks" className="tip-silks-inline" />
                </a>
              )}
              <span className="tip-horse-identity-group">
                <span className="tip-horse-identity">
                  {nap.number}. {nap.name} 
                </span>
                <span className="tip-odds-inline">{displayOdds}</span>
              </span>
            </div>
          )}
        </div>
        <span className="tip-form-percentage"> ({formValue}%)</span>
      </div>
      <div className="tip-body">
        {nap ? (
          <>
            <div className="tip-info"><strong>J:</strong> {nap.jockey}</div>
            <div className="tip-info"><strong>T:</strong> {nap.trainer}</div>
            <details className="tip-details">
              <summary className="tip-summary">Pedigree & Owner</summary>
              <div className="tip-info"><strong>Owner:</strong> {nap.owner}</div>
              <div className="tip-info"><strong>Breeding:</strong> {nap.breeding}</div>
              <div className="tip-info"><strong>Foaled:</strong> {nap.foaled}</div>
            </details>
            {isHotTrainer && <div className="tip-hot-match">🔥 HOT TRAINER MATCH</div>}

            {nextBest && (
              <>
                <div className="tip-details" style={{ marginTop: '12px' }}></div>
                <div className="tip-next-best">
                  <span className="next-best-label">NB:</span>
                  {nextBest.silks && <img src={nextBest.silks} alt="silks" className="tip-silks-inline-small" />}
                  <span className="next-best-identity">
                    {nextBest.number}. {nextBest.name} 
                    <span className="tip-odds-inline-small"> {displayNbOdds}</span>
                  </span>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="tip-detail">{race.detail}</div>
        )}
      </div>
    </div>
  );
};

export default TipCard;