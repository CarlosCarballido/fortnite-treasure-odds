import { describe, it, expect } from 'vitest';
import { getEffectiveProbabilities, drawSingleChest } from './models';
import { INITIAL_REWARDS } from '../config/rewards';
import { SeededRNG } from '../simulation/prng';

describe('Reward Distribution Models & Non-Repeatable Drops', () => {
  it('Drops obtained non-repeatable rewards without affecting repeatable items (Gizmos)', () => {
    const obtained = new Set(['pirate-shop-access', 'gizmo-pool']);
    const mults = { pirate_shop: 1.0, golden_skin: 1.0, vehicle_decal: 1.0, gizmo: 1.0 };

    const effective = getEffectiveProbabilities(
      INITIAL_REWARDS,
      mults,
      obtained,
      'categorical',
      'drop'
    );

    // Pirate Shop Access should NOT be in active probabilities because it is unique and obtained
    const pirateInPool = effective.find((e) => e.reward.id === 'pirate-shop-access');
    expect(pirateInPool).toBeUndefined();

    // Gizmo pool SHOULD still be in active probabilities because it is repeatable
    const gizmoInPool = effective.find((e) => e.reward.id === 'gizmo-pool');
    expect(gizmoInPool).toBeDefined();
    expect(gizmoInPool?.p).toBeCloseTo(1 / 127, 8);
  });

  it('In Categorical mode, at most 1 prize is awarded per chest', () => {
    const rng = new SeededRNG(12345);
    const active = [
      { reward: INITIAL_REWARDS[0], p: 0.2 },
      { reward: INITIAL_REWARDS[1], p: 0.3 },
    ];

    for (let i = 0; i < 100; i++) {
      const won = drawSingleChest(active, 'categorical', () => rng.next());
      expect(won.length).toBeLessThanOrEqual(1);
    }
  });

  it('In Independent mode, prizes are evaluated independently', () => {
    // Both prizes have 100% probability => both should drop in same chest
    const active = [
      { reward: INITIAL_REWARDS[0], p: 1.0 },
      { reward: INITIAL_REWARDS[1], p: 1.0 },
    ];
    const won = drawSingleChest(active, 'independent', () => 0.5);
    expect(won.length).toBe(2);
  });
});

