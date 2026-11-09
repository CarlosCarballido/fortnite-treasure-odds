import React, { useState, useEffect } from 'react';
import { RewardItem } from '../../types';
import { Badge } from '../common/Badge';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Box,
  Volume2,
  VolumeX,
  Keyboard,
  RotateCcw,
  Check,
  Trophy,
} from 'lucide-react';
import { drawSingleChest, getEffectiveProbabilities } from '../../math/models';
import { SeededRNG } from '../../simulation/prng';
import { soundEffects } from '../../utils/audio';

interface ChestUnboxerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: RewardItem[];
  onRewardWon?: (rewardId: string) => void;
  onLogChestsToTracker?: (chestsOpened: number, rewardsWon: string[]) => void;
}

export const ChestUnboxerModal: React.FC<ChestUnboxerModalProps> = ({
  isOpen,
  onClose,
  rewards,
  onRewardWon,
  onLogChestsToTracker,
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [openedCount, setOpenedCount] = useState(0);
  const [exactChestsInput, setExactChestsInput] = useState<number>(10);
  const [lastDrops, setLastDrops] = useState<RewardItem[]>([]);
  const [history, setHistory] = useState<{ reward: RewardItem; chestNum: number }[]>([]);
  const [multiplier, setMultiplier] = useState(1.0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastBatchSummary, setLastBatchSummary] = useState<{
    batchSize: number;
    drops: RewardItem[];
  } | null>(null);

  // Keyboard shortcut listener: Space or Enter to open, Esc to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.code === 'Space' && !isOpening) {
        // Prevent default spacebar scrolling
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          e.preventDefault();
          handleOpenExact(1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isOpening]);

  if (!isOpen) return null;

  const handleOpenExact = (amount: number) => {
    if (isOpening || amount <= 0) return;
    setIsOpening(true);
    setLastBatchSummary(null);

    soundEffects.playChestOpen(soundEnabled);

    const mults: Record<string, number> = {
      pirate_shop: multiplier,
      golden_skin: multiplier,
      vehicle_decal: multiplier,
      pickaxe_backpack: 1.0,
      jam_track: 1.0,
      loading_screen: 1.0,
      gizmo: 1.0,
    };

    const activeProbs = getEffectiveProbabilities(rewards, mults, new Set(), 'categorical', 'drop');
    const rng = new SeededRNG();
    const batchDrops: { reward: RewardItem; chestNum: number }[] = [];
    const rewardIdsWon: string[] = [];

    for (let i = 1; i <= amount; i++) {
      const won = drawSingleChest(activeProbs, 'categorical', () => rng.next());
      won.forEach((item) => {
        batchDrops.push({ reward: item, chestNum: openedCount + i });
        rewardIdsWon.push(item.id);
        if (onRewardWon) onRewardWon(item.id);
      });
    }

    const duration = amount === 1 ? 550 : Math.min(1000, 300 + amount * 3);

    setTimeout(() => {
      setOpenedCount((prev) => prev + amount);
      const dropsOnly = batchDrops.map((b) => b.reward);
      setLastDrops(dropsOnly);
      setLastBatchSummary({ batchSize: amount, drops: dropsOnly });

      if (batchDrops.length > 0) {
        setHistory((prev) => [...batchDrops, ...prev].slice(0, 30));
        soundEffects.playRareDrop(soundEnabled);

        // Confetti explosion
        confetti({
          particleCount: Math.min(150, 40 + batchDrops.length * 20),
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#eab308', '#ec4899', '#38bdf8', '#8b5cf6'],
        });
      }

      setIsOpening(false);
    }, duration);
  };

  const handleResetSession = () => {
    setOpenedCount(0);
    setLastDrops([]);
    setHistory([]);
    setLastBatchSummary(null);
  };

  const handleLogToTracker = () => {
    if (onLogChestsToTracker && openedCount > 0) {
      const allWonIds = history.map((h) => h.reward.id);
      onLogChestsToTracker(openedCount, allWonIds);
      handleResetSession();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden max-h-[92vh] flex flex-col justify-between">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-xl font-gaming font-bold text-amber-300">
              Simulador Visual de Cofres
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title={soundEnabled ? 'Silenciar efectos' : 'Activar efectos de sonido'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Center Content */}
        <div className="overflow-y-auto pr-1 my-3 space-y-4">
          {/* Animated Chest Stage */}
          <div className="relative flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-b from-slate-950/80 to-slate-900/90 rounded-xl border border-slate-800 shadow-inner">
            <div
              className={`transition-all duration-300 transform ${
                isOpening ? 'scale-110 rotate-3 animate-bounce' : 'scale-100 hover:scale-105'
              }`}
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-700 via-amber-500 to-yellow-300 p-1 shadow-gold-glow flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-xl flex flex-col items-center justify-center border border-amber-400/50">
                  <Box className={`w-12 h-12 ${isOpening ? 'text-yellow-300 animate-spin' : 'text-amber-400'}`} />
                  <span className="text-[9px] font-bold text-amber-300 uppercase mt-1">
                    {isOpening ? 'Abriendo...' : 'Cofre del Tesoro'}
                  </span>
                </div>
              </div>
            </div>

            {/* Results Reveal Area */}
            <div className="mt-3 min-h-[44px] flex flex-col items-center justify-center text-center">
              {lastDrops.length > 0 ? (
                <div className="space-y-1 animate-scaleUp">
                  {lastDrops.slice(0, 4).map((drop, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Badge variant="rarity" rarity={drop.rarity}>{drop.rarity}</Badge>
                      <span className="text-sm font-bold text-amber-300 font-gaming">
                        {drop.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        (1/{drop.baseDenominator.toLocaleString('es-ES')})
                      </span>
                    </div>
                  ))}
                  {lastDrops.length > 4 && (
                    <span className="text-xs text-amber-400 font-semibold block">
                      + y {lastDrops.length - 4} recompensas más en esta apertura
                    </span>
                  )}
                </div>
              ) : lastBatchSummary && lastBatchSummary.drops.length === 0 ? (
                <div className="text-xs text-slate-500 italic">
                  Se abrieron {lastBatchSummary.batchSize.toLocaleString('es-ES')} cofres. Contenían botín común (oro y pociones), sin tesoros especiales.
                </div>
              ) : (
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pulsa <strong>Espacio</strong> para abrir 1 o introduce una cantidad exacta abajo</span>
                </div>
              )}
            </div>
          </div>

          {/* EXACT CHESTS INPUT SECTION */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Abrir Cantidad Exacta de Cofres:
              </span>
              <div className="flex items-center space-x-1.5">
                {[1, 5, 10, 25, 50, 100].map((quick) => (
                  <button
                    key={quick}
                    onClick={() => setExactChestsInput(quick)}
                    className={`px-2 py-0.5 text-[11px] rounded font-semibold transition-colors ${
                      exactChestsInput === quick
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {quick}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={exactChestsInput}
                  onChange={(e) =>
                    setExactChestsInput(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-gaming font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                  placeholder="Número exacto (ej. 47)"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-medium">
                  cofres
                </span>
              </div>

              <button
                onClick={() => handleOpenExact(exactChestsInput)}
                disabled={isOpening}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-gaming font-bold text-base shadow-md hover:shadow-gold-glow active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {isOpening ? 'Abriendo...' : `Abrir ${exactChestsInput.toLocaleString('es-ES')} Cofres`}
              </button>
            </div>
          </div>

          {/* Multiplier and Session Counter */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-3 py-2 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-2">
              <span>Multiplicador:</span>
              {[1.0, 1.5, 2.0].map((m) => (
                <button
                  key={m}
                  onClick={() => setMultiplier(m)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    multiplier === m ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  &times;{m}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span>
                Abiertos en sesión: <strong className="text-amber-400">{openedCount.toLocaleString('es-ES')}</strong>
              </span>
              {openedCount > 0 && (
                <button
                  onClick={handleResetSession}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Reiniciar contador de esta sesión"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* History of Won Drops */}
          {history.length > 0 && (
            <div className="border-t border-slate-800/80 pt-2">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block mb-1.5">
                Historial de Tesoros Conseguidos ({history.length}):
              </span>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-xs">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-1.5 rounded bg-slate-950/50 border border-slate-800 text-slate-300"
                  >
                    <div className="flex items-center space-x-2">
                      <Badge variant="rarity" rarity={h.reward.rarity}>{h.reward.rarity}</Badge>
                      <span className="text-amber-300 font-medium">{h.reward.name}</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">Cofre #{h.chestNum}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        {openedCount > 0 && onLogChestsToTracker && (
          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleLogToTracker}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Guardar estos {openedCount.toLocaleString('es-ES')} cofres en mi Tracker</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
