import React, { useState } from 'react';
import {
  User,
  Bookmark,
  Calendar,
  Newspaper,
  Dumbbell,
  Settings,
  LogOut,
  Shield,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Fighter, BoxingEvent, Article, TrainingExercise } from '../types';
import { Language, translations } from '../i18n/translations';

interface DashboardViewProps {
  user: { email: string; name: string; isAdmin?: boolean } | null;
  lang: Language;
  onToggleLang: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  fighters: Fighter[];
  events: BoxingEvent[];
  articles: Article[];
  training: TrainingExercise[];
  favoriteFighterIds: string[];
  favoriteEventIds: string[];
  savedArticleIds: string[];
  completedTrainingIds: string[];
  onOpenFighter: (id: string) => void;
  onOpenEvent: (id: string) => void;
  onOpenArticle: (id: string) => void;
  onRemoveFavoriteFighter: (id: string) => void;
  onRemoveFavoriteEvent: (id: string) => void;
  onRemoveSavedArticle: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  lang,
  onToggleLang,
  onOpenAuth,
  onLogout,
  fighters,
  events,
  articles,
  training,
  favoriteFighterIds,
  favoriteEventIds,
  savedArticleIds,
  completedTrainingIds,
  onOpenFighter,
  onOpenEvent,
  onOpenArticle,
  onRemoveFavoriteFighter,
  onRemoveFavoriteEvent,
  onRemoveSavedArticle,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'fighters' | 'events' | 'articles' | 'training' | 'settings'>('fighters');

