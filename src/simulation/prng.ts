/**
 * Mulberry32 is a simple, fast 32-bit PRNG with high statistical quality
 * that allows full reproducibility given a seed.
 */
export class SeededRNG {
  private state: number;

  constructor(seed?: number) {
    this.state = (seed !== undefined ? seed : Math.floor(Math.random() * 0xffffffff)) >>> 0;
  }

  /**
   * Returns a pseudo-random floating point number in [0, 1)
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns current seed/state
   */
  public getState(): number {
    return this.state;
  }

  /**
   * Resets with a new seed
   */
  public reseed(seed: number): void {
    this.state = seed >>> 0;
  }
}

