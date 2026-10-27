import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Footer } from './components/Footer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ThreeArenaModal } from './components/ThreeArenaModal';
import { FighterCompareModal } from './components/FighterCompareModal';
import { FighterProfileModal } from './components/FighterProfileModal';
import { EventDetailModal } from './components/EventDetailModal';
import { ArticleModal } from './components/ArticleModal';
import { TrainingModal } from './components/TrainingModal';
import { AuthModal } from './components/AuthModal';

import { HomeView } from './views/HomeView';
import { FightersView } from './views/FightersView';
import { EventsView } from './views/EventsView';
import { RankingsView } from './views/RankingsView';
import { StatisticsView } from './views/StatisticsView';
import { NewsView } from './views/NewsView';
import { TrainingView } from './views/TrainingView';
import { DashboardView } from './views/DashboardView';
import { AdminView } from './views/AdminView';
import { FightGameView } from './views/FightGameView';

import {
  INITIAL_FIGHTERS,
  INITIAL_EVENTS,
  INITIAL_RANKINGS,
  INITIAL_ARTICLES,
  INITIAL_TRAINING,
} from './data/mockData';
import {
  Fighter,
  BoxingEvent,
  RankingEntry,
  Article,
  TrainingExercise,
  AuditLogItem,
} from './types';
import { Language, translations } from './i18n/translations';

