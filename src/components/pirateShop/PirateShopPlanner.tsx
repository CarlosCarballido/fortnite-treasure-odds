import React, { useState } from 'react';
import { PirateShopPlan, WishlistItem } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Key,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  AlertTriangle,
  ShoppingBag,
  Coins,
  ShieldAlert,
} from 'lucide-react';

interface PirateShopPlannerProps {
  plan: PirateShopPlan;
  onUpdatePlan: (updatedPlan: PirateShopPlan) => void;
}

export const PirateShopPlanner: React.FC<PirateShopPlannerProps> = ({
  plan,
  onUpdatePlan,
}) => {
  // Local state for activation date 1 (2026) and 2 (2027)
  const [activationDate1, setActivationDate1] = useState<string>(
    plan.activationDate1 || '2026-11-15'
  );
  const [activationDate2, setActivationDate2] = useState<string>(
    plan.activationDate2 || '2027-06-01'
  );

  // New wishlist item form
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(1500);
  const [newItemCategory, setNewItemCategory] = useState<'skin' | 'pickaxe' | 'emote' | 'wrap' | 'bundle'>('skin');

  // Calculate 14-day window end dates
  const calculateWindowDates = (startDateStr: string) => {
    const start = new Date(startDateStr);
    const end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
    return { start, end };
  };

  const window1 = calculateWindowDates(activationDate1);
  const window2 = calculateWindowDates(activationDate2);

  // Wishlist calculations
  const wishlist = plan.wishlist || [];
  const totalVbucks = wishlist.reduce((sum, item) => sum + item.vbucksPrice, 0);
  const totalEuroValue = ((totalVbucks / 1000) * 8.99).toFixed(2); // approximate 1,000 paVos = €8.99

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: WishlistItem = {
      id: `wish-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      vbucksPrice: Math.max(0, newItemPrice),
      isEligible: true,
    };

    const updated = {
      ...plan,
      wishlist: [...wishlist, newItem],
    };
    onUpdatePlan(updated);
    setNewItemName('');
  };

  const handleDeleteItem = (id: string) => {
    const updated = {
      ...plan,
      wishlist: wishlist.filter((item) => item.id !== id),
    };
    onUpdatePlan(updated);
  };

  const handleToggleEligible = (id: string) => {
    const updated = {
      ...plan,
      wishlist: wishlist.map((item) =>
        item.id === id ? { ...item, isEligible: !item.isEligible } : item
      ),
    };
    onUpdatePlan(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-gaming font-bold text-slate-100 flex items-center gap-2">
          <Key className="w-6 h-6 text-amber-400" />
          Planificador de Activación y Valor de la Tienda Pirata
        </h2>
        <p className="text-xs text-slate-400">
          Modela las dos ventanas de 14 días (2026 y 2027) y calcula el ahorro potencial en paVos (V-Bucks) para cosméticos elegibles.
        </p>
      </div>

      {/* Rules & Exclusions Disclaimer Card */}
      <Card className="p-4 bg-slate-900/90 border-amber-500/30">
        <div className="flex items-start space-x-3 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-slate-300">
            <strong className="text-amber-300">
              Condiciones y Exclusiones Reportadas (Sujetas a Verificación en el Juego):
            </strong>
            <p className="text-slate-400 leading-relaxed">
              La ficha de acceso concede <strong>dos ventanas de 14 días</strong> para reclamar cosméticos estándar que
              cuesten paVos en la tienda diaria.
              <span className="text-rose-400 font-semibold block mt-0.5">
                NO están incluidos: paquetes de dinero real, regalos a terceros, niveles del Pase de Batalla, suscripciones al Club de Fortnite ni restricciones específicas sobre Compañeros (Sidekicks).
              </span>
            </p>
          </div>
        </div>
      </Card>

      {/* 2 Activation Windows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Window 1: 2026 */}
        <Card glow="gold" className="p-5 bg-slate-900/90">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-slate-100 text-sm">Ventana 1 &middot; Año 2026</h3>
            </div>
            <Badge variant="source" source="third_party">Reportado</Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Fecha hipotética de activación:
              </label>
              <input
                type="date"
                value={activationDate1}
                onChange={(e) => {
                  setActivationDate1(e.target.value);
                  onUpdatePlan({ ...plan, activationDate1: e.target.value });
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Inicio:</span>
                <strong className="text-slate-200">
                  {window1.start.toLocaleDateString('es-ES', { dateStyle: 'long' })}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Finalización (14 días):</span>
                <strong className="text-amber-400">
                  {window1.end.toLocaleDateString('es-ES', { dateStyle: 'long' })}
                </strong>
              </div>
            </div>

            {/* 14 Days Visual Mini-Calendar */}
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                Calendario de los 14 días:
              </span>
              <div className="grid grid-cols-7 gap-1 text-center font-gaming text-xs">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-1.5 rounded bg-slate-800/60 border border-slate-700 text-slate-300 font-bold"
                  >
                    Día {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Window 2: 2027 */}
        <Card className="p-5 bg-slate-900/90 border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-slate-100 text-sm">Ventana 2 &middot; Año 2027</h3>
            </div>
            <Badge variant="source" source="third_party">Reportado</Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Fecha hipotética de activación (2027):
              </label>
              <input
                type="date"
                value={activationDate2}
                onChange={(e) => {
                  setActivationDate2(e.target.value);
                  onUpdatePlan({ ...plan, activationDate2: e.target.value });
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Inicio:</span>
                <strong className="text-slate-200">
                  {window2.start.toLocaleDateString('es-ES', { dateStyle: 'long' })}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Finalización (14 días):</span>
                <strong className="text-purple-300">
                  {window2.end.toLocaleDateString('es-ES', { dateStyle: 'long' })}
                </strong>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                Calendario de los 14 días (2027):
              </span>
              <div className="grid grid-cols-7 gap-1 text-center font-gaming text-xs">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-1.5 rounded bg-slate-800/60 border border-slate-700 text-slate-300 font-bold"
                  >
                    Día {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Wishlist & V-Bucks Valuation */}
      <Card className="p-5 bg-slate-900/90 border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              Lista de Deseos y Valor Total en paVos Reclamables
            </h3>
            <p className="text-xs text-slate-400">
              Añade los cosméticos que te gustaría canjear durante los 14 días para calcular el valor total obtenido.
            </p>
          </div>

          {/* Total Value Pill */}
          <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-medium">Valor Total Wishlist</span>
              <strong className="text-amber-400 font-gaming text-lg font-bold">
                {totalVbucks.toLocaleString('es-ES')} paVos (~€{totalEuroValue})
              </strong>
            </div>
          </div>
        </div>

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4 text-xs">
          <input
            type="text"
            placeholder="Nombre del cosmético (Ej. Goku, Leviathan Axe)"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="sm:col-span-2 bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
            required
          />
          <input
            type="number"
            step="100"
            min="100"
            max="10000"
            placeholder="Precio en paVos"
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(parseInt(e.target.value) || 0)}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
            required
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Objeto</span>
          </button>
        </form>

        {/* Wishlist Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2">Cosmético</th>
                <th className="py-2">Categoría</th>
                <th className="py-2 text-right">Precio paVos</th>
                <th className="py-2 text-center">Elegibilidad</th>
                <th className="py-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {wishlist.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="py-2 font-medium text-slate-200">{item.name}</td>
                  <td className="py-2 capitalize text-slate-400">{item.category}</td>
                  <td className="py-2 text-right font-gaming font-bold text-amber-300">
                    {item.vbucksPrice.toLocaleString('es-ES')} V
                  </td>
                  <td className="py-2 text-center">
                    <button
                      onClick={() => handleToggleEligible(item.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.isEligible
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {item.isEligible ? 'Elegible' : 'Excluido'}
                    </button>
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

