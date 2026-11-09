import { RewardItem, DistributionModel, DuplicateHandling } from '../types';

export interface ModelEvaluationResult {
  obtainedRewards: RewardItem[];
  chestIndex: number;
}

/**
 * Normalizes probabilities when using the Categorical model or when redistributing after drops.
 */
export function getEffectiveProbabilities(
  rewards: RewardItem[],
  multipliers: Record<string, number>,
  obtainedIds: Set<string>,
  model: DistributionModel,
  duplicateHandling: DuplicateHandling
): { reward: RewardItem; p: number }[] {
  // Filter rewards: non-repeatable rewards already obtained
  const activeRewards = rewards.map((r) => {
    const isObtained = obtainedIds.has(r.id);
    const mult = multipliers[r.category] ?? 1.0;
    const baseP = 1 / r.baseDenominator;
    const pWithMult = Math.min(1, baseP * mult);

    if (isObtained && !r.isRepeatable) {
      return { reward: r, p: 0, isRemoved: true };
    }
    return { reward: r, p: pWithMult, isRemoved: false };
  });

  if (duplicateHandling === 'redistribute' && model === 'categorical') {
    // Redistribute sum of removed non-repeatable items to remaining active items
    const originalSum = rewards.reduce((sum, r) => {
      const mult = multipliers[r.category] ?? 1.0;
      return sum + Math.min(1, (1 / r.baseDenominator) * mult);
    }, 0);

    const activeSum = activeRewards
      .filter((ar) => !ar.isRemoved)
      .reduce((sum, ar) => sum + ar.p, 0);

    if (originalSum > 0 && activeSum > 0 && activeSum < originalSum) {
      const factor = originalSum / activeSum;
      return activeRewards
        .filter((ar) => !ar.isRemoved)
        .map((ar) => ({ reward: ar.reward, p: Math.min(1, ar.p * factor) }));
    }
  }

  return activeRewards
    .filter((ar) => !ar.isRemoved)
    .map((ar) => ({ reward: ar.reward, p: ar.p }));
}

/**
 * Simulates a single chest draw under either the Categorical or Independent model.
 */
export function drawSingleChest(
  activeProbabilities: { reward: RewardItem; p: number }[],
  model: DistributionModel,
  rngNext: () => number
): RewardItem[] {
  const won: RewardItem[] = [];

  if (model === 'categorical') {
    // At most 1 reward per chest. Sum of probabilities must be <= 1.
    const rand = rngNext();
    let cumulative = 0;
    for (const item of activeProbabilities) {
      cumulative += item.p;
      if (rand < cumulative) {
        won.push(item.reward);
        break;
      }
    }
  } else {
    // Independent Bernoulli trials for each active prize
    for (const item of activeProbabilities) {
      if (rngNext() < item.p) {
        won.push(item.reward);
      }
    }
  }

  return won;
}

