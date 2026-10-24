import React, { useState } from 'react';
import { X, Check, ArrowRightLeft, Shield, Zap, Target, Heart, Award, Copy, CheckCheck } from 'lucide-react';
import { Fighter } from '../types';
import { Language, translations } from '../i18n/translations';

interface FighterCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  fighters: Fighter[];
  initialFighterAId?: string;
  initialFighterBId?: string;
}

export const FighterCompareModal: React.FC<FighterCompareModalProps> = ({
  isOpen,
  onClose,
  lang,
  fighters,
  initialFighterAId,
  initialFighterBId,
}) => {
  const t = translations[lang];
  const [fighterAId, setFighterAId] = useState<string>(initialFighterAId || fighters[0]?.id || '');
  const [fighterBId, setFighterBId] = useState<string>(
    initialFighterBId || (fighters.length > 1 ? fighters[1].id : fighters[0]?.id || '')
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fighterA = fighters.find((f) => f.id === fighterAId);
  const fighterB = fighters.find((f) => f.id === fighterBId);

  const swapFighters = () => {
    const temp = fighterAId;
    setFighterAId(fighterBId);
    setFighterBId(temp);
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('compareA', fighterAId);
    url.searchParams.set('compareB', fighterBId);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const calculateKoPercent = (wins: number, kos: number) => {
    if (wins === 0) return 0;
    return Math.round((kos / wins) * 100);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-[#0D0F14] border border-[#252A36] rounded-xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E232E] bg-[#12151D]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <h2 className="text-xl font-bold tracking-wider uppercase font-display text-white">
                {t.compareTitle}
              </h2>
            </div>
            <p className="text-xs text-[#8E95A5] mt-0.5">{t.compareSub}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#181B24] border border-[#262C3A] text-xs text-[#C5CAD5] hover:text-white transition-colors"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : t.shareComparison}</span>
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

        {/* Fighter Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-6 bg-[#0F1117] border-b border-[#1E232E]">
          {/* Corner A (Red) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-red-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {t.selectFighterA}
            </label>
            <select
              value={fighterAId}
              onChange={(e) => setFighterAId(e.target.value)}
              className="w-full bg-[#171A23] border border-[#292F3E] text-white text-sm rounded-lg px-3 py-2.5 focus:border-red-500 focus:outline-none"
            >
              {fighters.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.division}) — {f.wins}-{f.losses}-{f.draws} ({f.knockouts} KO)
                </option>
              ))}
            </select>
          </div>

          {/* Corner B (Blue) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-semibold text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {t.selectFighterB}
              </label>
              <button
                onClick={swapFighters}
                className="text-xs text-[#8E95A5] hover:text-white flex items-center gap-1 transition-colors"
                title="Swap corners"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Swap
              </button>
            </div>
            <select
              value={fighterBId}
              onChange={(e) => setFighterBId(e.target.value)}
              className="w-full bg-[#171A23] border border-[#292F3E] text-white text-sm rounded-lg px-3 py-2.5 focus:border-blue-500 focus:outline-none"
            >
              {fighters.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.division}) — {f.wins}-{f.losses}-{f.draws} ({f.knockouts} KO)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {fighterA && fighterB ? (
            <>
              {/* Fighter Heads Banner */}
              <div className="grid grid-cols-2 gap-4">
                {/* Fighter A */}
                <div className="flex items-center gap-4 bg-[#141720] border border-red-500/30 p-4 rounded-xl">
                  <img
                    src={fighterA.portraitUrl}
                    alt={fighterA.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-red-500/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-red-400">
                      Red Corner
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold font-display uppercase tracking-wide text-white truncate">
                      {fighterA.name}
                    </h3>
                    <p className="text-xs text-[#8E95A5] truncate">
                      {fighterA.nickname ? `"${fighterA.nickname}" · ` : ''}
                      {fighterA.nationality}
                    </p>
                    <span className="inline-block mt-1 text-xs font-mono-numbers text-[#D4AF37] font-semibold">
                      {fighterA.wins}-{fighterA.losses}-{fighterA.draws} ({fighterA.knockouts} KOs)
                    </span>
                  </div>
                </div>

                {/* Fighter B */}
                <div className="flex items-center gap-4 bg-[#141720] border border-blue-500/30 p-4 rounded-xl">
                  <img
                    src={fighterB.portraitUrl}
                    alt={fighterB.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-blue-500/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400">
                      Blue Corner
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold font-display uppercase tracking-wide text-white truncate">
                      {fighterB.name}
                    </h3>
                    <p className="text-xs text-[#8E95A5] truncate">
                      {fighterB.nickname ? `"${fighterB.nickname}" · ` : ''}
                      {fighterB.nationality}
                    </p>
                    <span className="inline-block mt-1 text-xs font-mono-numbers text-[#D4AF37] font-semibold">
                      {fighterB.wins}-{fighterB.losses}-{fighterB.draws} ({fighterB.knockouts} KOs)
                    </span>
                  </div>
                </div>
              </div>

              {/* Tale of the Tape Specifications Table */}
              <div className="bg-[#12151D] border border-[#202532] rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-[#151922] border-b border-[#202532] text-xs font-semibold uppercase tracking-wider text-[#A1A7B5]">
                  Tale of the Tape Metrics
                </div>

                <div className="divide-y divide-[#1A1E29] text-sm">
                  {/* Division */}
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="text-left font-medium text-white">{fighterA.division}</span>
                    <span className="text-center text-xs uppercase font-mono tracking-wider text-[#8E95A5]">
                      {t.division}
                    </span>
                    <span className="text-right font-medium text-white">{fighterB.division}</span>
                  </div>

                  {/* Height */}
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="text-left font-mono-numbers text-white">{fighterA.height}</span>
                    <span className="text-center text-xs uppercase font-mono tracking-wider text-[#8E95A5]">
                      {t.height}
                    </span>
                    <span className="text-right font-mono-numbers text-white">{fighterB.height}</span>
                  </div>

                  {/* Reach */}
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="text-left font-mono-numbers text-white">{fighterA.reach}</span>
                    <span className="text-center text-xs uppercase font-mono tracking-wider text-[#8E95A5]">
                      {t.reach}
                    </span>
                    <span className="text-right font-mono-numbers text-white">{fighterB.reach}</span>
                  </div>

                  {/* Stance */}
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="text-left text-white">{fighterA.stance}</span>
                    <span className="text-center text-xs uppercase font-mono tracking-wider text-[#8E95A5]">
                      {t.stance}
                    </span>
                    <span className="text-right text-white">{fighterB.stance}</span>
                  </div>

                  {/* Age */}
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="text-left font-mono-numbers text-white">{fighterA.age} yrs</span>
                    <span className="text-center text-xs uppercase font-mono tracking-wider text-[#8E95A5]">
                      Age
                    </span>
                    <span className="text-right font-mono-numbers text-white">{fighterB.age} yrs</span>
                  </div>

                  {/* Knockout % */}
                  <div className="grid grid-cols-3 p-3 items-center">
                    <span className="text-left font-mono-numbers font-semibold text-red-400">
                      {calculateKoPercent(fighterA.wins, fighterA.knockouts)}%
                    </span>
                    <span className="text-center text-xs uppercase font-mono tracking-wider text-[#8E95A5]">
                      {t.koRate}
                    </span>
                    <span className="text-right font-mono-numbers font-semibold text-blue-400">
                      {calculateKoPercent(fighterB.wins, fighterB.knockouts)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical Ratings Bar Comparison */}
              <div className="bg-[#12151D] border border-[#202532] rounded-xl p-4 sm:p-6 space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37] flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  {t.physicalRatings} (Score 1-100)
                </h4>

                {[
                  { label: t.power, key: 'power' as const },
                  { label: t.speed, key: 'speed' as const },
                  { label: t.defense, key: 'defense' as const },
                  { label: t.stamina, key: 'stamina' as const },
                  { label: t.ringIq, key: 'ringIq' as const },
                  { label: t.chin, key: 'chin' as const },
                ].map((stat) => {
                  const valA = fighterA.physicalStats[stat.key];
                  const valB = fighterB.physicalStats[stat.key];
                  return (
                    <div key={stat.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono-numbers font-bold text-red-400">{valA}</span>
                        <span className="text-[#A1A7B5] uppercase tracking-wider font-medium">
                          {stat.label}
                        </span>
                        <span className="font-mono-numbers font-bold text-blue-400">{valB}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 h-2.5">
                        {/* Bar A (right aligned) */}
                        <div className="bg-[#1C202B] rounded-full overflow-hidden flex justify-end">
                          <div
                            className="bg-red-500 rounded-full h-full transition-all duration-500"
                            style={{ width: `${valA}%` }}
                          />
                        </div>
                        {/* Bar B (left aligned) */}
                        <div className="bg-[#1C202B] rounded-full overflow-hidden flex justify-start">
                          <div
                            className="bg-blue-500 rounded-full h-full transition-all duration-500"
                            style={{ width: `${valB}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-xs text-[#687082] pt-2">
                * Note: Ratings are compiled from consensus sports analysts and kinematic fight performance data.
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-[#8E95A5]">
              Please select two active fighters to generate head-to-head metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
