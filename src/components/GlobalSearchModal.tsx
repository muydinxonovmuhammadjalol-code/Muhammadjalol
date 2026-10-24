import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, User, Calendar, Newspaper, Dumbbell, ChevronRight, CornerDownLeft } from 'lucide-react';
import { Fighter, BoxingEvent, Article, TrainingExercise } from '../types';
import { Language, translations } from '../i18n/translations';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  fighters: Fighter[];
  events: BoxingEvent[];
  articles: Article[];
  training: TrainingExercise[];
  onSelectFighter: (id: string) => void;
  onSelectEvent: (id: string) => void;
  onSelectArticle: (id: string) => void;
  onSelectTraining: (id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  lang,
  fighters,
  events,
  articles,
  training,
  onSelectFighter,
  onSelectEvent,
  onSelectArticle,
  onSelectTraining,
}) => {
  const t = translations[lang];
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fighters' | 'events' | 'news' | 'training'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      type: 'fighter' | 'event' | 'news' | 'training';
      tag: string;
      onClick: () => void;
    }> = [];

    // Search Fighters
    if (selectedCategory === 'all' || selectedCategory === 'fighters') {
      fighters.forEach((f) => {
        if (
          f.name.toLowerCase().includes(q) ||
          f.nickname?.toLowerCase().includes(q) ||
          f.nationality.toLowerCase().includes(q) ||
          f.division.toLowerCase().includes(q)
        ) {
          results.push({
            id: `f-${f.id}`,
            title: `${f.name} ${f.nickname ? `"${f.nickname}"` : ''}`,
            subtitle: `${f.division} · ${f.nationality} · ${f.wins}-${f.losses}-${f.draws} (${f.knockouts} KOs)`,
            type: 'fighter',
            tag: f.division,
            onClick: () => {
              onSelectFighter(f.id);
              onClose();
            },
          });
        }
      });
    }

    // Search Events
    if (selectedCategory === 'all' || selectedCategory === 'events') {
      events.forEach((ev) => {
        if (
          ev.title.toLowerCase().includes(q) ||
          ev.venue.toLowerCase().includes(q) ||
          ev.city.toLowerCase().includes(q) ||
          ev.weightDivision.toLowerCase().includes(q)
        ) {
          results.push({
            id: `e-${ev.id}`,
            title: ev.title,
            subtitle: `${ev.venue}, ${ev.city} · ${new Date(ev.date).toLocaleDateString()}`,
            type: 'event',
            tag: ev.weightDivision,
            onClick: () => {
              onSelectEvent(ev.id);
              onClose();
            },
          });
        }
      });
    }

    // Search News
    if (selectedCategory === 'all' || selectedCategory === 'news') {
      articles.forEach((art) => {
        if (
          art.title.toLowerCase().includes(q) ||
          art.subtitle.toLowerCase().includes(q) ||
          art.category.toLowerCase().includes(q) ||
          art.author.name.toLowerCase().includes(q)
        ) {
          results.push({
            id: `n-${art.id}`,
            title: art.title,
            subtitle: `${art.category} · By ${art.author.name} · ${art.readingTimeMinutes} min read`,
            type: 'news',
            tag: art.category,
            onClick: () => {
              onSelectArticle(art.id);
              onClose();
            },
          });
        }
      });
    }

    // Search Training
    if (selectedCategory === 'all' || selectedCategory === 'training') {
      training.forEach((tr) => {
        if (
          tr.title.toLowerCase().includes(q) ||
          tr.category.toLowerCase().includes(q) ||
          tr.description.toLowerCase().includes(q)
        ) {
          results.push({
            id: `t-${tr.id}`,
            title: tr.title,
            subtitle: `${tr.category} · Level: ${tr.difficulty} · Duration: ${tr.duration}`,
            type: 'training',
            tag: tr.category,
            onClick: () => {
              onSelectTraining(tr.id);
              onClose();
            },
          });
        }
      });
    }

    return results;
  }, [query, selectedCategory, fighters, events, articles, training, onSelectFighter, onSelectEvent, onSelectArticle, onSelectTraining, onClose]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < searchResults.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        searchResults[selectedIndex].onClick();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#101217] border border-[#262B36] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1E232E] gap-3 bg-[#13161E]">
          <Search className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={t.searchPlaceholder}
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-[#687082] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#687082] hover:text-white rounded"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[11px] font-mono text-[#687082] bg-[#1E232E] px-2 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#0E1015] border-b border-[#1E232E] overflow-x-auto text-xs text-[#8E95A5]">
          {(['all', 'fighters', 'events', 'news', 'training'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#D4AF37] text-black font-semibold'
                  : 'hover:text-white hover:bg-[#1A1D25]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-[#181C24]">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-[#687082] text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#D4AF37]" />
              <p>Type to search across registered champions, fight schedules, articles, and training.</p>
              <p className="text-xs text-[#505768] mt-1">
                Tip: Search "Malik", "Heavyweight", "Tashkent", "Biomechanics", or "Footwork"
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-[#687082] text-sm">
              <p className="text-white font-medium">No results found for "{query}"</p>
              <p className="text-xs text-[#505768] mt-1">Try another keyword or search under a different category.</p>
            </div>
          ) : (
            searchResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.onClick}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#1C202B] text-white' : 'text-[#C5CAD5] hover:bg-[#151821]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                        item.type === 'fighter'
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                          : item.type === 'event'
                          ? 'bg-red-500/15 text-red-400'
                          : item.type === 'news'
                          ? 'bg-blue-500/15 text-blue-400'
                          : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {item.type === 'fighter' && <User className="w-4 h-4" />}
                      {item.type === 'event' && <Calendar className="w-4 h-4" />}
                      {item.type === 'news' && <Newspaper className="w-4 h-4" />}
                      {item.type === 'training' && <Dumbbell className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate text-white">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-[#8E95A5] font-mono-numbers bg-[#252A35] px-1.5 py-0.2 rounded shrink-0">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-[#8E95A5] truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isSelected && (
                      <span className="text-[11px] text-[#D4AF37] flex items-center gap-1 font-mono">
                        Select <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-[#505768]" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#1E232E] bg-[#0E1015] flex items-center justify-between text-[11px] text-[#687082]">
          <span>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
          </span>
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to dismiss</span>
          </div>
        </div>
      </div>
    </div>
  );
};
