import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Award,
  Globe2,
  Zap,
  Info,
} from 'lucide-react';
import { Fighter, BoxingEvent } from '../types';
import { Language, translations } from '../i18n/translations';

interface StatisticsViewProps {
  fighters: Fighter[];
  events: BoxingEvent[];
  lang: Language;
  onOpenFighter: (id: string) => void;
  onOpenCompare: (id: string) => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  fighters,
  events,
  lang,
  onOpenFighter,
  onOpenCompare,
}) => {
  const t = translations[lang];
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // 1. Division distribution calculation
  const divisionDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    fighters.forEach((f) => {
      counts[f.division] = (counts[f.division] || 0) + 1;
    });
    return Object.entries(counts).map(([division, count]) => ({
      division,
      count,
      percent: fighters.length > 0 ? Math.round((count / fighters.length) * 100) : 0,
    }));
  }, [fighters]);

  // 2. Nationality breakdown
  const nationalityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    fighters.forEach((f) => {
      counts[f.nationality] = (counts[f.nationality] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([nationality, count]) => ({
        nationality,
        count,
        percent: fighters.length > 0 ? Math.round((count / fighters.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [fighters]);

  // 3. Top Knockout Punchers
  const topKoPunchers = useMemo(() => {
    return [...fighters].sort((a, b) => b.knockouts - a.knockouts).slice(0, 6);
  }, [fighters]);

  // 4. Stance distribution (Orthodox vs Southpaw)
  const stanceDistribution = useMemo(() => {
    let orthodox = 0;
    let southpaw = 0;
    fighters.forEach((f) => {
      if (f.stance === 'Southpaw') southpaw++;
      else orthodox++;
    });
    const total = fighters.length || 1;
    return {
      orthodox,
      southpaw,
      orthoPercent: Math.round((orthodox / total) * 100),
      southPercent: Math.round((southpaw / total) * 100),
    };
  }, [fighters]);

  // Overall platform totals safely calculated
  const totalBouts = fighters.reduce((acc, f) => acc + f.wins + f.losses + f.draws, 0);
  const totalWins = fighters.reduce((acc, f) => acc + f.wins, 0);
  const totalKos = fighters.reduce((acc, f) => acc + f.knockouts, 0);
  const aggregateKoPercentage = totalWins > 0 ? Math.round((totalKos / totalWins) * 100) : 0;
  const maxKos = Math.max(...fighters.map((f) => f.knockouts), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#1A1D27] pb-6">
        <span className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-semibold">
          Kinematic Data & Empirical Analytics
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-display tracking-wide text-white mt-1">
          {t.statsTitle}
        </h1>
        <p className="text-sm text-[#8E95A5] mt-1">{t.statsSub}</p>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#0E1117] border border-[#1E232E] rounded-xl">
          <span className="text-xs uppercase font-mono text-[#8E95A5] block">
            {t.totalFighters}
          </span>
          <span className="text-3xl font-extrabold font-mono-numbers text-white mt-1 block">
            {fighters.length}
          </span>
          <p className="text-[11px] text-[#687082] mt-1">Sanctioned professional fighters</p>
        </div>

        <div className="p-5 bg-[#0E1117] border border-[#1E232E] rounded-xl">
          <span className="text-xs uppercase font-mono text-[#8E95A5] block">
            Total Tracked Bouts
          </span>
          <span className="text-3xl font-extrabold font-mono-numbers text-[#D4AF37] mt-1 block">
            {totalBouts}
          </span>
          <p className="text-[11px] text-[#687082] mt-1">Accumulated career bouts</p>
        </div>

        <div className="p-5 bg-[#0E1117] border border-[#1E232E] rounded-xl">
          <span className="text-xs uppercase font-mono text-[#8E95A5] block">
            {t.avgKoRatio}
          </span>
          <span className="text-3xl font-extrabold font-mono-numbers text-red-400 mt-1 block">
            {aggregateKoPercentage}%
          </span>
          <p className="text-[11px] text-[#687082] mt-1">Formula: Total KOs / Total Wins × 100</p>
        </div>

        <div className="p-5 bg-[#0E1117] border border-[#1E232E] rounded-xl">
          <span className="text-xs uppercase font-mono text-[#8E95A5] block">
            Stance Ratio
          </span>
          <span className="text-xl sm:text-2xl font-extrabold font-mono-numbers text-white mt-1 block">
            {stanceDistribution.orthoPercent}% Orth / {stanceDistribution.southPercent}% South
          </span>
          <p className="text-[11px] text-[#687082] mt-1">
            {stanceDistribution.orthodox} Orthodox, {stanceDistribution.southpaw} Southpaw
          </p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Knockout Leaderboard Bar Chart */}
        <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E232E] pb-3">
            <h3 className="text-base font-bold font-display uppercase tracking-wide text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#D4AF37]" />
              {t.koComparison}
            </h3>
            <span className="text-xs text-[#8E95A5] font-mono">Knockouts / Total Wins</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {topKoPunchers.map((fighter) => {
              const barPercent = Math.round((fighter.knockouts / maxKos) * 100);
              const koRate =
                fighter.wins > 0 ? Math.round((fighter.knockouts / fighter.wins) * 100) : 0;
              return (
                <div
                  key={fighter.id}
                  onClick={() => onOpenFighter(fighter.id)}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white group-hover:text-[#D4AF37] transition-colors truncate">
                      {fighter.name} <span className="text-[#8E95A5] font-normal">({fighter.division})</span>
                    </span>
                    <span className="font-mono-numbers font-semibold text-red-400">
                      {fighter.knockouts} KOs <span className="text-[#687082]">({koRate}%)</span>
                    </span>
                  </div>

                  <div className="w-full bg-[#181C26] rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#D4AF37] to-red-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Division Distribution Breakdown */}
        <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E232E] pb-3">
            <h3 className="text-base font-bold font-display uppercase tracking-wide text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
              {t.distributionByDivision}
            </h3>
            <span className="text-xs text-[#8E95A5] font-mono">Weight Classes</span>
          </div>

          <div className="space-y-3 pt-2">
            {divisionDistribution.map((div) => (
              <div key={div.division} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#C5CAD5] font-medium">{div.division}</span>
                  <span className="font-mono-numbers font-bold text-white">
                    {div.count} fighters <span className="text-[#8E95A5]">({div.percent}%)</span>
                  </span>
                </div>
                <div className="w-full bg-[#181C26] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#D4AF37] h-full rounded-full transition-all duration-700"
                    style={{ width: `${div.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3 & 4: Nationality & Methodology */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Nationality Distribution */}
        <div className="lg:col-span-2 bg-[#0E1117] border border-[#1E232E] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E232E] pb-3">
            <h3 className="text-base font-bold font-display uppercase tracking-wide text-white flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-[#D4AF37]" />
              International Athlete Geographic Origins
            </h3>
            <span className="text-xs text-[#8E95A5] font-mono">National Federations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {nationalityBreakdown.map((nat) => (
              <div
                key={nat.nationality}
                className="p-3.5 bg-[#131620] border border-[#202532] rounded-lg flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                  <span className="font-semibold text-white">{nat.nationality}</span>
                </div>
                <span className="font-mono-numbers text-[#D4AF37] font-bold">
                  {nat.count} ({nat.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mathematical Formulas Documentation */}
        <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#1E232E] pb-3">
              <Info className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-base font-bold font-display uppercase tracking-wide text-white">
                Empirical Formulas
              </h3>
            </div>
            <p className="text-xs text-[#8E95A5] leading-relaxed">
              All statistical tables adhere to verified arithmetic standards:
            </p>
            <ul className="space-y-2 text-xs text-[#C5CAD5]">
              <li className="bg-[#131620] p-2.5 rounded border border-[#202532]">
                <strong className="text-white block font-mono">Knockout Ratio:</strong>
                <span className="font-mono text-[#D4AF37]">KO% = (Total KOs / Total Wins) × 100</span>
              </li>
              <li className="bg-[#131620] p-2.5 rounded border border-[#202532]">
                <strong className="text-white block font-mono">Win Percentage:</strong>
                <span className="font-mono text-[#D4AF37]">Win% = (Wins / Total Fights) × 100</span>
              </li>
            </ul>
          </div>

          <div className="text-[11px] text-[#687082] pt-3 border-t border-[#1E232E]">
            * Zero values are handled with safety guards; no unverified figures are fabricated.
          </div>
        </div>
      </div>
    </div>
  );
};
