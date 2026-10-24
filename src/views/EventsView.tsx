import React, { useState, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Tv,
  Trophy,
  Filter,
  CheckCircle,
  Search,
  ExternalLink,
} from 'lucide-react';
import { BoxingEvent, Fighter } from '../types';
import { Language, translations } from '../i18n/translations';

interface EventsViewProps {
  events: BoxingEvent[];
  fighters: Fighter[];
  lang: Language;
  onOpenEvent: (id: string) => void;
  onOpenFighter: (id: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  fighters,
  lang,
  onOpenEvent,
  onOpenFighter,
}) => {
  const t = translations[lang];
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const divisions = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.weightDivision))).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filterStatus !== 'all' && e.status !== filterStatus) return false;
      if (selectedDivision !== 'all' && e.weightDivision !== selectedDivision) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.country.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, filterStatus, selectedDivision, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#1A1D27] pb-6">
        <span className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-semibold">
          International Sanctioned Schedule
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-display tracking-wide text-white mt-1">
          {t.eventsTitle}
        </h1>
        <p className="text-sm text-[#8E95A5] mt-1">{t.eventsSub}</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#141720] rounded-lg border border-[#252A38]">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider font-display rounded-md transition-colors ${
                filterStatus === 'all'
                  ? 'bg-[#D4AF37] text-black shadow-sm'
                  : 'text-[#8E95A5] hover:text-white'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setFilterStatus('upcoming')}
              className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider font-display rounded-md transition-colors ${
                filterStatus === 'upcoming'
                  ? 'bg-[#D4AF37] text-black shadow-sm'
                  : 'text-[#8E95A5] hover:text-white'
              }`}
            >
              {t.filterUpcoming}
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider font-display rounded-md transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-[#D4AF37] text-black shadow-sm'
                  : 'text-[#8E95A5] hover:text-white'
              }`}
            >
              {t.filterCompleted}
            </button>
          </div>

          {/* Division Selector */}
          <div className="flex items-center gap-3">
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="bg-[#141720] border border-[#252A38] text-white text-xs rounded-lg px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all">All Divisions</option>
              {divisions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#687082] absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venue or city..."
                className="w-full bg-[#141720] border border-[#252A38] text-white text-xs rounded-lg pl-8 pr-3 py-2 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {filteredEvents.map((event) => {
          const f1 = fighters.find((f) => f.id === event.mainEvent.fighter1Id);
          const f2 = fighters.find((f) => f.id === event.mainEvent.fighter2Id);
          const isUpcoming = event.status === 'upcoming';

          return (
            <div
              key={event.id}
              className="bg-[#0E1117] border border-[#1E232E] hover:border-[#2D3344] rounded-xl overflow-hidden transition-all shadow-xl"
            >
              {/* Event Top Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                {/* Poster Thumbnail */}
                <div className="lg:col-span-3">
                  <div
                    onClick={() => onOpenEvent(event.id)}
                    className="aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-lg overflow-hidden bg-[#141720] cursor-pointer relative group"
                  >
                    <img
                      src={event.posterUrl}
                      alt={event.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                      <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider">
                        {event.weightDivision}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        isUpcoming
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {event.status}
                    </span>
                    <span className="text-xs text-[#8E95A5] font-mono">
                      {event.mainEvent.scheduledRounds} Scheduled Rounds
                    </span>
                  </div>

                  <h3
                    onClick={() => onOpenEvent(event.id)}
                    className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wide text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    {event.title}
                  </h3>

                  <p className="text-xs text-[#A1A7B5] leading-relaxed line-clamp-2">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#8E95A5] pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {new Date(event.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {event.venue}, {event.city}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {event.broadcastChannel.split('&')[0]}
                    </span>
                  </div>
                </div>

                {/* Right Action Box */}
                <div className="lg:col-span-3 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#1E232E] pt-4 lg:pt-0 lg:pl-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#687082] block">
                      Main Event Contestants
                    </span>
                    <p className="text-xs font-semibold text-white truncate">
                      {f1 ? f1.name : 'Contender Red'} <span className="text-[#D4AF37]">vs</span>{' '}
                      {f2 ? f2.name : 'Contender Blue'}
                    </p>
                    {event.mainEvent.result && (
                      <span className="inline-block text-[11px] text-emerald-400 font-medium">
                        ✓ {event.mainEvent.result}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => onOpenEvent(event.id)}
                      className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs uppercase tracking-wider font-display rounded transition-colors text-center"
                    >
                      {t.viewFightCard}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
