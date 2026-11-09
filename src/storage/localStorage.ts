import { ChestTrackerSession, PirateShopPlan, SavedScenario, RewardItem } from '../types';

const STORAGE_KEYS = {
  TRACKER: 'fn_treasure_tracker_v1',
  OBTAINED: 'fn_treasure_obtained_v1',
  CUSTOM_REWARDS: 'fn_treasure_custom_rewards_v1',
  SHOP_PLAN: 'fn_treasure_shop_plan_v1',
  SAVED_SCENARIOS: 'fn_treasure_saved_scenarios_v1',
  SETTINGS: 'fn_treasure_settings_v1',
};

export interface UserSettings {
  lang: 'es' | 'en';
  theme: 'dark' | 'light';
  animationsEnabled: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  lang: 'es',
  theme: 'dark',
  animationsEnabled: true,
};

export function loadTrackerSessions(): ChestTrackerSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRACKER);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading tracker sessions', e);
    return [];
  }
}

export function saveTrackerSessions(sessions: ChestTrackerSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRACKER, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving tracker sessions', e);
  }
}

export function loadObtainedRewards(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OBTAINED);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading obtained rewards', e);
    return [];
  }
}

export function saveObtainedRewards(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OBTAINED, JSON.stringify(ids));
  } catch (e) {
    console.error('Error saving obtained rewards', e);
  }
}

export function loadCustomRewards(): RewardItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_REWARDS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading custom rewards', e);
    return [];
  }
}

export function saveCustomRewards(rewards: RewardItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_REWARDS, JSON.stringify(rewards));
  } catch (e) {
    console.error('Error saving custom rewards', e);
  }
}

export function loadShopPlan(): PirateShopPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOP_PLAN);
    return raw
      ? JSON.parse(raw)
      : {
          activationDate1: '2026-11-15T00:00:00Z',
          activationDate2: '2027-06-01T00:00:00Z',
          wishlist: [
            { id: 'item-1', name: 'Goku (Dragon Ball)', category: 'skin', vbucksPrice: 2000, isEligible: true },
            { id: 'item-2', name: 'Leviathan Axe', category: 'pickaxe', vbucksPrice: 1000, isEligible: true },
            { id: 'item-3', name: 'Master Chief Bundle', category: 'bundle', vbucksPrice: 2600, isEligible: true },
          ],
        };
  } catch (e) {
    console.error('Error loading shop plan', e);
    return { wishlist: [] };
  }
}

export function saveShopPlan(plan: PirateShopPlan): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SHOP_PLAN, JSON.stringify(plan));
  } catch (e) {
    console.error('Error saving shop plan', e);
  }
}

export function loadSavedScenarios(): SavedScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_SCENARIOS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading saved scenarios', e);
    return [];
  }
}

export function saveSavedScenarios(scenarios: SavedScenario[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_SCENARIOS, JSON.stringify(scenarios));
  } catch (e) {
    console.error('Error saving saved scenarios', e);
  }
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

