import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useLangStore } from '../store/useLangStore';
import { Layout } from '../components/Layout';
import { ArrowRight, Loader2 } from 'lucide-react';
import { ScribbleCircle } from '../components/Decorations';
import clsx from 'clsx';

type AuthTab = 'signin' | 'signup';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, loading, error, clearError } = useAuthStore();
  const { t } = useLangStore();

  const [tab, setTab] = useState<AuthTab>('signin');
  const [stadtname, setStadtname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stadtname.trim() || !password.trim()) return;

    if (tab === 'signup') {
      if (password !== confirmPassword) {
        setConfirmError(t.authPasswordMismatch);
        return;
      }
      setConfirmError('');
      await signUp(stadtname, password);
    } else {
      await signIn(stadtname, password);
    }

    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  };

  const switchTab = (newTab: AuthTab) => {
    setTab(newTab);
    clearError();
    setConfirmPassword('');
    setConfirmError('');
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
        {/* Left Column - Hero Text */}
        <div className="lg:col-span-7 pt-12 relative">
          <h1 className="text-6xl md:text-8xl font-display font-medium tracking-tighter leading-[0.9] mb-12 whitespace-pre-line">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl font-light text-hb-gray max-w-md leading-relaxed">
            {t.heroSubtitle}
          </p>
          <ScribbleCircle className="-top-10 -left-10 opacity-10" />
        </div>

        {/* Right Column - Auth Form */}
        <div className="lg:col-span-5 pt-12">
          <div className="bg-white p-12 border border-hb-line relative">
            {/* Tab Switcher */}
            <div className="flex space-x-6 mb-10 border-b border-hb-line">
              <button
                onClick={() => switchTab('signin')}
                className={clsx(
                  "text-sm font-medium pb-3 -mb-px transition-colors uppercase tracking-wider",
                  tab === 'signin'
                    ? "text-hb-ink border-b border-hb-ink"
                    : "text-hb-gray hover:text-hb-ink"
                )}
              >
                {t.authSignIn}
              </button>
              <button
                onClick={() => switchTab('signup')}
                className={clsx(
                  "text-sm font-medium pb-3 -mb-px transition-colors uppercase tracking-wider",
                  tab === 'signup'
                    ? "text-hb-ink border-b border-hb-ink"
                    : "text-hb-gray hover:text-hb-ink"
                )}
              >
                {t.authSignUp}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="group">
                <label className="block text-xs font-mono uppercase tracking-widest text-hb-gray mb-4">
                  {t.authStadtnameLabel}
                </label>
                <input
                  type="text"
                  value={stadtname}
                  onChange={(e) => setStadtname(e.target.value)}
                  className="hb-input text-2xl font-display"
                  placeholder={t.authStadtnamePlaceholder}
                  autoComplete="username"
                />
              </div>

              <div className="group">
                <label className="block text-xs font-mono uppercase tracking-widest text-hb-gray mb-4">
                  {t.authPasswordLabel}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="hb-input text-2xl font-display"
                  placeholder="••••••••"
                  autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                />
              </div>

              {tab === 'signup' && (
                <div className="group">
                  <label className="block text-xs font-mono uppercase tracking-widest text-hb-gray mb-4">
                    {t.authConfirmPasswordLabel}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="hb-input text-2xl font-display"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
              )}

              {confirmError && (
                <div className="text-sm text-red-600 font-light bg-red-50 border border-red-200 p-4">
                  {confirmError}
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 font-light bg-red-50 border border-red-200 p-4">
                  {error}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !stadtname.trim() || !password.trim() || (tab === 'signup' && !confirmPassword.trim())}
                  className={clsx(
                    "w-full border border-hb-ink bg-hb-ink text-white hover:bg-white hover:text-hb-ink",
                    "px-8 py-4 text-sm font-medium uppercase tracking-widest transition-all duration-300",
                    "flex items-center justify-between group",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-hb-ink disabled:hover:text-white"
                  )}
                >
                  <span>
                    {tab === 'signin' ? t.authSignInAction : t.authSignUpAction}
                  </span>
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};
