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
const calculatePeakRating = (horse) => {
  const ratings = (horse.past || []).map(p => parseFloat(p.name)).filter(r => !isNaN(r));
  return ratings.length > 0 ? Math.max(...ratings) : 0;
};
/**
 * Find the horse with the highest peak rating in its history
 */
export const getTopHorseForRace = (race) => {
  const runners = (race.horses || []).filter(horse => {
    const lastOdd = horse.odds?.[horse.odds.length - 1];
    return lastOdd !== "null" && lastOdd !== "NR";
  });

  if (runners.length === 0) return null;

  // Check if any runners belong to a HOT_TRAINER
  const hotTrainerRunners = runners.filter(horse => 
    HOT_TRAINERS.some(hot => horse.trainer?.toLowerCase().includes(hot.toLowerCase()))
  );

  // Strategy: Prioritize Hot Trainers pool. If none exist, fallback to all runners.
  const pool = hotTrainerRunners.length > 0 ? hotTrainerRunners : runners;

  let topHorse = null;
  let highestRating = -1;

  pool.forEach(horse => {
    const ratings = (horse.past || []).map(p => parseFloat(p.name)).filter(r => !isNaN(r));
    const peak = ratings.length > 0 ? Math.max(...ratings) : 0;

    if (peak > highestRating) {
      highestRating = peak;
      topHorse = horse;
    }
  });
  return topHorse;
};

/**
 * Determines the NAP (best horse based on current strategy) and the Next Best horse for a given race.
 * The Next Best is the highest-rated horse among the remaining valid runners, excluding the NAP.
 * @param {object} race The race object.
 * @returns {{nap: object|null, nextBest: object|null}} An object containing the NAP and Next Best horses.
 */
export const getNapAndNextBestForRace = (race) => {
  const nap = getTopHorseForRace(race); // Use existing logic for NAP

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

  // Calculate peak ratings for the remaining runners and sort them to find the next best
  const nextBestCandidate = otherRunners
    .map(horse => ({
      horse,
      peakRating: calculatePeakRating(horse)
    }))
    .sort((a, b) => b.peakRating - a.peakRating);

  const nextBest = nextBestCandidate.length > 0 ? nextBestCandidate[0].horse : null;

  return { nap, nextBest };
};