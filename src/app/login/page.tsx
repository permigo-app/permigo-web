'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Gaston from '@/components/Gaston';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const { signIn, resetPassword, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  if (user) {
    router.push('/app');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError(t('login_remplir')); return; }
    setError('');
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      localStorage.setItem('@onboarding_done', 'true');
      document.cookie = 'onboarding_done=true; path=/; max-age=31536000; SameSite=Lax';
      window.location.href = '/app';
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError(t('login_email_reset')); return; }
    setError('');
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(t('login_reset_envoye'));
    }
  };

  const handleGuest = () => {
    localStorage.setItem('@onboarding_done', 'true');
    localStorage.setItem('userCar', JSON.stringify({ id: 'red', name: 'Rouge', image: '/images/cars/car-red.png', color: '#e74c3c' }));
    localStorage.setItem('userProfile', JSON.stringify({ name: 'Pilote', carColor: '#e74c3c', carType: 'red', objective: 'relax' }));
    document.cookie = 'onboarding_done=true; path=/; max-age=31536000; SameSite=Lax';
    window.location.href = '/app';
  };

  const inputCls = 'rounded-2xl px-4 py-3.5 focus:outline-none transition-all duration-200';
  const inputStyle: React.CSSProperties = {
    background: 'var(--card-secondary)',
    border: '2px solid var(--border-subtle)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="max-w-md mx-auto px-5 py-12 relative">
      <div className="absolute top-0 right-0"><LanguageSwitcher /></div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{t('login_titre')}</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('login_subtitle')}</p>
      </div>

      <div className="mb-6">
        <Gaston message={t('login_gaston')} expression="happy" size="large" />
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-3 mb-4 fade-in-up">
        <input type="email" placeholder={t('login_email')} value={email} onChange={e => setEmail(e.target.value)}
          className={inputCls}
          style={inputStyle}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(78,205,196,0.15)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }} />
        {!showForgot && (
          <input type="password" placeholder={t('login_mdp')} value={password} onChange={e => setPassword(e.target.value)}
            className={inputCls}
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(78,205,196,0.15)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }} />
        )}
        {error && <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>}
        {success && <p className="text-sm" style={{ color: 'var(--success)' }}>{success}</p>}

        {showForgot ? (
          <button type="button" onClick={handleForgotPassword} disabled={loading}
            className="py-3.5 rounded-2xl font-black press-scale disabled:opacity-50 btn-glow-teal"
            style={{ background: 'var(--brand)', color: 'var(--bg-primary)' }}>
            {loading ? t('login_reset_loading') : t('login_reset_link')}
          </button>
        ) : (
          <button type="submit" disabled={loading}
            className="py-3.5 rounded-2xl font-black press-scale disabled:opacity-50 btn-glow-teal"
            style={{ background: 'var(--brand)', color: 'var(--bg-primary)' }}>
            {loading ? t('login_connexion_loading') : t('login_connexion')}
          </button>
        )}
      </form>

      <button
        onClick={() => { setShowForgot(!showForgot); setError(''); setSuccess(''); }}
        className="text-xs font-bold mb-4 block mx-auto"
        style={{ color: 'var(--text-secondary)' }}
      >
        {showForgot ? t('login_retour') : t('login_mdp_oublie')}
      </button>

      <div className="text-center mb-4"><span className="text-sm" style={{ color: 'var(--text-disabled)' }}>{t('login_ou')}</span></div>

      <button onClick={handleGuest} className="w-full py-3.5 rounded-2xl font-bold press-scale" style={{ background: 'var(--card-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
        {t('login_invite')}
      </button>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
        {t('login_pas_compte')}{' '}
        <Link href="/auth" className="font-bold" style={{ color: 'var(--success)' }}>{t('s_inscrire')}</Link>
      </p>
    </div>
  );
}
