export const HOT_TRAINERS = [
  "A P O'Brien", "T D Easterby", "L Russell & M Scudamore",
  "W P Mullins", "G Elliott", "R Hannon", "G P Cromwell",
  "G & J Moore", "R A Fahey", "Ian Williams", "A W Carroll",
  "K R Burke", "E Bolger", "James Owen", "J P O'Brien", "P Twomey",
  "D Skelton", "P F Nicholls", "A M Balding", "W J Haggas", "N P Mulholland"
];

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