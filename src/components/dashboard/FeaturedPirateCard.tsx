import React, { useState } from 'react';
import { Key, Sparkles, TrendingUp, HelpCircle, Compass, ShieldAlert, Award } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { OFFICIAL_DENOMINATORS } from '../../config/constants';
import {
  calculateCumulativeProbability,
  calculateChestsForTargetProbability,
  formatProbabilityPercentage,
  formatOddsRatio,
} from '../../math/probability';
import { UserSettings } from '../../storage/localStorage';
import { DICTIONARY } from '../../config/locales';

interface FeaturedPirateCardProps {
  totalLoggedChests: number;
  settings: UserSettings;
  onNavigateToCalculator: () => void;
}

export const FeaturedPirateCard: React.FC<FeaturedPirateCardProps> = ({
  totalLoggedChests,
  settings,
  onNavigateToCalculator,
}) => {
  const dict = DICTIONARY[settings.lang];
  const [multiplier, setMultiplier] = useState<number>(1.0);

  const baseDenom = OFFICIAL_DENOMINATORS.pirate_shop; // 137,500
  const effectiveP = Math.min(1, (1 / baseDenom) * multiplier);

  // Exact math calculations
  const cumulativeOdds = calculateCumulativeProbability(totalLoggedChests, effectiveP);
  const chests50 = calculateChestsForTargetProbability(0.5, effectiveP);
  const chests90 = calculateChestsForTargetProbability(0.9, effectiveP);
  const remainingTo50 = Math.max(0, chests50 - totalLoggedChests);

  return (
    <Card glow="gold" className="p-6 md:p-8 relative overflow-hidden">
      {/* Background Decorative Graphic */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none hidden lg:block">
        <Key className="w-48 h-48 text-amber-300" />
      </div>

      <div className="relative z-10">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 shadow-gold-glow">
              <Key className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Badge variant="rarity" rarity="supreme">Supreme</Badge>
                <Badge variant="source" source="official">Probabilidad Oficial Epic Games</Badge>
              </div>
              <h2 className="text-2xl md:text-3xl font-gaming font-bold text-amber-400 mt-1">
                {dict.pirateCard.title}
              </h2>
            </div>
          </div>

          {/* Multiplier Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Bono:</span>
            {[
              { val: 1.0, label: 'Normal (×1)' },
              { val: 1.5, label: 'Hora ×1.5' },
              { val: 2.0, label: 'Hora ×2' },
            ].map((btn) => (
              <button
                key={btn.val}
                onClick={() => setMultiplier(btn.val)}
                className={`px-2.5 py-1 text-xs rounded font-semibold transition-all ${
                  multiplier === btn.val
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-amber-300'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Central Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Box 1: Probabilidad por cofre */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-amber-500/20">
            <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
              <span>{dict.pirateCard.currentOdds}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-gaming font-bold text-amber-300">
              {formatProbabilityPercentage(effectiveP, 5)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {formatOddsRatio(effectiveP)}
            </div>
          </div>

          {/* Box 2: Cofres Registrados */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
              <span>{dict.pirateCard.chestsOpened}</span>
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-gaming font-bold text-slate-100">
              {totalLoggedChests.toLocaleString('es-ES')}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">
              Acumulado: {formatProbabilityPercentage(cumulativeOdds, 4)}
            </div>
          </div>

          {/* Box 3: Mediana (50% de probabilidad) */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
              <span>{dict.pirateCard.chestsTo50}</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-gaming font-bold text-amber-300">
              {chests50.toLocaleString('es-ES')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {remainingTo50 > 0 ? `Te faltan ~${remainingTo50.toLocaleString('es-ES')} cofres` : '¡Objetivo superado!'}
            </div>
          </div>

          {/* Box 4: Percentil 90% */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
              <span>{dict.pirateCard.chestsTo90}</span>
              <Award className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-gaming font-bold text-purple-300">
              {chests90.toLocaleString('es-ES')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Media esperada: {(137500 / multiplier).toLocaleString('es-ES')}
            </div>
          </div>
        </div>

        {/* Progress Towards 50% Milestone Bar */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium">Progreso hacia el hito del 50% ({chests50.toLocaleString('es-ES')} cofres)</span>
            <span className="text-amber-400 font-bold">
              {Math.min(100, ((totalLoggedChests / chests50) * 100)).toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0.5, (totalLoggedChests / chests50) * 100))}%` }}
            />
          </div>
        </div>

        {/* Actions / Educational disclaimers */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Ningún número finito de cofres garantiza el 100%. Cada cofre es un sorteo independiente.
            </span>
          </p>

          <button
            onClick={onNavigateToCalculator}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4 flex items-center gap-1"
          >
            Abrir Calculadora Interactiva Completa &rarr;
          </button>
        </div>
      </div>
    </Card>
  );
};

