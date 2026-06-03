export const HOT_TRAINERS = [
  "A P O'Brien", "T D Easterby", "L Russell & M Scudamore",
  "W P Mullins", "G Elliott", "R Hannon", "G P Cromwell",
  "G & J Moore", "R A Fahey", "Ian Williams", "A W Carroll",
  "K R Burke", "E Bolger", "James Owen", "J P O'Brien", "P Twomey",
  "D Skelton", "P F Nicholls", "A M Balding", "W J Haggas", "N P Mulholland",
  "J & T Gosden", "C Appleby", "R M Beckett", "C Johnston", "H De Bromhead"
];

/**
 * Helper to calculate the highest peak rating from a horse's past performances.
 */
export const calculatePeakRating = (horse) => {
  const ratings = (horse.past || []).map(p => parseFloat(p.name)).filter(r => !isNaN(r));
  return ratings.length > 0 ? Math.max(...ratings) : 0;
};

/**
 * Helper to calculate the average rating from a horse's last 3 runs.
 */
export const calculateAvgRating = (horse) => {
  const past = horse.past || [];
  const last3 = past.slice(0, 3);
  if (last3.length === 0) return 0;
  const sum = last3.reduce((acc, r) => acc + (parseFloat(r.name) || 0), 0);
  return sum / last3.length;
};

/**
 * Helper to parse weight strings (e.g., "11-07" or "161") into total pounds.
 */
export const parseWeight = (w) => {
  if (!w) return 0;
  if (typeof w === 'number') return w;
  const s = w.toString().toLowerCase().replace(/\s+/g, '');
  
  // Handle hyphen format: "11-07"
  const hyphenMatch = s.match(/(\d+)-(\d+)/);
  if (hyphenMatch) return (parseInt(hyphenMatch[1], 10) * 14) + parseInt(hyphenMatch[2], 10);
  
  // Handle unit format: "9st 2lb" or "9st"
  const stMatch = s.match(/(\d+)st/);
  const lbMatch = s.match(/(\d+)lb/);
  if (stMatch || lbMatch) {
    const st = stMatch ? parseInt(stMatch[1], 10) : 0;
    const lb = lbMatch ? parseInt(lbMatch[1], 10) : 0;
    return (st * 14) + lb;
  }

  return parseFloat(s) || 0;
};

/**
 * Helper to calculate the rating from a horse's last run.
 */
export const calculateLastRunRating = (horse) => {
  const past = horse.past || [];
  return past.length > 0 ? (parseFloat(past[0].name) || 0) : 0;
};

/**
 * Helper to parse distance strings (e.g., "1m2f" or "5f") into total furlongs.
 */
export const parseDistanceToFurlongs = (distStr) => {
  if (!distStr || typeof distStr !== 'string') return 0;
  let totalFurlongs = 0;
  const mMatch = distStr.match(/(\d+)m/);
  const fMatch = distStr.match(/(\d+)f/);
  const yMatch = distStr.match(/(\d+)y/);
  if (mMatch) totalFurlongs += parseInt(mMatch[1], 10) * 8;
  if (fMatch) totalFurlongs += parseInt(fMatch[1], 10);
  if (yMatch) totalFurlongs += Math.round(parseInt(yMatch[1], 10) / 220);
  return totalFurlongs;
};

/**
 * Helper to parse race class from a detail string (e.g., "Class 4 Handicap").
 */
