import React from 'react';
import { Sparkles, Globe, Sun, Moon, Database, Box, HelpCircle } from 'lucide-react';
import { UserSettings } from '../../storage/localStorage';
import { DICTIONARY } from '../../config/locales';

interface NavbarProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenChestGame: () => void;
  onOpenBackupModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onUpdateSettings,
  activeTab,
  onSelectTab,
  onOpenChestGame,
  onOpenBackupModal,
}) => {
  const dict = DICTIONARY[settings.lang];

  const navItems = [
    { id: 'dashboard', label: dict.tabs.dashboard },
    { id: 'calculator', label: dict.tabs.calculator },
    { id: 'simulator', label: dict.tabs.simulator },
    { id: 'squad', label: dict.tabs.squad },
    { id: 'planner', label: dict.tabs.planner },
    { id: 'inverse', label: dict.tabs.inverse },
    { id: 'tracker', label: dict.tabs.tracker },
    { id: 'collection', label: dict.tabs.collection },
    { id: 'pirateShop', label: dict.tabs.pirateShop },
    { id: 'sources', label: dict.tabs.sources },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070c18]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Event Tag */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 flex items-center justify-center shadow-gold-glow">
              <Sparkles className="w-6 h-6 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-gaming text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
                  FORTNITE TREASURE ODDS
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Semana 2 Activa
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Simulador Independiente Cazatesoros &middot; 9 nov 2026
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Interactive Chest Minigame Button */}
            <button
              onClick={onOpenChestGame}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-semibold text-xs shadow-md hover:from-amber-500 hover:to-yellow-400 transition-all transform active:scale-95"
              title="Abrir cofre interactivo"
            >
              <Box className="w-4 h-4" />
              <span className="hidden sm:inline">Simular Cofre</span>
            </button>

            {/* Backup / Export / Import */}
            <button
              onClick={onOpenBackupModal}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors"
              title="Copia de seguridad / Datos"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => onUpdateSettings({ lang: settings.lang === 'es' ? 'en' : 'es' })}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold uppercase"
              title="Cambiar idioma / Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings.lang}</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors"
              title="Tema"
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 pt-1 scrollbar-none border-t border-slate-800/50">
          {navItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

