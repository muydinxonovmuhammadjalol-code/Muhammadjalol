import React, { useState } from 'react';
import { X, Bookmark, Share2, Award, Shield, Check, Calendar, MapPin, Zap, Flame, ExternalLink, ArrowRightLeft } from 'lucide-react';
import { Fighter } from '../types';
import { Language, translations } from '../i18n/translations';

interface FighterProfileModalProps {
  fighter: Fighter | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenCompare: (fighterId: string) => void;
  allFighters: Fighter[];
  onSelectFighter: (id: string) => void;
}

export const FighterProfileModal: React.FC<FighterProfileModalProps> = ({
  fighter,
  isOpen,
  onClose,
  lang,
  isFavorited,
  onToggleFavorite,
  onOpenCompare,
  allFighters,
  onSelectFighter,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'fights' | 'stats'>('overview');

  if (!isOpen || !fighter) return null;

  const koPercent = fighter.wins > 0 ? Math.round((fighter.knockouts / fighter.wins) * 100) : 0;

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('fighter', fighter.slug);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const relatedFighters = allFighters
    .filter((f) => f.id !== fighter.id && (f.division === fighter.division || f.nationality === fighter.nationality))
    .slice(0, 3);

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
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E232E] bg-[#12151D]">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-mono text-[#D4AF37]">
              {fighter.division} · #{fighter.ranking} World
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(fighter.id)}
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
              title="Share profile"
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

        {/* Hero Banner with Portrait */}
        <div className="relative bg-[#10131A] p-6 sm:p-8 border-b border-[#1E232E]">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative shrink-0">
              <img
                src={fighter.portraitUrl}
                alt={fighter.name}
                referrerPolicy="no-referrer"
                className="w-32 h-44 sm:w-40 sm:h-52 object-cover rounded-lg border border-[#2D3342] shadow-xl"
              />
              <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-[11px] font-mono-numbers px-2 py-0.5 rounded text-[#D4AF37] border border-[#D4AF37]/30">
                {fighter.status}
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              {fighter.nickname && (
                <span className="text-sm font-semibold tracking-wider uppercase text-[#D4AF37] font-display">
                  "{fighter.nickname}"
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display uppercase tracking-wide text-white">
                {fighter.name}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-[#8E95A5] mt-1">
                <span>{fighter.nationality}</span>
                <span>·</span>
                <span>{fighter.division}</span>
                <span>·</span>
                <span>{fighter.stance}</span>
                <span>·</span>
                <span>Age {fighter.age}</span>
              </div>

              {/* Record Callout */}
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-4 py-2 px-3 bg-[#171B24] rounded-lg border border-[#252B38] w-fit mx-auto sm:mx-0">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8E95A5] block">
                    Record
                  </span>
                  <span className="text-lg font-bold font-mono-numbers text-white">
                    {fighter.wins}-{fighter.losses}-{fighter.draws}
                  </span>
                </div>
                <div className="w-[1px] h-7 bg-[#252B38]" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8E95A5] block">
                    Knockouts
                  </span>
                  <span className="text-lg font-bold font-mono-numbers text-red-400">
                    {fighter.knockouts} <span className="text-xs text-[#8E95A5]">({koPercent}%)</span>
                  </span>
                </div>
                <div className="w-[1px] h-7 bg-[#252B38]" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8E95A5] block">
                    Ranking
                  </span>
                  <span className="text-lg font-bold font-mono-numbers text-[#D4AF37]">
                    #{fighter.ranking}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                <button
                  onClick={() => {
                    onOpenCompare(fighter.id);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs rounded transition-colors uppercase tracking-wider font-display"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Compare With Another Fighter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-6 px-6 bg-[#11141C] border-b border-[#1E232E] text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#D4AF37] text-white'
                : 'border-transparent text-[#8E95A5] hover:text-white'
            }`}
          >
            Overview & Bio
          </button>
          <button
            onClick={() => setActiveTab('fights')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'fights'
                ? 'border-[#D4AF37] text-white'
                : 'border-transparent text-[#8E95A5] hover:text-white'
            }`}
          >
            Fight History ({fighter.recentFights.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-[#D4AF37] text-white'
                : 'border-transparent text-[#8E95A5] hover:text-white'
            }`}
          >
            Physical Analytics
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Physical specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#131721] p-4 rounded-xl border border-[#202532]">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8E95A5] block">
                    Height
                  </span>
                  <span className="text-sm font-semibold font-mono-numbers text-white">
                    {fighter.height}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8E95A5] block">
                    Reach
                  </span>
                  <span className="text-sm font-semibold font-mono-numbers text-white">
                    {fighter.reach}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8E95A5] block">
                    Stance
                  </span>
                  <span className="text-sm font-semibold text-white">{fighter.stance}</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8E95A5] block">
                    Born
                  </span>
                  <span className="text-sm font-semibold font-mono-numbers text-white">
                    {fighter.birthDate}
                  </span>
                </div>
              </div>

              {/* World Titles */}
              {fighter.titles && fighter.titles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Sanctioned Championship Belts
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {fighter.titles.map((title, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-[#1A1F2B] border border-[#2E3646] px-3 py-1.5 rounded-lg text-white font-medium flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Biography */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A7B5]">
                  Career Dossier
                </h3>
                <p className="text-sm leading-relaxed text-[#C5CAD5] whitespace-pre-line">
                  {fighter.biography}
                </p>
              </div>

              {/* Related Fighters */}
              {relatedFighters.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-[#1E232E]">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A7B5]">
                    Contenders in Same Division / Region
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {relatedFighters.map((rf) => (
                      <div
                        key={rf.id}
                        onClick={() => onSelectFighter(rf.id)}
                        className="flex items-center gap-3 p-3 bg-[#13161F] hover:bg-[#1A1E29] border border-[#202532] rounded-lg cursor-pointer transition-colors"
                      >
                        <img
                          src={rf.portraitUrl}
                          alt={rf.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{rf.name}</p>
                          <p className="text-[11px] text-[#8E95A5] truncate font-mono-numbers">
                            {rf.wins}-{rf.losses}-{rf.draws} ({rf.knockouts} KO)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'fights' && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A7B5]">
                Verified Bout History
              </h3>
              <div className="divide-y divide-[#1A1E29] border border-[#202532] rounded-xl overflow-hidden bg-[#12151D]">
                {fighter.recentFights.map((fight) => (
                  <div key={fight.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${
                          fight.result === 'W'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : fight.result === 'L'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {fight.result}
                      </span>
                      <div>
                        <span className="text-sm font-bold text-white block">
                          vs {fight.opponent}
                        </span>
                        <span className="text-xs text-[#8E95A5]">
                          {fight.eventTitle} · {fight.date}
                        </span>
                        {fight.notes && (
                          <p className="text-xs text-[#A1A7B5] mt-0.5">{fight.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold font-mono text-white block">
                        {fight.method}
                      </span>
                      <span className="text-[11px] text-[#8E95A5]">Round {fight.round}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A7B5]">
                Kinematic & Athletic Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Concussive Power', val: fighter.physicalStats.power },
                  { label: 'Hand & Foot Speed', val: fighter.physicalStats.speed },
                  { label: 'Defensive Slipping', val: fighter.physicalStats.defense },
                  { label: 'Championship Stamina', val: fighter.physicalStats.stamina },
                  { label: 'Tactical Ring IQ', val: fighter.physicalStats.ringIq },
                  { label: 'Punch Durability (Chin)', val: fighter.physicalStats.chin },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[#13161F] border border-[#202532] rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#C5CAD5] font-medium">{s.label}</span>
                      <span className="font-mono-numbers font-bold text-[#D4AF37]">{s.val}/100</span>
                    </div>
                    <div className="w-full bg-[#1C202B] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#D4AF37] h-full rounded-full transition-all duration-500"
                        style={{ width: `${s.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
