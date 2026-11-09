import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Sparkles } from 'lucide-react';
import {
  calculateChestsForTargetProbability,
  calculateCumulativeProbability,
  formatProbabilityPercentage,
} from '../../math/probability';

export const WhatIfSimulator: React.FC = () => {
  const [hypotheticalDenom, setHypotheticalDenom] = useState<number>(25000);
  const [chestsToTest, setChestsToTest] = useState<number>(5000);

  const baseDenom = 137500;
  const baseP = 1 / baseDenom;
  const hypothetP = 1 / hypotheticalDenom;

  const baseCum = calculateCumulativeProbability(chestsToTest, baseP);
  const hypothetCum = calculateCumulativeProbability(chestsToTest, hypothetP);

  const baseChests50 = calculateChestsForTargetProbability(0.5, baseP);
  const hypothetChests50 = calculateChestsForTargetProbability(0.5, hypothetP);

  return (
    <Card className="p-5 bg-slate-900/90 border-slate-800">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-bold text-slate-100 font-gaming text-base uppercase">
          Modo Especial: "¿Qué pasaría si variasen las probabilidades?"
        </h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Explora hipotéticos balances ajustando la tasa de aparición de la Ficha de la Tienda Pirata.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">
            Denominador Hipotético (1 en X): 1/{hypotheticalDenom.toLocaleString('es-ES')}
          </label>
          <input
            type="range"
            min="1000"
            max="150000"
            step="1000"
            value={hypotheticalDenom}
            onChange={(e) => setHypotheticalDenom(parseInt(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
            <span>1/1.000 (Hipotético alto)</span>
            <span>1/137.500 (Tasa de referencia)</span>
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">
            Cofres de Prueba: {chestsToTest.toLocaleString('es-ES')}
          </label>
          <input
            type="range"
            min="500"
            max="50000"
            step="500"
            value={chestsToTest}
            onChange={(e) => setChestsToTest(parseInt(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-500 block">Tasa de Referencia Actual (1/137.500)</span>
          <div className="text-xl font-gaming font-bold text-slate-300 mt-1">
            {formatProbabilityPercentage(baseCum, 3)} en {chestsToTest.toLocaleString('es-ES')} cofres
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Cofres necesarios para el 50%: {baseChests50.toLocaleString('es-ES')}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 text-xs">
          <span className="text-[11px] text-amber-400 block font-semibold">Tasa Hipotética (1/{hypotheticalDenom.toLocaleString('es-ES')})</span>
          <div className="text-xl font-gaming font-bold text-amber-300 mt-1">
            {formatProbabilityPercentage(hypothetCum, 3)} en {chestsToTest.toLocaleString('es-ES')} cofres
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block font-medium">
            Cofres necesarios para el 50%: {hypothetChests50.toLocaleString('es-ES')} ({Math.round(((baseChests50 - hypothetChests50) / baseChests50) * 100)}% menos)
          </span>
        </div>
      </div>
    </Card>
  );
};
