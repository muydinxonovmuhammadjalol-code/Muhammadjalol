import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Award,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { RankingEntry, Fighter, WeightDivision } from '../types';
import { Language, translations } from '../i18n/translations';

interface RankingsViewProps {
  rankings: RankingEntry[];
  fighters: Fighter[];
  lang: Language;
  onOpenFighter: (id: string) => void;
  onOpenCompare: (id: string) => void;
}

export const RankingsView: React.FC<RankingsViewProps> = ({
  rankings,
  fighters,
  lang,
  onOpenFighter,
  onOpenCompare,
}) => {
  const t = translations[lang];
  const [selectedDivision, setSelectedDivision] = useState<WeightDivision>('Pound-for-Pound');
  const [searchQuery, setSearchQuery] = useState('');

  const divisionsList: WeightDivision[] = [
    'Pound-for-Pound',
    'Heavyweight',
    'Cruiserweight',
    'Light Heavyweight',
    'Super Middleweight',
    'Middleweight',
    'Super Welterweight',
    'Welterweight',
    'Super Lightweight',
    'Lightweight',
    'Super Featherweight',
    'Featherweight',
  ];

  const currentDivisionRankings = useMemo(() => {
    let list = rankings.filter((r) => r.division === selectedDivision);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => {
        const fighter = fighters.find((f) => f.id === r.fighterId);
        return (
          fighter?.name.toLowerCase().includes(q) ||
          fighter?.nationality.toLowerCase().includes(q)
        );
      });
    }

    return list.sort((a, b) => a.position - b.position);
  }, [rankings, selectedDivision, searchQuery, fighters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#1A1D27] pb-6">
        <span className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-semibold">
          Independent Consensus Ratings
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-display tracking-wide text-white mt-1">
          {t.rankingsTitle}
        </h1>
        <p className="text-sm text-[#8E95A5] mt-1">{t.rankingsSub}</p>
      </div>

      {/* Division Selector Pills / Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {divisionsList.map((div) => (
          <button
            key={div}
            onClick={() => setSelectedDivision(div)}
            className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider font-display rounded-lg whitespace-nowrap transition-colors ${
              selectedDivision === div
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'bg-[#141720] text-[#A1A7B5] hover:text-white border border-[#242936]'
            }`}
          >
            {div}
          </button>
        ))}
      </div>

      {/* Search and Methodology Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0E1117] border border-[#1E232E] p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#D4AF37]" />
          <h2 className="text-base font-bold font-display uppercase tracking-wide text-white">
            {selectedDivision} Rankings
          </h2>
          <span className="text-xs text-[#8E95A5]">· Updated October 2026</span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#687082] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter rated contenders..."
            className="w-full bg-[#141720] border border-[#252A38] text-white text-xs rounded-lg pl-8 pr-3 py-2 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#12151D] text-[#8E95A5] uppercase font-mono text-[11px] border-b border-[#1E232E]">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">{t.pos}</th>
                <th className="py-3.5 px-4">{t.fighter}</th>
                <th className="py-3.5 px-4 hidden md:table-cell">{t.country}</th>
                <th className="py-3.5 px-4 font-mono-numbers">{t.record}</th>
                <th className="py-3.5 px-4 text-center">{t.movement}</th>
                <th className="py-3.5 px-4 hidden lg:table-cell font-mono-numbers text-right">
                  Points
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181C25] text-white">
              {currentDivisionRankings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8E95A5]">
                    No ranked fighters listed under {selectedDivision} yet. Check back following sanctioning council updates.
                  </td>
                </tr>
              ) : (
                currentDivisionRankings.map((entry) => {
                  const fighter = fighters.find((f) => f.id === entry.fighterId);
                  if (!fighter) return null;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-[#13161F] transition-colors cursor-pointer group"
                      onClick={() => onOpenFighter(fighter.id)}
                    >
                      {/* Rank Position */}
                      <td className="py-4 px-4 text-center font-mono-numbers font-black text-base text-[#D4AF37]">
                        #{entry.position}
                      </td>

                      {/* Fighter Name & Portrait */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={fighter.portraitUrl}
                            alt={fighter.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover rounded-lg border border-[#262B38] shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-white group-hover:text-[#D4AF37] transition-colors uppercase font-display block truncate">
                              {fighter.name}
                            </span>
                            <span className="text-[11px] text-[#8E95A5] md:hidden block">
                              {fighter.nationality}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Country */}
                      <td className="py-4 px-4 hidden md:table-cell text-[#C5CAD5]">
                        {fighter.nationality}
                      </td>

                      {/* Record */}
                      <td className="py-4 px-4 font-mono-numbers font-semibold">
                        {fighter.wins}-{fighter.losses}-{fighter.draws}{' '}
                        <span className="text-[#8E95A5] text-xs">({fighter.knockouts} KOs)</span>
                      </td>

                      {/* Movement Trend */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {entry.movement === 'up' && (
                            <span className="flex items-center text-xs font-mono text-emerald-400 font-bold">
                              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{Math.max(1, entry.previousPosition - entry.position)}
                            </span>
                          )}
                          {entry.movement === 'down' && (
                            <span className="flex items-center text-xs font-mono text-red-400 font-bold">
                              <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> -{Math.max(1, entry.position - entry.previousPosition)}
                            </span>
                          )}
                          {entry.movement === 'same' && (
                            <span className="flex items-center text-xs font-mono text-[#687082]">
                              <Minus className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {entry.movement === 'new' && (
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded font-bold">
                              NEW
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Points */}
                      <td className="py-4 px-4 hidden lg:table-cell text-right font-mono-numbers text-[#A1A7B5]">
                        {entry.points || 1000}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCompare(fighter.id);
                          }}
                          className="px-2.5 py-1 text-xs text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded font-semibold font-display uppercase"
                        >
                          Compare
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer Notice */}
      <div className="p-4 bg-[#0E1117] border border-[#1E232E] rounded-xl flex items-start gap-3 text-xs text-[#8E95A5]">
        <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t.sampleRankingsNotice} Ratings are computed utilizing consensus algorithm weighting past strength of opposition, title defenses, and active sanctioning committee decisions.
        </p>
      </div>
    </div>
  );
};
