import React, { useState, useMemo } from 'react';
import { ChestTrackerSession, RewardItem } from '../../types';
import { Card } from '../common/Card';
import {
  RotateCcw,
  Download,
  Trash2,
  Clock,
  Plus,
  FileSpreadsheet,
  Filter,
} from 'lucide-react';
import { calculateMixedSessionsProbability, formatProbabilityPercentage } from '../../math/probability';
import { exportTrackerAsCSV, exportAllDataAsJSON } from '../../storage/exportImport';

interface ChestTrackerProps {
  sessions: ChestTrackerSession[];
  onAddSession: (session: ChestTrackerSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onUndoLastSession: () => void;
  onOpenResetModal: () => void;
  rewards: RewardItem[];
}

export const ChestTracker: React.FC<ChestTrackerProps> = ({
  sessions,
  onAddSession,
  onDeleteSession,
  onUndoLastSession,
  onOpenResetModal,
  rewards,
}) => {
  // Modal / Form state for custom session
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [filterMode, setFilterMode] = useState<string>('all');
  const [customChestInput, setCustomChestInput] = useState<number>(20);

  const [formMode, setFormMode] = useState<'solo' | 'duo' | 'trio' | 'squad'>('squad');
  const [formIndividualChests, setFormIndividualChests] = useState(12);
  const [formGroupChests, setFormGroupChests] = useState(40);
  const [formMultiplier, setFormMultiplier] = useState(1.0);
  const [formDuration, setFormDuration] = useState(20);
  const [formRewardsWon, setFormRewardsWon] = useState<string[]>([]);
  const [formNotes, setFormNotes] = useState('');

  // Quick Add function
  const handleQuickAdd = (amount: number) => {
    const newSession: ChestTrackerSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toISOString(),
      gameMode: 'solo',
      playersCount: 1,
      individualChests: amount,
      groupUniqueChests: amount,
      multiplier: 1.0,
      durationMinutes: Math.round(amount * 1.5),
      rewardsWon: [],
      notes: `Añadido rápido +${amount} cofres`,
    };
    onAddSession(newSession);
  };

  const handleSaveCustomSession = (e: React.FormEvent) => {
    e.preventDefault();
    let playersCount = 1;
    if (formMode === 'duo') playersCount = 2;
    if (formMode === 'trio') playersCount = 3;
    if (formMode === 'squad') playersCount = 4;

    const newSession: ChestTrackerSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toISOString(),
      gameMode: formMode,
      playersCount,
      individualChests: formIndividualChests,
      groupUniqueChests: formGroupChests,
      multiplier: formMultiplier,
      durationMinutes: formDuration,
      rewardsWon: formRewardsWon,
      notes: formNotes,
    };

