import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';

interface ResetStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetTrackerOnly: () => void;
  onResetCollectionOnly: () => void;
  onResetAllData: () => void;
  totalLoggedChests: number;
}

export const ResetStatsModal: React.FC<ResetStatsModalProps> = ({
  isOpen,
  onClose,
  onResetTrackerOnly,
  onResetCollectionOnly,
  onResetAllData,
  totalLoggedChests,
}) => {
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = (action: () => void, msg: string) => {
    action();
    setResetSuccessMsg(msg);
    setTimeout(() => {
      setResetSuccessMsg(null);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-rose-400 mb-2">
          <RotateCcw className="w-5 h-5" />
          <h3 className="text-lg font-bold text-slate-100 font-gaming">
            Reiniciar Estadísticas y Datos
          </h3>
        </div>

        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Elige qué estadísticas deseas restablecer. Puedes reiniciar únicamente tus cofres registrados o limpiar todas las configuraciones.
        </p>

        {resetSuccessMsg ? (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center space-x-2 text-sm font-semibold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5" />
            <span>{resetSuccessMsg}</span>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {/* Option 1: Reset Tracker Chets Only */}
            <button
              onClick={() =>
                handleAction(onResetTrackerOnly, '¡Contador de cofres reiniciado a 0!')
              }
              className="w-full flex items-start space-x-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 text-left transition-all"
            >
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-200 font-bold">
                  Reiniciar Solo Cofres y Partidas ({totalLoggedChests.toLocaleString('es-ES')} cofres)
                </strong>
                <span className="text-slate-400 text-[11px]">
                  Pone el contador a 0 y borra el historial de partidas, manteniendo tu colección intacta.
                </span>
              </div>
            </button>

            {/* Option 2: Reset Collection Checkboxes */}
            <button
              onClick={() =>
                handleAction(onResetCollectionOnly, '¡Colección de recompensas reiniciada!')
              }
              className="w-full flex items-start space-x-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 text-left transition-all"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-200 font-bold">
                  Desmarcar Colección de Recompensas
                </strong>
                <span className="text-slate-400 text-[11px]">
                  Vuelve a marcar todos los premios semanales como pendientes.
                </span>
              </div>
            </button>

            {/* Option 3: Full Reset */}
            <button
              onClick={() =>
                handleAction(onResetAllData, '¡Todos los datos se han restablecido de fábrica!')
              }
              className="w-full flex items-start space-x-3 p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-950/40 text-left transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-rose-300 font-bold">
                  Restablecer Todos los Datos de Fábrica
                </strong>
                <span className="text-rose-400/80 text-[11px]">
                  Borra todos los cofres, partidas, marcas de colección, wishlist y configuraciones personalizadas.
                </span>
              </div>
            </button>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

