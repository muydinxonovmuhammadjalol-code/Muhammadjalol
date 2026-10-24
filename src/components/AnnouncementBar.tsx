import React, { useState, useEffect } from 'react';
import { Trophy, Clock, X, ArrowRight } from 'lucide-react';
import { BoxingEvent } from '../types';
import { Language, translations } from '../i18n/translations';

interface AnnouncementBarProps {
  featuredEvent: BoxingEvent | null;
  onOpenEvent: (id: string) => void;
  lang: Language;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  featuredEvent,
  onOpenEvent,
  lang,
}) => {
  const t = translations[lang];
  const [dismissed, setDismissed] = useState(false);
  const [countdownStr, setCountdownStr] = useState('');

  useEffect(() => {
    if (!featuredEvent) return;
    const updateCountdown = () => {
      const diff = Math.max(0, new Date(featuredEvent.date).getTime() - Date.now());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      setCountdownStr(`${d}d ${h}h ${m}m`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [featuredEvent]);

  if (dismissed || !featuredEvent) return null;

  return (
    <div className="bg-[#12141A] border-b border-[#202430] text-xs text-[#C5CAD5] py-2 px-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0" />
          <span className="font-mono uppercase tracking-wider text-[#D4AF37] font-semibold shrink-0">
            {t.nextTitleFight}:
          </span>
          <span className="font-medium text-white truncate">
            {featuredEvent.title}
          </span>
          <span className="hidden md:inline text-[#8E95A5] shrink-0">
            · {featuredEvent.venue}, {featuredEvent.city}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {countdownStr && (
            <span className="hidden sm:flex items-center gap-1.5 font-mono-numbers text-xs text-white bg-[#1A1D27] px-2.5 py-0.5 rounded border border-[#2B303E]">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              {countdownStr}
            </span>
          )}
          <button
            onClick={() => onOpenEvent(featuredEvent.id)}
            className="flex items-center gap-1 text-[#D4AF37] hover:text-[#E5C158] font-semibold transition-colors"
          >
            <span>{t.viewFightCard}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-[#687082] hover:text-white p-0.5"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