  // Resolved entities
  const favoriteFighters = fighters.filter((f) => favoriteFighterIds.includes(f.id));
  const favoriteEvents = events.filter((e) => favoriteEventIds.includes(e.id));
  const savedArticles = articles.filter((a) => savedArticleIds.includes(a.id));
  const completedTraining = training.filter((tr) => completedTrainingIds.includes(tr.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Card */}
      <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#181C26] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] text-2xl font-bold font-display uppercase shrink-0">
            {user ? user.name[0] : 'G'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display uppercase tracking-wide text-white">
                {user ? user.name : t.guestUser}
              </h1>
              {user?.isAdmin && (
                <span className="text-[10px] font-mono uppercase bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/40 font-bold">
                  COMMISSIONER
                </span>
              )}
            </div>
            <p className="text-xs text-[#8E95A5] mt-0.5">
              {user ? user.email : 'Ringside Access · Preferences preserved in local storage'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#181C26] hover:bg-[#222836] border border-[#2B3242] text-xs text-[#C5CAD5] hover:text-white rounded transition-colors font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.signOut}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-bold font-display uppercase tracking-wider rounded transition-colors"
            >
              Sign In to Cloud Pass
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#1A1D27] text-xs font-semibold uppercase tracking-wider font-display">
        <button
          onClick={() => setActiveTab('fighters')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'fighters'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'text-[#8E95A5] hover:text-white bg-[#12151D]'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>{t.savedFighters} ({favoriteFighters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'events'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'text-[#8E95A5] hover:text-white bg-[#12151D]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{t.savedEvents} ({favoriteEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('articles')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'articles'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'text-[#8E95A5] hover:text-white bg-[#12151D]'
          }`}
        >
          <Newspaper className="w-3.5 h-3.5" />
          <span>{t.savedArticles} ({savedArticles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('training')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'training'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'text-[#8E95A5] hover:text-white bg-[#12151D]'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Training Drills ({completedTraining.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'text-[#8E95A5] hover:text-white bg-[#12151D]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Preferences</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* Saved Fighters Tab */}
        {activeTab === 'fighters' && (
          <div>
            {favoriteFighters.length === 0 ? (
              <div className="py-16 text-center bg-[#0E1117] border border-[#1E232E] rounded-xl space-y-2">
                <Bookmark className="w-8 h-8 mx-auto text-[#687082] opacity-40" />
                <p className="text-white text-sm font-semibold">No fighters bookmarked yet.</p>
                <p className="text-xs text-[#8E95A5]">Browse the directory and click the bookmark icon to save contenders here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteFighters.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => onOpenFighter(f.id)}
                    className="p-4 bg-[#0E1117] border border-[#1E232E] hover:border-[#2D3344] rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={f.portraitUrl}
                        alt={f.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-14 object-cover rounded-lg border border-[#252B38]"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white uppercase font-display truncate group-hover:text-[#D4AF37] transition-colors">
                          {f.name}
                        </h4>
                        <p className="text-xs text-[#8E95A5] truncate">{f.division} · {f.nationality}</p>
                        <span className="text-xs text-[#D4AF37] font-mono-numbers">
                          {f.wins}-{f.losses}-{f.draws} ({f.knockouts} KOs)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavoriteFighter(f.id);
                      }}
                      className="p-1.5 text-[#687082] hover:text-red-400 rounded transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Events Tab */}
        {activeTab === 'events' && (
          <div>
            {favoriteEvents.length === 0 ? (
              <div className="py-16 text-center bg-[#0E1117] border border-[#1E232E] rounded-xl space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-[#687082] opacity-40" />
                <p className="text-white text-sm font-semibold">No fight cards tracked yet.</p>
                <p className="text-xs text-[#8E95A5]">Track title fights from the schedule to monitor live countdowns.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {favoriteEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => onOpenEvent(ev.id)}
                    className="p-4 bg-[#0E1117] border border-[#1E232E] hover:border-[#2D3344] rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-semibold">
                        {ev.weightDivision}
                      </span>
                      <h4 className="text-base font-bold text-white uppercase font-display truncate">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-[#8E95A5]">
                        {ev.venue}, {ev.city} · {new Date(ev.date).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavoriteEvent(ev.id);
                      }}
                      className="p-1.5 text-[#687082] hover:text-red-400 rounded transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Articles Tab */}
        {activeTab === 'articles' && (
          <div>
            {savedArticles.length === 0 ? (
              <div className="py-16 text-center bg-[#0E1117] border border-[#1E232E] rounded-xl space-y-2">
                <Newspaper className="w-8 h-8 mx-auto text-[#687082] opacity-40" />
                <p className="text-white text-sm font-semibold">Reading list is currently empty.</p>
                <p className="text-xs text-[#8E95A5]">Save in-depth technical analyses to read whenever convenient.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => onOpenArticle(art.id)}
                    className="p-4 bg-[#0E1117] border border-[#1E232E] hover:border-[#2D3344] rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-semibold">
                        {art.category}
                      </span>
                      <h4 className="text-base font-bold text-white truncate">{art.title}</h4>
                      <p className="text-xs text-[#8E95A5]">
                        By {art.author.name} · {art.readingTimeMinutes} min read
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSavedArticle(art.id);
                      }}
                      className="p-1.5 text-[#687082] hover:text-red-400 rounded transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#0E1117] border border-[#1E232E] rounded-xl flex items-center justify-between">
              <span className="text-xs text-[#8E95A5]">
                Completed Drills: <strong className="text-white font-mono-numbers">{completedTraining.length}</strong>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {completedTraining.map((tr) => (
                <div
                  key={tr.id}
                  className="p-4 bg-[#0E1117] border border-emerald-500/20 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#D4AF37]">{tr.category}</span>
                    <h4 className="text-sm font-bold text-white font-display uppercase">{tr.title}</h4>
                    <span className="text-xs text-[#8E95A5]">Duration: {tr.duration}</span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preferences / Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl p-6 space-y-6 max-w-2xl">
            <h3 className="text-base font-bold uppercase font-display tracking-wide text-white">
              Platform Interface Preferences
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-3 border-b border-[#1E232E]">
                <div>
                  <span className="font-semibold text-white block">Display Language</span>
                  <span className="text-[#8E95A5]">Toggle between English and O'zbek tili</span>
                </div>
                <button
                  onClick={onToggleLang}
                  className="px-3 py-1.5 bg-[#181C26] border border-[#2B3242] text-white rounded font-mono font-bold"
                >
                  {lang.toUpperCase()}
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#1E232E]">
                <div>
                  <span className="font-semibold text-white block">Theme Mode</span>
                  <span className="text-[#8E95A5]">Cinematic Championship Dark Theme (Default)</span>
                </div>
                <span className="text-[#D4AF37] font-mono">DARK OPTIMIZED</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="font-semibold text-white block">Audio & 3D WebGL</span>
                  <span className="text-[#8E95A5]">High performance Three.js arena rendering</span>
                </div>
                <span className="text-emerald-400 font-mono">ENABLED</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
