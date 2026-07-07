import React, { useState, useEffect, useMemo } from 'react';
import { getTipRunnersForRace } from '../utils/raceUtils';

const TipCard = ({ race, selectedDate, showUpcomingOnly, selectedSymbols, showHandicapsOnly }) => {
  const [isVanishing, setIsVanishing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

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
    if (cur > prev) return <span className="movement-down">▼</span>;
    if (cur < prev) return <span className="movement-up">▲</span>;
    return <span className="movement-stable">~</span>;
  };

  const raceIndicators = useMemo(() => {
    if (!showHandicapsOnly) return [];

    const detail = race.detail?.toLowerCase() || '';
    const runnerCount = (race.horses || []).length;
    const isHandicapOrNursery = detail.includes('handicap') || detail.includes('nursery');
    const isClass1 = detail.includes('class 1');

    const indicators = [];

    if (isClass1) indicators.push({ symbol: '👑', title: 'Class 1 Race' });
    if (isHandicapOrNursery) indicators.push({ symbol: '⚖️', title: 'Handicap Race' });
    if ((isHandicapOrNursery || isClass1) && runnerCount >= 8) {
      indicators.push({ symbol: '🏆', title: 'Tricast Race (8+ Runners)' });
    }

    if (indicators.length === 0) {
      indicators.push({ symbol: '🚫', title: 'Not a Handicap, Class 1, or Nursery' });
    }

    return indicators;
  }, [race.detail, race.horses, showHandicapsOnly]);

  const handleDismiss = () => {
    setIsVanishing(true);
    setTimeout(() => {
      setIsDismissed(true);
    }, 800); // Wait for the vanish-puff animation (0.8s) to complete
  };

  if (isDismissed) return null;

  return (
    <div className={`tip-card ${isVanishing ? 'vanishing' : ''}`}>
      <div className="tip-header">
        <div className="tip-header-top">
          <div className="tip-header-identifiers">
            <span className="tip-time">{race.time}</span>
            <span className="tip-place">{race.place}</span>
          </div>
          <div className="tip-header-badges">
            {raceIndicators.map((indicator, idx) => (
              <span key={idx} title={indicator.title} style={{ marginLeft: '6px' }}>
                {indicator.symbol}
              </span>
            ))}
          </div>
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
                <div key={runner.name} className="tip-runner-row">
                  <div className="tip-runner-identity">
                    <span className="tip-runner-no">{runner.number}.</span>
                    <a
                      href={`https://pluckier.github.io/racing/#${selectedDate}@${race.time}${race.place.replace(/\s+/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`View ${runner.name} in main app`}
                    >
                      {runner.silks && <img src={runner.silks} alt="silks" className="tip-silks-inline-small" />}
                    </a>
                    <span className="tip-runner-name">{runner.name}</span>
                    <span className="tip-runner-reasons">
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
                  <span className="tip-runner-odds">
                    {displayOdds}{movement}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {untippedCount > 0 && (
          <div className="untipped-footer" style={{ marginTop: tipRunners.length > 0 ? '10px' : '0' }}>
            <div className="untipped-header-text">
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
                  <div key={runner.name} className="untipped-runner-row">
                    <div className="untipped-runner-identity">
                      <span className="untipped-runner-no">{runner.number}.</span>
                      {runner.silks && <img src={runner.silks} alt="silks" className="tip-silks-inline-small" style={{ opacity: 0.6 }} />}
                      <span className="untipped-runner-name">{runner.name}</span>
                          {runner.allReasons && (
                            <span className="untipped-runner-potential-symbols">
                              {runner.allReasons.map(r => (
                                <span key={r} className="tip-reason-tag" title={r}>{r.split(' ')[0]}</span>
                              ))}
                            </span>
                          )}
                    </div>
                    <span className="untipped-runner-odds">
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

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', marginBottom: '5px' }}>
          <button 
            onClick={handleDismiss} 
            className="tip-dismiss-btn"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '1.2rem', 
              opacity: 0.4,
              transition: 'opacity 0.2s',
              padding: '4px 12px'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '0.4'}
            title="Dismiss tip"
          >
            ❌
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipCard;