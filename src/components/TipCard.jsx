import React, { useState, useEffect, useMemo } from 'react';
import { getTipRunnersForRace } from '../utils/raceUtils';

const TipCard = ({ race, selectedDate, showUpcomingOnly, selectedSymbols, showHandicapsOnly }) => {
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
  const allTipRunners = getTipRunnersForRace(race);
  const tipRunners = useMemo(() => {
    return allTipRunners.map(runner => {
      const reasonsArray = Array.from(runner.reasons);
      const activeReasons = reasonsArray.filter(r => 
        selectedSymbols.has(r.split(' ')[0])
      );

      // If no symbols are left active for this horse, it's no longer a 'tipped' horse
      if (activeReasons.length === 0) return null;

      return { 
        ...runner, 
        displayReasons: reasonsArray.map(r => ({
          text: r,
          symbol: r.split(' ')[0],
          isActive: selectedSymbols.has(r.split(' ')[0])
        }))
      };
    }).filter(Boolean);
  }, [allTipRunners, selectedSymbols]);

  const allValidRunners = (race.horses || []).filter(h => {
    const lastOdd = h.odds?.[h.odds.length - 1];
    return lastOdd !== "null" && lastOdd !== "NR";
  });

  const untippedHorses = useMemo(() => {
    return allValidRunners
      .filter(validRunner => !tipRunners.some(tippedRunner => tippedRunner.name === validRunner.name))
      .map(runner => {
        const originalTip = allTipRunners.find(t => t.name === runner.name);
        return originalTip ? { ...runner, allReasons: Array.from(originalTip.reasons) } : runner;
      })
      .sort((a, b) => {
        const valA = parseFloat(a.odds?.[a.odds.length - 1]) || 999;
        const valB = parseFloat(b.odds?.[b.odds.length - 1]) || 999;
        if (valA !== valB) return valA - valB;
        return a.number - b.number;
      });
  }, [allValidRunners, tipRunners, allTipRunners]);
  const untippedCount = untippedHorses.length;

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

  const raceIndicator = useMemo(() => {
    if (!showHandicapsOnly) return null;

    const detail = race.detail?.toLowerCase() || '';
    const runnerCount = (race.horses || []).length;
    const isHandicapOrNursery = detail.includes('handicap') || detail.includes('nursery');
    const isClass1 = detail.includes('class 1');

    if (isClass1) return { symbol: '👑', title: 'Class 1 Race' };
    if (isHandicapOrNursery && runnerCount >= 8) {
      return { symbol: '⚖️🏆', title: 'Tricast Race (8+ Runners)' };
    }
    if (isHandicapOrNursery && runnerCount < 8) {
      return { symbol: '⚖️', title: 'Handicap Race' };
    }
    if (!isHandicapOrNursery) {
      return { symbol: '🚫', title: 'Not a Handicap, Class 1, or Nursery' };
    }
    return null;
  }, [race.detail, race.horses, showHandicapsOnly]);

  return (
    <div className={`tip-card ${isVanishing ? 'vanishing' : ''}`}>
      <div className="tip-header">
        <div className="tip-header-top">
          <div className="tip-header-identifiers">
            <span className="tip-time">{race.time}</span>
            <span className="tip-place">{race.place}</span>
          </div>
          {raceIndicator && (
            <span title={raceIndicator.title}>
              {raceIndicator.symbol}
            </span>
          )}
        </div>
        <div className="tip-race-info">
          {race.detail} ({race.going})
        </div>
      </div>

      <div className="tip-body">
        {tipRunners.length > 0 && (
          <div className="shortlist-container">
            {tipRunners.map((runner) => {
              const oddsArr = runner.odds || [];
              const currentOdds = oddsArr[oddsArr.length - 1];
              const displayOdds = currentOdds === "null" ? "NR" : (currentOdds || "x");
              const movement = getMovementIndicator(oddsArr);

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
                        {runner.displayReasons.map(r => (
                          <span 
                            key={r.text} 
                            className="tip-reason-tag" 
                            title={r.text}
                            style={{ opacity: r.isActive ? 1 : 0.4 }}
                          >
                            {r.symbol}
                          </span>
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
        )}

        {untippedCount > 0 && (
          <div className="untipped-footer" style={{ marginTop: tipRunners.length > 0 ? '10px' : '0' }}>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--detail-text-color)', opacity: 0.8, fontStyle: 'italic', marginBottom: '5px' }}>
              {tipRunners.length > 0 
                ? `${untippedCount} more horse${untippedCount !== 1 ? 's' : ''} run:` 
                : `All ${untippedCount} runners:`}
            </div>
            <div className="untipped-horses-list">
              {untippedHorses.map((runner) => {
                const oddsArr = runner.odds || [];
                const currentOdds = oddsArr[oddsArr.length - 1];
                const displayOdds = currentOdds === "null" ? "NR" : (currentOdds || "x");
                const movement = getMovementIndicator(oddsArr);

                return (
                  <div key={runner.name} className="untipped-runner-row" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '1px 0', 
                    fontSize: '0.75rem', 
                    color: 'var(--detail-text-color)' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
                      <span style={{ marginRight: '4px' }}>{runner.number}.</span>
                      {runner.silks && <img src={runner.silks} alt="silks" className="tip-silks-inline-small" style={{ opacity: 0.6 }} />}
                      <span style={{ margin: '0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{runner.name}</span>
                          {runner.allReasons && (
                            <span style={{ display: 'inline-flex', gap: '2px', marginLeft: '4px', opacity: 0.5 }}>
                              {runner.allReasons.map(r => (
                                <span key={r} className="tip-reason-tag" title={r} style={{ fontSize: '0.8em' }}>{r.split(' ')[0]}</span>
                              ))}
                            </span>
                          )}
                    </div>
                    <span style={{ fontWeight: 'normal', marginLeft: '10px', whiteSpace: 'nowrap' }}>
                      {displayOdds}{movement}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tipRunners.length === 0 && untippedCount === 0 && (
          <div className="no-tips-msg">No runners found.</div>
        )}
      </div>
    </div>
  );
};

export default TipCard;