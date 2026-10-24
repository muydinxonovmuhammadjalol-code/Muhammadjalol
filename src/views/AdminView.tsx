import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  History,
  Users,
  Calendar,
  Newspaper,
  Award,
  Search,
  X,
} from 'lucide-react';
import { Fighter, BoxingEvent, Article, RankingEntry, AuditLogItem } from '../types';
import { Language, translations } from '../i18n/translations';

interface AdminViewProps {
  fighters: Fighter[];
  events: BoxingEvent[];
  articles: Article[];
  rankings: RankingEntry[];
  auditLogs: AuditLogItem[];
  lang: Language;
  onAddFighter: (fighter: Fighter) => void;
  onUpdateFighter: (fighter: Fighter) => void;
  onDeleteFighter: (id: string) => void;
  onAddEvent: (event: BoxingEvent) => void;
  onDeleteEvent: (id: string) => void;
  onAddArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onResetData: () => void;
  onExportData: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  fighters,
  events,
  articles,
  rankings,
  auditLogs,
  lang,
  onAddFighter,
  onUpdateFighter,
  onDeleteFighter,
  onAddEvent,
  onDeleteEvent,
  onAddArticle,
  onDeleteArticle,
  onResetData,
  onExportData,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'fighters' | 'events' | 'articles' | 'audit'>('fighters');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Fighter Modal state
  const [isAddingFighter, setIsAddingFighter] = useState(false);
  const [newFighterName, setNewFighterName] = useState('');
  const [newFighterNickname, setNewFighterNickname] = useState('');
  const [newFighterNationality, setNewFighterNationality] = useState('Uzbekistan');
  const [newFighterDivision, setNewFighterDivision] = useState('Heavyweight');
  const [newFighterWins, setNewFighterWins] = useState(15);
  const [newFighterLosses, setNewFighterLosses] = useState(0);
  const [newFighterDraws, setNewFighterDraws] = useState(0);
  const [newFighterKnockouts, setNewFighterKnockouts] = useState(13);

