import React from 'react';
import { RarityTier, DataSourceType } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'rarity' | 'source' | 'custom';
  rarity?: RarityTier;
  source?: DataSourceType;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'custom',
  rarity,
  source,
}) => {
  let baseStyle = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ';

  if (variant === 'rarity' && rarity) {
    switch (rarity) {
      case 'supreme':
        baseStyle += 'bg-pink-950/80 text-pink-300 border border-pink-500/50 shadow-sm shadow-pink-500/20';
        break;
      case 'major':
        baseStyle += 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20';
        break;
      case 'standard':
        baseStyle += 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20';
        break;
    }
  } else if (variant === 'source' && source) {
    switch (source) {
      case 'official':
        baseStyle += 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40';
        break;
      case 'third_party':
        baseStyle += 'bg-blue-950/80 text-blue-300 border border-blue-500/40';
        break;
      case 'hypothesis':
        baseStyle += 'bg-purple-950/80 text-purple-300 border border-purple-500/40';
        break;
      case 'user_custom':
        baseStyle += 'bg-orange-950/80 text-orange-300 border border-orange-500/40';
        break;
    }
  } else {
    baseStyle += 'bg-slate-800 text-slate-300 border border-slate-700';
  }

  return <span className={`${baseStyle} ${className}`}>{children}</span>;
};

