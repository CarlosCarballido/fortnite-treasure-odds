import { describe, it, expect } from 'vitest';
import { calculateSquadUniqueChests, evaluateSquadPerformance } from './squad';

describe('Squad Chest Calculations & Overlap', () => {
  it('With 0 overlap factor, unique chests equals total raw chests', () => {
    const playerChests = [100, 100, 100, 100];
    const { rawTotal, uniqueTotal } = calculateSquadUniqueChests(playerChests, 0.0);
    expect(rawTotal).toBe(400);
    expect(uniqueTotal).toBe(400);
  });

  it('With positive overlap factor, accounts for looted redundancy', () => {
    const playerChests = [100, 100, 100, 100];
    const { rawTotal, uniqueTotal } = calculateSquadUniqueChests(playerChests, 0.1);
    expect(rawTotal).toBe(400);
    expect(uniqueTotal).toBeLessThan(400);
    expect(uniqueTotal).toBeGreaterThan(100);
    // Surplus is 300, 10% overlap => -30 chests => 370 unique chests
    expect(uniqueTotal).toBe(370);
  });

  it('Correctly evaluates squad advantage without falsely multiplying single chest odds', () => {
    const res = evaluateSquadPerformance({
      mode: 'squad',
      players: [
        { id: '1', name: 'P1', chestsPerMatch: 10, matchesPlayed: 10, matchDurationMinutes: 15 },
        { id: '2', name: 'P2', chestsPerMatch: 10, matchesPlayed: 10, matchDurationMinutes: 15 },
        { id: '3', name: 'P3', chestsPerMatch: 10, matchesPlayed: 10, matchDurationMinutes: 15 },
        { id: '4', name: 'P4', chestsPerMatch: 10, matchesPlayed: 10, matchDurationMinutes: 15 },
      ],
      chestOverlapFactor: 0.05,
      multiplier: 1.0,
      targetCategory: 'pirate_shop',
    });

    // Single chest probability should still be strictly 1 / 137500
    expect(res.exactStats.p).toBeCloseTo(1 / 137500, 10);
    // Unique chests is around ~385
    expect(res.uniqueChests).toBe(385);
    // Solo advantage ratio should be > 3.5
    expect(res.soloAdvantageRatio).toBeGreaterThan(3.5);
  });
});

