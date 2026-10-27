import React, { useState } from 'react';
import { Search, Globe, User, Shield, Menu, X, Box, ArrowRight } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  onToggleLang: () => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
  onOpen3D: () => void;
  user: { email: string; name: string; isAdmin?: boolean } | null;
  favoriteCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  lang,
  onToggleLang,
  onOpenSearch,
  onOpenAuth,
  onOpen3D,
  user,
  favoriteCount,
}) => {
  const t = translations[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'fighters', label: t.navFighters },
    { id: 'events', label: t.navEvents },
    { id: 'rankings', label: t.navRankings },
    { id: 'stats', label: t.navStats },
    { id: 'news', label: t.navNews },
    { id: 'training', label: t.navTraining },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090A0C]/95 backdrop-blur-md border-b border-[#1A1D26]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* ZONE 1: Single text element wordmark */}
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2 text-left whitespace-nowrap shrink-0 group focus:outline-none"
          >
            <span className="w-3 h-3 bg-[#D4AF37] transform rotate-45 group-hover:scale-110 transition-transform" />
            <span className="text-xl sm:text-2xl font-black tracking-wider uppercase font-display text-white group-hover:text-[#D4AF37] transition-colors">
              {t.brandTitle}
            </span>
          </button>

          {/* ZONE 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#A1A7B5]">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors uppercase tracking-wider font-display text-sm font-bold ${
                    isActive ? 'text-white' : 'hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ZONE 3: Primary Action & Utilities */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Fight Now Primary Action */}
            <button
              onClick={() => onSelectTab('fight')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-display uppercase tracking-wider text-black bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:scale-105 rounded shadow-md transition-all whitespace-nowrap"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>{t.navFightGame}</span>
            </button>

            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 p-2 text-[#8E95A5] hover:text-white hover:bg-[#151821] rounded-lg transition-colors"
              title="Search (Cmd+K)"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
              <span className="hidden xl:inline text-xs font-mono text-[#687082]">Search</span>
            </button>

            {/* 3D Ring Shortcut */}
            <button
              onClick={onOpen3D}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded transition-colors whitespace-nowrap font-mono"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Arena</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-[#C5CAD5] hover:text-white bg-[#151821] border border-[#242936] rounded transition-colors"
              title="Toggle English / O'zbek"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="uppercase font-bold">{lang}</span>
            </button>

            {/* User Account / Sign In */}
            {user ? (
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap ${
                  currentTab === 'dashboard'
                    ? 'bg-[#D4AF37] text-black font-semibold'
                    : 'bg-[#181B24] border border-[#292F3E] text-white hover:bg-[#202532]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[90px] truncate">{user.name}</span>
                {favoriteCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#D4AF37] text-black text-[10px] font-bold flex items-center justify-center">
                    {favoriteCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 text-xs font-semibold text-black bg-[#D4AF37] hover:bg-[#E5C158] rounded transition-colors whitespace-nowrap uppercase tracking-wider font-display"
              >
                {t.signIn}
              </button>
            )}

            {/* Admin link if user is admin or on click */}
            <button
              onClick={() => onSelectTab('admin')}
              className={`p-2 rounded transition-colors ${
                currentTab === 'admin'
                  ? 'text-[#D4AF37] bg-[#1E232E]'
                  : 'text-[#687082] hover:text-[#C5CAD5]'
              }`}
              title="Admin Console"
              aria-label="Admin Console"
            >
              <Shield className="w-4 h-4" />
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#8E95A5] hover:text-white rounded"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0F1117] border-b border-[#1E232E] px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded text-sm font-bold uppercase tracking-wider font-display flex items-center justify-between ${
                currentTab === item.id
                  ? 'bg-[#181C26] text-[#D4AF37]'
                  : 'text-[#C5CAD5] hover:bg-[#141720]'
              }`}
            >
              <span>{item.label}</span>
              <ArrowRight className="w-4 h-4 text-[#505768]" />
            </button>
          ))}
          <button
            onClick={() => {
              onSelectTab('fight');
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded text-sm font-black uppercase tracking-wider font-display flex items-center justify-between bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-black"
          >
            <span>🥊 {t.fightNowCTA}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="pt-2 border-t border-[#1E232E] flex items-center justify-between">
            <button
              onClick={() => {
                onOpen3D();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs text-[#D4AF37] font-mono py-1"
            >
              <Box className="w-4 h-4" />
              <span>Launch 3D Championship Arena</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
