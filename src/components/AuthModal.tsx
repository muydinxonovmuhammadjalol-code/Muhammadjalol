import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLoginSuccess: (user: { email: string; name: string; isAdmin?: boolean }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  onLoginSuccess,
}) => {
  const t = translations[lang];
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (tab !== 'forgot' && (!password || password.length < 6)) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (tab === 'forgot') {
        setSuccess('Password recovery dispatch sent to your verified email.');
      } else {
        const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('legacy');
        const displayName = name.trim() || email.split('@')[0];
        onLoginSuccess({
          email,
          name: displayName,
          isAdmin,
        });
        onClose();
      }
    }, 600);
  };

  const handleGuestLogin = () => {
    onLoginSuccess({
      email: 'guest@ringlegacy.com',
      name: t.guestUser,
      isAdmin: false,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0E1016] border border-[#262B38] rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E232E] bg-[#12151D]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <h2 className="text-lg font-bold font-display uppercase tracking-wider text-white">
              {tab === 'signin' ? t.signIn : tab === 'signup' ? 'Create Fan Pass' : 'Reset Password'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8E95A5] hover:text-white hover:bg-[#1E232E] rounded transition-colors"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 p-1.5 bg-[#141720] border-b border-[#1E232E] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setError('');
              setSuccess('');
            }}
            className={`py-2 rounded-lg transition-colors ${
              tab === 'signin'
                ? 'bg-[#1F2430] text-white shadow-sm'
                : 'text-[#8E95A5] hover:text-white'
            }`}
          >
            {t.signIn}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setError('');
              setSuccess('');
            }}
            className={`py-2 rounded-lg transition-colors ${
              tab === 'signup'
                ? 'bg-[#1F2430] text-white shadow-sm'
                : 'text-[#8E95A5] hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {tab === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A7B5] block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#687082] absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muhammadjalol"
                  className="w-full bg-[#151922] border border-[#292F3E] text-white text-sm rounded-lg pl-9 pr-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A7B5] block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#687082] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-[#151922] border border-[#292F3E] text-white text-sm rounded-lg pl-9 pr-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#A1A7B5] block">
                  Password
                </label>
                {tab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-xs text-[#D4AF37] hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#687082] absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#151922] border border-[#292F3E] text-white text-sm rounded-lg pl-9 pr-3 py-2.5 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs rounded uppercase tracking-wider transition-colors font-display disabled:opacity-50"
          >
            {loading
              ? 'Authenticating...'
              : tab === 'signin'
              ? 'Enter Ringside Pass'
              : tab === 'signup'
              ? 'Create Ringside Account'
              : 'Dispatch Recovery Link'}
          </button>

          {/* Quick guest login */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2 bg-[#171B24] hover:bg-[#202532] border border-[#282E3C] text-xs text-[#C5CAD5] rounded transition-colors"
            >
              Continue as Ringside Guest (Instant Access)
            </button>
          </div>

          <p className="text-[11px] text-center text-[#687082] pt-2">
            Protected under RING LEGACY authentication rules. For admin access, use an admin-associated email address.
          </p>
        </form>
      </div>
    </div>
  );
};
