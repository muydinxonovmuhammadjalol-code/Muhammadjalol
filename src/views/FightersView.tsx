import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Bookmark,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Award,
} from 'lucide-react';
import { Fighter, WeightDivision } from '../types';
import { Language, translations } from '../i18n/translations';

interface FightersViewProps {
  fighters: Fighter[];
  lang: Language;
  onOpenFighter: (id: string) => void;
  onOpenCompare: (id: string) => void;
  favoriteFighterIds: string[];
  onToggleFavoriteFighter: (id: string) => void;
}

export const FightersView: React.FC<FightersViewProps> = ({
  fighters,
  lang,
  onOpenFighter,
  onOpenCompare,
  favoriteFighterIds,
  onToggleFavoriteFighter,
}) => {
  const t = translations[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'ranking' | 'wins' | 'knockouts' | 'name'>('ranking');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Extract unique countries
  const countries = useMemo(() => {
    const list = Array.from(new Set(fighters.map((f) => f.nationality))).sort();
    return list;
  }, [fighters]);

  // Extract unique divisions
  const divisions = useMemo(() => {
    const list = Array.from(new Set(fighters.map((f) => f.division))).sort();
    return list;
  }, [fighters]);

  // Filtering & Sorting
  const filteredFighters = useMemo(() => {
    let result = [...fighters];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.nickname?.toLowerCase().includes(q) ||
          f.nationality.toLowerCase().includes(q) ||
          f.division.toLowerCase().includes(q)
      );
    }

    if (selectedDivision !== 'all') {
      result = result.filter((f) => f.division === selectedDivision);
    }

    if (selectedCountry !== 'all') {
      result = result.filter((f) => f.nationality === selectedCountry);
    }

    if (selectedStatus !== 'all') {
      result = result.filter((f) => f.status.toLowerCase() === selectedStatus.toLowerCase());
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'ranking') return a.ranking - b.ranking;
      if (sortBy === 'wins') return b.wins - a.wins;
      if (sortBy === 'knockouts') return b.knockouts - a.knockouts;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [fighters, searchQuery, selectedDivision, selectedCountry, selectedStatus, sortBy]);

  const totalPages = Math.ceil(filteredFighters.length / itemsPerPage) || 1;
  const paginatedFighters = filteredFighters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDivision('all');
    setSelectedCountry('all');
    setSelectedStatus('all');
    setSortBy('ranking');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#1A1D27] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-semibold">
            World Athlete Registry
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-display tracking-wide text-white mt-1">
            {t.navFighters} Directory
          </h1>
          <p className="text-sm text-[#8E95A5] mt-1">
            Complete database of sanctioned champions, top contenders, and verified professional records.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <div className="flex items-center bg-[#141720] p-1 rounded-lg border border-[#252A38]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-[#D4AF37] text-black' : 'text-[#8E95A5] hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-[#D4AF37] text-black' : 'text-[#8E95A5] hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#687082] absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by fighter name, nickname, or nation..."
              className="w-full bg-[#141720] border border-[#252A38] text-white text-xs sm:text-sm rounded-lg pl-9 pr-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[#687082] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Division select */}
          <div className="md:col-span-3">
            <select
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#141720] border border-[#252A38] text-white text-xs sm:text-sm rounded-lg px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all">All Weight Divisions</option>
              {divisions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>

          {/* Country select */}
          <div className="md:col-span-2">
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#141720] border border-[#252A38] text-white text-xs sm:text-sm rounded-lg px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort select */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#141720] border border-[#252A38] text-white text-xs sm:text-sm rounded-lg px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="ranking">Sort by Ranking</option>
              <option value="wins">Sort by Wins</option>
              <option value="knockouts">Sort by Knockouts</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Results count & Clear */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1C202B] text-xs text-[#8E95A5]">
          <span>
            Showing <strong className="text-white font-mono-numbers">{filteredFighters.length}</strong> registered fighters
          </span>
          {(searchQuery || selectedDivision !== 'all' || selectedCountry !== 'all') && (
            <button
              onClick={clearFilters}
              className="text-[#D4AF37] hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.clearFilters}</span>
            </button>
          )}
        </div>
      </div>

      {/* Fighters Display */}
      {filteredFighters.length === 0 ? (
        <div className="py-20 text-center bg-[#0E1117] border border-[#1E232E] rounded-xl space-y-3">
          <p className="text-white text-lg font-semibold">{t.noResultsFound}</p>
          <p className="text-xs text-[#8E95A5] max-w-sm mx-auto">
            No athletes matched your filter parameters. Try resetting your search or weight division filters.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-[#D4AF37] text-black text-xs font-semibold rounded font-display uppercase tracking-wider"
          >
            {t.clearFilters}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedFighters.map((fighter) => {
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
                      <span className="text-[10px] uppercase text-[#687082] block">KO Ratio</span>
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
      ) : (
        /* List View */
        <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl overflow-hidden divide-y divide-[#181C25]">
          {paginatedFighters.map((fighter) => {
            const isFav = favoriteFighterIds.includes(fighter.id);
            return (
              <div
                key={fighter.id}
                onClick={() => onOpenFighter(fighter.id)}
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#13161F] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={fighter.portraitUrl}
                    alt={fighter.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-16 object-cover rounded-lg border border-[#252B38] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white truncate font-display uppercase tracking-wide">
                        {fighter.name}
                      </span>
                      {fighter.nickname && (
                        <span className="text-xs text-[#D4AF37] font-semibold hidden md:inline">
                          "{fighter.nickname}"
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8E95A5]">
                      {fighter.division} · {fighter.nationality} · Stance: {fighter.stance}
                    </p>
                    <span className="text-xs text-[#D4AF37] font-mono-numbers font-semibold">
                      Record: {fighter.wins}-{fighter.losses}-{fighter.draws} ({fighter.knockouts} KOs)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCompare(fighter.id);
                    }}
                    className="px-3 py-1.5 text-xs text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded font-semibold font-display uppercase"
                  >
                    Compare
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavoriteFighter(fighter.id);
                    }}
                    className={`p-2 rounded transition-colors ${
                      isFav ? 'text-[#D4AF37]' : 'text-[#687082] hover:text-white'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded bg-[#141720] border border-[#252A38] text-white disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-[#8E95A5] font-mono-numbers">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded bg-[#141720] border border-[#252A38] text-white disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
