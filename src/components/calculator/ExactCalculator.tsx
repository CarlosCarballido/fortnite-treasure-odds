import React, { useState, useMemo } from 'react';
import { RewardItem } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  calculateCumulativeProbability,
  calculateFailureProbability,
  calculateChestsForTargetProbability,
  calculatePercentiles,
  calculateExpectedChests,
  formatProbabilityPercentage,
} from '../../math/probability';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Calculator, Sparkles, TrendingUp, Info, Share2, Printer, Check } from 'lucide-react';
import { UserSettings } from '../../storage/localStorage';

interface ExactCalculatorProps {
  rewards: RewardItem[];
  settings: UserSettings;
  loggedChests: number;
  onShowToast?: (title: string, description?: string) => void;
}

export const ExactCalculator: React.FC<ExactCalculatorProps> = ({
  rewards,
  loggedChests,
  onShowToast,
}) => {
  // Read initial query params if present
  const queryParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const initialChests = parseInt(queryParams.get('chests') || '1000') || 1000;
  const initialMult = parseFloat(queryParams.get('mult') || '1.0') || 1.0;
  const initialRewardId = queryParams.get('reward') || 'pirate-shop-access';

  // State
  const [selectedRewardId, setSelectedRewardId] = useState<string>(initialRewardId);
  const [chests, setChests] = useState<number>(initialChests);
  const [multiplier, setMultiplier] = useState<number>(initialMult);
  const [chestsPerMinute] = useState<number>(0.8);
  const [logScale, setLogScale] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Selected reward details
  const currentReward = useMemo(() => {
    return rewards.find((r) => r.id === selectedRewardId) || rewards[0];
  }, [rewards, selectedRewardId]);

  const pSingle = Math.min(1, (1 / currentReward.baseDenominator) * multiplier);

  // Exact calculations
  const cumulativeP = calculateCumulativeProbability(chests, pSingle);
  const failureP = calculateFailureProbability(chests, pSingle);
  const expectedChests = calculateExpectedChests(pSingle);
  const medianChests = calculateChestsForTargetProbability(0.5, pSingle);
  const percentiles = useMemo(() => calculatePercentiles(pSingle), [pSingle]);

  // Chart data
  const chartPoints = useMemo(() => {
    const maxN = Math.max(chests * 1.5, medianChests > 0 && medianChests < 500000 ? medianChests * 1.2 : chests * 2, 2000);
    const step = Math.max(1, Math.floor(maxN / 30));
    const data = [];

    for (let n = 0; n <= maxN; n += step) {
      const pNorm = calculateCumulativeProbability(n, 1 / currentReward.baseDenominator);
      const p15 = calculateCumulativeProbability(n, (1 / currentReward.baseDenominator) * 1.5);
      const p2 = calculateCumulativeProbability(n, (1 / currentReward.baseDenominator) * 2.0);
      const pCurrent = calculateCumulativeProbability(n, pSingle);

      data.push({
        chests: n,
        actual: Number((pCurrent * 100).toFixed(4)),
        normal: Number((pNorm * 100).toFixed(4)),
        bonus15: Number((p15 * 100).toFixed(4)),
        bonus2: Number((p2 * 100).toFixed(4)),
      });
    }
    return data;
  }, [currentReward, chests, pSingle, medianChests]);

  const handleCopyShareLink = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('tab', 'calculator');
    url.searchParams.set('reward', selectedRewardId);
    url.searchParams.set('chests', chests.toString());
    url.searchParams.set('mult', multiplier.toString());

    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedLink(true);
      if (onShowToast) {
        onShowToast('¡Enlace copiado!', 'Puedes compartir este cálculo exacto en tus redes sociales.');
      }
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-gaming font-bold text-slate-100 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-amber-400" />
            Calculadora de Probabilidades Exactas
          </h2>
          <p className="text-xs text-slate-400">
            Fórmulas numéricamente estables: P = -Math.expm1(n &times; Math.log1p(-p)). Sin aproximaciones prematuras.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Share Link Button */}
          <button
            onClick={handleCopyShareLink}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Copiar enlace con este cálculo para compartir"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
            <span>{copiedLink ? '¡Copiado!' : 'Compartir Cálculo'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Imprimir resumen de probabilidades"
          >
            <Printer className="w-4 h-4" />
          </button>

          <Badge variant="source" source="public_data">Tasas de Referencia</Badge>
          <Badge variant="rarity" rarity={currentReward.rarity}>{currentReward.rarity}</Badge>
        </div>
      </div>

      {/* Inputs Section */}
      <Card className="p-5 bg-slate-900/90 border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Selector de Recompensa */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Seleccionar Recompensa
            </label>
            <select
              value={selectedRewardId}
              onChange={(e) => setSelectedRewardId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {rewards.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (1/{r.baseDenominator.toLocaleString('es-ES')})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentReward.description}</span>
            </div>
          </div>

          {/* 2. Cantidad de Cofres */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                2. Cofres a Abrir (n)
              </label>
              <span className="text-xs font-bold text-amber-400 font-gaming">
                {chests.toLocaleString('es-ES')} cofres
              </span>
            </div>
            <input
              type="number"
              min={1}
              max={1000000}
              value={chests}
              onChange={(e) => setChests(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 mb-2 focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center space-x-1.5">
              {[100, 500, 1000, 5000, 10000, 50000].map((quick) => (
                <button
                  key={quick}
                  onClick={() => setChests(quick)}
                  className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  {quick.toLocaleString('es-ES')}
                </button>
              ))}
              {loggedChests > 0 && (
                <button
                  onClick={() => setChests(loggedChests)}
                  className="px-2 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30"
                  title="Usar cofres del tracker"
                >
                  Tracker ({loggedChests})
                </button>
              )}
            </div>
          </div>

          {/* 3. Multiplicador de Sesión */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              3. Multiplicador de Sesión
            </label>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {[
                { val: 1.0, label: 'Normal ×1' },
                { val: 1.5, label: 'Hora ×1.5' },
                { val: 2.0, label: 'Hora ×2' },
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => setMultiplier(btn.val)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    multiplier === btn.val
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Personalizado:</span>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={multiplier}
                onChange={(e) => setMultiplier(Math.max(0.01, parseFloat(e.target.value) || 1))}
                className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cumulative Probability */}
        <Card glow="gold" className="p-4 bg-slate-900/90">
          <div className="text-xs text-slate-400">Probabilidad &ge; 1 Éxito</div>
          <div className="text-3xl font-gaming font-bold text-amber-400 mt-1">
            {formatProbabilityPercentage(cumulativeP, 4)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            En {chests.toLocaleString('es-ES')} cofres
          </div>
        </Card>

        {/* Probability of Failure */}
        <Card className="p-4 bg-slate-900/90 border-slate-800">
          <div className="text-xs text-slate-400">Probabilidad de Fracaso (0)</div>
          <div className="text-3xl font-gaming font-bold text-rose-400 mt-1">
            {formatProbabilityPercentage(failureP, 4)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Chance de no obtenerlo en {chests.toLocaleString('es-ES')} cofres
          </div>
        </Card>

        {/* Expected Chests */}
        <Card className="p-4 bg-slate-900/90 border-slate-800">
          <div className="text-xs text-slate-400">Media Esperada (E = 1/p)</div>
          <div className="text-3xl font-gaming font-bold text-cyan-300 mt-1">
            {Math.round(expectedChests).toLocaleString('es-ES')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Cofres promedio hasta el primer éxito
          </div>
        </Card>

        {/* Median Chests */}
        <Card className="p-4 bg-slate-900/90 border-slate-800">
          <div className="text-xs text-slate-400">Mediana (50% de probabilidad)</div>
          <div className="text-3xl font-gaming font-bold text-purple-300 mt-1">
            {medianChests.toLocaleString('es-ES')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Mitad de jugadores lo consiguen antes
          </div>
        </Card>
      </div>

      {/* Chart: Probability Growth Curve */}
      <Card className="p-5 bg-slate-900/90 border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Curva de Probabilidad Acumulada vs. Cofres
            </h3>
            <p className="text-xs text-slate-400">
              Evolución matemática del porcentaje acumulado de conseguir {currentReward.name}.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Escala:</span>
            <button
              onClick={() => setLogScale(false)}
              className={`px-2 py-1 text-xs rounded font-medium ${
                !logScale ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Lineal
            </button>
            <button
              onClick={() => setLogScale(true)}
              className={`px-2 py-1 text-xs rounded font-medium ${
                logScale ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Logarítmica
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartPoints} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="chests"
                stroke="#64748b"
                tickFormatter={(val) => val.toLocaleString('es-ES')}
                scale={logScale ? 'log' : 'auto'}
                domain={logScale ? [10, 'dataMax'] : [0, 'dataMax']}
              />
              <YAxis
                stroke="#64748b"
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
                formatter={(val: number) => [`${val.toFixed(3)}%`, 'Probabilidad']}
                labelFormatter={(label) => `${label.toLocaleString('es-ES')} cofres`}
              />
              <ReferenceLine y={50} stroke="#eab308" strokeDasharray="4 4" label={{ value: '50% Mediana', fill: '#eab308', fontSize: 11 }} />
              <ReferenceLine y={90} stroke="#a855f7" strokeDasharray="4 4" label={{ value: '90%', fill: '#a855f7', fontSize: 11 }} />
              <ReferenceLine x={chests} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: 'Actual', fill: '#38bdf8', fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="normal"
                stroke="#64748b"
                strokeWidth={1.5}
                dot={false}
                name="Normal (×1)"
              />
              <Line
                type="monotone"
                dataKey="bonus15"
                stroke="#38bdf8"
                strokeWidth={1.5}
                dot={false}
                name="Bonus ×1.5"
              />
              <Line
                type="monotone"
                dataKey="bonus2"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                name="Bonus ×2"
              />
              {multiplier !== 1 && multiplier !== 1.5 && multiplier !== 2 && (
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={false}
                  name={`Seleccionado (×${multiplier})`}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Tables: Percentiles & Target Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Percentiles Table */}
        <Card className="p-5 bg-slate-900/90 border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Percentiles Estadísticos de Cofres Necesarios
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2">Percentil</th>
                  <th className="py-2 text-right">Cofres Necesarios</th>
                  <th className="py-2 text-right">Horas Est. (~{chestsPerMinute}/min)</th>
                  <th className="py-2 text-right">Estado Actual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {percentiles.map((p) => {
                  const hours = (p.chests / (chestsPerMinute * 60)).toFixed(1);
                  const achieved = chests >= p.chests;
                  return (
                    <tr key={p.percentile} className={p.percentile === 50 ? 'bg-amber-500/10 font-bold' : ''}>
                      <td className="py-2 text-slate-300">
                        P{p.percentile} ({p.percentile}%)
                      </td>
                      <td className="py-2 text-right font-gaming text-amber-400">
                        {p.chests.toLocaleString('es-ES')}
                      </td>
                      <td className="py-2 text-right text-slate-400">{hours} h</td>
                      <td className="py-2 text-right">
                        {achieved ? (
                          <span className="text-emerald-400 font-bold">Alcanzado</span>
                        ) : (
                          <span className="text-slate-500">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Comparison: Normal vs Bonus Rates */}
        <Card className="p-5 bg-slate-900/90 border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Comparativa de Rendimiento por Multiplicador
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2">Multiplicador</th>
                  <th className="py-2 text-right">Prob. en {chests.toLocaleString('es-ES')} cofres</th>
                  <th className="py-2 text-right">Cofres para 50%</th>
                  <th className="py-2 text-right">Ahorro de Tiempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[
                  { label: 'Normal (×1.0)', mult: 1.0 },
                  { label: 'Hora del Tesoro (×1.5)', mult: 1.5 },
                  { label: 'Hora del Tesoro (×2.0)', mult: 2.0 },
                ].map((row) => {
                  const pRow = Math.min(1, (1 / currentReward.baseDenominator) * row.mult);
                  const pCum = calculateCumulativeProbability(chests, pRow);
                  const n50 = calculateChestsForTargetProbability(0.5, pRow);
                  const n50Base = calculateChestsForTargetProbability(0.5, 1 / currentReward.baseDenominator);
                  const saved = row.mult > 1 ? `${Math.round(((n50Base - n50) / n50Base) * 100)}% menos cofres` : 'Línea base';

                  return (
                    <tr key={row.mult}>
                      <td className="py-2 font-medium text-slate-300">{row.label}</td>
                      <td className="py-2 text-right font-gaming text-amber-400">
                        {formatProbabilityPercentage(pCum, 4)}
                      </td>
                      <td className="py-2 text-right font-gaming text-slate-200">
                        {n50.toLocaleString('es-ES')}
                      </td>
                      <td className="py-2 text-right text-emerald-400">{saved}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/70 text-xs text-slate-400">
            <strong>Conclusión matemática:</strong> Con multiplicador &times;2, la cantidad de cofres para alcanzar el 50%
            se reduce de <strong>95.308</strong> a <strong>47.654</strong> (un ahorro de 47.654 aperturas).
          </div>
        </Card>
      </div>
    </div>
  );
};
