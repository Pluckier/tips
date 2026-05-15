import React from 'react';
import { HOT_TRAINERS, getNapAndNextBestForRace } from '../utils/raceUtils';

const TipCard = ({ race, selectedDate }) => {
  const formMatch = race.detail?.match(/FORM\s+(\d+)%/i);
  const formValue = formMatch ? formMatch[1] : '0';

  // Get both the NAP and the Next Best horse for the race
  const { nap, nextBest } = getNapAndNextBestForRace(race);

  const currentOdds = nap?.odds?.[nap.odds.length - 1];
  const displayOdds = currentOdds === "null" ? "NR" : (currentOdds || "N/A");

  const nbOdds = nextBest?.odds?.[nextBest.odds.length - 1];
  const displayNbOdds = nbOdds === "null" ? "NR" : (nbOdds || "N/A");

  const isHotTrainer = nap && HOT_TRAINERS.some(hot =>
    nap.trainer?.toLowerCase().includes(hot.toLowerCase())
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
                <span className="tip-horse-identity">{nap.number}. {nap.name}</span>
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