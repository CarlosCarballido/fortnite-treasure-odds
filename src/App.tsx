import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { EventBanner } from './components/dashboard/EventBanner';
import { FeaturedPirateCard } from './components/dashboard/FeaturedPirateCard';
import { QuickStatsOverview } from './components/dashboard/QuickStatsOverview';
import { ExactCalculator } from './components/calculator/ExactCalculator';
import { MonteCarloView } from './components/simulator/MonteCarloView';
import { ChestUnboxerModal } from './components/simulator/ChestUnboxerModal';
import { SquadCalculator } from './components/squad/SquadCalculator';
import { TreasureHourPlanner } from './components/planner/TreasureHourPlanner';
import { InverseCalculator } from './components/inverse/InverseCalculator';
import { ChestTracker } from './components/tracker/ChestTracker';
import { RewardCollection } from './components/collection/RewardCollection';
import { PirateShopPlanner } from './components/pirateShop/PirateShopPlanner';
import { SourcesView } from './components/sources/SourcesView';
import { BackupModal } from './components/common/BackupModal';
import { WhatIfSimulator } from './components/extras/WhatIfSimulator';
import { SurvivalCalculator } from './components/extras/SurvivalCalculator';

import { RewardItem, ChestTrackerSession, PirateShopPlan } from './types';
import { INITIAL_REWARDS } from './config/rewards';
import {
  loadTrackerSessions,
  saveTrackerSessions,
  loadObtainedRewards,
  saveObtainedRewards,
  loadCustomRewards,
  saveCustomRewards,
  loadShopPlan,
  saveShopPlan,
  loadSettings,
  saveSettings,
  UserSettings,
} from './storage/localStorage';
import { DICTIONARY } from './config/locales';

