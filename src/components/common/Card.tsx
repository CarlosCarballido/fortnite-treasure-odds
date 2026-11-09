import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'gold' | 'cyan' | 'purple' | 'none';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  onClick,
}) => {
  let glowStyle = 'border-slate-800/80 shadow-md';
  if (glow === 'gold') {
    glowStyle = 'border-amber-500/40 shadow-gold-glow bg-gradient-to-b from-amber-950/20 to-slate-900/90';
  } else if (glow === 'cyan') {
    glowStyle = 'border-cyan-500/40 shadow-cyan-glow bg-gradient-to-b from-cyan-950/20 to-slate-900/90';
  } else if (glow === 'purple') {
    glowStyle = 'border-purple-500/40 shadow-purple-glow bg-gradient-to-b from-purple-950/20 to-slate-900/90';
  } else {
    glowStyle = 'border-slate-800/80 bg-slate-900/80 hover:border-slate-700/80';
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border backdrop-blur-sm transition-all duration-200 ${glowStyle} ${className}`}
    >
      {children}
    </div>
  );
};

