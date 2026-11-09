import React, { useState } from 'react';
import { RewardItem } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import confetti from 'canvas-confetti';
import { X, Sparkles, Box, RefreshCw, Trophy, Crown, Key } from 'lucide-react';
import { drawSingleChest, getEffectiveProbabilities } from '../../math/models';
import { SeededRNG } from '../../simulation/prng';

interface ChestUnboxerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: RewardItem[];
  onRewardWon?: (rewardId: string) => void;
}

export const ChestUnboxerModal: React.FC<ChestUnboxerModalProps> = ({
  isOpen,
  onClose,
  rewards,
  onRewardWon,
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [openedCount, setOpenedCount] = useState(0);
  const [lastDrops, setLastDrops] = useState<RewardItem[]>([]);
  const [history, setHistory] = useState<{ reward: RewardItem; chestNum: number }[]>([]);
  const [multiplier, setMultiplier] = useState(1.0);

  if (!isOpen) return null;

  const handleOpenChest = () => {
    if (isOpening) return;
    setIsOpening(true);

    const nextCount = openedCount + 1;
    setOpenedCount(nextCount);

    // Multipliers map
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
    const won = drawSingleChest(activeProbs, 'categorical', () => rng.next());

    setTimeout(() => {
      setLastDrops(won);
      setIsOpening(false);

      if (won.length > 0) {
        won.forEach((item) => {
          setHistory((prev) => [{ reward: item, chestNum: nextCount }, ...prev.slice(0, 19)]);
          if (onRewardWon) onRewardWon(item.id);
        });

        // Trigger confetti for rare drops
        if (won.some((r) => r.rarity === 'supreme')) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#eab308', '#ec4899', '#38bdf8'],
          });
        }
      }
    }, 700);
  };

  const handleOpenBatch = (amount: number) => {
    if (isOpening) return;
    setIsOpening(true);

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
    const allWon: { reward: RewardItem; chestNum: number }[] = [];

    for (let i = 1; i <= amount; i++) {
      const won = drawSingleChest(activeProbs, 'categorical', () => rng.next());
      won.forEach((item) => {
        allWon.push({ reward: item, chestNum: openedCount + i });
        if (onRewardWon) onRewardWon(item.id);
      });
    }

    setTimeout(() => {
      setOpenedCount((prev) => prev + amount);
      if (allWon.length > 0) {
        setLastDrops(allWon.map((w) => w.reward));
        setHistory((prev) => [...allWon, ...prev].slice(0, 20));
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
        });
      } else {
        setLastDrops([]);
      }
      setIsOpening(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulador Visual Interactivo</span>
          </div>
          <h3 className="text-2xl font-gaming font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400">
            Apertura de Cofre Cazatesoros
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Simulación basada en las tasas de referencia 1/137.500 y multiplicadores.
          </p>
        </div>

        {/* Chest Display Box */}
        <div className="relative flex flex-col items-center justify-center py-8 px-4 bg-gradient-to-b from-slate-950/80 to-slate-900/90 rounded-xl border border-slate-800 shadow-inner mb-6">
          <div
            className={`transition-all duration-300 transform ${
              isOpening ? 'scale-110 rotate-2 animate-bounce' : 'scale-100 hover:scale-105'
            }`}
          >
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-amber-700 via-amber-500 to-yellow-300 p-1 shadow-gold-glow flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-xl flex flex-col items-center justify-center border border-amber-400/50">
                <Box className={`w-14 h-14 ${isOpening ? 'text-yellow-300 animate-spin' : 'text-amber-400'}`} />
                <span className="text-[10px] font-bold text-amber-300 uppercase mt-1">
                  {isOpening ? 'Abriendo...' : 'Cofre Legendario'}
                </span>
              </div>
            </div>
          </div>

          {/* Loot Reveal Area */}
          <div className="mt-4 min-h-[50px] flex flex-col items-center justify-center text-center">
            {lastDrops.length > 0 ? (
              <div className="space-y-1 animate-scaleUp">
                {lastDrops.map((drop, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Badge variant="rarity" rarity={drop.rarity}>{drop.rarity}</Badge>
                    <span className="text-sm font-bold text-amber-300 font-gaming">
                      {drop.name}
                    </span>
                    <span className="text-xs text-slate-400">(1/{drop.baseDenominator.toLocaleString('es-ES')})</span>
                  </div>
                ))}
              </div>
            ) : openedCount > 0 && !isOpening ? (
              <div className="text-xs text-slate-500 italic">
                El cofre contenía botín común (Munición, Oro y Pociones). Sin tesoro especial.
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Haz clic en "Abrir Cofre" para probar tu suerte
              </div>
            )}
          </div>
        </div>

        {/* Buttons / Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <button
            onClick={handleOpenChest}
            disabled={isOpening}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-gaming text-lg font-bold shadow-lg hover:shadow-gold-glow transition-all active:scale-95 disabled:opacity-50"
          >
            {isOpening ? 'Abriendo cofre...' : 'Abrir 1 Cofre'}
          </button>
          <button
            onClick={() => handleOpenBatch(10)}
            disabled={isOpening}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
          >
            Abrir 10
          </button>
          <button
            onClick={() => handleOpenBatch(100)}
            disabled={isOpening}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
          >
            Abrir 100
          </button>
        </div>

        {/* Bonus Selector */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2 py-2 bg-slate-950/60 rounded-lg border border-slate-800 mb-4">
          <span>Multiplicador activo:</span>
          <div className="flex space-x-1.5">
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
          <span>Total abiertos: <strong>{openedCount.toLocaleString('es-ES')}</strong></span>
        </div>

        {/* History Log */}
        {history.length > 0 && (
          <div className="border-t border-slate-800/80 pt-3">
            <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block mb-2">
              Historial de Tesoros Obtenidos ({history.length}):
            </span>
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-950/40 border border-slate-800 text-slate-300"
                >
                  <span className="text-amber-300 font-medium">{h.reward.name}</span>
                  <span className="text-slate-500 text-[11px]">Cofre #{h.chestNum}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

