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

  // Redirect if already logged in
  if (user) {
    router.push('/');
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
      window.location.href = '/';
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
    window.location.href = '/';
  };

  return (
    <div className="max-w-md mx-auto px-5 py-12 relative">
      <div className="absolute top-0 right-0"><LanguageSwitcher /></div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black">{t('login_titre')}</h1>
        <p className="text-sm" style={{ color: '#8B9DC3' }}>{t('login_subtitle')}</p>
      </div>

      <div className="mb-6">
        <Gaston message={t('login_gaston')} expression="happy" size="large" />
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-3 mb-4 fade-in-up">
        <input type="email" placeholder={t('login_email')} value={email} onChange={e => setEmail(e.target.value)}
          className="rounded-2xl px-4 py-3.5 text-white placeholder-[#5A6B8A] focus:outline-none transition-all duration-200"
          style={{ background: '#16213E', border: '2px solid #2A3550' }}
          onFocus={e => { e.currentTarget.style.borderColor = '#4ecdc4'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(78,205,196,0.15)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = '#2A3550'; e.currentTarget.style.boxShadow = 'none'; }} />
        {!showForgot && (
          <input type="password" placeholder={t('login_mdp')} value={password} onChange={e => setPassword(e.target.value)}
            className="rounded-2xl px-4 py-3.5 text-white placeholder-[#5A6B8A] focus:outline-none transition-all duration-200"
            style={{ background: '#16213E', border: '2px solid #2A3550' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#4ecdc4'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(78,205,196,0.15)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#2A3550'; e.currentTarget.style.boxShadow = 'none'; }} />
        )}
        {error && <p className="text-sm" style={{ color: '#FF6B6B' }}>{error}</p>}
        {success && <p className="text-sm" style={{ color: '#00B894' }}>{success}</p>}

        {showForgot ? (
          <button type="button" onClick={handleForgotPassword} disabled={loading}
            className="py-3.5 rounded-2xl font-black text-white press-scale disabled:opacity-50 btn-glow-teal"
            style={{ background: 'linear-gradient(135deg, #4ecdc4, #26a69a)', color: '#0a0e2a' }}>
            {loading ? t('login_reset_loading') : t('login_reset_link')}
          </button>
        ) : (
          <button type="submit" disabled={loading}
            className="py-3.5 rounded-2xl font-black press-scale disabled:opacity-50 btn-glow-teal"
            style={{ background: 'linear-gradient(135deg, #4ecdc4, #26a69a)', color: '#0a0e2a' }}>
            {loading ? t('login_connexion_loading') : t('login_connexion')}
          </button>
        )}
      </form>

      <button
        onClick={() => { setShowForgot(!showForgot); setError(''); setSuccess(''); }}
        className="text-xs font-bold mb-4 block mx-auto"
        style={{ color: '#8B9DC3' }}
      >
        {showForgot ? t('login_retour') : t('login_mdp_oublie')}
      </button>

      <div className="text-center mb-4"><span className="text-sm" style={{ color: '#5A6B8A' }}>{t('login_ou')}</span></div>

      <button onClick={handleGuest} className="w-full py-3.5 rounded-2xl font-bold press-scale" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
        {t('login_invite')}
      </button>

      <p className="text-center text-sm mt-6" style={{ color: '#8B9DC3' }}>
        {t('login_pas_compte')}{' '}
        <Link href="/register" className="font-bold" style={{ color: '#00B894' }}>{t('s_inscrire')}</Link>
      </p>
    </div>
  );
}
