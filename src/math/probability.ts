import { PercentileData } from '../types';

/**
 * Calculates the exact cumulative probability of obtaining at least 1 success in n trials,
 * each with independent probability p.
 * Uses P = -Math.expm1(n * Math.log1p(-p)) for high numerical precision with small p and large n.
 */
export function calculateCumulativeProbability(n: number, p: number): number {
  if (n <= 0 || p <= 0) return 0;
  if (p >= 1) return 1;

  // Stable log(1 - p)
  const log1MinusP = Math.log1p(-p);
  const nLog = n * log1MinusP;

  // If nLog is very negative, exp(nLog) underflows to 0, so 1 - 0 = 1
  if (nLog < -700) return 1;

  const prob = -Math.expm1(nLog);
  return Math.min(1, Math.max(0, prob));
}

/**
 * Calculates failure probability: probability of obtaining 0 successes in n trials.
 */
export function calculateFailureProbability(n: number, p: number): number {
  if (n <= 0) return 1;
  if (p <= 0) return 1;
  if (p >= 1) return 0;

  const log1MinusP = Math.log1p(-p);
  const nLog = n * log1MinusP;
  if (nLog < -700) return 0;

  return Math.min(1, Math.max(0, Math.exp(nLog)));
}

/**
 * Calculates cumulative probability across multiple heterogeneous sessions,
 * each with n_i chests and p_i success probability:
 * P = 1 - PRODUCT( (1 - p_i)^n_i ) = -Math.expm1( SUM( n_i * Math.log1p(-p_i) ) )
 */
export function calculateMixedSessionsProbability(
  sessions: { chests: number; p: number }[]
): number {
  if (!sessions || sessions.length === 0) return 0;

  let totalLog = 0;
  for (const s of sessions) {
    if (s.chests > 0 && s.p > 0) {
      if (s.p >= 1) return 1;
      totalLog += s.chests * Math.log1p(-s.p);
    }
  }

  if (totalLog === 0) return 0;
  if (totalLog < -700) return 1;

  return Math.min(1, Math.max(0, -Math.expm1(totalLog)));
}

/**
 * Calculates the number of chests required to reach a target probability q in (0, 1)
 * given per-chest probability p in (0, 1).
 * Formula: n = ceil( Math.log1p(-q) / Math.log1p(-p) )
 * Returns Infinity if q >= 1 and 0 < p < 1, because no finite number guarantees success.
 */
export function calculateChestsForTargetProbability(q: number, p: number): number {
  if (q <= 0) return 0;
  if (p >= 1) return 1;
  if (p <= 0) return Infinity;
  if (q >= 1) return Infinity; // Crucial requirement: No finite number guarantees prize when 0 < p < 1

  const num = Math.log1p(-q);
  const den = Math.log1p(-p);

  if (den === 0) return Infinity;

  const result = Math.ceil(num / den);
  return Math.max(0, result);
}

/**
 * Computes standard percentiles (10, 25, 50, 75, 90, 95, 99) of chests needed to get first success.
 */
export function calculatePercentiles(p: number): PercentileData[] {
  const targets = [10, 25, 50, 75, 90, 95, 99];
  return targets.map((pct) => ({
    percentile: pct,
    chests: calculateChestsForTargetProbability(pct / 100, p),
  }));
}

/**
 * Expected number of chests to first success: E[X] = 1 / p for a geometric distribution.
 */
export function calculateExpectedChests(p: number): number {
  if (p <= 0) return Infinity;
  if (p >= 1) return 1;
  return 1 / p;
}

/**
 * Wilson score 95% confidence interval for empirical frequency p_hat = successes / trials.
 * Robust even when successes = 0 or successes = trials.
 */
export function calculateWilsonConfidenceInterval(
  successes: number,
  trials: number,
  confidenceLevel: number = 0.95
): [number, number] {
  if (trials <= 0) return [0, 0];

  // z value for 95% is ~1.959964
  const z = confidenceLevel === 0.99 ? 2.575829 : 1.959964;
  const pHat = successes / trials;
  const zSq = z * z;

  const denominator = 1 + zSq / trials;
  const centerAdjusted = (pHat + zSq / (2 * trials)) / denominator;
  const margin =
    (z / denominator) *
    Math.sqrt((pHat * (1 - pHat)) / trials + zSq / (4 * trials * trials));

  const lower = Math.max(0, centerAdjusted - margin);
  const upper = Math.min(1, centerAdjusted + margin);

  return [lower, upper];
}

/**
 * Formats a probability as a percentage string with adaptive precision.
 * e.g., 0.0000072727 => "0.000727%" or "1 en 137.500"
 */
export function formatProbabilityPercentage(prob: number, maxDecimals: number = 4): string {
  if (prob === 0) return '0%';
  if (prob >= 1) return '100%';

  const pct = prob * 100;
  if (pct >= 1) {
    return `${pct.toFixed(Math.min(4, maxDecimals))}%`;
  } else if (pct >= 0.01) {
    return `${pct.toFixed(4)}%`;
  } else if (pct >= 0.0001) {
    return `${pct.toFixed(5)}%`;
  } else {
    return `${pct.toPrecision(4)}%`;
  }
}

/**
 * Returns formatted 1 in X odds string, e.g. "1 en 137.500"
 */
export function formatOddsRatio(prob: number): string {
  if (prob <= 0) return 'Imposible (0)';
  if (prob >= 1) return '1 en 1 (Garantizado)';
  const ratio = Math.round(1 / prob);
  return `1 en ${ratio.toLocaleString('es-ES')}`;
}