export default function App() {
  // 1. Language state (English / Uzbek)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('ring_legacy_lang');
    return saved === 'uz' ? 'uz' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('ring_legacy_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'uz' : 'en'));
  };

  // 2. Navigation Tab state
  const [activeTab, setActiveTab] = useState<string>('home');

  // 3. User Session state
  const [user, setUser] = useState<{ email: string; name: string; isAdmin?: boolean } | null>(() => {
    const saved = localStorage.getItem('ring_legacy_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('ring_legacy_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ring_legacy_user');
    }
  }, [user]);

  // 4. Data models with localStorage persistence
  const [fighters, setFighters] = useState<Fighter[]>(() => {
    const saved = localStorage.getItem('ring_legacy_fighters');
    return saved ? JSON.parse(saved) : INITIAL_FIGHTERS;
  });

  const [events, setEvents] = useState<BoxingEvent[]>(() => {
    const saved = localStorage.getItem('ring_legacy_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [rankings, setRankings] = useState<RankingEntry[]>(() => {
    const saved = localStorage.getItem('ring_legacy_rankings');
    return saved ? JSON.parse(saved) : INITIAL_RANKINGS;
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('ring_legacy_articles');
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });

  const [training, setTraining] = useState<TrainingExercise[]>(() => {
    const saved = localStorage.getItem('ring_legacy_training');
    return saved ? JSON.parse(saved) : INITIAL_TRAINING;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('ring_legacy_audit');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'log-1',
            timestamp: new Date().toISOString(),
            action: 'CREATE',
            entity: 'FIGHTER',
            details: 'Sanctioned baseline international championship roster loaded.',
          },
        ];
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('ring_legacy_fighters', JSON.stringify(fighters));
  }, [fighters]);

  useEffect(() => {
    localStorage.setItem('ring_legacy_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('ring_legacy_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('ring_legacy_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // 5. User Bookmarks & Preferences
  const [favoriteFighterIds, setFavoriteFighterIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('ring_legacy_fav_fighters');
    return saved ? JSON.parse(saved) : ['fighter-001', 'fighter-002'];
  });

  const [favoriteEventIds, setFavoriteEventIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('ring_legacy_fav_events');
    return saved ? JSON.parse(saved) : ['event-001'];
  });

  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('ring_legacy_saved_articles');
    return saved ? JSON.parse(saved) : ['article-001'];
  });

  const [completedTrainingIds, setCompletedTrainingIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('ring_legacy_completed_training');
    return saved ? JSON.parse(saved) : ['tr-01'];
  });

  useEffect(() => {
    localStorage.setItem('ring_legacy_fav_fighters', JSON.stringify(favoriteFighterIds));
  }, [favoriteFighterIds]);

  useEffect(() => {
    localStorage.setItem('ring_legacy_fav_events', JSON.stringify(favoriteEventIds));
  }, [favoriteEventIds]);

  useEffect(() => {
    localStorage.setItem('ring_legacy_saved_articles', JSON.stringify(savedArticleIds));
  }, [savedArticleIds]);

  useEffect(() => {
    localStorage.setItem('ring_legacy_completed_training', JSON.stringify(completedTrainingIds));
  }, [completedTrainingIds]);

  // 6. Modal controllers
  const [is3DArenaOpen, setIs3DArenaOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareFighterAId, setCompareFighterAId] = useState<string | undefined>(undefined);
  const [compareFighterBId, setCompareFighterBId] = useState<string | undefined>(undefined);

  const [selectedFighterId, setSelectedFighterId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);

  // Keyboard shortcut Cmd/Ctrl + K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check URL queries on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const compareA = params.get('compareA');
    const compareB = params.get('compareB');
    if (compareA || compareB) {
      setCompareFighterAId(compareA || undefined);
      setCompareFighterBId(compareB || undefined);
      setIsCompareOpen(true);
    }
  }, []);

  // Favorite toggle helpers
  const toggleFavoriteFighter = (id: string) => {
    setFavoriteFighterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleFavoriteEvent = (id: string) => {
    setFavoriteEventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleBookmarkArticle = (id: string) => {
    setSavedArticleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleCompleteTraining = (id: string) => {
    setCompletedTrainingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openCompare = (fighterAId?: string) => {
    if (fighterAId) {
      setCompareFighterAId(fighterAId);
    }
    setIsCompareOpen(true);
  };

  // Admin handlers
  const handleAddFighter = (newFighter: Fighter) => {
    setFighters((prev) => [newFighter, ...prev]);
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CREATE',
        entity: 'FIGHTER',
        details: `Enrolled contender ${newFighter.name} (${newFighter.division}) to registry.`,
      },
      ...prev,
    ]);
  };

  const handleUpdateFighter = (updated: Fighter) => {
    setFighters((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'UPDATE',
        entity: 'FIGHTER',
        details: `Updated dossier and records for ${updated.name}.`,
      },
      ...prev,
    ]);
  };

  const handleDeleteFighter = (id: string) => {
    const f = fighters.find((item) => item.id === id);
    setFighters((prev) => prev.filter((item) => item.id !== id));
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'DELETE',
        entity: 'FIGHTER',
        details: `De-registered athlete ${f?.name || id} from commission.`,
      },
      ...prev,
    ]);
  };

  const handleAddEvent = (newEvent: BoxingEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CREATE',
        entity: 'EVENT',
        details: `Sanctioned title fight ${newEvent.title}.`,
      },
      ...prev,
    ]);
  };

  const handleDeleteEvent = (id: string) => {
    const ev = events.find((item) => item.id === id);
    setEvents((prev) => prev.filter((item) => item.id !== id));
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'DELETE',
        entity: 'EVENT',
        details: `Cancelled sanctioned event ${ev?.title || id}.`,
      },
      ...prev,
    ]);
  };

  const handleAddArticle = (newArticle: Article) => {
    setArticles((prev) => [newArticle, ...prev]);
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'CREATE',
        entity: 'ARTICLE',
        details: `Published technical dispatch: "${newArticle.title}".`,
      },
      ...prev,
    ]);
  };

  const handleDeleteArticle = (id: string) => {
    const a = articles.find((item) => item.id === id);
    setArticles((prev) => prev.filter((item) => item.id !== id));
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'DELETE',
        entity: 'ARTICLE',
        details: `Unpublished editorial article: "${a?.title || id}".`,
      },
      ...prev,
    ]);
  };

  const handleResetData = () => {
    setFighters(INITIAL_FIGHTERS);
    setEvents(INITIAL_EVENTS);
    setRankings(INITIAL_RANKINGS);
    setArticles(INITIAL_ARTICLES);
    setTraining(INITIAL_TRAINING);
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'RESET',
        entity: 'FIGHTER',
        details: 'Commission restored factory baseline seed dataset.',
      },
      ...prev,
    ]);
  };

  const handleExportData = () => {
    const data = {
      fighters,
      events,
      rankings,
      articles,
      training,
      auditLogs,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ring-legacy-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Resolved entities for open modals
  const activeFighter = fighters.find((f) => f.id === selectedFighterId) || null;
  const activeEvent = events.find((e) => e.id === selectedEventId) || null;
  const activeArticle = articles.find((a) => a.id === selectedArticleId) || null;
  const activeTraining = training.find((t) => t.id === selectedTrainingId) || null;

  // Full-viewport Game Shell (never renders website navbars or footers during play)
  if (activeTab === 'fight') {
    return (
      <FightGameView
        fighters={fighters}
        lang={lang}
        onExit={() => {
          setActiveTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090A0C] text-[#EDEDED] flex flex-col font-body selection:bg-[#D4AF37]/30 selection:text-white">
      {/* 1. Announcement Bar */}
      <AnnouncementBar
        featuredEvent={events.find((e) => e.status === 'upcoming') || null}
        onOpenEvent={(id) => setSelectedEventId(id)}
        lang={lang}
      />

      {/* 2. Top Bar Navigation (Zone 1 - Zone 2 - Zone 3) */}
      <Navbar
        currentTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        lang={lang}
        onToggleLang={toggleLanguage}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpen3D={() => setIs3DArenaOpen(true)}
        user={user}
        favoriteCount={favoriteFighterIds.length + favoriteEventIds.length}
      />

      {/* 3. Main Views */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            onSelectTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            lang={lang}
            fighters={fighters}
            events={events}
            articles={articles}
            rankings={rankings}
            onOpenFighter={(id) => setSelectedFighterId(id)}
            onOpenEvent={(id) => setSelectedEventId(id)}
            onOpenArticle={(id) => setSelectedArticleId(id)}
            onOpen3D={() => setIs3DArenaOpen(true)}
            onOpenCompare={openCompare}
            favoriteFighterIds={favoriteFighterIds}
            onToggleFavoriteFighter={toggleFavoriteFighter}
          />
        )}

        {activeTab === 'fighters' && (
          <FightersView
            fighters={fighters}
            lang={lang}
            onOpenFighter={(id) => setSelectedFighterId(id)}
            onOpenCompare={openCompare}
            favoriteFighterIds={favoriteFighterIds}
            onToggleFavoriteFighter={toggleFavoriteFighter}
          />
        )}

        {activeTab === 'events' && (
          <EventsView
            events={events}
            fighters={fighters}
            lang={lang}
            onOpenEvent={(id) => setSelectedEventId(id)}
            onOpenFighter={(id) => setSelectedFighterId(id)}
          />
        )}

        {activeTab === 'rankings' && (
          <RankingsView
            rankings={rankings}
            fighters={fighters}
            lang={lang}
            onOpenFighter={(id) => setSelectedFighterId(id)}
            onOpenCompare={openCompare}
          />
        )}

        {activeTab === 'stats' && (
          <StatisticsView
            fighters={fighters}
            events={events}
            lang={lang}
            onOpenFighter={(id) => setSelectedFighterId(id)}
            onOpenCompare={openCompare}
          />
        )}

        {activeTab === 'news' && (
          <NewsView
            articles={articles}
            lang={lang}
            onOpenArticle={(id) => setSelectedArticleId(id)}
            savedArticleIds={savedArticleIds}
            onToggleBookmarkArticle={toggleBookmarkArticle}
          />
        )}

        {activeTab === 'training' && (
          <TrainingView
            training={training}
            lang={lang}
            onOpenTraining={(id) => setSelectedTrainingId(id)}
            completedTrainingIds={completedTrainingIds}
            onToggleCompleteTraining={toggleCompleteTraining}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            user={user}
            lang={lang}
            onToggleLang={toggleLanguage}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={() => setUser(null)}
            fighters={fighters}
            events={events}
            articles={articles}
            training={training}
            favoriteFighterIds={favoriteFighterIds}
            favoriteEventIds={favoriteEventIds}
            savedArticleIds={savedArticleIds}
            completedTrainingIds={completedTrainingIds}
            onOpenFighter={(id) => setSelectedFighterId(id)}
            onOpenEvent={(id) => setSelectedEventId(id)}
            onOpenArticle={(id) => setSelectedArticleId(id)}
            onRemoveFavoriteFighter={(id) => toggleFavoriteFighter(id)}
            onRemoveFavoriteEvent={(id) => toggleFavoriteEvent(id)}
            onRemoveSavedArticle={(id) => toggleBookmarkArticle(id)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            fighters={fighters}
            events={events}
            articles={articles}
            rankings={rankings}
            auditLogs={auditLogs}
            lang={lang}
            onAddFighter={handleAddFighter}
            onUpdateFighter={handleUpdateFighter}
            onDeleteFighter={handleDeleteFighter}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onAddArticle={handleAddArticle}
            onDeleteArticle={handleDeleteArticle}
            onResetData={handleResetData}
            onExportData={handleExportData}
          />
        )}
      </main>

      {/* 4. Footer */}
      <Footer
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        lang={lang}
      />

      {/* 5. Modals & Interactive Overlays */}
      {/* 3D WebGL Championship Boxing Arena */}
      <ThreeArenaModal
        isOpen={is3DArenaOpen}
        onClose={() => setIs3DArenaOpen(false)}
        lang={lang}
      />

      {/* Global Search Dialog */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        lang={lang}
        fighters={fighters}
        events={events}
        articles={articles}
        training={training}
        onSelectFighter={(id) => setSelectedFighterId(id)}
        onSelectEvent={(id) => setSelectedEventId(id)}
        onSelectArticle={(id) => setSelectedArticleId(id)}
        onSelectTraining={(id) => setSelectedTrainingId(id)}
      />

      {/* Head-to-Head Comparison Tool */}
      <FighterCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        lang={lang}
        fighters={fighters}
        initialFighterAId={compareFighterAId}
        initialFighterBId={compareFighterBId}
      />

      {/* Dedicated Fighter Profile View */}
      <FighterProfileModal
        fighter={activeFighter}
        isOpen={Boolean(selectedFighterId)}
        onClose={() => setSelectedFighterId(null)}
        lang={lang}
        isFavorited={selectedFighterId ? favoriteFighterIds.includes(selectedFighterId) : false}
        onToggleFavorite={toggleFavoriteFighter}
        onOpenCompare={openCompare}
        allFighters={fighters}
        onSelectFighter={(id) => setSelectedFighterId(id)}
      />

      {/* Dedicated Event Fight Card View */}
      <EventDetailModal
        event={activeEvent}
        isOpen={Boolean(selectedEventId)}
        onClose={() => setSelectedEventId(null)}
        lang={lang}
        fighters={fighters}
        onSelectFighter={(id) => setSelectedFighterId(id)}
        isFavorited={selectedEventId ? favoriteEventIds.includes(selectedEventId) : false}
        onToggleFavorite={toggleFavoriteEvent}
      />

      {/* Article Reader View */}
      <ArticleModal
        article={activeArticle}
        isOpen={Boolean(selectedArticleId)}
        onClose={() => setSelectedArticleId(null)}
        lang={lang}
        isBookmarked={selectedArticleId ? savedArticleIds.includes(selectedArticleId) : false}
        onToggleBookmark={toggleBookmarkArticle}
      />

      {/* Training Drill Protocol View */}
      <TrainingModal
        exercise={activeTraining}
        isOpen={Boolean(selectedTrainingId)}
        onClose={() => setSelectedTrainingId(null)}
        lang={lang}
        isCompleted={selectedTrainingId ? completedTrainingIds.includes(selectedTrainingId) : false}
        onToggleComplete={toggleCompleteTraining}
      />

      {/* Auth Pass Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        lang={lang}
        onLoginSuccess={(u) => setUser(u)}
      />
    </div>
  );
}
