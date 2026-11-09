import React, { useRef, useState } from 'react';
import { X, Download, Upload, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { exportAllDataAsJSON, exportTrackerAsCSV, importAllDataFromJSON } from '../../storage/exportImport';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importAllDataFromJSON(content);
        if (success) {
          setImportStatus('¡Datos restaurados con éxito!');
          setTimeout(() => {
            onDataRestored();
            onClose();
          }, 1000);
        } else {
          setImportStatus('Error: Archivo de copia de seguridad no válido.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('¿Seguro que deseas reiniciar todos los datos locales y registros? Esta acción no se puede deshacer.')) {
      localStorage.clear();
      onDataRestored();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-100 mb-1">Copia de Seguridad y Datos</h3>
        <p className="text-xs text-slate-400 mb-5">
          Tus datos se guardan exclusivamente en el almacenamiento local de tu navegador.
        </p>

        <div className="space-y-3 text-xs">
          {/* Export JSON */}
          <button
            onClick={exportAllDataAsJSON}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all text-left"
          >
            <div>
              <strong className="text-amber-400 block font-gaming text-sm">Descargar Backup Completo (JSON)</strong>
              <span className="text-slate-400 text-[11px]">Incluye registros, recompensas obtenidas y wishlist</span>
            </div>
            <Download className="w-4 h-4 text-amber-400 shrink-0" />
          </button>

          {/* Export CSV */}
          <button
            onClick={exportTrackerAsCSV}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all text-left"
          >
            <div>
              <strong className="text-emerald-400 block font-gaming text-sm">Exportar Tracker en CSV (Excel)</strong>
              <span className="text-slate-400 text-[11px]">Descarga la tabla de todas tus partidas registradas</span>
            </div>
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
          </button>

          {/* Import JSON */}
          <div className="pt-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-left"
            >
              <div>
                <strong className="text-cyan-400 block font-gaming text-sm">Restaurar Copia de Seguridad</strong>
                <span className="text-slate-400 text-[11px]">Carga un archivo .json exportado previamente</span>
              </div>
              <Upload className="w-4 h-4 text-cyan-400 shrink-0" />
            </button>
          </div>

          {importStatus && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Clear Storage */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Borrar todos los datos locales y restablecer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

