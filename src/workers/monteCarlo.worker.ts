import { MonteCarloConfig, MonteCarloResult, RewardItem } from '../types';
import { SeededRNG } from '../simulation/prng';
import { calculateWilsonConfidenceInterval, calculateCumulativeProbability } from '../math/probability';
import { INITIAL_REWARDS } from '../config/rewards';
import { getEffectiveProbabilities, drawSingleChest } from '../math/models';

let isCancelled = false;

self.onmessage = (e: MessageEvent) => {
  const data = e.data;

  if (data.type === 'CANCEL') {
    isCancelled = true;
    return;
  }

  if (data.type === 'START') {
    isCancelled = false;
    runSimulation(data.config);
  }
};

function runSimulation(config: MonteCarloConfig) {
  const {
    totalChests,
    simulationsCount,
    targetRewards,
    multipliers,
    distributionModel,
    duplicateHandling,
    seed,
    useGeometricOptimization,
  } = config;

  const rng = new SeededRNG(seed);
  const targetId = targetRewards[0] || 'pirate-shop-access';

  // Find target reward item
  const targetItem = INITIAL_REWARDS.find((r) => r.id === targetId) || INITIAL_REWARDS[0];
  const targetCategory = targetItem.category;
  const mult = multipliers[targetCategory] ?? 1.0;
  const pSingle = Math.min(1, (1 / targetItem.baseDenominator) * mult);

  let successCount = 0;
  const firstSuccessChests: number[] = [];
  const chestDistributionBuckets = new Map<number, number>();

  const BATCH_SIZE = Math.max(100, Math.floor(simulationsCount / 50));
  const startTime = Date.now();

  // Optimized Geometric Sampling Mode
  if (useGeometricOptimization) {
    const log1MinusP = Math.log1p(-pSingle);

    for (let trial = 1; trial <= simulationsCount; trial++) {
      if (isCancelled) {
        self.postMessage({ type: 'CANCELLED' });
        return;
      }

      const u = rng.next();
      // Avoid log(0)
      const safeU = Math.min(0.9999999999999999, Math.max(1e-15, u));
      // K is number of chests until success: ceil( ln(1 - u) / ln(1 - p) )
      const k = pSingle >= 1 ? 1 : Math.ceil(Math.log(1 - safeU) / log1MinusP);

      if (k <= totalChests) {
        successCount++;
        firstSuccessChests.push(k);

        // Group into distribution bucket
        const bucket = Math.floor(k / Math.max(1, Math.floor(totalChests / 20))) * Math.max(1, Math.floor(totalChests / 20));
        chestDistributionBuckets.set(bucket, (chestDistributionBuckets.get(bucket) || 0) + 1);
      }

      if (trial % BATCH_SIZE === 0 || trial === simulationsCount) {
        self.postMessage({
          type: 'PROGRESS',
          progress: {
            currentTrial: trial,
            totalTrials: simulationsCount,
            percent: Math.round((trial / simulationsCount) * 100),
            successesCount: successCount,
            status: 'running',
          },
        });
      }
    }
  } else {
    // Step-by-Step Chest Simulation (tracks multiple prizes & duplicate handling)
    for (let trial = 1; trial <= simulationsCount; trial++) {
      if (isCancelled) {
        self.postMessage({ type: 'CANCELLED' });
        return;
      }

      const obtainedInTrial = new Set<string>();
      let foundTargetAtChest = -1;

      for (let chest = 1; chest <= totalChests; chest++) {
        const activeProbs = getEffectiveProbabilities(
          INITIAL_REWARDS,
          multipliers,
          obtainedInTrial,
          distributionModel,
          duplicateHandling
        );

        const won = drawSingleChest(activeProbs, distributionModel, () => rng.next());
        for (const item of won) {
          obtainedInTrial.add(item.id);
          if (item.id === targetId && foundTargetAtChest === -1) {
            foundTargetAtChest = chest;
          }
        }

        if (foundTargetAtChest !== -1) {
          // If we found the target reward, record first success index and proceed to next trial
          break;
        }
      }

      if (foundTargetAtChest !== -1) {
        successCount++;
        firstSuccessChests.push(foundTargetAtChest);

        const bucket = Math.floor(foundTargetAtChest / Math.max(1, Math.floor(totalChests / 20))) * Math.max(1, Math.floor(totalChests / 20));
        chestDistributionBuckets.set(bucket, (chestDistributionBuckets.get(bucket) || 0) + 1);
      }

      if (trial % BATCH_SIZE === 0 || trial === simulationsCount) {
        self.postMessage({
          type: 'PROGRESS',
          progress: {
            currentTrial: trial,
            totalTrials: simulationsCount,
            percent: Math.round((trial / simulationsCount) * 100),
            successesCount: successCount,
            status: 'running',
          },
        });
      }
    }
  }

  // Calculate statistics
  const empiricalProb = successCount / simulationsCount;
  const ci95 = calculateWilsonConfidenceInterval(successCount, simulationsCount, 0.95);
  const theoreticalProb = calculateCumulativeProbability(totalChests, pSingle);
  const diffPercentPoints = (empiricalProb - theoreticalProb) * 100;

  firstSuccessChests.sort((a, b) => a - b);
  const minChests = firstSuccessChests.length > 0 ? firstSuccessChests[0] : 0;
  const maxChests = firstSuccessChests.length > 0 ? firstSuccessChests[firstSuccessChests.length - 1] : 0;
  const medianChests =
    firstSuccessChests.length > 0 ? firstSuccessChests[Math.floor(firstSuccessChests.length / 2)] : 0;
  const meanChests =
    firstSuccessChests.length > 0
      ? Math.round(firstSuccessChests.reduce((a, b) => a + b, 0) / firstSuccessChests.length)
      : 0;

  const distributionArray = Array.from(chestDistributionBuckets.entries())
    .map(([chests, count]) => ({ chests, count }))
    .sort((a, b) => a.chests - b.chests);

  const result: MonteCarloResult = {
    totalTrials: simulationsCount,
    chestsPerTrial: totalChests,
    successCount,
    empiricalProbability: empiricalProb,
    confidenceInterval95: ci95,
    chestsToFirstSuccessDistribution: distributionArray,
    firstSuccessStats: {
      min: minChests,
      max: maxChests,
      median: medianChests,
      mean: meanChests,
      neverFoundCount: simulationsCount - successCount,
    },
    theoreticalProbability: theoreticalProb,
    differencePercentPoints: diffPercentPoints,
    completedAt: new Date().toISOString(),
  };

  self.postMessage({
    type: 'COMPLETE',
    result,
    elapsedMs: Date.now() - startTime,
  });
}

