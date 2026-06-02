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
 * Helper to calculate the rating from a horse's last run.
 */
export const calculateLastRunRating = (horse) => {
  const past = horse.past || [];
  return past.length > 0 ? (parseFloat(past[0].name) || 0) : 0;
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
 */
export const getTipRunnersForRace = (race) => {
  const allRunners = (race.horses || []).filter(h => {
    const lastOdd = h.odds?.[h.odds.length - 1];
    return lastOdd !== "null" && lastOdd !== "NR";
  });

  if (allRunners.length === 0) return [];

  const isHandicap = race.detail?.toLowerCase().includes('handicap');

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
    if (isHot) addHorse(h, '🔥 Trainer');

    if (isHandicap && (h.past || []).length === 3) {
      addHorse(h, '🎯 H3');
    }
  });

  addHorse(favorite, '✨ Fav');
  addHorse(topRated, '📊 Rated');
  if (secondRated) addHorse(secondRated, '📈 2nd');
  addHorse(topAvgRated, '⭐ Avg');
  if (secondAvgRated) addHorse(secondAvgRated, '🌟 A2');
  addHorse(topLastRated, '🏃 Last');
  addHorse(wildcard, '💀 Bottom');

  return Array.from(tipMap.values()).sort((a, b) => {
    const valA = parseFloat(a.odds?.[a.odds.length - 1]) || 999;
    const valB = parseFloat(b.odds?.[b.odds.length - 1]) || 999;
    if (valA !== valB) return valA - valB;
    return a.number - b.number;
  });
};