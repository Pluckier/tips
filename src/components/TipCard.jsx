import React from 'react';
import { HOT_TRAINERS, getTopHorseForRace } from '../utils/raceUtils';

const TipCard = ({ race }) => {
  const formMatch = race.detail?.match(/FORM\s+(\d+)%/i);
  const formValue = formMatch ? formMatch[1] : '0';

  // Find the horse with the highest peak rating in its history
  const topHorse = getTopHorseForRace(race);

  const currentOdds = topHorse?.odds?.[topHorse.odds.length - 1];
  const displayOdds = currentOdds === "null" ? "NR" : (currentOdds || "N/A");

  const isHotTrainer = topHorse && HOT_TRAINERS.some(hot => 
    topHorse.trainer?.toLowerCase().includes(hot.toLowerCase())
  );

  return (
    <div className="tip-card">
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
};

export default TipCard;