export const parseRaceClass = (detail) => {
  if (!detail) return null;
  const s = detail.toString().trim();
  // Handle raw numbers (e.g., "6") or "Class 6"
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  const match = s.match(/Class\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Identifies runners for the "Shortlist" based on:
 * 1. Top Trainer (HOT_TRAINERS list)
 * 2. Top or Second Best Peak Rating (Past race 'name')
 * 3. Favorite (Shortest odds)
 * 4. Top or Second Best Average Rating (Last 3 runs or whatever is available)
 * 5. Wildcard (Bottom rated horse based on Average Rating)
 * 6. Top Last Run Rating (Most recent outing)
 * 7. Horses with exactly 3 runs in a handicap race
 * 8. Improvers (Last run was their best run ever)
 * 9. Class Standout (Peak rating is double the next best in the race)
 * 10. Underweight (Today's weight is lighter than any previous weight carried in comparable conditions)
 */
export const getTipRunnersForRace = (race) => {
  const allRunners = (race.horses || []).filter(h => {
    const lastOdd = h.odds?.[h.odds.length - 1];
    return lastOdd !== "null" && lastOdd !== "NR";
  });

  if (allRunners.length === 0) return [];

  const isHandicap = race.detail?.toLowerCase().includes('handicap');
  const todayFurlongs = parseDistanceToFurlongs(race.distance);
  const todayGoing = race.going;
  const todayClass = parseRaceClass(race.detail);

  // 1. Identify Favorite (Shortest Odds)
  const sortedByOdds = [...allRunners].sort((a, b) => {
    const valA = parseFloat(a.odds?.[a.odds.length - 1]) || 999;
    const valB = parseFloat(b.odds?.[b.odds.length - 1]) || 999;
    return valA - valB;
  });
  const favorite = sortedByOdds[0];

  // 2. Identify Top 2 Rated (Peak)
  const sortedByRating = [...allRunners].sort((a, b) => calculatePeakRating(b) - calculatePeakRating(a));
  const topRated = sortedByRating[0];
  const secondRated = sortedByRating[1];

  // 3. Identify Top 2 Rated (Average)
  const sortedByAvg = [...allRunners].sort((a, b) => calculateAvgRating(b) - calculateAvgRating(a));
  const topAvgRated = sortedByAvg[0];
  const secondAvgRated = sortedByAvg[1];
  
  const wildcard = [...sortedByAvg].reverse().find(h => {
    const lastOdd = parseFloat(h.odds?.[h.odds.length - 1]);
    return !isNaN(lastOdd) && lastOdd <= 250;
  });

  // 4. Identify Top Rated (Last Run)
  const sortedByLast = [...allRunners].sort((a, b) => calculateLastRunRating(b) - calculateLastRunRating(a));
  const topLastRated = sortedByLast[0];

  // Map to store unique horses and their "reasons" for being tipped
  const tipMap = new Map();

  const addHorse = (horse, reason) => {
    if (!horse) return;
    if (!tipMap.has(horse.name)) {
      tipMap.set(horse.name, { ...horse, reasons: new Set() });
    }
    tipMap.get(horse.name).reasons.add(reason);
  };

  // Apply Criteria
  allRunners.forEach(h => {
    const isHot = HOT_TRAINERS.some(hot => h.trainer?.includes(hot)) || h.owner?.startsWith("STAR");
    if (isHot) addHorse(h, '🔥 Hot trainer');

    if (isHandicap && (h.past || []).length === 3) {
      addHorse(h, '🎯 Handicap newbie');
    }

    // Identify Improvers: Last run rating equals lifetime peak rating
    const lastRating = calculateLastRunRating(h);
    const lastOdd = parseFloat(h.odds?.[h.odds.length - 1]);
    if (lastRating > 0 && lastRating === calculatePeakRating(h) && !isNaN(lastOdd) && lastOdd < 250) {
      addHorse(h, '🚀 Improving');
    }

    // Identify Underweight: Lighter than any past run with same Distance, Going, and Class
    const allowance = parseFloat(h.allowance) || 0;
    const currentWeight = parseWeight(h.weight) - allowance;
    
    const comparablePast = (h.past || []).filter(p => {
      const pDist = parseDistanceToFurlongs(p.distance);
      const pGoing = p.going;
      const pClass = parseRaceClass(p.raceClass);
      
      // Performance check: Won or within 1.5 lengths
      const pos = parseInt(p.position?.toString().split('/')[0], 10);
      const isWinner = pos === 1;
      let withinMargin = isWinner;

      if (!isWinner && p.distBeaten) {
        const db = p.distBeaten.toString().toLowerCase().trim();
        const abbrev = ['shd', 'hd', 'nk', 'ns', 'dh'];
        if (abbrev.includes(db)) {
          withinMargin = true;
        } else {
          const dNum = parseFloat(db);
          if (!isNaN(dNum) && dNum <= 1.5) {
            withinMargin = true;
          }
        }
      }
      
      const match = pDist === todayFurlongs && pGoing === todayGoing && pClass === todayClass && withinMargin;
      
      return match;
    });

    const pastWeights = comparablePast.map(p => parseWeight(p.weight)).filter(pw => pw > 0);
    if (currentWeight > 0 && pastWeights.length > 0 && currentWeight <= Math.min(...pastWeights)) {
      addHorse(h, '🟣 Light Today');     
    }
  });

  addHorse(favorite, '✨ Favourite');
  addHorse(topRated, '📊 Top Spike on chart');

  const topPeak = calculatePeakRating(topRated);
  const secondPeak = secondRated ? calculatePeakRating(secondRated) : 0;

  // Check distance beaten for the highest-rated run to ensure the "Spike" was competitive
  const peakRun = (topRated.past || []).find(p => parseFloat(p.name) === topPeak);
  const peakPos = peakRun ? parseInt(peakRun.position?.toString().split('/')[0], 10) : 0;
  let peakDistValid = peakPos === 1;
  if (peakRun && !peakDistValid && peakRun.distBeaten) {
    const db = peakRun.distBeaten.toString().toLowerCase().trim();
    const abbrev = ['shd', 'hd', 'nk', 'ns', 'dh'];
    if (abbrev.includes(db)) {
      peakDistValid = true;
    } else {
      const dNum = parseFloat(db);
      peakDistValid = !isNaN(dNum) && dNum < 2;
    }
  }

  if (topPeak > 0 && topPeak > (secondPeak * 1.9) && peakDistValid) {
    addHorse(topRated, '💎 Massive spike');
  }

  if (secondRated) addHorse(secondRated, '📈 2nd Top Spike');
  addHorse(topAvgRated, '⭐ Top Rated (3 Runs)');
  if (secondAvgRated) addHorse(secondAvgRated, '🌟 2nd Rated (3 runs)');
  addHorse(topLastRated, '🏃 Only last run');
  addHorse(wildcard, '💀 Bottom rated');

  return Array.from(tipMap.values()).sort((a, b) => {
    const valA = parseFloat(a.odds?.[a.odds.length - 1]) || 999;
    const valB = parseFloat(b.odds?.[b.odds.length - 1]) || 999;
    if (valA !== valB) return valA - valB;
    return a.number - b.number;
  });
};