  // Confirmation modal for destructive delete
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'fighter' | 'event' | 'article' | 'reset';
    id?: string;
    title?: string;
  }>({ isOpen: false, type: 'fighter' });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateFighter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFighterName.trim()) {
      showNotification('error', 'Fighter name is required.');
      return;
    }

    const created: Fighter = {
      id: `fighter-${Date.now()}`,
      slug: newFighterName.toLowerCase().replace(/\s+/g, '-'),
      name: newFighterName.trim(),
      nickname: newFighterNickname.trim() || undefined,
      nationality: newFighterNationality,
      countryCode: newFighterNationality === 'Uzbekistan' ? 'UZ' : 'US',
      division: newFighterDivision as any,
      stance: 'Orthodox',
      height: "6' 2\" (188 cm)",
      reach: '77" (195 cm)',
      birthDate: '1999-01-01',
      age: 27,
      wins: Number(newFighterWins),
      losses: Number(newFighterLosses),
      draws: Number(newFighterDraws),
      knockouts: Number(newFighterKnockouts),
      ranking: fighters.length + 1,
      status: 'Active',
      titles: [],
      biography: `${newFighterName} entered the professional ranks with prominent boxing power and disciplined ring mastery.`,
      portraitUrl: '/src/assets/images/fighter_welterweight_star_1792817257475.jpg',
      recentFights: [],
      physicalStats: { power: 90, speed: 88, defense: 87, stamina: 89, ringIq: 88, chin: 89 },
      isDemoData: false,
    };

    onAddFighter(created);
    setIsAddingFighter(false);
    setNewFighterName('');
    setNewFighterNickname('');
    showNotification('success', `Contender ${created.name} registered into active commission database.`);
  };

  const confirmDelete = () => {
    if (deleteConfirmation.type === 'fighter' && deleteConfirmation.id) {
      onDeleteFighter(deleteConfirmation.id);
      showNotification('success', 'Athlete record removed from commission registry.');
    } else if (deleteConfirmation.type === 'event' && deleteConfirmation.id) {
      onDeleteEvent(deleteConfirmation.id);
      showNotification('success', 'Fight event removed from sanctioning calendar.');
    } else if (deleteConfirmation.type === 'article' && deleteConfirmation.id) {
      onDeleteArticle(deleteConfirmation.id);
      showNotification('success', 'Article dispatch unpublished.');
    } else if (deleteConfirmation.type === 'reset') {
      onResetData();
      showNotification('success', 'Platform demonstration records reset to factory baseline.');
    }
    setDeleteConfirmation({ isOpen: false, type: 'fighter' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#1A1D27] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-semibold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
            Sanctioning Commission Authority
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-display tracking-wide text-white mt-1">
            {t.adminTitle}
          </h1>
          <p className="text-sm text-[#8E95A5] mt-1">{t.adminSub}</p>
        </div>

        {/* Global Data Operations */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <button
            onClick={onExportData}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#141720] hover:bg-[#1E2330] border border-[#262B3A] text-xs text-[#C5CAD5] hover:text-white rounded transition-colors font-mono"
            title="Export all database records as JSON"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t.exportData}</span>
          </button>
          <button
            onClick={() =>
              setDeleteConfirmation({
                isOpen: true,
                type: 'reset',
                title: 'Reset Demo Data to Initial Baseline',
              })
            }
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1A1315] hover:bg-[#281A1D] border border-red-500/30 text-xs text-red-400 rounded transition-colors font-mono"
            title="Reset to default seed dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetDefaultData}</span>
          </button>
        </div>
      </div>

      {/* Notifications banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border border-red-500/30 text-red-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#1A1D27] text-xs font-semibold uppercase tracking-wider font-display">
        <button
          onClick={() => setActiveTab('fighters')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'fighters'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'text-[#8E95A5] hover:text-white bg-[#12151D]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Fighter Roster ({fighters.length})</span>
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
          <span>Sanctioned Events ({events.length})</span>
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
          <span>Editorial Articles ({articles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'text-[#8E95A5] hover:text-white bg-[#12151D]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Fighter Management */}
      {activeTab === 'fighters' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display uppercase tracking-wide text-white">
              Athlete Registry Roster
            </h3>
            <button
              onClick={() => setIsAddingFighter(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs rounded uppercase tracking-wider font-display"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addFighter}</span>
            </button>
          </div>

          <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#12151D] text-[#8E95A5] uppercase font-mono text-[11px] border-b border-[#1E232E]">
                  <tr>
                    <th className="py-3.5 px-4">Athlete</th>
                    <th className="py-3.5 px-4">Division</th>
                    <th className="py-3.5 px-4 font-mono-numbers">Record</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Commission Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181C25] text-white">
                  {fighters.map((f) => (
                    <tr key={f.id} className="hover:bg-[#13161F] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={f.portraitUrl}
                            alt={f.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-10 object-cover rounded border border-[#252A38] shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white block uppercase font-display">
                              {f.name}
                            </span>
                            <span className="text-[#8E95A5] text-[11px]">{f.nationality}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#C5CAD5]">{f.division}</td>
                      <td className="py-3.5 px-4 font-mono-numbers font-semibold">
                        {f.wins}-{f.losses}-{f.draws} ({f.knockouts} KOs)
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1B202D] text-[#D4AF37] border border-[#282F3E]">
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() =>
                            setDeleteConfirmation({
                              isOpen: true,
                              type: 'fighter',
                              id: f.id,
                              title: f.name,
                            })
                          }
                          className="p-1.5 text-[#687082] hover:text-red-400 rounded transition-colors"
                          title="Delete athlete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Event Management */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display uppercase tracking-wide text-white">
              Sanctioned Events Calendar
            </h3>
          </div>

          <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#12151D] text-[#8E95A5] uppercase font-mono text-[11px] border-b border-[#1E232E]">
                  <tr>
                    <th className="py-3.5 px-4">Event Title</th>
                    <th className="py-3.5 px-4">Division</th>
                    <th className="py-3.5 px-4">Venue & City</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181C25] text-white">
                  {events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-[#13161F] transition-colors">
                      <td className="py-3.5 px-4 font-bold uppercase font-display text-white">
                        {ev.title}
                      </td>
                      <td className="py-3.5 px-4 text-[#D4AF37] font-mono">{ev.weightDivision}</td>
                      <td className="py-3.5 px-4 text-[#C5CAD5]">
                        {ev.venue}, {ev.city}
                      </td>
                      <td className="py-3.5 px-4 font-mono-numbers text-[#8E95A5]">
                        {new Date(ev.date).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() =>
                            setDeleteConfirmation({
                              isOpen: true,
                              type: 'event',
                              id: ev.id,
                              title: ev.title,
                            })
                          }
                          className="p-1.5 text-[#687082] hover:text-red-400 rounded transition-colors"
                          title="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Articles Management */}
      {activeTab === 'articles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display uppercase tracking-wide text-white">
              Editorial Dispatches
            </h3>
          </div>

          <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#12151D] text-[#8E95A5] uppercase font-mono text-[11px] border-b border-[#1E232E]">
                  <tr>
                    <th className="py-3.5 px-4">Headline</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Author</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181C25] text-white">
                  {articles.map((art) => (
                    <tr key={art.id} className="hover:bg-[#13161F] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                        {art.title}
                      </td>
                      <td className="py-3.5 px-4 text-[#D4AF37] font-mono">{art.category}</td>
                      <td className="py-3.5 px-4 text-[#C5CAD5]">{art.author.name}</td>
                      <td className="py-3.5 px-4 font-mono-numbers text-[#8E95A5]">
                        {art.publishedAt}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() =>
                            setDeleteConfirmation({
                              isOpen: true,
                              type: 'article',
                              id: art.id,
                              title: art.title,
                            })
                          }
                          className="p-1.5 text-[#687082] hover:text-red-400 rounded transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display uppercase tracking-wide text-white">
              Commission Audit Trail
            </h3>
            <span className="text-xs text-[#8E95A5] font-mono">
              Immutable session activity log
            </span>
          </div>

          <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl overflow-hidden shadow-xl">
            <div className="divide-y divide-[#181C25] text-xs">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-[#8E95A5]">
                  No audit actions logged in this session yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : log.action === 'UPDATE'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="font-semibold text-white">{log.details}</span>
                    </div>
                    <span className="text-[11px] text-[#687082] font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Fighter */}
      {isAddingFighter && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setIsAddingFighter(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0E1016] border border-[#262B38] rounded-xl overflow-hidden shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1E232E] pb-3">
              <h3 className="text-base font-bold uppercase font-display text-white">
                Register New Contender
              </h3>
              <button
                onClick={() => setIsAddingFighter(false)}
                className="p-1 text-[#8E95A5] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFighter} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A1A7B5] font-semibold uppercase block">
                    Full Athlete Name
                  </label>
                  <input
                    type="text"
                    value={newFighterName}
                    onChange={(e) => setNewFighterName(e.target.value)}
                    placeholder="e.g. Jasur Akhmedov"
                    required
                    className="w-full bg-[#151922] border border-[#292F3E] text-white text-xs rounded-lg px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#A1A7B5] font-semibold uppercase block">
                    Ring Nickname
                  </label>
                  <input
                    type="text"
                    value={newFighterNickname}
                    onChange={(e) => setNewFighterNickname(e.target.value)}
                    placeholder="e.g. The Silk Road Tiger"
                    className="w-full bg-[#151922] border border-[#292F3E] text-white text-xs rounded-lg px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A1A7B5] font-semibold uppercase block">
                    Nationality
                  </label>
                  <select
                    value={newFighterNationality}
                    onChange={(e) => setNewFighterNationality(e.target.value)}
                    className="w-full bg-[#151922] border border-[#292F3E] text-white text-xs rounded-lg px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Uzbekistan">Uzbekistan</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Japan">Japan</option>
                    <option value="Kazakhstan">Kazakhstan</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[#A1A7B5] font-semibold uppercase block">
                    Weight Division
                  </label>
                  <select
                    value={newFighterDivision}
                    onChange={(e) => setNewFighterDivision(e.target.value)}
                    className="w-full bg-[#151922] border border-[#292F3E] text-white text-xs rounded-lg px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Heavyweight">Heavyweight</option>
                    <option value="Cruiserweight">Cruiserweight</option>
                    <option value="Light Heavyweight">Light Heavyweight</option>
                    <option value="Welterweight">Welterweight</option>
                    <option value="Lightweight">Lightweight</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-[#A1A7B5] font-semibold uppercase block">Wins</label>
                  <input
                    type="number"
                    min="0"
                    value={newFighterWins}
                    onChange={(e) => setNewFighterWins(Number(e.target.value))}
                    className="w-full bg-[#151922] border border-[#292F3E] text-white text-xs rounded-lg px-2 py-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#A1A7B5] font-semibold uppercase block">Losses</label>
                  <input
                    type="number"
                    min="0"
                    value={newFighterLosses}
                    onChange={(e) => setNewFighterLosses(Number(e.target.value))}
                    className="w-full bg-[#151922] border border-[#292F3E] text-white text-xs rounded-lg px-2 py-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#A1A7B5] font-semibold uppercase block">Draws</label>
                  <input
                    type="number"
                    min="0"
                    value={newFighterDraws}
                    onChange={(e) => setNewFighterDraws(Number(e.target.value))}
                    className="w-full bg-[#151922] border border-[#292F3E] text-white text-xs rounded-lg px-2 py-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#A1A7B5] font-semibold uppercase block">KOs</label>
                  <input
                    type="number"
                    min="0"
                    value={newFighterKnockouts}
                    onChange={(e) => setNewFighterKnockouts(Number(e.target.value))}
                    className="w-full bg-[#151922] border border-[#292F3E] text-white text-xs rounded-lg px-2 py-2"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingFighter(false)}
                  className="px-4 py-2 bg-[#171B24] text-[#A1A7B5] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] text-black font-bold uppercase font-display rounded"
                >
                  Save to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Reset Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setDeleteConfirmation({ isOpen: false, type: 'fighter' })}
        >
          <div
            className="w-full max-w-sm bg-[#0E1016] border border-red-500/40 rounded-xl p-6 space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white uppercase font-display">
                Confirm Commission Action
              </h3>
              <p className="text-xs text-[#A1A7B5] mt-1 leading-relaxed">
                Are you sure you want to proceed with: <br />
                <strong className="text-white">"{deleteConfirmation.title}"</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmation({ isOpen: false, type: 'fighter' })}
                className="px-4 py-2 bg-[#171B24] text-[#A1A7B5] rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold uppercase font-display rounded text-xs"
              >
                Proceed & Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
