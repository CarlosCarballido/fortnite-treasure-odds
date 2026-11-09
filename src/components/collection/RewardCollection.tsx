import React, { useState } from 'react';
import { RewardItem } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { KNOWN_GIZMOS } from '../../config/rewards';
import {
  Trophy,
  CheckCircle2,
  Circle,
  Edit2,
  Sparkles,
  Info,
  Calendar,
  Lock,
  Crown,
  Key,
  Compass,
} from 'lucide-react';
import { calculateCumulativeProbability, formatProbabilityPercentage } from '../../math/probability';

interface RewardCollectionProps {
  rewards: RewardItem[];
  obtainedIds: string[];
  onToggleObtained: (rewardId: string) => void;
  onUpdateReward: (updatedReward: RewardItem) => void;
}

export const RewardCollection: React.FC<RewardCollectionProps> = ({
  rewards,
  obtainedIds,
  onToggleObtained,
  onUpdateReward,
}) => {
  const [activeWeekTab, setActiveWeekTab] = useState<number>(2); // Default to Week 2 (Current)
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDenom, setEditDenom] = useState(137500);
  const [editDesc, setEditDesc] = useState('');

  const weekTabs = [
    { week: 0, label: 'Permanentes' },
    { week: 1, label: 'Semana 1 (1–8 nov)' },
    { week: 2, label: 'Semana 2 (8–15 nov)' },
    { week: 3, label: 'Semana 3 (15–22 nov)' },
    { week: 4, label: 'Semana 4 (22–29 nov)' },
    { week: 5, label: 'Semana 5 (29 nov–6 dic)' },
  ];

  const currentTabRewards = rewards.filter((r) => r.week === activeWeekTab);
  const totalItems = rewards.filter((r) => !r.isRepeatable).length;
  const obtainedCount = obtainedIds.length;
  const progressPercent = totalItems > 0 ? ((obtainedCount / totalItems) * 100).toFixed(1) : '0';

  const handleStartEdit = (r: RewardItem) => {
    setEditingReward(r);
    setEditName(r.name);
    setEditDenom(r.baseDenominator);
    setEditDesc(r.description);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;

    onUpdateReward({
      ...editingReward,
      name: editName,
      baseDenominator: Math.max(1, editDenom),
      description: editDesc,
      source: 'user_custom',
    });

    setEditingReward(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Overall Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-gaming font-bold text-slate-100 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            Catálogo y Colección de Recompensas
          </h2>
          <p className="text-xs text-slate-400">
            Marca las recompensas que ya has conseguido para personalizar tus probabilidades y desbloqueos.
          </p>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Progreso de Colección</span>
            <strong className="text-amber-400 font-gaming text-lg font-bold">
              {obtainedCount} / {totalItems} ({progressPercent}%)
            </strong>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/40 flex items-center justify-center font-gaming text-xs font-bold text-amber-300">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Week Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {weekTabs.map((tab) => {
          const isActive = activeWeekTab === tab.week;
          const isCurrent = tab.week === 2;
          return (
            <button
              key={tab.week}
              onClick={() => setActiveWeekTab(tab.week)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              <span>{tab.label}</span>
              {isCurrent && (
                <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  En Curso
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Rewards Grid for Selected Tab */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentTabRewards.map((reward) => {
          const isObtained = obtainedIds.includes(reward.id);
          const p = 1 / reward.baseDenominator;

          return (
            <Card
              key={reward.id}
              glow={reward.rarity === 'supreme' ? 'gold' : reward.rarity === 'major' ? 'purple' : 'none'}
              className={`p-4 flex flex-col justify-between transition-all ${
                isObtained ? 'bg-emerald-950/10 border-emerald-500/30' : 'bg-slate-900/90'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-1.5">
                    <Badge variant="rarity" rarity={reward.rarity}>{reward.rarity}</Badge>
                    <Badge variant="source" source={reward.source}>
                      {reward.source === 'official' ? 'Oficial' : reward.source === 'user_custom' ? 'Editado' : 'Hipótesis'}
                    </Badge>
                  </div>

                  {/* Obtained Toggle */}
                  <button
                    onClick={() => onToggleObtained(reward.id)}
                    className="flex items-center space-x-1 text-xs font-semibold"
                    title={isObtained ? 'Marcar como pendiente' : 'Marcar como conseguido'}
                  >
                    {isObtained ? (
                      <span className="flex items-center text-emerald-400 gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Conseguido</span>
                      </span>
                    ) : (
                      <span className="flex items-center text-slate-400 hover:text-slate-200 gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        <Circle className="w-3.5 h-3.5" />
                        <span>Pendiente</span>
                      </span>
                    )}
                  </button>
                </div>

                {/* Name & Rate */}
                <h4 className="text-base font-bold text-slate-100 font-gaming mt-1">
                  {reward.name}
                </h4>
                <div className="text-xs font-gaming font-semibold text-amber-400 mt-0.5">
                  1 en {reward.baseDenominator.toLocaleString('es-ES')} ({formatProbabilityPercentage(p, 5)})
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {reward.description}
                </p>
              </div>

              {/* Footer / Edit */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  {reward.isRepeatable ? 'Recompensa repetible' : 'Único (no repetible)'}
                </span>

                <button
                  onClick={() => handleStartEdit(reward)}
                  className="flex items-center space-x-1 text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Editar</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Special Section: Gizmos Known Pool (Permanent) */}
      {activeWeekTab === 0 && (
        <Card className="p-5 bg-slate-900/90 border-slate-800 mt-6">
          <div className="flex items-center space-x-2 mb-3">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Desglose de Gizmos Conocidos (Tasa de obtención: 1/127 para cualquiera de los 5)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Nota matemática rigurosa: La probabilidad oficial publicada de 1/127 corresponde a obtener <strong>un Gizmo cualquiera</strong> al abrir el cofre, no a cada Gizmo de forma individual. La distribución interna exacta entre los 5 gizmos no ha sido detallada por Epic Games.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {KNOWN_GIZMOS.map((g) => (
              <div key={g.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <div className="font-bold text-amber-300 font-gaming mb-1">{g.name}</div>
                <div className="text-slate-400 text-[11px] leading-relaxed">{g.description}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Edit Reward Modal */}
      {editingReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-5 text-slate-100">
            <h3 className="text-base font-bold text-slate-100 mb-4">Editar Recompensa</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nombre de la Recompensa</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Denominador de Probabilidad (1 / X)</label>
                <input
                  type="number"
                  min="1"
                  max="100000000"
                  value={editDenom}
                  onChange={(e) => setEditDenom(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Probabilidad resultante: 1 en {editDenom.toLocaleString('es-ES')} ({formatProbabilityPercentage(1 / editDenom, 5)})
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReward(null)}
                  className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

