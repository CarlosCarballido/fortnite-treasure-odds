import React, { useState, useMemo } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Calendar, Clock, Sparkles, TrendingUp, HelpCircle, History, Plus, AlertCircle } from 'lucide-react';
import { calculateCumulativeProbability, calculateMixedSessionsProbability, formatProbabilityPercentage } from '../../math/probability';
import { OFFICIAL_DENOMINATORS, HISTORIC_SESSIONS } from '../../config/constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const TreasureHourPlanner: React.FC = () => {
  // Scenario inputs
  const [normalHours, setNormalHours] = useState<number>(2);
  const [bonusHours, setBonusHours] = useState<number>(4);
  const [bonusMultiplier, setBonusMultiplier] = useState<number>(2.0);

  // Match pace parameters
  const [matchMinutes, setMatchMinutes] = useState<number>(18);
  const [lobbyMinutes, setLobbyMinutes] = useState<number>(2);
  const [chestsPerMatch, setChestsPerMatch] = useState<number>(12);
  const [squadSize, setSquadSize] = useState<number>(4);
  const [squadOverlap, setSquadOverlap] = useState<number>(0.1);

  const baseP = 1 / OFFICIAL_DENOMINATORS.pirate_shop; // 1 / 137500

  // Calculate pacing
  const cycleTimeMinutes = matchMinutes + lobbyMinutes;
  const matchesPerHour = 60 / cycleTimeMinutes;

  // Unique chests per match for the squad
  const rawChestsPerMatch = chestsPerMatch * squadSize;
  const uniqueChestsPerMatch = Math.round(
    rawChestsPerMatch - (rawChestsPerMatch - chestsPerMatch) * squadOverlap
  );
  const uniqueChestsPerHour = Math.round(matchesPerHour * uniqueChestsPerMatch);

  // Normal chests & bonus chests
  const normalChests = Math.round(normalHours * uniqueChestsPerHour);
  const bonusChests = Math.round(bonusHours * uniqueChestsPerHour);
  const totalChests = normalChests + bonusChests;

  // Probabilities
  const pMixed = useMemo(() => {
    return calculateMixedSessionsProbability([
      { chests: normalChests, p: baseP },
      { chests: bonusChests, p: baseP * bonusMultiplier },
    ]);
  }, [normalChests, bonusChests, bonusMultiplier, baseP]);

  // Comparison: What if all hours were normal?
  const pAllNormal = useMemo(() => {
    return calculateCumulativeProbability(totalChests, baseP);
  }, [totalChests, baseP]);

  // Absolute difference in percentage points
  const diffPercentPoints = (pMixed - pAllNormal) * 100;
  const relativeIncrease = pAllNormal > 0 ? ((pMixed - pAllNormal) / pAllNormal) * 100 : 0;

  // Chart data
  const comparisonData = [
    {
      escenario: 'Todo Normal (×1)',
      probabilidad: Number((pAllNormal * 100).toFixed(4)),
      cofres: totalChests,
    },
    {
      escenario: `Mixto (${normalHours}h norm + ${bonusHours}h ×${bonusMultiplier})`,
      probabilidad: Number((pMixed * 100).toFixed(4)),
      cofres: totalChests,
    },
    {
      escenario: `Todo Bonus (${normalHours + bonusHours}h ×${bonusMultiplier})`,
      probabilidad: Number(
        (calculateCumulativeProbability(totalChests, baseP * bonusMultiplier) * 100).toFixed(4)
      ),
      cofres: totalChests,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-gaming font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-amber-400" />
          Planificador de Horas del Tesoro y Sesiones
        </h2>
        <p className="text-xs text-slate-400">
          Calcula el impacto exacto de jugar durante las ventanas especiales con multiplicadores frente a sesiones normales.
        </p>
      </div>

      {/* Main Interactive Question Tool */}
      <Card glow="gold" className="p-6 bg-slate-900/90">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-amber-300">
            Herramienta: "¿Qué probabilidad tengo si juego X horas normales e Y horas con bonus?"
          </h3>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Horas Normales (×1.0)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="50"
                value={normalHours}
                onChange={(e) => setNormalHours(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
              />
              <span className="text-xs text-slate-400 font-medium">horas</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              ~{normalChests.toLocaleString('es-ES')} cofres
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Horas con Bonus de Sesión
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="50"
                value={bonusHours}
                onChange={(e) => setBonusHours(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
              />
              <span className="text-xs text-slate-400 font-medium">horas</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              ~{bonusChests.toLocaleString('es-ES')} cofres
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Multiplicador del Bonus
            </label>
            <div className="flex items-center space-x-2">
              <select
                value={bonusMultiplier}
                onChange={(e) => setBonusMultiplier(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
              >
                <option value={1.5}>Bono Sesión 1 (×1.5)</option>
                <option value={2.0}>Bono Sesión 2 (×2.0)</option>
                <option value={3.0}>Bono Especial (×3.0)</option>
                <option value={5.0}>Bono Máximo (×5.0)</option>
              </select>
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 block">
              Tasa: 1/{Math.round(137500 / bonusMultiplier).toLocaleString('es-ES')}
            </span>
          </div>
        </div>

        {/* Results Highlight Banner */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Probabilidad Total Resultante:</span>
            <div className="text-3xl font-gaming font-bold text-amber-400 mt-0.5">
              {formatProbabilityPercentage(pMixed, 4)}
            </div>
            <span className="text-[11px] text-slate-500">
              En {totalChests.toLocaleString('es-ES')} cofres ({normalHours + bonusHours} h)
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Ganancia Absoluta por Bonus:</span>
            <div className="text-3xl font-gaming font-bold text-emerald-400 mt-0.5">
              +{diffPercentPoints.toFixed(4)} %
            </div>
            <span className="text-[11px] text-slate-500">
              Puntos porcentuales frente a jugar solo normal
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Aumento Relativo de Probabilidad:</span>
            <div className="text-3xl font-gaming font-bold text-cyan-300 mt-0.5">
              +{relativeIncrease.toFixed(1)} %
            </div>
            <span className="text-[11px] text-slate-500">
              Más eficiente gracias a las {bonusHours} h de bono
            </span>
          </div>
        </div>
      </Card>

      {/* Comparison Chart */}
      <Card className="p-5 bg-slate-900/90 border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          Comparativa Visual del Escenario Mixto
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Visualiza cómo cambia tu probabilidad total invirtiendo las {normalHours + bonusHours} horas según la presencia de bonos.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="escenario" stroke="#64748b" />
              <YAxis stroke="#64748b" unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
                formatter={(val: number) => [`${val.toFixed(4)}%`, 'Probabilidad']}
              />
              <Bar dataKey="probabilidad" fill="#eab308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Historical Sessions Archive */}
      <Card className="p-5 bg-slate-900/90 border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-purple-400" />
          Registro Histórico de Horas del Tesoro (7 de noviembre de 2026)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HISTORIC_SESSIONS.map((hs) => (
            <div key={hs.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-200 text-sm">{hs.name}</span>
                <Badge variant="source" source="official">Confirmado</Badge>
              </div>
              <p className="text-slate-400 mb-3">{hs.notes}</p>
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Ficha Pirata</span>
                  <strong className="text-amber-400 font-gaming text-sm">&times;{hs.multipliers.pirate_shop}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Skin Dorada</span>
                  <strong className="text-yellow-400 font-gaming text-sm">&times;{hs.multipliers.golden_skin}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Vehículo</span>
                  <strong className="text-cyan-400 font-gaming text-sm">&times;{hs.multipliers.vehicle_decal}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

