import React from 'react';
import { ChestTrackerSession } from '../../types';
import { Card } from '../common/Card';
import { TrendingUp, Users, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatProbabilityPercentage } from '../../math/probability';
import { calculateMixedSessionsProbability } from '../../math/probability';

interface QuickStatsOverviewProps {
  sessions: ChestTrackerSession[];
  onQuickAddChests: (amount: number) => void;
  onNavigateToTracker: () => void;
}

export const QuickStatsOverview: React.FC<QuickStatsOverviewProps> = ({
  sessions,
  onQuickAddChests,
  onNavigateToTracker,
}) => {
  const totalChests = sessions.reduce((sum, s) => sum + s.individualChests, 0);
  const totalHours = sessions.reduce((sum, s) => sum + s.durationMinutes, 0) / 60;
  const chestsPerMinute = totalHours > 0 ? (totalChests / (totalHours * 60)).toFixed(2) : '0';

  // Calculate cumulative historical probability across all logged sessions
  const sessionEntries = sessions.map((s) => ({
    chests: s.individualChests,
    p: (1 / 137500) * (s.multiplier || 1.0),
  }));
  const cumulativeHistoricalOdds = calculateMixedSessionsProbability(sessionEntries);

  return (
    <div className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-slate-900/90 border-slate-800">
          <div className="text-xs text-slate-400">Total Cofres Registrados</div>
          <div className="text-2xl font-gaming font-bold text-slate-100 mt-1">
            {totalChests.toLocaleString('es-ES')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">En {sessions.length} partidas</div>
        </Card>

        <Card className="p-4 bg-slate-900/90 border-slate-800">
          <div className="text-xs text-slate-400">Probabilidad Histórica</div>
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
          <div className="text-xs text-slate-400">Registro Rápido</div>
          <div className="flex items-center space-x-1.5 mt-2">
            {[1, 5, 10].map((amt) => (
              <button
                key={amt}
                onClick={() => onQuickAddChests(amt)}
                className="flex-1 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all active:scale-95"
              >
                +{amt}
              </button>
            ))}
          </div>
          <button
            onClick={onNavigateToTracker}
            className="text-[10px] text-right text-slate-400 hover:text-amber-300 underline mt-1"
          >
            Ver Historial Detallado &rarr;
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

