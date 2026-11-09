import { ChestTrackerSession } from '../types';
import {
  loadTrackerSessions,
  saveTrackerSessions,
  loadObtainedRewards,
  saveObtainedRewards,
  loadCustomRewards,
  saveCustomRewards,
  loadShopPlan,
  saveShopPlan,
  loadSavedScenarios,
  saveSavedScenarios,
} from './localStorage';

export interface FullBackupData {
  version: 1;
  exportDate: string;
  trackerSessions: ChestTrackerSession[];
  obtainedRewards: string[];
  customRewards: any[];
  shopPlan: any;
  savedScenarios: any[];
}

export function exportAllDataAsJSON(): void {
  const data: FullBackupData = {
    version: 1,
    exportDate: new Date().toISOString(),
    trackerSessions: loadTrackerSessions(),
    obtainedRewards: loadObtainedRewards(),
    customRewards: loadCustomRewards(),
    shopPlan: loadShopPlan(),
    savedScenarios: loadSavedScenarios(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fortnite-treasure-odds-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAllDataFromJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as FullBackupData;
    if (data.trackerSessions) saveTrackerSessions(data.trackerSessions);
    if (data.obtainedRewards) saveObtainedRewards(data.obtainedRewards);
    if (data.customRewards) saveCustomRewards(data.customRewards);
    if (data.shopPlan) saveShopPlan(data.shopPlan);
    if (data.savedScenarios) saveSavedScenarios(data.savedScenarios);
    return true;
  } catch (e) {
    console.error('Error importing JSON data', e);
    return false;
  }
}

export function exportTrackerAsCSV(): void {
  const sessions = loadTrackerSessions();
  const headers = [
    'ID',
    'Fecha',
    'Modo',
    'Jugadores',
    'Cofres Individuales',
    'Cofres Grupales Unicos',
    'Multiplicador',
    'Duracion (minutos)',
    'Premios Obtenidos',
    'Notas',
  ];

  const rows = sessions.map((s) => [
    s.id,
    s.date,
    s.gameMode,
    s.playersCount,
    s.individualChests,
    s.groupUniqueChests,
    s.multiplier,
    s.durationMinutes,
    `"${(s.rewardsWon || []).join(';')}"`,
    `"${(s.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cazatesoros-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

