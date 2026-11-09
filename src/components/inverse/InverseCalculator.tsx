import React, { useState, useMemo } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Target, Clock, Calendar, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Compass } from 'lucide-react';
import {
  calculateChestsForTargetProbability,
  calculateCumulativeProbability,
  formatProbabilityPercentage,
} from '../../math/probability';
import { BASE_DENOMINATORS } from '../../config/constants';

interface InverseCalculatorProps {
  loggedChests: number;
}

export const InverseCalculator: React.FC<InverseCalculatorProps> = ({ loggedChests }) => {
  // Mode 1: Probability Goal => Chests & Hours
  const [targetProb, setTargetProb] = useState<number>(0.5); // 50%
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [dailyPlayHours, setDailyPlayHours] = useState<number>(3.0);
  const [chestsPerHour, setChestsPerHour] = useState<number>(40); // 40 chests/hr in squad or solo

  // Mode 2: Effort (Hours Available) => Probability
  const [availableHours, setAvailableHours] = useState<number>(15);
  const [effortMultiplier, setEffortMultiplier] = useState<number>(1.0);

  const baseP = 1 / BASE_DENOMINATORS.pirate_shop; // 1 / 137500
  const effectiveP = Math.min(1, baseP * multiplier);

  // Goal Mode Calculations
  const requiredChests = useMemo(() => {
    return calculateChestsForTargetProbability(targetProb, effectiveP);
  }, [targetProb, effectiveP]);

  const remainingChests = Math.max(0, requiredChests - loggedChests);
  const requiredTotalHours = requiredChests / Math.max(1, chestsPerHour);
  const remainingHours = remainingChests / Math.max(1, chestsPerHour);
  const daysNeeded = Math.ceil(remainingHours / Math.max(0.5, dailyPlayHours));

  // Feasibility Check (Event ends Dec 6, 2026, ~27 days from Nov 9 reference)
  const daysRemainingInSeason = 27;
  let feasibility: { label: string; color: string; desc: string };
  if (daysNeeded <= 7) {
    feasibility = { label: 'Muy Factible', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40', desc: 'Objetivo alcanzable con dedicación moderada.' };
  } else if (daysNeeded <= daysRemainingInSeason) {
    feasibility = { label: 'Exigente pero Posible', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40', desc: 'Requiere constancia diaria y aprovechar las Horas del Tesoro.' };
  } else {
    feasibility = { label: 'Extremo / Casi Inviable', color: 'text-rose-400 border-rose-500/40 bg-rose-950/40', desc: `Supera los días restantes de la temporada a tu ritmo actual (${dailyPlayHours}h/día).` };
  }

  // Effort Mode Calculations
  const effortChests = Math.round(availableHours * chestsPerHour);
  const effortProbability = useMemo(() => {
    const pEffort = Math.min(1, baseP * effortMultiplier);
    return calculateCumulativeProbability(effortChests, pEffort);
  }, [effortChests, effortMultiplier, baseP]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-gaming font-bold text-slate-100 flex items-center gap-2">
          <Target className="w-6 h-6 text-amber-400" />
          Calculadora Inversa y Objetivos de Probabilidad
        </h2>
        <p className="text-xs text-slate-400">
          Define tu meta de probabilidad deseada y averigua el esfuerzo real necesario, o calcula tus opciones según las horas que tengas libres.
        </p>
      </div>

      {/* TOOL 1: "Quiero un X% de probabilidad" */}
      <Card glow="gold" className="p-6 bg-slate-900/90">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-amber-300">
            1. Meta de Probabilidad: "Quiero un X% de conseguir la Ficha Pirata"
          </h3>
        </div>

        {/* Target Buttons */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Selecciona tu Objetivo de Probabilidad:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { val: 0.2, label: '20%' },
              { val: 0.5, label: '50% (Mediana)' },
              { val: 0.8, label: '80%' },
              { val: 0.9, label: '90%' },
              { val: 0.95, label: '95%' },
              { val: 0.99, label: '99%' },
            ].map((btn) => (
              <button
                key={btn.val}
                onClick={() => setTargetProb(btn.val)}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                  targetProb === btn.val
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-gold-glow'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pacing Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Multiplicador de Aperturas
            </label>
            <select
              value={multiplier}
              onChange={(e) => setMultiplier(parseFloat(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            >
              <option value={1.0}>Normal (×1.0)</option>
              <option value={1.5}>Bono Hora del Tesoro (×1.5)</option>
              <option value={2.0}>Bono Hora del Tesoro (×2.0)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Cofres por Hora (Ritmo de Juego)
            </label>
            <input
              type="number"
              min="5"
              max="200"
              value={chestsPerHour}
              onChange={(e) => setChestsPerHour(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Dedicación Diaria (Horas/Día)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="16"
              value={dailyPlayHours}
              onChange={(e) => setDailyPlayHours(Math.max(0.5, parseFloat(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
            />
          </div>
        </div>

        {/* Goal Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400 block">Cofres Totales Necesarios</span>
            <div className="text-2xl font-gaming font-bold text-amber-400 mt-1">
              {requiredChests.toLocaleString('es-ES')}
            </div>
            <span className="text-[11px] text-slate-500">
              Para {(targetProb * 100).toFixed(0)}% de probabilidad
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400 block">Cofres que te Faltan</span>
            <div className="text-2xl font-gaming font-bold text-slate-100 mt-1">
              {remainingChests.toLocaleString('es-ES')}
            </div>
            <span className="text-[11px] text-emerald-400">
              Descontando tus {loggedChests.toLocaleString('es-ES')} cofres
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400 block">Horas de Juego Necesarias</span>
            <div className="text-2xl font-gaming font-bold text-cyan-300 mt-1">
              {remainingHours.toFixed(1)} h
            </div>
            <span className="text-[11px] text-slate-500">
              A {chestsPerHour} cofres por hora
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400 block">Días Calendario Necesarios</span>
            <div className="text-2xl font-gaming font-bold text-purple-300 mt-1">
              ~{daysNeeded} días
            </div>
            <span className="text-[11px] text-slate-500">
              Jugando {dailyPlayHours} h cada día
            </span>
          </div>
        </div>

        {/* Feasibility Alert */}
        <div className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs ${feasibility.color}`}>
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong>Viabilidad del Objetivo: {feasibility.label}</strong>
            <p className="mt-0.5 leading-relaxed">{feasibility.desc}</p>
          </div>
        </div>
      </Card>

      {/* TOOL 2: "Tengo X horas esta semana. ¿Qué posibilidades tengo?" */}
      <Card className="p-6 bg-slate-900/90 border-slate-800">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-cyan-300">
            2. Calculadora Inversa de Esfuerzo: "Tengo X horas disponibles. ¿Qué posibilidades tengo?"
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Horas Disponibles Esta Semana
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={availableHours}
              onChange={(e) => setAvailableHours(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Multiplicador Previsto
            </label>
            <select
              value={effortMultiplier}
              onChange={(e) => setEffortMultiplier(parseFloat(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
            >
              <option value={1.0}>Normal (×1.0)</option>
              <option value={1.5}>Bono Sesión (×1.5)</option>
              <option value={2.0}>Bono Sesión (×2.0)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Cofres que Podrás Abrir
            </label>
            <div className="text-2xl font-gaming font-bold text-slate-100 mt-1">
              ~{effortChests.toLocaleString('es-ES')} cofres
            </div>
            <span className="text-[11px] text-slate-500">
              A {chestsPerHour} cofres / hora
            </span>
          </div>
        </div>

        {/* Result Callout */}
        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">
              Probabilidad Acumulada Realista en {availableHours} Horas:
            </span>
            <div className="text-3xl font-gaming font-bold text-amber-400 mt-1">
              {formatProbabilityPercentage(effortProbability, 4)}
            </div>
          </div>
          <div className="text-xs text-slate-400 max-w-md">
            <strong>Evaluación honesta:</strong> En {availableHours} horas de juego abrirás aproximadamente{' '}
            {effortChests.toLocaleString('es-ES')} cofres. Tu chance de conseguir la ficha es del{' '}
            {formatProbabilityPercentage(effortProbability, 3)}, y la probabilidad de <strong>no</strong> conseguirla es del{' '}
            {formatProbabilityPercentage(1 - effortProbability, 2)}.
          </div>
        </div>
      </Card>
    </div>
  );
};

