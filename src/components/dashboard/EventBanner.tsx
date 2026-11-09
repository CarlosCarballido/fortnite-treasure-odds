import React from 'react';
import { Calendar, Clock, Crown, Car, Shield, Sparkles } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { EVENT_DATES } from '../../config/constants';

export const EventBanner: React.FC = () => {
  // Current reference date: Nov 9, 2026
  const week2End = new Date(EVENT_DATES.week2.end);
  const now = new Date(EVENT_DATES.referenceDate);
  const diffDays = Math.ceil((week2End.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-[#0e172e] to-slate-900 border-amber-500/20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Rotación en curso &middot; Semana 2 (8–15 nov 2026)
            </span>
            <Badge variant="source" source="public_data">Dato Público</Badge>
          </div>
          <h1 className="text-lg sm:text-xl font-gaming font-bold text-slate-100 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            Solid Gold Lil Uzi Vert &amp; Cadillac CT5-V Blackwing Dorado
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Fecha de referencia: 9 de noviembre de 2026
            </span>
            <span className="flex items-center gap-1 text-amber-300/90 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Quedan ~{diffDays} días para la Semana 3
            </span>
          </p>
        </div>

        {/* Right Active Items Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-amber-500/30 text-amber-300">
            <Crown className="w-3.5 h-3.5" />
            <span className="font-semibold">Lil Uzi: 1/1.562.500</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-amber-500/30 text-amber-300">
            <Car className="w-3.5 h-3.5" />
            <span className="font-semibold">Cadillac: 1/7.813</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-700 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mochila: 1/568</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

