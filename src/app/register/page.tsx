'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const { signUp, user } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (user) {
    router.push('/app');
    return null;
  }

  if (showConfirmation) {
    return (
      <div className="max-w-md mx-auto px-5 py-12 text-center relative">
        <div className="absolute top-0 right-0"><LanguageSwitcher /></div>
        <span className="text-[80px] block mb-4">📧</span>
        <h1 className="text-2xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>{t('register_verif_titre')}</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {t('register_verif_msg')} <strong style={{ color: 'var(--success)' }}>{email}</strong>.
          <br />{t('register_verif_lien')}
        </p>
        <Link href="/login" className="inline-block py-3.5 px-8 rounded-2xl font-black press-scale" style={{ background: 'var(--success)', color: '#fff' }}>
          {t('register_retour')}
        </Link>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError(t('register_remplir'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('register_mdp_mismatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('register_mdp_min'));
      return;
    }

    setError('');
    setLoading(true);
    const result = await signUp(email, password, username);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.needsConfirmation) {
      setShowConfirmation(true);
    } else {
      localStorage.setItem('@onboarding_done', 'true');
      document.cookie = 'onboarding_done=true; path=/; max-age=31536000; SameSite=Lax';
      window.location.href = '/';
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--card-secondary)',
    border: '2px solid var(--border-subtle)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="max-w-md mx-auto px-5 py-12 relative">
      <div className="absolute top-0 right-0"><LanguageSwitcher /></div>
      <div className="text-center mb-8">
        <span className="text-[64px] block mb-3">🎓</span>
        <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{t('register_titre')}</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('register_subtitle')}</p>
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-3 mb-6">
        <input type="text" placeholder={t('register_nom')} value={username} onChange={e => setUsername(e.target.value)}
          className="rounded-2xl px-4 py-3.5 focus:outline-none"
          style={inputStyle} />
        <input type="email" placeholder={t('register_email')} value={email} onChange={e => setEmail(e.target.value)}
          className="rounded-2xl px-4 py-3.5 focus:outline-none"
          style={inputStyle} />
        <input type="password" placeholder={t('register_mdp')} value={password} onChange={e => setPassword(e.target.value)}
          className="rounded-2xl px-4 py-3.5 focus:outline-none"
          style={inputStyle} />
        <input type="password" placeholder={t('register_mdp_confirm')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
          className="rounded-2xl px-4 py-3.5 focus:outline-none"
          style={inputStyle} />
        {error && <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>}
        <button type="submit" disabled={loading}
          className="py-3.5 rounded-2xl font-black press-scale disabled:opacity-50"
          style={{ background: 'var(--success)', color: '#fff' }}>
          {loading ? t('register_loading') : t('register_creer')}
        </button>
      </form>

      <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('register_deja_compte')}{' '}
        <Link href="/login" className="font-bold" style={{ color: 'var(--success)' }}>{t('se_connecter')}</Link>
      </p>
    </div>
  );
}
