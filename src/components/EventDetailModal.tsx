import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Tv, Ticket, Shield, Clock, Bookmark, Share2, Check } from 'lucide-react';
import { BoxingEvent, Fighter } from '../types';
import { Language, translations } from '../i18n/translations';

interface EventDetailModalProps {
  event: BoxingEvent | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  fighters: Fighter[];
  onSelectFighter: (id: string) => void;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  lang,
  fighters,
  onSelectFighter,
  isFavorited,
  onToggleFavorite,
}) => {
  const t = translations[lang];
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number }>({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!event) return;
    const calculateCountdown = () => {
      const target = new Date(event.date).getTime();
      const current = Date.now();
      const diff = Math.max(0, target - current);

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (!isOpen || !event) return null;

  const f1 = fighters.find((f) => f.id === event.mainEvent.fighter1Id);
  const f2 = fighters.find((f) => f.id === event.mainEvent.fighter2Id);

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('event', event.slug);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[#0D0F14] border border-[#252A36] rounded-xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E232E] bg-[#12151D]">
          <div className="flex items-center gap-3">
            <span
              className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                event.status === 'upcoming'
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                  : event.status === 'live'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {event.status === 'upcoming' ? t.scheduled : event.status === 'live' ? t.liveNow : t.filterCompleted}
            </span>
            <span className="text-xs text-[#8E95A5] hidden sm:inline">
              {event.weightDivision} Championship
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(event.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
                isFavorited
                  ? 'bg-[#D4AF37] text-black font-semibold'
                  : 'bg-[#181B24] border border-[#262C3A] text-[#C5CAD5] hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>{isFavorited ? t.favorited : t.favorite}</span>
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-[#8E95A5] hover:text-white hover:bg-[#1E232E] rounded transition-colors"
              title="Share event"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8E95A5] hover:text-white hover:bg-[#1E232E] rounded transition-colors"
              aria-label={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative bg-[#10131A] overflow-hidden border-b border-[#1E232E]">
          <img
            src={event.posterUrl}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="w-full h-48 sm:h-64 object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F14] via-[#0D0F14]/70 to-transparent flex flex-col justify-end p-6 sm:p-8">
            <span className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-semibold">
              {event.subtitle || 'World Boxing Championship'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display uppercase tracking-wide text-white mt-1">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#C5CAD5] mt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                {new Date(event.date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                {event.venue}, {event.city}, {event.country}
              </span>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Countdown Clock for upcoming events */}
          {event.status === 'upcoming' && (
            <div className="bg-[#141722] border border-[#232938] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <h4 className="text-xs uppercase font-semibold text-white tracking-wider">
                    Official Countdown to Bell Time
                  </h4>
                  <p className="text-xs text-[#8E95A5]">Ring walks scheduled to begin at 22:00 local arena time</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono-numbers">
                <div className="bg-[#1B202D] px-3 py-1.5 rounded text-center min-w-[50px] border border-[#282F3E]">
                  <span className="text-lg font-bold text-white block">{timeLeft.d}</span>
                  <span className="text-[10px] text-[#8E95A5] uppercase">{t.days}</span>
                </div>
                <span className="text-[#D4AF37] font-bold">:</span>
                <div className="bg-[#1B202D] px-3 py-1.5 rounded text-center min-w-[50px] border border-[#282F3E]">
                  <span className="text-lg font-bold text-white block">{timeLeft.h}</span>
                  <span className="text-[10px] text-[#8E95A5] uppercase">{t.hours}</span>
                </div>
                <span className="text-[#D4AF37] font-bold">:</span>
                <div className="bg-[#1B202D] px-3 py-1.5 rounded text-center min-w-[50px] border border-[#282F3E]">
                  <span className="text-lg font-bold text-white block">{timeLeft.m}</span>
                  <span className="text-[10px] text-[#8E95A5] uppercase">{t.minutes}</span>
                </div>
                <span className="text-[#D4AF37] font-bold">:</span>
                <div className="bg-[#1B202D] px-3 py-1.5 rounded text-center min-w-[50px] border border-[#282F3E]">
                  <span className="text-lg font-bold text-white block">{timeLeft.s}</span>
                  <span className="text-[10px] text-[#8E95A5] uppercase">{t.seconds}</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Event Showcase */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37]">
                {t.mainEvent} — {event.mainEvent.beltName || 'World Title Bout'}
              </h3>
              <span className="text-xs text-[#8E95A5] font-mono-numbers">
                {event.mainEvent.scheduledRounds} Scheduled Rounds
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fighter 1 */}
              {f1 && (
                <div
                  onClick={() => {
                    onSelectFighter(f1.id);
                    onClose();
                  }}
                  className="flex items-center gap-4 bg-[#141720] border border-red-500/30 hover:border-red-500 p-4 rounded-xl cursor-pointer transition-colors"
                >
                  <img
                    src={f1.portraitUrl}
                    alt={f1.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover rounded-lg border border-red-500/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase text-red-400 font-semibold">
                      Red Corner
                    </span>
                    <h4 className="text-base font-bold uppercase text-white truncate font-display">
                      {f1.name}
                    </h4>
                    <p className="text-xs text-[#8E95A5] truncate">{f1.nationality}</p>
                    <span className="text-xs font-mono-numbers text-[#D4AF37]">
                      {f1.wins}-{f1.losses}-{f1.draws} ({f1.knockouts} KOs)
                    </span>
                  </div>
                </div>
              )}

              {/* Fighter 2 */}
              {f2 && (
                <div
                  onClick={() => {
                    onSelectFighter(f2.id);
                    onClose();
                  }}
                  className="flex items-center gap-4 bg-[#141720] border border-blue-500/30 hover:border-blue-500 p-4 rounded-xl cursor-pointer transition-colors"
                >
                  <img
                    src={f2.portraitUrl}
                    alt={f2.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover rounded-lg border border-blue-500/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold">
                      Blue Corner
                    </span>
                    <h4 className="text-base font-bold uppercase text-white truncate font-display">
                      {f2.name}
                    </h4>
                    <p className="text-xs text-[#8E95A5] truncate">{f2.nationality}</p>
                    <span className="text-xs font-mono-numbers text-[#D4AF37]">
                      {f2.wins}-{f2.losses}-{f2.draws} ({f2.knockouts} KOs)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Completed Event Result if any */}
            {event.mainEvent.result && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-semibold text-center">
                Official Result: {event.mainEvent.result}
              </div>
            )}
          </div>

          {/* Undercard bouts */}
          {event.undercard.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-[#A1A7B5]">
                {t.undercard}
              </h3>
              <div className="space-y-2">
                {event.undercard.map((bout) => {
                  const b1 = fighters.find((f) => f.id === bout.fighter1Id);
                  const b2 = fighters.find((f) => f.id === bout.fighter2Id);
                  return (
                    <div
                      key={bout.id}
                      className="p-3 bg-[#13161F] border border-[#202532] rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[#8E95A5] font-mono">{bout.division}</span>
                        <span className="font-semibold text-white">
                          {b1 ? b1.name : 'Contender A'} <span className="text-[#D4AF37]">vs</span>{' '}
                          {b2 ? b2.name : 'Contender B'}
                        </span>
                      </div>
                      <span className="text-[#8E95A5] font-mono-numbers">
                        {bout.scheduledRounds} Rounds
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description & Broadcast details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#1E232E] text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-white block">Official Broadcast</span>
              <p className="text-[#A1A7B5]">{event.broadcastChannel}</p>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-white block">Sanctioning Body</span>
              <p className="text-[#A1A7B5]">{event.officialSource}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
