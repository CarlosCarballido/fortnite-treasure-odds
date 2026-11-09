import { SquadSimulationInput, ExactCalculationOutput } from '../types';
import { calculateCumulativeProbability, calculatePercentiles, calculateExpectedChests, calculateChestsForTargetProbability } from './probability';
import { BASE_DENOMINATORS } from '../config/constants';

export interface SquadCalculationResult {
  mode: string;
  playersCount: number;
  rawTotalChests: number;
  overlapFactor: number;
  uniqueChests: number;
  effectiveProbability: number;
  timeSpentHours: number;
  chestsPerHour: number;
  soloEquivalentChests: number;
  soloAdvantageRatio: number;
  exactStats: ExactCalculationOutput;
}

/**
 * Calculates unique chests opened by a team considering chest overlap.
 * In battle royale, when team members loot the same POI, some chests are "stolen" or opened
 * by a teammate instead of expanding the total discovered pool.
 * Overlap factor alpha (0.0 to 1.0) defines this degree of redundancy.
 */
export function calculateSquadUniqueChests(
  playerChests: number[],
  overlapFactor: number = 0.05
): { rawTotal: number; uniqueTotal: number } {
  const rawTotal = playerChests.reduce((sum, c) => sum + Math.max(0, c), 0);
  const nPlayers = playerChests.length;

  if (nPlayers <= 1 || rawTotal === 0) {
    return { rawTotal, uniqueTotal: rawTotal };
  }

  // If overlap is 0: perfectly separated exploration => unique = rawTotal
  // If overlap is 1: all players follow each other to the exact same spots => unique = max individual chests
  const maxIndividual = Math.max(...playerChests);
  const potentialSurplus = rawTotal - maxIndividual;
  const uniqueTotal = Math.round(rawTotal - potentialSurplus * Math.min(1, Math.max(0, overlapFactor)));

  return {
    rawTotal,
    uniqueTotal: Math.max(maxIndividual, uniqueTotal),
  };
}

/**
 * Evaluates squad efficiency and probability of getting the specified target reward.
 */
export function evaluateSquadPerformance(input: SquadSimulationInput): SquadCalculationResult {
  const baseDenom = BASE_DENOMINATORS[input.targetCategory] || BASE_DENOMINATORS.pirate_shop;
  const p = Math.min(1, (1 / baseDenom) * input.multiplier);

  const playerChests = input.players.map((p) => p.chestsPerMatch * p.matchesPlayed);
  const { rawTotal, uniqueTotal } = calculateSquadUniqueChests(playerChests, input.chestOverlapFactor);

  // Total time spent in match (matches * avg match duration)
  const avgDurationMinutes =
    input.players.length > 0
      ? input.players.reduce((sum, p) => sum + p.matchDurationMinutes * p.matchesPlayed, 0) / input.players.length
      : 0;
  const timeSpentHours = avgDurationMinutes / 60;

  // Single chest odds are unchanged. Team advantage comes from opening uniqueTotal chests.
  const cumulativeProbability = calculateCumulativeProbability(uniqueTotal, p);
  const failureProbability = 1 - cumulativeProbability;
  const expectedChests = calculateExpectedChests(p);
  const medianChests = calculateChestsForTargetProbability(0.5, p);
  const percentiles = calculatePercentiles(p);

  // Solo equivalent: what 1 player would have opened alone with the first player's stats
  const soloChests = input.players[0] ? input.players[0].chestsPerMatch * input.players[0].matchesPlayed : 0;
  const soloAdvantageRatio = soloChests > 0 ? uniqueTotal / soloChests : input.players.length;

  const exactStats: ExactCalculationOutput = {
    p,
    multiplier: input.multiplier,
    chests: uniqueTotal,
    cumulativeProbability,
    failureProbability,
    expectedChests,
    medianChests,
    percentiles,
    targetProbChests: {
      '20%': calculateChestsForTargetProbability(0.2, p),
      '50%': calculateChestsForTargetProbability(0.5, p),
      '80%': calculateChestsForTargetProbability(0.8, p),
      '90%': calculateChestsForTargetProbability(0.9, p),
      '95%': calculateChestsForTargetProbability(0.95, p),
      '99%': calculateChestsForTargetProbability(0.99, p),
    },
    estimatedTimeMinutes: avgDurationMinutes,
  };

  return {
    mode: input.mode,
    playersCount: input.players.length,
    rawTotalChests: rawTotal,
    overlapFactor: input.chestOverlapFactor,
    uniqueChests: uniqueTotal,
    effectiveProbability: cumulativeProbability,
    timeSpentHours,
    chestsPerHour: timeSpentHours > 0 ? Math.round(uniqueTotal / timeSpentHours) : 0,
    soloEquivalentChests: soloChests,
    soloAdvantageRatio,
    exactStats,
  };
}

