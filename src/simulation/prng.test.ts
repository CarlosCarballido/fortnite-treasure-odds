import { describe, it, expect } from 'vitest';
import { SeededRNG } from './prng';

describe('Seeded PRNG (Mulberry32) Reproducibility', () => {
  it('Produces identical sequence for identical seed', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(42);

    const seq1 = [rng1.next(), rng1.next(), rng1.next(), rng1.next()];
    const seq2 = [rng2.next(), rng2.next(), rng2.next(), rng2.next()];

    expect(seq1).toEqual(seq2);
  });

  it('Produces different sequence for different seed', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(43);

    expect(rng1.next()).not.toEqual(rng2.next());
  });

  it('Outputs numbers strictly in [0, 1)', () => {
    const rng = new SeededRNG(999);
    for (let i = 0; i < 1000; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});

