import React, { useState } from 'react';
import { X, Bookmark, Share2, Clock, Calendar, Check, BookOpen } from 'lucide-react';
import { Article } from '../types';
import { Language, translations } from '../i18n/translations';

interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  isOpen,
  onClose,
  lang,
  isBookmarked,
  onToggleBookmark,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);

  if (!isOpen || !article) return null;

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('article', article.slug);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#0D0F14] border border-[#252A36] rounded-xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E232E] bg-[#12151D]">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-[#D4AF37] font-semibold">
              {article.category}
            </span>
            <span className="text-[#505768]">·</span>
            <span className="text-xs text-[#8E95A5] flex items-center gap-1 font-mono-numbers">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTimeMinutes} {t.readTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
                isBookmarked
                  ? 'bg-[#D4AF37] text-black font-semibold'
                  : 'bg-[#181B24] border border-[#262C3A] text-[#C5CAD5] hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>{isBookmarked ? 'Saved' : 'Save Story'}</span>
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-[#8E95A5] hover:text-white hover:bg-[#1E232E] rounded transition-colors"
              title="Share article"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8E95A5] hover:text-white hover:bg-[#1E232E] rounded transition-colors"
              aria-label={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero image banner */}
        <div className="relative h-56 sm:h-72 overflow-hidden bg-[#10131A]">
          <img
            src={article.imageUrl}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F14] via-[#0D0F14]/50 to-transparent flex items-end p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display uppercase tracking-wide text-white leading-tight">
              {article.title}
            </h1>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Byline */}
          <div className="flex items-center justify-between py-3 border-y border-[#1E232E] text-xs text-[#8E95A5]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold">
                {article.author.name[0]}
              </div>
              <div>
                <span className="font-semibold text-white block">{article.author.name}</span>
                <span className="text-[11px] text-[#8E95A5]">{article.author.role}</span>
              </div>
            </div>
            <span className="flex items-center gap-1 font-mono-numbers">
              <Calendar className="w-3.5 h-3.5" />
              {article.publishedAt}
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-base text-[#D4AF37] font-medium italic leading-relaxed">
            "{article.subtitle}"
          </p>

          {/* Article paragraphs */}
          <div className="prose prose-invert max-w-none text-sm sm:text-base leading-relaxed text-[#D2D7E0] space-y-4">
            {article.body.split('\n\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Tags */}
          <div className="pt-4 border-t border-[#1E232E] flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-[#8E95A5]">Topics:</span>
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs bg-[#171B24] border border-[#252B38] px-2.5 py-1 rounded text-[#A1A7B5]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
