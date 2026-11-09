export type RewardCategory =
  | 'pirate_shop'
  | 'golden_skin'
  | 'vehicle_decal'
  | 'pickaxe_backpack'
  | 'jam_track'
  | 'loading_screen'
  | 'gizmo';

export type RarityTier = 'supreme' | 'major' | 'standard';

export type DataSourceType = 'public_data' | 'third_party' | 'hypothesis' | 'user_custom';

export interface RewardItem {
  id: string;
  name: string;
  nameEn: string;
  category: RewardCategory;
  baseDenominator: number;
  week: number; // 0 for permanent season-long rewards, 1..5 for weekly rewards
  rarity: RarityTier;
  isRepeatable: boolean; // only gizmos are repeatable
  description: string;
  descriptionEn: string;
  source: DataSourceType;
  iconName?: string;
  isCustom?: boolean;
}

export interface GizmoDetail {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
}

export interface SessionConfig {
  sessionName: string;
  multiplierPirate: number;
  multiplierSkin: number;
  multiplierVehicle: number;
  multiplierDefault: number;
  source: DataSourceType;
  notes?: string;
}

export interface SquadPlayerConfig {
  id: string;
  name: string;
  chestsPerMatch: number;
  matchesPlayed: number;
  matchDurationMinutes: number;
}

export interface SquadSimulationInput {
  mode: 'solo' | 'duo' | 'trio' | 'squad';
  players: SquadPlayerConfig[];
  chestOverlapFactor: number; // 0.0 = completely independent chests (no overlap), 0.3 = 30% overlap
  multiplier: number;
  targetCategory: RewardCategory;
}

export interface PercentileData {
  percentile: number; // 10, 25, 50, 75, 90, 95, 99
  chests: number;
}

export interface ExactCalculationOutput {
  p: number; // base or boosted single chest probability
  multiplier: number;
  chests: number;
  cumulativeProbability: number; // P(at least 1)
  failureProbability: number; // P(0)
  expectedChests: number; // E = 1/p
  medianChests: number; // 50% percentile
  percentiles: PercentileData[];
  targetProbChests: { [goal: string]: number }; // e.g. "20%": n, "50%": n, etc.
  estimatedTimeMinutes: number;
}

export type DistributionModel = 'categorical' | 'independent';
export type DuplicateHandling = 'drop' | 'redistribute';

export interface MonteCarloConfig {
  totalChests: number;
  simulationsCount: number; // e.g. 1000, 10000, 50000
  targetRewards: string[]; // reward ids
  multipliers: Record<RewardCategory, number>;
  distributionModel: DistributionModel;
  duplicateHandling: DuplicateHandling;
  week: number;
  seed?: number;
  useGeometricOptimization: boolean;
}

export interface MonteCarloProgress {
  currentTrial: number;
  totalTrials: number;
  percent: number;
  successesCount: number;
  status: 'idle' | 'running' | 'paused' | 'done' | 'cancelled';
}

export interface MonteCarloResult {
  totalTrials: number;
  chestsPerTrial: number;
  successCount: number;
  empiricalProbability: number;
  confidenceInterval95: [number, number]; // [lower, upper]
  chestsToFirstSuccessDistribution: { chests: number; count: number }[];
  firstSuccessStats: {
    min: number;
    max: number;
    median: number;
    mean: number;
    neverFoundCount: number;
  };
  theoreticalProbability: number;
  differencePercentPoints: number;
  completedAt: string;
}

export interface ChestTrackerSession {
  id: string;
  date: string; // ISO
  gameMode: 'solo' | 'duo' | 'trio' | 'squad';
  playersCount: number;
  individualChests: number;
  groupUniqueChests: number;
  multiplier: number;
  durationMinutes: number;
  rewardsWon: string[]; // reward IDs
  notes?: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  category: 'skin' | 'pickaxe' | 'emote' | 'wrap' | 'bundle' | 'other';
  vbucksPrice: number;
  isEligible: boolean;
  notes?: string;
}

export interface PirateShopPlan {
  activationDate1?: string; // ISO date string for 2026 window
  activationDate2?: string; // ISO date string for 2027 window
  wishlist: WishlistItem[];
}

export interface SavedScenario {
  id: string;
  name: string;
  createdAt: string;
  chests: number;
  multiplier: number;
  category: RewardCategory;
  squadMode: 'solo' | 'duo' | 'trio' | 'squad';
  playersCount: number;
}
