import { describe, it, expect } from 'vitest';
import {
  calculateCumulativeProbability,
  calculateFailureProbability,
  calculateChestsForTargetProbability,
  calculateExpectedChests,
  calculateMixedSessionsProbability,
  calculateWilsonConfidenceInterval,
} from './probability';

describe('Mandatory Mathematical Tests - Pirate Shop Access (p = 1 / 137500)', () => {
  const pBase = 1 / 137500;

  it('Calculates exact probability for 1 chest', () => {
    const prob = calculateCumulativeProbability(1, pBase);
    expect(prob).toBeCloseTo(1 / 137500, 10);
  });

  it('Calculates 1,000 chests: approximately 0.7246%', () => {
    const prob = calculateCumulativeProbability(1000, pBase);
    const pct = prob * 100;
    expect(pct).toBeCloseTo(0.7246, 3);
  });

  it('Calculates 10,000 chests: approximately 7.0146%', () => {
    const prob = calculateCumulativeProbability(10000, pBase);
    const pct = prob * 100;
    expect(pct).toBeCloseTo(7.0146, 3);
  });

  it('Calculates 100,000 chests: approximately 51.6776%', () => {
    const prob = calculateCumulativeProbability(100000, pBase);
    const pct = prob * 100;
    expect(pct).toBeCloseTo(51.6776, 3);
  });

  it('Calculates required chests for 50% target: exactly 95,308', () => {
    const n50 = calculateChestsForTargetProbability(0.5, pBase);
    expect(n50).toBe(95308);
  });

  it('Calculates required chests for 90% target: exactly 316,605', () => {
    const n90 = calculateChestsForTargetProbability(0.9, pBase);
    expect(n90).toBe(316605);
  });

  it('Calculates expected value to first success: 137,500', () => {
    const expected = calculateExpectedChests(pBase);
    expect(expected).toBe(137500);
  });

  it('Calculates with x2 bonus (p = 1 / 68750): 50% reached after 47,654 chests', () => {
    const pBoosted = (1 / 137500) * 2;
    expect(pBoosted).toBeCloseTo(1 / 68750, 12);

    const n50Boosted = calculateChestsForTargetProbability(0.5, pBoosted);
    expect(n50Boosted).toBe(47654);
  });
});

describe('Edge Cases and Safety Limits', () => {
  const p = 1 / 137500;

  it('Handles zero chests: probability is 0', () => {
    expect(calculateCumulativeProbability(0, p)).toBe(0);
    expect(calculateFailureProbability(0, p)).toBe(1);
  });

  it('Handles negative chests: probability is 0', () => {
    expect(calculateCumulativeProbability(-10, p)).toBe(0);
  });

  it('Handles p = 0: cumulative prob is 0, target chests is Infinity', () => {
    expect(calculateCumulativeProbability(1000, 0)).toBe(0);
    expect(calculateChestsForTargetProbability(0.5, 0)).toBe(Infinity);
  });

  it('Handles p = 1: 1 chest gives 100%', () => {
    expect(calculateCumulativeProbability(1, 1)).toBe(1);
    expect(calculateFailureProbability(1, 1)).toBe(0);
  });

  it('Never guarantees 100% (q = 1) for 0 < p < 1: returns Infinity', () => {
    expect(calculateChestsForTargetProbability(1, p)).toBe(Infinity);
    expect(calculateChestsForTargetProbability(1.05, p)).toBe(Infinity);
  });

  it('Handles q = 0: returns 0 chests', () => {
    expect(calculateChestsForTargetProbability(0, p)).toBe(0);
  });

  it('Handles extreme number of chests without overflow/NaN', () => {
    const extreme = calculateCumulativeProbability(1000000000, p);
    expect(extreme).toBe(1);
    const failureExtreme = calculateFailureProbability(1000000000, p);
    expect(failureExtreme).toBe(0);
  });
});

describe('Mixed Sessions Probability Calculation', () => {
  it('Correctly accumulates independent sessions with different rates', () => {
    const p1 = 1 / 137500; // Normal rate
    const p2 = 2 / 137500; // x2 rate

    const mixedProb = calculateMixedSessionsProbability([
      { chests: 1000, p: p1 },
      { chests: 1000, p: p2 },
    ]);

    // Theoretical: 1 - (1-p1)^1000 * (1-p2)^1000
    const fail1 = Math.pow(1 - p1, 1000);
    const fail2 = Math.pow(1 - p2, 1000);
    const expected = 1 - fail1 * fail2;

    expect(mixedProb).toBeCloseTo(expected, 8);
  });

  it('Handles empty or zero sessions safely', () => {
    expect(calculateMixedSessionsProbability([])).toBe(0);
    expect(calculateMixedSessionsProbability([{ chests: 0, p: 0.1 }])).toBe(0);
  });
});

describe('Statistical Confidence Interval (Wilson Score)', () => {
  it('Produces valid 95% interval with 0 successes', () => {
    const [lower, upper] = calculateWilsonConfidenceInterval(0, 10000);
    expect(lower).toBe(0);
    expect(upper).toBeGreaterThan(0);
    expect(upper).toBeLessThan(0.001);
  });

  it('Captures empirical frequency within reasonable bounds', () => {
    const [lower, upper] = calculateWilsonConfidenceInterval(50, 1000);
    expect(lower).toBeLessThan(0.05);
    expect(upper).toBeGreaterThan(0.05);
  });
});

