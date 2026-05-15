export const HOT_TRAINERS = [
  "A P O'Brien", "T D Easterby", "L Russell & M Scudamore",
  "W P Mullins", "G Elliott", "R Hannon", "G P Cromwell",
  "G & J Moore", "R A Fahey", "Ian Williams", "A W Carroll",
  "K R Burke", "E Bolger", "James Owen", "J P O'Brien", "P Twomey",
  "D Skelton", "P F Nicholls", "A M Balding", "W J Haggas", "N P Mulholland"
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
 * Find the top horse based on current strategy (Hot Trainer/Peak vs Avg L3)
 */
export const getTopHorseForRace = (race, sortByAvg = false) => {
  const runners = (race.horses || []).filter(horse => {
    const lastOdd = horse.odds?.[horse.odds.length - 1];
    return lastOdd !== "null" && lastOdd !== "NR";
  });

  if (runners.length === 0) return null;

  let pool = runners;
  if (!sortByAvg) {
    const hotTrainerRunners = runners.filter(horse => 
      HOT_TRAINERS.some(hot => horse.trainer?.toLowerCase().includes(hot.toLowerCase()))
    );
    if (hotTrainerRunners.length > 0) pool = hotTrainerRunners;
  }

  const scoringFn = sortByAvg ? calculateAvgRating : calculatePeakRating;
  let topHorse = null;
  let highestScore = -1;

  pool.forEach(horse => {
    const score = scoringFn(horse);
    if (score > highestScore) {
      highestScore = score;
      topHorse = horse;
    }
  });
  return topHorse;
};

/**
 * Determines the NAP (best horse based on current strategy) and the Next Best horse for a given race.
 * The Next Best is the highest-rated horse among the remaining valid runners, excluding the NAP.
 * @param {object} race The race object.
 * @param {boolean} sortByAvg Strategy toggle flag.
 * @returns {{nap: object|null, nextBest: object|null}} An object containing the NAP and Next Best horses.
 */
export const getNapAndNextBestForRace = (race, sortByAvg = false) => {
  const nap = getTopHorseForRace(race, sortByAvg); 

  const allValidRunners = (race.horses || []).filter(horse => {
    const lastOdd = horse.odds?.[horse.odds.length - 1];
    return lastOdd !== "null" && lastOdd !== "NR";
  });

  // If no NAP or less than 2 valid runners, there cannot be a next best
  if (!nap || allValidRunners.length < 2) {
    return { nap, nextBest: null };
  }

  // Filter out the NAP from the list of all valid runners
  const otherRunners = allValidRunners.filter(horse => horse !== nap);

  const scoringFn = sortByAvg ? calculateAvgRating : calculatePeakRating;

  const nextBestCandidate = otherRunners
    .map(horse => ({
      horse,
      score: scoringFn(horse)
    }))
    .sort((a, b) => b.score - a.score);

  const nextBest = nextBestCandidate.length > 0 ? nextBestCandidate[0].horse : null;

  return { nap, nextBest };
};