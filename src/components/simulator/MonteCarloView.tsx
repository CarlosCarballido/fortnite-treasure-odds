import React, { useState, useEffect, useRef } from 'react';
import { RewardItem, MonteCarloConfig, MonteCarloResult, MonteCarloProgress, DistributionModel, DuplicateHandling } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Play, Pause, RotateCcw, XCircle, Activity, Sparkles, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatProbabilityPercentage } from '../../math/probability';

interface MonteCarloViewProps {
  rewards: RewardItem[];
}

export const MonteCarloView: React.FC<MonteCarloViewProps> = ({ rewards }) => {
  // Config state
  const [totalChests, setTotalChests] = useState<number>(5000);
  const [simulationsCount, setSimulationsCount] = useState<number>(10000);
  const [targetRewardId, setTargetRewardId] = useState<string>('pirate-shop-access');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [distributionModel, setDistributionModel] = useState<DistributionModel>('categorical');
  const [duplicateHandling, setDuplicateHandling] = useState<DuplicateHandling>('drop');
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [useGeometric, setUseGeometric] = useState<boolean>(true);

  // Execution state
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'done'>('idle');
  const [progress, setProgress] = useState<MonteCarloProgress>({
    currentTrial: 0,
    totalTrials: 10000,
    percent: 0,
    successesCount: 0,
    status: 'idle',
  });
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const workerRef = useRef<Worker | null>(null);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../../workers/monteCarlo.worker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e: MessageEvent) => {
      const data = e.data;
      if (data.type === 'PROGRESS') {
        setProgress(data.progress);
      } else if (data.type === 'COMPLETE') {
        setResult(data.result);
        setStatus('done');
        setElapsedTime(data.elapsedMs || 0);
      } else if (data.type === 'CANCELLED') {
        setStatus('idle');
        setProgress((prev) => ({ ...prev, status: 'idle', percent: 0 }));
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const handleStart = () => {
    if (!workerRef.current) return;

    setStatus('running');
    setResult(null);
    setProgress({
      currentTrial: 0,
      totalTrials: simulationsCount,
      percent: 0,
      successesCount: 0,
      status: 'running',
    });

    const multipliersRecord: Record<string, number> = {
      pirate_shop: multiplier,
      golden_skin: multiplier,
      vehicle_decal: multiplier,
      pickaxe_backpack: 1.0,
      jam_track: 1.0,
      loading_screen: 1.0,
      gizmo: 1.0,
    };

    const config: MonteCarloConfig = {
      totalChests,
      simulationsCount,
      targetRewards: [targetRewardId],
      multipliers: multipliersRecord,
      distributionModel,
      duplicateHandling,
      week: 2,
      seed: seed !== undefined && !isNaN(seed) ? Number(seed) : undefined,
      useGeometricOptimization: useGeometric,
    };

    workerRef.current.postMessage({ type: 'START', config });
  };

  const handleCancel = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'CANCEL' });
    }
    setStatus('idle');
  };

  const handleReset = () => {
    handleCancel();
    setResult(null);
    setProgress({
      currentTrial: 0,
      totalTrials: simulationsCount,
      percent: 0,
      successesCount: 0,
      status: 'idle',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-gaming font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-6 h-6 text-amber-400" />
          Simulador Monte Carlo en Web Worker
        </h2>
        <p className="text-xs text-slate-400">
          Simula miles de trayectorias independientes sin congelar la interfaz. Muestreo estocástico con intervalos de confianza Wilson al 95%.
        </p>
      </div>

      {/* Configuration Grid */}
      <Card className="p-5 bg-slate-900/90 border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Target Reward */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Recompensa Objetivo
            </label>
            <select
              value={targetRewardId}
              disabled={status === 'running'}
              onChange={(e) => setTargetRewardId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 disabled:opacity-50"
            >
              {rewards.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (1/{r.baseDenominator.toLocaleString('es-ES')})
                </option>
              ))}
            </select>
          </div>

          {/* Chests Per Simulation */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Cofres por Partida / Intento
            </label>
            <input
              type="number"
              min={1}
              max={1000000}
              value={totalChests}
              disabled={status === 'running'}
              onChange={(e) => setTotalChests(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 disabled:opacity-50"
            />
          </div>

          {/* Number of Simulations */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Número de Simulaciones (N)
            </label>
            <select
              value={simulationsCount}
              disabled={status === 'running'}
              onChange={(e) => setSimulationsCount(parseInt(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 disabled:opacity-50"
            >
              <option value={1000}>1.000 simulaciones</option>
              <option value={5000}>5.000 simulaciones</option>
              <option value={10000}>10.000 simulaciones</option>
              <option value={50000}>50.000 simulaciones</option>
              <option value={100000}>100.000 simulaciones (Alta precisión)</option>
            </select>
          </div>

          {/* Multiplier */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Multiplicador
            </label>
            <select
              value={multiplier}
              disabled={status === 'running'}
              onChange={(e) => setMultiplier(parseFloat(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 disabled:opacity-50"
            >
              <option value={1.0}>Normal (×1.0)</option>
              <option value={1.5}>Hora del Tesoro (×1.5)</option>
              <option value={2.0}>Hora del Tesoro (×2.0)</option>
              <option value={5.0}>Bonus Especial (×5.0)</option>
              <option value={10.0}>Bonus Extremo (×10.0)</option>
            </select>
          </div>
        </div>

        {/* Advanced Options Bar */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Model */}
          <div>
            <span className="text-slate-400 font-medium">Modelo estadístico:</span>
            <div className="flex items-center space-x-2 mt-1">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="model"
                  value="categorical"
                  checked={distributionModel === 'categorical'}
                  disabled={status === 'running'}
                  onChange={() => setDistributionModel('categorical')}
                  className="text-amber-500"
                />
                <span className="text-slate-300">Categórico Excluyente</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="radio"
                  name="model"
                  value="independent"
                  checked={distributionModel === 'independent'}
                  disabled={status === 'running'}
                  onChange={() => setDistributionModel('independent')}
                  className="text-amber-500"
                />
                <span className="text-slate-300">Sorteos Independientes</span>
              </label>
            </div>
          </div>

          {/* Seed */}
          <div>
            <span className="text-slate-400 font-medium">Semilla PRNG (Opcional):</span>
            <input
              type="number"
              placeholder="Ej. 42 (reproducible)"
              value={seed ?? ''}
              disabled={status === 'running'}
              onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 disabled:opacity-50"
            />
          </div>

          {/* Geometric Optimization */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-slate-300 font-medium block">Muestreo Geométrico</span>
              <span className="text-[11px] text-slate-500">Acelera eventos ultra-raros</span>
            </div>
            <input
              type="checkbox"
              checked={useGeometric}
              disabled={status === 'running'}
              onChange={(e) => setUseGeometric(e.target.checked)}
              className="w-4 h-4 text-amber-500 rounded bg-slate-950 border-slate-700"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {status !== 'running' ? (
              <button
                onClick={handleStart}
                className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-bold text-xs shadow-md hover:from-amber-500 hover:to-yellow-400 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Lanzar Simulación</span>
              </button>
            ) : (
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            )}

            <button
              onClick={handleReset}
              disabled={status === 'running'}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          </div>

          {/* Progress Indicator */}
          {status === 'running' && (
            <div className="flex items-center space-x-3 text-xs text-amber-400 font-medium animate-pulse">
              <Activity className="w-4 h-4" />
              <span>
                Simulando: {progress.currentTrial.toLocaleString('es-ES')} / {progress.totalTrials.toLocaleString('es-ES')} ({progress.percent}%)
              </span>
            </div>
          )}
        </div>

        {/* Real Progress Bar */}
        {(status === 'running' || status === 'done') && (
          <div className="mt-3">
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-200"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Results View */}
      {result && (
        <div className="space-y-4">
          {/* Main Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card glow="gold" className="p-4 bg-slate-900/90">
              <div className="text-xs text-slate-400">Frecuencia Empírica Simulada</div>
              <div className="text-3xl font-gaming font-bold text-amber-400 mt-1">
                {formatProbabilityPercentage(result.empiricalProbability, 4)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {result.successCount.toLocaleString('es-ES')} éxitos de {result.totalTrials.toLocaleString('es-ES')} intentos
              </div>
            </Card>

            <Card className="p-4 bg-slate-900/90 border-slate-800">
              <div className="text-xs text-slate-400">Probabilidad Teórica Exacta</div>
              <div className="text-3xl font-gaming font-bold text-cyan-300 mt-1">
                {formatProbabilityPercentage(result.theoreticalProbability, 4)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Diferencia: {result.differencePercentPoints > 0 ? '+' : ''}
                {result.differencePercentPoints.toFixed(4)} puntos %
              </div>
            </Card>

            <Card className="p-4 bg-slate-900/90 border-slate-800">
              <div className="text-xs text-slate-400">Intervalo de Confianza (Wilson 95%)</div>
              <div className="text-xl font-gaming font-bold text-purple-300 mt-1">
                [{formatProbabilityPercentage(result.confidenceInterval95[0], 3)} &ndash;{' '}
                {formatProbabilityPercentage(result.confidenceInterval95[1], 3)}]
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Rango al 95% de nivel de confianza
              </div>
            </Card>

            <Card className="p-4 bg-slate-900/90 border-slate-800">
              <div className="text-xs text-slate-400">Mediana de Cofres al Primer Éxito</div>
              <div className="text-3xl font-gaming font-bold text-slate-100 mt-1">
                {result.firstSuccessStats.median > 0
                  ? result.firstSuccessStats.median.toLocaleString('es-ES')
                  : 'Sin éxitos'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Tiempo de cómputo: {elapsedTime} ms
              </div>
            </Card>
          </div>

          {/* Zero Success Explanation Banner */}
          {result.successCount === 0 && (
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start space-x-3 text-xs text-slate-300">
              <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-300">
                  ¿Por qué se obtuvieron 0 éxitos en esta simulación?
                </strong>
                <p className="mt-1 leading-relaxed">
                  Que en {result.totalTrials.toLocaleString('es-ES')} simulaciones de {result.chestsPerTrial.toLocaleString('es-ES')}{' '}
                  cofres no haya salido el premio <strong>NO significa que la probabilidad real sea cero</strong>. Para premios
                  ultra-raros como Pirate Shop Access (1 en 137.500), la probabilidad de ver cero premios en{' '}
                  {result.chestsPerTrial.toLocaleString('es-ES')} cofres es de{' '}
                  {formatProbabilityPercentage(1 - result.theoreticalProbability, 2)}. El intervalo de Wilson superior{' '}
                  ({formatProbabilityPercentage(result.confidenceInterval95[1], 4)}) demuestra que la tasa real está dentro
                  de los parámetros esperados.
                </p>
              </div>
            </div>
          )}

          {/* Histogram Chart */}
          {result.chestsToFirstSuccessDistribution.length > 0 && (
            <Card className="p-5 bg-slate-900/90 border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 mb-2">
                Distribución de Cofres hasta el Primer Éxito (Histograma Monte Carlo)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Frecuencia observada según el número de cofres que tardó cada simulación exitosa en conseguir el premio.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.chestsToFirstSuccessDistribution} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="chests"
                      stroke="#64748b"
                      tickFormatter={(val) => `~${val.toLocaleString('es-ES')}`}
                      fontSize={11}
                    />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                      }}
                      formatter={(val: number) => [val.toLocaleString('es-ES'), 'Simulaciones']}
                      labelFormatter={(label) => `Cofre ~${label.toLocaleString('es-ES')}`}
                    />
                    <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

