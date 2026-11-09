import React, { useState } from 'react';
import { ChestTrackerSession } from '../../types';
import { Card } from '../common/Card';
import { AlertTriangle, RotateCcw, Plus, Check } from 'lucide-react';
import { formatProbabilityPercentage } from '../../math/probability';
import { calculateMixedSessionsProbability } from '../../math/probability';

interface QuickStatsOverviewProps {
  sessions: ChestTrackerSession[];
  onQuickAddChests: (amount: number) => void;
  onNavigateToTracker: () => void;
  onOpenResetModal: () => void;
}

export const QuickStatsOverview: React.FC<QuickStatsOverviewProps> = ({
  sessions,
  onQuickAddChests,
  onNavigateToTracker,
  onOpenResetModal,
}) => {
  const [customChestAmount, setCustomChestAmount] = useState<number>(25);

  const totalChests = sessions.reduce((sum, s) => sum + s.individualChests, 0);
  const totalHours = sessions.reduce((sum, s) => sum + s.durationMinutes, 0) / 60;
  const chestsPerMinute = totalHours > 0 ? (totalChests / (totalHours * 60)).toFixed(2) : '0';

  // Calculate cumulative probability across all logged sessions
  const sessionEntries = sessions.map((s) => ({
    chests: s.individualChests,
    p: (1 / 137500) * (s.multiplier || 1.0),
  }));
  const cumulativeHistoricalOdds = calculateMixedSessionsProbability(sessionEntries);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customChestAmount > 0) {
      onQuickAddChests(customChestAmount);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-slate-900/90 border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-400">Total Cofres Registrados</div>
            <div className="text-2xl font-gaming font-bold text-slate-100 mt-1">
              {totalChests.toLocaleString('es-ES')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">En {sessions.length} partidas</div>
          </div>
          {totalChests > 0 && (
            <button
              onClick={onOpenResetModal}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 mt-2 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Resetear estadísticas</span>
            </button>
          )}
        </Card>

        <Card className="p-4 bg-slate-900/90 border-slate-800">
          <div className="text-xs text-slate-400">Probabilidad Acumulada</div>
          <div className="text-2xl font-gaming font-bold text-emerald-400 mt-1">
            {formatProbabilityPercentage(cumulativeHistoricalOdds, 4)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">De haber obtenido la ficha</div>
        </Card>

        <Card className="p-4 bg-slate-900/90 border-slate-800">
          <div className="text-xs text-slate-400">Tiempo Invertido</div>
          <div className="text-2xl font-gaming font-bold text-amber-300 mt-1">
            {totalHours.toFixed(1)} h
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ritmo: {chestsPerMinute} cofres/min</div>
        </Card>

        <Card className="p-4 bg-slate-900/90 border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400">Registro Rápido de Cofres</div>

          {/* Quick presets */}
          <div className="flex items-center space-x-1.5 mt-2">
            {[1, 5, 10].map((amt) => (
              <button
                key={amt}
                onClick={() => onQuickAddChests(amt)}
                className="flex-1 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all active:scale-95"
              >
                +{amt}
              </button>
            ))}
          </div>

          {/* Custom exact amount input */}
          <form onSubmit={handleAddCustom} className="flex items-center space-x-1.5 mt-2">
            <input
              type="number"
              min="1"
              max="5000"
              value={customChestAmount}
              onChange={(e) => setCustomChestAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-100 font-gaming font-bold"
            />
            <button
              type="submit"
              className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition-colors"
            >
              + Añadir
            </button>
          </form>

          <button
            onClick={onNavigateToTracker}
            className="text-[10px] text-right text-slate-400 hover:text-amber-300 underline mt-1.5"
          >
            Ver Historial Completo &rarr;
          </button>
        </Card>
      </div>

      {/* Gambler's Fallacy Notice */}
      <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start space-x-3 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 leading-relaxed">
          <span className="font-semibold text-amber-300">Aviso sobre la Falacia del Jugador: </span>
          Haber abierto {totalChests.toLocaleString('es-ES')} cofres con una probabilidad acumulada del{' '}
          {formatProbabilityPercentage(cumulativeHistoricalOdds, 3)} <strong>NO</strong> incrementa la probabilidad del
          próximo cofre. El siguiente cofre sigue teniendo exactamente una probabilidad de 1 en 137.500 (o la tasa con
          bonus aplicable). Los cofres pasados no recuerdan nada.
        </div>
      </div>
    </div>
  );
};
