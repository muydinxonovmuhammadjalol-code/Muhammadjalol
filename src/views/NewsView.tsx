import React, { useState, useMemo } from 'react';
import { Search, Clock, Calendar, Bookmark, ArrowRight, Newspaper, User } from 'lucide-react';
import { Article } from '../types';
import { Language, translations } from '../i18n/translations';

interface NewsViewProps {
  articles: Article[];
  lang: Language;
  onOpenArticle: (id: string) => void;
  savedArticleIds: string[];
  onToggleBookmarkArticle: (id: string) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({
  articles,
  lang,
  onOpenArticle,
  savedArticleIds,
  onToggleBookmarkArticle,
}) => {
  const t = translations[lang];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'all',
    'Championship',
    'History',
    'Training',
    'Previews',
    'Interviews',
    'Results',
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      if (selectedCategory !== 'all' && art.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          art.title.toLowerCase().includes(q) ||
          art.subtitle.toLowerCase().includes(q) ||
          art.author.name.toLowerCase().includes(q) ||
          art.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#1A1D27] pb-6">
        <span className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-semibold">
          Combat Sports Journal
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase font-display tracking-wide text-white mt-1">
          {t.newsTitle}
        </h1>
        <p className="text-sm text-[#8E95A5] mt-1">{t.newsSub}</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0E1117] border border-[#1E232E] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider font-display rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'bg-[#141720] text-[#A1A7B5] hover:text-white border border-[#242936]'
              }`}
            >
              {cat === 'all' ? 'All Stories' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#687082] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories, authors, tags..."
            className="w-full bg-[#141720] border border-[#252A38] text-white text-xs rounded-lg pl-8 pr-3 py-2 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>
      </div>

      {/* Featured Lead Story */}
      {filteredArticles.length > 0 && selectedCategory === 'all' && !searchQuery && (
        <div
          onClick={() => onOpenArticle(filteredArticles[0].id)}
          className="group relative bg-[#0E1117] border border-[#202532] hover:border-[#D4AF37]/50 rounded-xl overflow-hidden cursor-pointer transition-all shadow-xl grid grid-cols-1 lg:grid-cols-12"
        >
          <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto overflow-hidden bg-[#141720]">
            <img
              src={filteredArticles[0].imageUrl}
              alt={filteredArticles[0].title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1117] via-transparent to-transparent lg:hidden" />
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[#D4AF37] font-semibold uppercase">
                  {filteredArticles[0].category}
                </span>
                <span className="text-[#505768]">·</span>
                <span className="text-[#8E95A5]">
                  {filteredArticles[0].readingTimeMinutes} {t.readTime}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-[#D4AF37] transition-colors leading-tight font-display uppercase tracking-wide">
                {filteredArticles[0].title}
              </h2>

              <p className="text-xs sm:text-sm text-[#A1A7B5] leading-relaxed line-clamp-3">
                {filteredArticles[0].subtitle}
              </p>
            </div>

            <div className="pt-4 border-t border-[#1C202B] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#C5CAD5]">
                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{filteredArticles[0].author.name}</span>
              </div>
              <span className="text-xs font-bold text-[#D4AF37] font-display uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Read Dispatch <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(selectedCategory === 'all' && !searchQuery
          ? filteredArticles.slice(1)
          : filteredArticles
        ).map((article) => {
          const isSaved = savedArticleIds.includes(article.id);
          return (
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

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmarkArticle(article.id);
                  }}
                  className={`absolute top-2.5 right-2.5 p-1.5 rounded backdrop-blur-sm transition-colors ${
                    isSaved ? 'bg-[#D4AF37] text-black' : 'bg-black/60 text-white/80 hover:text-white'
                  }`}
                  title="Bookmark"
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-[#687082] font-mono-numbers">
                    <span>{article.publishedAt}</span>
                    <span>·</span>
                    <span>{article.readingTimeMinutes} min read</span>
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
          );
        })}
      </div>
    </div>
  );
};