export const App: React.FC = () => {
  // Settings & Theme
  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data States
  const [rewards, setRewards] = useState<RewardItem[]>(() => {
    const custom = loadCustomRewards();
    if (custom.length > 0) {
      const customMap = new Map(custom.map((c) => [c.id, c]));
      return INITIAL_REWARDS.map((r) => customMap.get(r.id) || r);
    }
    return INITIAL_REWARDS;
  });

  const [obtainedIds, setObtainedIds] = useState<string[]>(loadObtainedRewards);
  const [sessions, setSessions] = useState<ChestTrackerSession[]>(loadTrackerSessions);
  const [shopPlan, setShopPlan] = useState<PirateShopPlan>(loadShopPlan);

  // Modals
  const [isChestGameOpen, setIsChestGameOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Sync settings theme to document HTML class
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveSettings(settings);
  }, [settings]);

  // Read URL query parameters on initial mount for shareable scenario links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['dashboard', 'calculator', 'simulator', 'squad', 'planner', 'inverse', 'tracker', 'collection', 'pirateShop', 'sources'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  // Update URL on tab change without full reload
  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

  // State handlers
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleToggleObtained = (rewardId: string) => {
    setObtainedIds((prev) => {
      const next = prev.includes(rewardId)
        ? prev.filter((id) => id !== rewardId)
        : [...prev, rewardId];
      saveObtainedRewards(next);
      return next;
    });
  };

  const handleUpdateReward = (updated: RewardItem) => {
    setRewards((prev) => {
      const next = prev.map((r) => (r.id === updated.id ? updated : r));
      saveCustomRewards(next);
      return next;
    });
  };

  const handleAddSession = (newSession: ChestTrackerSession) => {
    setSessions((prev) => {
      const next = [newSession, ...prev];
      saveTrackerSessions(next);
      return next;
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);
      saveTrackerSessions(next);
      return next;
    });
  };

  const handleUndoLastSession = () => {
    setSessions((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice(1);
      saveTrackerSessions(next);
      return next;
    });
  };

  const handleQuickAddChests = (amount: number) => {
    const newSession: ChestTrackerSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      gameMode: 'solo',
      playersCount: 1,
      individualChests: amount,
      groupUniqueChests: amount,
      multiplier: 1.0,
      durationMinutes: Math.round(amount * 1.5),
      rewardsWon: [],
      notes: `Añadido rápido +${amount} cofres`,
    };
    handleAddSession(newSession);
  };

  const handleReloadAllData = () => {
    setSessions(loadTrackerSessions());
    setObtainedIds(loadObtainedRewards());
    setShopPlan(loadShopPlan());
    const custom = loadCustomRewards();
    if (custom.length > 0) {
      const customMap = new Map(custom.map((c) => [c.id, c]));
      setRewards(INITIAL_REWARDS.map((r) => customMap.get(r.id) || r));
    } else {
      setRewards(INITIAL_REWARDS);
    }
  };

  const totalLoggedChests = sessions.reduce((sum, s) => sum + s.individualChests, 0);

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-[#070c18] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Top Navigation */}
      <Navbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenChestGame={() => setIsChestGameOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Week & Reference Date Banner */}
        <EventBanner />

        {/* Dynamic Tab Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <FeaturedPirateCard
              totalLoggedChests={totalLoggedChests}
              settings={settings}
              onNavigateToCalculator={() => handleSelectTab('calculator')}
            />
            <QuickStatsOverview
              sessions={sessions}
              onQuickAddChests={handleQuickAddChests}
              onNavigateToTracker={() => handleSelectTab('tracker')}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WhatIfSimulator />
              <SurvivalCalculator loggedChests={totalLoggedChests} />
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <ExactCalculator
            rewards={rewards}
            settings={settings}
            loggedChests={totalLoggedChests}
          />
        )}

        {activeTab === 'simulator' && (
          <MonteCarloView rewards={rewards} />
        )}

        {activeTab === 'squad' && (
          <SquadCalculator />
        )}

        {activeTab === 'planner' && (
          <TreasureHourPlanner />
        )}

        {activeTab === 'inverse' && (
          <InverseCalculator loggedChests={totalLoggedChests} />
        )}

        {activeTab === 'tracker' && (
          <ChestTracker
            sessions={sessions}
            onAddSession={handleAddSession}
            onDeleteSession={handleDeleteSession}
            onUndoLastSession={handleUndoLastSession}
            rewards={rewards}
          />
        )}

        {activeTab === 'collection' && (
          <RewardCollection
            rewards={rewards}
            obtainedIds={obtainedIds}
            onToggleObtained={handleToggleObtained}
            onUpdateReward={handleUpdateReward}
          />
        )}

        {activeTab === 'pirateShop' && (
          <PirateShopPlanner
            plan={shopPlan}
            onUpdatePlan={(updated) => {
              setShopPlan(updated);
              saveShopPlan(updated);
            }}
          />
        )}

        {activeTab === 'sources' && (
          <SourcesView />
        )}
      </main>

      {/* Interactive Unboxing Minigame Modal */}
      <ChestUnboxerModal
        isOpen={isChestGameOpen}
        onClose={() => setIsChestGameOpen(false)}
        rewards={rewards}
        onRewardWon={(rId) => {
          if (!obtainedIds.includes(rId)) {
            handleToggleObtained(rId);
          }
        }}
      />

      {/* Data Backup & Export/Import Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={handleReloadAllData}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 py-8 bg-[#050811] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <span className="font-gaming text-sm font-bold text-slate-300">
              FORTNITE TREASURE ODDS &middot; SIMULADOR DEFINITIVO
            </span>
            <p>
              Desarrollado con React, TypeScript, Tailwind CSS, Recharts y Web Workers. Precisión estocástica garantizada.
            </p>
          </div>
          <div className="text-center md:text-right space-y-1">
            <p className="text-slate-400">
              Datos oficiales de Epic Games del 7 de noviembre de 2026.
            </p>
            <p className="text-[11px] text-slate-600">
              Proyecto de código abierto independiente. No afiliado a Epic Games.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

