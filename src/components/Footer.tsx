import React, { useState } from 'react';
import { Mail, ArrowUp, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, lang }) => {
  const t = translations[lang];
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setErrorMessage('');

    if (!email || !email.includes('@') || !email.includes('.')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus('success');
      setEmail('');
    }, 700);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#07080A] border-t border-[#181B24] text-[#8E95A5] text-xs">
      {/* Newsletter Section */}
      <div className="border-b border-[#181B24] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
              Ringside Intelligence
            </span>
            <h3 className="text-2xl font-bold font-display uppercase tracking-wide text-white mt-1">
              {t.newsletterTitle}
            </h3>
            <p className="text-sm text-[#A1A7B5] mt-1.5 leading-relaxed">
              {t.newsletterSub}
            </p>
          </div>

          <div className="w-full lg:w-auto">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="bg-[#12151D] border border-[#262C3A] text-white text-xs sm:text-sm rounded-lg px-4 py-2.5 focus:border-[#D4AF37] focus:outline-none flex-1"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs rounded uppercase tracking-wider font-display transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {loading ? t.subscribing : t.subscribe}
              </button>
            </form>

            {status === 'success' && (
              <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t.subscribeSuccess}
              </p>
            )}
            {status === 'error' && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#D4AF37] transform rotate-45" />
              <span className="text-lg font-black tracking-wider uppercase font-display text-white">
                RING LEGACY
              </span>
            </div>
            <p className="text-xs text-[#8E95A5] leading-relaxed">
              {t.tagline}
            </p>
            <p className="text-[11px] text-[#555C6D] leading-relaxed pt-1">
              Sanctioned athlete data modeling, division rankings, and sports journalism simulation.
            </p>
          </div>

          {/* Directory Links */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white font-display">
              Directory & Events
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectTab('fighters')}
                  className="hover:text-white transition-colors"
                >
                  {t.navFighters}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('events')}
                  className="hover:text-white transition-colors"
                >
                  {t.navEvents}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('rankings')}
                  className="hover:text-white transition-colors"
                >
                  {t.navRankings}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('stats')}
                  className="hover:text-white transition-colors"
                >
                  {t.navStats}
                </button>
              </li>
            </ul>
          </div>

          {/* Editorial & Academy */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white font-display">
              Editorial & Academy
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectTab('news')}
                  className="hover:text-white transition-colors"
                >
                  {t.navNews}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('training')}
                  className="hover:text-white transition-colors"
                >
                  {t.navTraining}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('dashboard')}
                  className="hover:text-white transition-colors"
                >
                  {t.navDashboard}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('admin')}
                  className="hover:text-white transition-colors"
                >
                  {t.navAdmin}
                </button>
              </li>
            </ul>
          </div>

          {/* Governance & Compliance */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white font-display">
              Commission & Standards
            </span>
            <ul className="space-y-2 text-[11px]">
              <li>Independent Ratings Panel</li>
              <li>Medical & Safety Oversight</li>
              <li>Clean Boxing Program</li>
              <li>Digital Archive & Telemetry</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#181B24] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#555C6D]">
          <div>
            © {currentYear} RING LEGACY. {t.allRightsReserved}
            <span className="mx-2">·</span>
            {t.footerLegal}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={scrollToTop} className="flex items-center gap-1 text-[#8E95A5] hover:text-white transition-colors">
              <span>{t.backToTop}</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
