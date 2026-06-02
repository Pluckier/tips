import React, { useState, useEffect } from 'react';
import { getTipRunnersForRace } from '../utils/raceUtils';

const TipCard = ({ race, selectedDate, showUpcomingOnly }) => {
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

  // Get the shortlisted runners based on new criteria
  const tipRunners = getTipRunnersForRace(race);

  const untippedCount = (race.horses || []).filter(h => {
    const lastOdd = h.odds?.[h.odds.length - 1];
    return lastOdd !== "null" && lastOdd !== "NR";
  }).length - tipRunners.length;

  const getMovementIndicator = (oddsArray) => {
    if (oddsArray.length < 2) return null;
    const cur = parseFloat(oddsArray[oddsArray.length - 1]);
    const prev = parseFloat(oddsArray[oddsArray.length - 2]);
    if (isNaN(cur) || isNaN(prev)) return null;
    if (cur > prev) return (
      <span style={{ color: '#3b82f6', marginLeft: '4px', fontSize: '0.85em', fontWeight: 'bold' }}>▼</span>
    );
    if (cur < prev) return (
      <span style={{ color: '#ef4444', marginLeft: '4px', fontSize: '0.85em', fontWeight: 'bold' }}>▲</span>
    );
    return (
      <span style={{ color: 'var(--text-h)', marginLeft: '4px', fontSize: '0.85em', opacity: 0.5 }}>~</span>
    );
  };

  return (
    <div className={`tip-card ${isVanishing ? 'vanishing' : ''}`}>
      <div className="tip-header">
        <div className="tip-header-top">
          <span className="tip-time">{race.time}</span>
          <span className="tip-place">{race.place}</span>
        </div>
        <div className="tip-race-info">
          {race.detail} ({formValue}%)
        </div>
      </div>

      <div className="tip-body">
        {tipRunners.length > 0 ? (
          <>
            <div className="shortlist-container">
              {tipRunners.map((runner) => {
                const oddsArr = runner.odds || [];
                const currentOdds = oddsArr[oddsArr.length - 1];
                const displayOdds = currentOdds === "null" ? "NR" : (currentOdds || "x");
                const movement = getMovementIndicator(oddsArr);
                const reasons = Array.from(runner.reasons);

                return (
                  <div key={runner.name} className="tip-runner-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
                    <div className="tip-runner-identity" style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
                      <span className="tip-runner-no">{runner.number}.</span>
                      <a
                        href={`https://pluckier.github.io/racing/#${selectedDate}@${race.time}${race.place.replace(/\s+/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`View ${runner.name} in main app`}
                      >
                        {runner.silks && <img src={runner.silks} alt="silks" className="tip-silks-inline-small" />}
                      </a>
                      <span className="tip-runner-name" style={{ margin: '0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{runner.name}</span>
                      <span className="tip-runner-reasons" style={{ marginLeft: '6px', display: 'inline-flex', gap: '2px', verticalAlign: 'middle' }}>
                        {reasons.map(r => (
                          <span key={r} className="tip-reason-tag" title={r}>{r.split(' ')[0]}</span>
                        ))}
                      </span>
                    </div>
                    <span className="tip-runner-odds" style={{ fontWeight: 'bold', marginLeft: '10px', whiteSpace: 'nowrap' }}>
                      {displayOdds}{movement}
                    </span>
                  </div>
                );
              })}
            </div>
            {untippedCount > 0 && (
              <div className="untipped-footer" style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-h)', marginTop: '10px', opacity: 0.6, fontStyle: 'italic' }}>
                {untippedCount} more horse{untippedCount !== 1 ? 's' : ''} run
              </div>
            )}
          </>
        ) : (
          <div className="no-tips-msg">No shortlist runners found.</div>
        )}
      </div>
    </div>
  );
};

export default TipCard;