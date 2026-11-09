import React, { useState } from 'react';
import { Card } from '../common/Card';
import { ShieldAlert, TrendingDown } from 'lucide-react';
import { calculateFailureProbability, formatProbabilityPercentage } from '../../math/probability';
import { OFFICIAL_DENOMINATORS } from '../../config/constants';

export const SurvivalCalculator: React.FC<{ loggedChests: number }> = ({ loggedChests }) => {
  const [plannedSeasonChests, setPlannedSeasonChests] = useState<number>(20000);
  const [bonusPercentage, setBonusPercentage] = useState<number>(20); // 20% of chests during bonus hours

  const baseP = 1 / OFFICIAL_DENOMINATORS.pirate_shop;
  const normalChests = Math.round(plannedSeasonChests * (1 - bonusPercentage / 100));
  const bonusChests = Math.round(plannedSeasonChests * (bonusPercentage / 100));

  // Combined failure probability
  const failNormal = calculateFailureProbability(normalChests, baseP);
  const failBonus = calculateFailureProbability(bonusChests, baseP * 2.0); // assume x2 in bonus hours
  const totalFailureP = failNormal * failBonus;
  const successP = 1 - totalFailureP;

  return (
    <Card className="p-5 bg-slate-900/90 border-slate-800">
      <div className="flex items-center space-x-2 mb-3">
        <ShieldAlert className="w-5 h-5 text-rose-400" />
        <h3 className="text-sm font-bold text-slate-100 font-gaming text-base uppercase">
          Calculadora de Supervivencia: Riesgo de Terminar la Temporada sin la Ficha
        </h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Calcula la probabilidad matemática de finalizar todo el evento Cazatesoros sin haber encontrado la ficha pirata.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">
            Total de Cofres Estimados en toda la Temporada: {plannedSeasonChests.toLocaleString('es-ES')}
          </label>
          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={plannedSeasonChests}
            onChange={(e) => setPlannedSeasonChests(parseInt(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">
            % de Cofres Abiertos Durante Horas del Tesoro (×2): {bonusPercentage}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={bonusPercentage}
            onChange={(e) => setBonusPercentage(parseInt(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 text-xs">
          <span className="text-rose-400 font-semibold block">Probabilidad de Terminar SIN la Ficha (Fracaso)</span>
          <div className="text-2xl font-gaming font-bold text-rose-300 mt-1">
            {formatProbabilityPercentage(totalFailureP, 3)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Riesgo real de no conseguirla tras abrir {plannedSeasonChests.toLocaleString('es-ES')} cofres
          </span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-xs">
          <span className="text-emerald-400 font-semibold block">Probabilidad de Éxito al Menos 1 Vez</span>
          <div className="text-2xl font-gaming font-bold text-emerald-300 mt-1">
            {formatProbabilityPercentage(successP, 3)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            De conseguir Pirate Shop Access antes del 6 de diciembre de 2026
          </span>
        </div>
      </div>
    </Card>
  );
};

