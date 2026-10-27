import React, { useState, useEffect } from 'react';
import {
  Trophy,
  ArrowRight,
  Clock,
  MapPin,
  Calendar,
  Bookmark,
  Share2,
  Box,
  Flame,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
} from 'lucide-react';
import { Fighter, BoxingEvent, Article, RankingEntry } from '../types';
import { Language, translations } from '../i18n/translations';

interface HomeViewProps {
  onSelectTab: (tab: string) => void;
  lang: Language;
  fighters: Fighter[];
  events: BoxingEvent[];
  articles: Article[];
  rankings: RankingEntry[];
  onOpenFighter: (id: string) => void;
  onOpenEvent: (id: string) => void;
  onOpenArticle: (id: string) => void;
  onOpen3D: () => void;
  onOpenCompare: (id?: string) => void;
  favoriteFighterIds: string[];
  onToggleFavoriteFighter: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTab,
  lang,
  fighters,
  events,
  articles,
  rankings,
  onOpenFighter,
  onOpenEvent,
  onOpenArticle,
  onOpen3D,
  onOpenCompare,
  favoriteFighterIds,
  onToggleFavoriteFighter,
}) => {
  const t = translations[lang];

  // Next upcoming championship event for hero panel
  const upcomingEvents = events.filter((e) => e.status === 'upcoming');
  const featuredEvent = upcomingEvents[0] || events[0];

  const [heroCountdown, setHeroCountdown] = useState<{ d: number; h: number; m: number; s: number }>({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
  });

  useEffect(() => {
    if (!featuredEvent) return;
    const updateCountdown = () => {
      const diff = Math.max(0, new Date(featuredEvent.date).getTime() - Date.now());
      setHeroCountdown({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [featuredEvent]);

  // Featured fighters (top champions)
  const featuredFighters = fighters.slice(0, 4);

  // P4P Rankings Preview (top 5)
  const p4pRankings = rankings
    .filter((r) => r.division === 'Pound-for-Pound')
    .sort((a, b) => a.position - b.position)
    .slice(0, 5);

  const totalWins = fighters.reduce((acc, f) => acc + f.wins, 0);
  const totalKos = fighters.reduce((acc, f) => acc + f.knockouts, 0);
  const avgKoRate = totalWins > 0 ? Math.round((totalKos / totalWins) * 100) : 0;

  return (
    <div className="space-y-16 pb-20">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[680px] flex items-center justify-center overflow-hidden border-b border-[#1C202C]">
        {/* Background Image with Contrast Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_boxing_arena_1792817255999.jpg"
            alt="World Championship Boxing Arena"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          {/* Measured multi-layer contrast scrim ensuring legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0C] via-[#090A0C]/75 to-black/60" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#090A0C]/50 to-[#090A0C]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md border border-[#D4AF37]/30 text-xs font-mono uppercase tracking-widest text-[#D4AF37] rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                Sanctioned International Championship Series
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight font-display text-white leading-none">
                {t.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-[#C5CAD5] max-w-xl leading-relaxed">
                {t.heroSubtext}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => onSelectTab('fight')}
                  className="px-6 py-3.5 bg-gradient-to-r from-red-600 via-[#D4AF37] to-red-600 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider font-display rounded transition-all shadow-xl shadow-red-500/20 flex items-center gap-2 transform hover:scale-105"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>{t.fightNowCTA}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectTab('fighters')}
                  className="px-5 py-3.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs uppercase tracking-wider font-display rounded transition-all flex items-center gap-2"
                >
                  <span>{t.exploreFighters}</span>
                </button>

                <button
                  onClick={() => onSelectTab('events')}
                  className="px-6 py-3.5 bg-[#141720]/90 hover:bg-[#1E2330] border border-[#2B3142] text-white font-bold text-xs uppercase tracking-wider font-display rounded transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t.viewUpcomingEvents}</span>
                </button>

                <button
                  onClick={onOpen3D}
                  className="px-5 py-3.5 bg-black/60 hover:bg-black/90 border border-[#D4AF37]/50 text-[#D4AF37] font-bold text-xs uppercase tracking-wider font-display rounded transition-all flex items-center gap-2"
                >
                  <Box className="w-4 h-4" />
                  <span>{t.open3DArena}</span>
                </button>
              </div>
            </div>

            {/* Right Featured Fight Card */}
            {featuredEvent && (
              <div className="lg:col-span-5">
                <div className="bg-[#0F1219]/90 backdrop-blur-md border border-[#262C3A] rounded-xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1E2432] pb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-red-500" />
                      {t.undisputedClash}
                    </span>
                    <span className="text-[11px] font-mono-numbers text-white bg-[#1C212E] px-2 py-0.5 rounded border border-[#2B3244]">
                      {featuredEvent.weightDivision}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold uppercase font-display text-white tracking-wide">
                      {featuredEvent.title}
                    </h3>
                    <p className="text-xs text-[#8E95A5] mt-0.5">
                      {featuredEvent.venue} · {featuredEvent.city}, {featuredEvent.country}
                    </p>
                  </div>

                  {/* Countdown Timer */}
                  <div className="bg-[#141822] border border-[#202636] rounded-lg p-3">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#8E95A5] block mb-2 text-center">
                      Time Remaining Until Opening Bell
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center font-mono-numbers">
                      <div className="bg-[#0C0E14] py-2 rounded border border-[#1E2432]">
                        <span className="text-xl font-bold text-white block">{heroCountdown.d}</span>
                        <span className="text-[9px] uppercase text-[#687082]">{t.days}</span>
                      </div>
                      <div className="bg-[#0C0E14] py-2 rounded border border-[#1E2432]">
                        <span className="text-xl font-bold text-white block">{heroCountdown.h}</span>
                        <span className="text-[9px] uppercase text-[#687082]">{t.hours}</span>
                      </div>
                      <div className="bg-[#0C0E14] py-2 rounded border border-[#1E2432]">
                        <span className="text-xl font-bold text-white block">{heroCountdown.m}</span>
                        <span className="text-[9px] uppercase text-[#687082]">{t.minutes}</span>
                      </div>
                      <div className="bg-[#0C0E14] py-2 rounded border border-[#1E2432]">
                        <span className="text-xl font-bold text-white block">{heroCountdown.s}</span>
                        <span className="text-[9px] uppercase text-[#687082]">{t.seconds}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenEvent(featuredEvent.id)}
                    className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs uppercase tracking-wider font-display rounded transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{t.viewFightCard}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. STATS BANNER STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#0E1017] border border-[#1E222E] rounded-xl">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-[#8E95A5] block">
              {t.totalFighters}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono-numbers text-white mt-1 block">
              {fighters.length}
            </span>
            <span className="text-[11px] text-[#555C6D]">Sanctioned World Roster</span>
          </div>
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-[#8E95A5] block">
              {t.activeEvents}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono-numbers text-[#D4AF37] mt-1 block">
              {events.length}
            </span>
            <span className="text-[11px] text-[#555C6D]">International Cards</span>
          </div>
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-[#8E95A5] block">
              {t.avgKoRatio}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono-numbers text-red-400 mt-1 block">
              {avgKoRate}%
            </span>
            <span className="text-[11px] text-[#555C6D]">Finishing Precision</span>
          </div>
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-[#8E95A5] block">
              {t.totalArticles}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono-numbers text-white mt-1 block">
              {articles.length}
            </span>
            <span className="text-[11px] text-[#555C6D]">Technical Analyses</span>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CONTENDERS & WORLD CHAMPIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1A1D27] pb-4">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-semibold">
              Division Dominance
            </span>
            <h2 className="text-3xl font-extrabold uppercase font-display tracking-wide text-white mt-0.5">
              {t.featuredFightersTitle}
            </h2>
            <p className="text-sm text-[#8E95A5] mt-1">{t.featuredFightersSub}</p>
          </div>
          <button
            onClick={() => onSelectTab('fighters')}
            className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:text-[#E5C158] font-bold font-display uppercase tracking-wider self-start sm:self-end"
          >
            <span>{t.viewAllFighters}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredFighters.map((fighter) => {
            const isFav = favoriteFighterIds.includes(fighter.id);
            const koRate =
              fighter.wins > 0 ? Math.round((fighter.knockouts / fighter.wins) * 100) : 0;
            return (
              <div
                key={fighter.id}
                className="group relative bg-[#0E1117] border border-[#202532] hover:border-[#D4AF37]/50 rounded-xl overflow-hidden transition-all duration-300 flex flex-col shadow-lg"
              >
                {/* Fighter Image */}
                <div
                  onClick={() => onOpenFighter(fighter.id)}
                  className="relative aspect-[3/4] overflow-hidden cursor-pointer bg-[#141720]"
                >
                  <img
                    src={fighter.portraitUrl}
                    alt={fighter.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1117] via-transparent to-black/30" />

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavoriteFighter(fighter.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-lg backdrop-blur-md transition-colors ${
                      isFav
                        ? 'bg-[#D4AF37] text-black'
                        : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/90'
                    }`}
                    title={isFav ? t.favorited : t.favorite}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {/* Division Badge */}
                  <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm text-[11px] font-mono-numbers px-2 py-0.5 rounded text-white border border-white/10">
                    {fighter.division}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {fighter.nickname && (
                      <span className="text-[11px] font-semibold text-[#D4AF37] font-display uppercase tracking-wider block truncate">
                        "{fighter.nickname}"
                      </span>
                    )}
                    <h3
                      onClick={() => onOpenFighter(fighter.id)}
                      className="text-lg font-bold font-display uppercase tracking-wide text-white hover:text-[#D4AF37] transition-colors cursor-pointer truncate"
                    >
                      {fighter.name}
                    </h3>
                    <p className="text-xs text-[#8E95A5]">{fighter.nationality}</p>
                  </div>

                  {/* Record Metrics */}
                  <div className="pt-2 border-t border-[#1C202B] grid grid-cols-2 gap-2 text-xs font-mono-numbers">
                    <div>
                      <span className="text-[10px] uppercase text-[#687082] block">Record</span>
                      <span className="font-bold text-white">
                        {fighter.wins}-{fighter.losses}-{fighter.draws}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-[#687082] block">KO Rate</span>
                      <span className="font-bold text-red-400">
                        {fighter.knockouts} KOs ({koRate}%)
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onOpenFighter(fighter.id)}
                      className="py-1.5 px-3 bg-[#171B24] hover:bg-[#222734] border border-[#252B3A] text-xs font-semibold uppercase font-display tracking-wider text-white rounded transition-colors text-center"
                    >
                      {t.profile}
                    </button>
                    <button
                      onClick={() => onOpenCompare(fighter.id)}
                      className="py-1.5 px-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-xs font-semibold uppercase font-display tracking-wider text-[#D4AF37] rounded transition-colors text-center"
                    >
                      {t.compareFighter}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CHAMPIONSHIP SCHEDULE & RANKINGS DUAL SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upcoming Events Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1D27] pb-3">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-semibold">
                  Sanctioned Bouts
                </span>
                <h3 className="text-2xl font-bold uppercase font-display tracking-wide text-white">
                  {t.eventsTitle}
                </h3>
              </div>
              <button
                onClick={() => onSelectTab('events')}
                className="text-xs text-[#D4AF37] hover:underline uppercase font-display font-bold"
              >
                Full Calendar →
              </button>
            </div>

            <div className="space-y-4">
              {events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  onClick={() => onOpenEvent(event.id)}
                  className="bg-[#0E1117] border border-[#1E232E] hover:border-[#2D3444] rounded-xl p-4 sm:p-5 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-[#D4AF37] font-semibold">{event.weightDivision}</span>
                      <span className="text-[#555C6D]">·</span>
                      <span className="text-[#8E95A5]">
                        {new Date(event.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h4 className="text-base font-bold font-display uppercase tracking-wide text-white group-hover:text-[#D4AF37] transition-colors truncate">
                      {event.title}
                    </h4>
                    <p className="text-xs text-[#8E95A5] flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#555C6D]" />
                      {event.venue}, {event.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span
                      className={`text-xs px-2.5 py-1 rounded font-mono uppercase ${
                        event.status === 'upcoming'
                          ? 'bg-[#181C26] text-[#D4AF37] border border-[#2B3142]'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {event.status}
                    </span>
                    <button className="px-3 py-1.5 bg-[#D4AF37] text-black font-semibold text-xs font-display uppercase rounded hover:bg-[#E5C158] transition-colors">
                      {t.viewFightCard}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rankings Preview Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1D27] pb-3">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-semibold">
                  Official Consensus
                </span>
                <h3 className="text-2xl font-bold uppercase font-display tracking-wide text-white">
                  Pound-For-Pound Top 5
                </h3>
              </div>
              <button
                onClick={() => onSelectTab('rankings')}
                className="text-xs text-[#D4AF37] hover:underline uppercase font-display font-bold"
              >
                All Divisions →
              </button>
            </div>

            <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl overflow-hidden divide-y divide-[#181C25]">
              {p4pRankings.map((entry) => {
                const fighter = fighters.find((f) => f.id === entry.fighterId);
                if (!fighter) return null;
                return (
                  <div
                    key={entry.id}
                    onClick={() => onOpenFighter(fighter.id)}
                    className="p-3.5 flex items-center justify-between hover:bg-[#141822] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 text-center font-mono-numbers font-extrabold text-base text-[#D4AF37]">
                        #{entry.position}
                      </span>
                      <img
                        src={fighter.portraitUrl}
                        alt={fighter.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-cover rounded-lg border border-[#262B38]"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-white block truncate uppercase font-display">
                          {fighter.name}
                        </span>
                        <span className="text-xs text-[#8E95A5] font-mono-numbers">
                          {fighter.division} · {fighter.wins}-{fighter.losses}-{fighter.draws}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {entry.movement === 'up' && (
                        <span className="flex items-center text-xs font-mono text-emerald-400">
                          <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                        </span>
                      )}
                      {entry.movement === 'down' && (
                        <span className="flex items-center text-xs font-mono text-red-400">
                          <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                        </span>
                      )}
                      {entry.movement === 'same' && (
                        <span className="flex items-center text-xs font-mono text-[#687082]">
                          <Minus className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. LATEST BOXING NEWS EDITORIAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1A1D27] pb-4">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-semibold">
              Ringside Journalism
            </span>
            <h2 className="text-3xl font-extrabold uppercase font-display tracking-wide text-white mt-0.5">
              {t.newsTitle}
            </h2>
            <p className="text-sm text-[#8E95A5] mt-1">{t.newsSub}</p>
          </div>
          <button
            onClick={() => onSelectTab('news')}
            className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:text-[#E5C158] font-bold font-display uppercase tracking-wider self-start sm:self-end"
          >
            <span>View All Dispatches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((article) => (
            <div
              key={article.id}
              onClick={() => onOpenArticle(article.id)}
              className="group bg-[#0E1117] border border-[#1E232E] hover:border-[#2D3344] rounded-xl overflow-hidden cursor-pointer flex flex-col transition-all shadow-md"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-[#141720]">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-sm text-[11px] font-mono px-2 py-0.5 rounded text-[#D4AF37]">
                  {article.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-[#687082] font-mono-numbers">
                    <span>{article.publishedAt}</span>
                    <span>·</span>
                    <span>{article.readingTimeMinutes} {t.readTime}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs text-[#8E95A5] line-clamp-2 leading-relaxed">
                    {article.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1C202B] flex items-center justify-between text-xs text-[#8E95A5]">
                  <span>By {article.author.name}</span>
                  <span className="text-[#D4AF37] font-semibold group-hover:translate-x-1 transition-transform">
                    Read →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