    onAddSession(newSession);
    setIsAddingCustom(false);
    setFormNotes('');
    setFormRewardsWon([]);
  };

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    if (filterMode === 'all') return sessions;
    return sessions.filter((s) => s.gameMode === filterMode);
  }, [sessions, filterMode]);

  // Aggregated statistics
  const totalChests = sessions.reduce((sum, s) => sum + s.individualChests, 0);
  const normalChests = sessions.filter((s) => s.multiplier === 1.0).reduce((sum, s) => sum + s.individualChests, 0);
  const boostedChests = sessions.filter((s) => s.multiplier > 1.0).reduce((sum, s) => sum + s.individualChests, 0);
  const totalDurationMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalHours = totalDurationMinutes / 60;
  const chestsPerMin = totalDurationMinutes > 0 ? (totalChests / totalDurationMinutes).toFixed(2) : '0';

  // Calculate cumulative probability
  const sessionEntries = sessions.map((s) => ({
    chests: s.individualChests,
    p: (1 / 137500) * s.multiplier,
  }));
  const cumulativeHistoricalProbability = calculateMixedSessionsProbability(sessionEntries);

  return (
    <div className="space-y-6">
      {/* Header & Quick Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-gaming font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" />
            Registro y Tracker de Cofres
          </h2>
          <p className="text-xs text-slate-400">
            Anota tus partidas en tiempo real. Persistencia local en navegador sin registro.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleQuickAdd(1)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all active:scale-95"
          >
            +1
          </button>
          <button
            onClick={() => handleQuickAdd(5)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all active:scale-95"
          >
            +5
          </button>
          <button
            onClick={() => handleQuickAdd(10)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all active:scale-95"
          >
            +10
          </button>

          {/* Add custom amount */}
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min="1"
              value={customChestInput}
              onChange={(e) => setCustomChestInput(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-bold font-gaming"
            />
            <button
              onClick={() => handleQuickAdd(customChestInput)}
              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              + Añadir
            </button>
          </div>

          <button
            onClick={() => setIsAddingCustom(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow transition-all active:scale-95 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Partida Completa</span>
          </button>

          {sessions.length > 0 && (
            <>
              <button
                onClick={onUndoLastSession}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Deshacer último registro"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenResetModal}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
                title="Reiniciar contador de estadísticas"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Resetear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3 bg-slate-900/90 border-slate-800">
          <span className="text-[11px] text-slate-400 block">Cofres Totales</span>
          <strong className="text-xl font-gaming text-slate-100">{totalChests.toLocaleString('es-ES')}</strong>
        </Card>
        <Card className="p-3 bg-slate-900/90 border-slate-800">
          <span className="text-[11px] text-slate-400 block">Cofres Normales</span>
          <strong className="text-xl font-gaming text-slate-300">{normalChests.toLocaleString('es-ES')}</strong>
        </Card>
        <Card className="p-3 bg-slate-900/90 border-slate-800">
          <span className="text-[11px] text-slate-400 block">Cofres con Bonus</span>
          <strong className="text-xl font-gaming text-amber-400">{boostedChests.toLocaleString('es-ES')}</strong>
        </Card>
        <Card className="p-3 bg-slate-900/90 border-slate-800">
          <span className="text-[11px] text-slate-400 block">Horas Totales</span>
          <strong className="text-xl font-gaming text-cyan-300">{totalHours.toFixed(1)} h</strong>
        </Card>
        <Card className="p-3 bg-slate-900/90 border-slate-800">
          <span className="text-[11px] text-slate-400 block">Cofres / Minuto</span>
          <strong className="text-xl font-gaming text-purple-300">{chestsPerMin}</strong>
        </Card>
        <Card glow="gold" className="p-3 bg-slate-900/90">
          <span className="text-[11px] text-slate-400 block">Prob. Acumulada</span>
          <strong className="text-xl font-gaming text-amber-400">
            {formatProbabilityPercentage(cumulativeHistoricalProbability, 3)}
          </strong>
        </Card>
      </div>

      {/* Filter and Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
        {/* Mode Filter */}
        <div className="flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Filtrar:</span>
          {['all', 'solo', 'duo', 'trio', 'squad'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2 py-0.5 rounded uppercase font-semibold text-[10px] transition-colors ${
                filterMode === mode
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === 'all' ? 'Todos' : mode}
            </button>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={exportTrackerAsCSV}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Descargar CSV</span>
          </button>
          <button
            onClick={exportAllDataAsJSON}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Backup JSON</span>
          </button>
        </div>
      </div>

      {/* Sessions History Table */}
      <Card className="p-4 bg-slate-900/90 border-slate-800 overflow-hidden">
        {filteredSessions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            {sessions.length === 0
              ? 'No has registrado partidas todavía. Usa los botones rápidos superiores o añade una partida.'
              : 'No hay partidas que coincidan con el filtro seleccionado.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5">Fecha</th>
                  <th className="py-2.5">Modo</th>
                  <th className="py-2.5 text-right">Cofres Indiv.</th>
                  <th className="py-2.5 text-right">Cofres Grupo</th>
                  <th className="py-2.5 text-center">Multiplicador</th>
                  <th className="py-2.5 text-right">Duración</th>
                  <th className="py-2.5">Premios</th>
                  <th className="py-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="py-2 text-slate-400 whitespace-nowrap">
                      {new Date(s.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-2 font-medium text-slate-200 uppercase">{s.gameMode}</td>
                    <td className="py-2 text-right font-gaming font-bold text-amber-300">
                      {s.individualChests}
                    </td>
                    <td className="py-2 text-right font-gaming text-slate-300">
                      {s.groupUniqueChests}
                    </td>
                    <td className="py-2 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          s.multiplier > 1
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        &times;{s.multiplier}
                      </span>
                    </td>
                    <td className="py-2 text-right text-slate-400">{s.durationMinutes} min</td>
                    <td className="py-2">
                      {s.rewardsWon && s.rewardsWon.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {s.rewardsWon.map((rId) => {
                            const rItem = rewards.find((r) => r.id === rId);
                            return (
                              <span
                                key={rId}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              >
                                {rItem?.name || rId}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-600">&ndash;</span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => onDeleteSession(s.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Eliminar partida"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Custom Session Modal */}
      {isAddingCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-5 text-slate-100">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Registrar Partida Completa</h3>
            <form onSubmit={handleSaveCustomSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Modo de Juego</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['solo', 'duo', 'trio', 'squad'] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setFormMode(m)}
                      className={`py-1.5 rounded uppercase font-bold text-center border ${
                        formMode === m
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cofres Personales</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formIndividualChests}
                    onChange={(e) => setFormIndividualChests(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cofres Únicos de Equipo</label>
                  <input
                    type="number"
                    min="1"
                    max="400"
                    value={formGroupChests}
                    onChange={(e) => setFormGroupChests(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Multiplicador</label>
                  <select
                    value={formMultiplier}
                    onChange={(e) => setFormMultiplier(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                  >
                    <option value={1.0}>Normal (×1.0)</option>
                    <option value={1.5}>Hora ×1.5</option>
                    <option value={2.0}>Hora ×2.0</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duración (Minutos)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formDuration}
                    onChange={(e) => setFormDuration(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Recompensas Obtenidas en esta partida</label>
                <select
                  multiple
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 h-20"
                  value={formRewardsWon}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                    setFormRewardsWon(selected);
                  }}
                >
                  {rewards.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500">Mantén presionado Ctrl para seleccionar varias</span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notas de la partida (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Buena partida, Carretes Calurosos"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Guardar Partida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
