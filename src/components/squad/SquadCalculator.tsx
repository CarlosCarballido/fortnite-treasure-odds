import React, { useState, useMemo } from 'react';
import { RewardCategory, SquadPlayerConfig, SquadSimulationInput } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Users, User, Clock, ShieldCheck, HelpCircle, TrendingUp, Zap } from 'lucide-react';
import { evaluateSquadPerformance } from '../../math/squad';
import { formatProbabilityPercentage } from '../../math/probability';
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

export const SquadCalculator: React.FC = () => {
  const [squadMode, setSquadMode] = useState<'solo' | 'duo' | 'trio' | 'squad'>('squad');
  const [overlapFactor, setOverlapFactor] = useState<number>(0.08); // 8% default overlap
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [targetCategory, setTargetCategory] = useState<RewardCategory>('pirate_shop');

  // Player configurations
  const [players, setPlayers] = useState<SquadPlayerConfig[]>([
    { id: 'p1', name: 'Tú (Líder)', chestsPerMatch: 12, matchesPlayed: 25, matchDurationMinutes: 18 },
    { id: 'p2', name: 'Compañero 1', chestsPerMatch: 10, matchesPlayed: 25, matchDurationMinutes: 18 },
    { id: 'p3', name: 'Compañero 2', chestsPerMatch: 11, matchesPlayed: 25, matchDurationMinutes: 18 },
    { id: 'p4', name: 'Compañero 3', chestsPerMatch: 9, matchesPlayed: 25, matchDurationMinutes: 18 },
  ]);

  // Active players subset based on mode
  const activePlayers = useMemo(() => {
    switch (squadMode) {
      case 'solo':
        return players.slice(0, 1);
      case 'duo':
        return players.slice(0, 2);
      case 'trio':
        return players.slice(0, 3);
      case 'squad':
        return players.slice(0, 4);
    }
  }, [squadMode, players]);

  const updatePlayer = (index: number, field: keyof SquadPlayerConfig, value: number) => {
    setPlayers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Run calculation
  const result = useMemo(() => {
    const input: SquadSimulationInput = {
      mode: squadMode,
      players: activePlayers,
      chestOverlapFactor: overlapFactor,
      multiplier,
      targetCategory,
    };
    return evaluateSquadPerformance(input);
  }, [squadMode, activePlayers, overlapFactor, multiplier, targetCategory]);

  // Comparative data for Solo vs Duo vs Trio vs Squad under equal match counts
  const comparativeModesData = useMemo(() => {
    const modes: ('solo' | 'duo' | 'trio' | 'squad')[] = ['solo', 'duo', 'trio', 'squad'];
    const p1 = players[0];

    return modes.map((m) => {
      let count = 1;
      if (m === 'duo') count = 2;
      if (m === 'trio') count = 3;
      if (m === 'squad') count = 4;

      const subPlayers = players.slice(0, count);
      const res = evaluateSquadPerformance({
        mode: m,
        players: subPlayers,
        chestOverlapFactor: overlapFactor,
        multiplier,
        targetCategory,
      });

      return {
        mode: m.toUpperCase(),
        cofresUnicos: res.uniqueChests,
        probabilidad: Number((res.effectiveProbability * 100).toFixed(4)),
      };
    });
  }, [players, overlapFactor, multiplier, targetCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-gaming font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-400" />
          Simulador y Optimizador de Escuadrones
        </h2>
        <p className="text-xs text-slate-400">
          Modela la ventaja real del juego en equipo: apertura de cofres únicos compartidos, deduplicación y ahorro de tiempo.
        </p>
      </div>

      {/* Mode Selector */}
      <Card className="p-4 bg-slate-900/90 border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Modo de Juego:</span>
            {[
              { id: 'solo', label: 'Solo (1)', count: 1 },
              { id: 'duo', label: 'Dúo (2)', count: 2 },
              { id: 'trio', label: 'Trío (3)', count: 3 },
              { id: 'squad', label: 'Escuadrón (4)', count: 4 },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setSquadMode(btn.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  squadMode === btn.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-400">Multiplicador:</span>
            {[1.0, 1.5, 2.0].map((m) => (
              <button
                key={m}
                onClick={() => setMultiplier(m)}
                className={`px-2 py-1 rounded font-semibold ${
                  multiplier === m ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                &times;{m}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Crucial Explainer Notice */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-start space-x-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-cyan-300">
            Regla de Oro del Escuadrón:
          </strong>
          <p className="leading-relaxed text-slate-400">
            La probabilidad de un solo cofre <strong>NO se multiplica por 4</strong> al jugar en escuadrón. La ventaja del
            equipo proviene exclusivamente de que cuatro jugadores exploran el mapa y abren <strong>más cofres únicos</strong> en
            la misma cantidad de tiempo. Cuando cualquiera encuentra la ficha, se otorga acceso a todo el grupo según las guías
            oficiales.
          </p>
        </div>
      </div>

      {/* Players Input Table & Overlap Factor Slider */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Players List */}
        <Card className="lg:col-span-2 p-5 bg-slate-900/90 border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between mb-3">
            <span>Rendimiento por Jugador ({activePlayers.length} en partida)</span>
            <span className="text-xs text-slate-400 font-normal">Edita cofres y partidas</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2">Jugador</th>
                  <th className="py-2">Cofres / Partida</th>
                  <th className="py-2">Partidas</th>
                  <th className="py-2">Min / Partida</th>
                  <th className="py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activePlayers.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="py-2.5 font-medium text-slate-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      {p.name}
                    </td>
                    <td className="py-2.5">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={p.chestsPerMatch}
                        onChange={(e) => updatePlayer(idx, 'chestsPerMatch', parseInt(e.target.value) || 1)}
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100"
                      />
                    </td>
                    <td className="py-2.5">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={p.matchesPlayed}
                        onChange={(e) => updatePlayer(idx, 'matchesPlayed', parseInt(e.target.value) || 1)}
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100"
                      />
                    </td>
                    <td className="py-2.5">
                      <input
                        type="number"
                        min="5"
                        max="35"
                        value={p.matchDurationMinutes}
                        onChange={(e) => updatePlayer(idx, 'matchDurationMinutes', parseInt(e.target.value) || 18)}
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100"
                      />
                    </td>
                    <td className="py-2.5 text-right font-gaming text-amber-300 font-bold">
                      {(p.chestsPerMatch * p.matchesPlayed).toLocaleString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Overlap & Explanations */}
        <Card className="p-5 bg-slate-900/90 border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Factor de Solapamiento: {(overlapFactor * 100).toFixed(0)}%
              </label>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={overlapFactor}
              onChange={(e) => setOverlapFactor(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0% (Zonas separadas)</span>
              <span>50% (Mismo POI)</span>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div>
                Cofres brutos sumados: <strong className="text-slate-200">{result.rawTotalChests.toLocaleString('es-ES')}</strong>
              </div>
              <div>
                Cofres únicos efectivos: <strong className="text-emerald-400">{result.uniqueChests.toLocaleString('es-ES')}</strong>
              </div>
              <div>
                Pérdida por redundancia:{' '}
                <span className="text-rose-400">
                  -{(result.rawTotalChests - result.uniqueChests).toLocaleString('es-ES')} cofres
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="text-xs text-slate-400">Multiplicador de Eficiencia Grupal:</div>
            <div className="text-2xl font-gaming font-bold text-amber-400 mt-0.5">
              {result.soloAdvantageRatio.toFixed(2)}&times; más rápido que Solo
            </div>
          </div>
        </Card>
      </div>

      {/* Main Results KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card glow="gold" className="p-4 bg-slate-900/90">
          <div className="text-xs text-slate-400">Probabilidad del Escuadrón (&ge;1 Ficha)</div>
          <div className="text-3xl font-gaming font-bold text-amber-400 mt-1">
            {formatProbabilityPercentage(result.effectiveProbability, 4)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            En {result.uniqueChests.toLocaleString('es-ES')} cofres únicos
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/90 border-slate-800">
          <div className="text-xs text-slate-400">Cofres Únicos Abiertos</div>
          <div className="text-3xl font-gaming font-bold text-slate-100 mt-1">
            {result.uniqueChests.toLocaleString('es-ES')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            vs {result.soloEquivalentChests.toLocaleString('es-ES')} jugando solo
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/90 border-slate-800">
          <div className="text-xs text-slate-400">Horas Totales Reales Invertidas</div>
          <div className="text-3xl font-gaming font-bold text-cyan-300 mt-1">
            {result.timeSpentHours.toFixed(1)} h
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Velocidad: ~{result.chestsPerHour} cofres grupales / hora
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/90 border-slate-800">
          <div className="text-xs text-slate-400">Horas Estimadas para el 50%</div>
          <div className="text-3xl font-gaming font-bold text-purple-300 mt-1">
            {result.chestsPerHour > 0
              ? `${(result.exactStats.medianChests / result.chestsPerHour).toFixed(1)} h`
              : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Solo tardaría:{' '}
            {result.chestsPerHour > 0
              ? `${((result.exactStats.medianChests / result.chestsPerHour) * result.soloAdvantageRatio).toFixed(1)} h`
              : 'N/A'}
          </div>
        </Card>
      </div>

      {/* Comparison Chart: Solo vs Duo vs Trio vs Squad */}
      <Card className="p-5 bg-slate-900/90 border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          Comparativa de Eficiencia: Solo vs. Dúo vs. Trío vs. Escuadrón
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Probabilidad acumulada obtenida en la misma cantidad de partidas según el tamaño del equipo.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparativeModesData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="mode" stroke="#64748b" />
              <YAxis stroke="#64748b" unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
                formatter={(val: number, name: string) => [
                  name === 'probabilidad' ? `${val.toFixed(4)}%` : val.toLocaleString('es-ES'),
                  name === 'probabilidad' ? 'Probabilidad' : 'Cofres Únicos',
                ]}
              />
              <Legend />
              <Bar dataKey="probabilidad" name="Probabilidad (%)" fill="#eab308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

