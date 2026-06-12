'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

  const BENEFITS = [
    { icon: '📚', text: '2 286 questions officielles' },
    { icon: '⚡', text: 'Mode Turbo & examens blancs' },
    { icon: '🔥', text: 'Streaks, XP & badges' },
    { icon: '🇧🇪', text: 'FR + NL · 100% gratuit' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg-page)',
      fontFamily: 'Sora, sans-serif',
    }}>
      {/* ── Left panel — branding (desktop only) ── */}
      <div className="hidden lg:flex" style={{
        width: 420, flexShrink: 0,
        background: 'linear-gradient(160deg, #0E1525 0%, #07080F 100%)',
        borderRight: '1px solid var(--border-card)',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{ position:'absolute', top:-100, right:-60, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(34,214,199,0.07) 0%,transparent 60%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, left:-60, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle,rgba(245,158,11,0.05) 0%,transparent 60%)', pointerEvents:'none' }} />

        <div style={{ position: 'relative' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 40 }}>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
              <span style={{ color: '#F1F5F9' }}>My</span>
              <span style={{ color: '#22D6C7' }}>Permi</span>
              <span style={{ color: '#55E6DA' }}>Go</span>
            </span>
          </Link>

          <h2 style={{ margin: '0 0 10px', fontSize: 30, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.8px', lineHeight: 1.15 }}>
            Bienvenue,<br />
            <span style={{
              background: 'linear-gradient(135deg,#22D6C7,#55E6DA)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              bon retour !
            </span>
          </h2>
          <p style={{ margin: '0 0 36px', fontSize: 14, color: 'rgba(241,245,249,0.5)', lineHeight: 1.7 }}>
            Reprends là où tu t&apos;es arrêté et continue vers ton permis.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {BENEFITS.map(b => (
              <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(34,214,199,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>
                  {b.icon}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(241,245,249,0.75)' }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px', position: 'relative',
      }}>
        {/* Language switcher */}
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <LanguageSwitcher />
        </div>

        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
                <span style={{ color: 'var(--text-primary)' }}>My</span>
                <span style={{ color: '#22D6C7' }}>Permi</span>
                <span style={{ color: '#55E6DA' }}>Go</span>
              </span>
            </Link>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 900, color: 'var(--text-title)', letterSpacing: '-0.5px' }}>
              {t('login_titre')}
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-sub)' }}>{t('login_subtitle')}</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
            <input
              type="email"
              placeholder={t('login_email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                borderRadius: 13, padding: '14px 16px',
                fontSize: 14, fontFamily: 'Sora, sans-serif',
                background: 'var(--bg-input)',
                border: '1.5px solid var(--border-card)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#22D6C7'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34,214,199,0.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            {!showForgot && (
              <input
                type="password"
                placeholder={t('login_mdp')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  borderRadius: 13, padding: '14px 16px',
                  fontSize: 14, fontFamily: 'Sora, sans-serif',
                  background: 'var(--bg-input)',
                  border: '1.5px solid var(--border-card)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#22D6C7'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34,214,199,0.12)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            )}

            {error && <p style={{ fontSize: 13, color: 'var(--error)', margin: '2px 0 0', fontWeight: 600 }}>{error}</p>}
            {success && <p style={{ fontSize: 13, color: 'var(--success)', margin: '2px 0 0', fontWeight: 600 }}>{success}</p>}

            {showForgot ? (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="press-scale"
                style={{
                  padding: '14px', borderRadius: 13, fontWeight: 800, fontSize: 15,
                  background: 'linear-gradient(135deg,#22D6C7,#1AB8AB)',
                  color: '#07080F', border: 'none', cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.6 : 1, fontFamily: 'Sora, sans-serif',
                  boxShadow: '0 4px 18px rgba(34,214,199,0.2)',
                }}>
                {loading ? t('login_reset_loading') : t('login_reset_link')}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="press-scale"
                style={{
                  padding: '14px', borderRadius: 13, fontWeight: 800, fontSize: 15,
                  background: 'linear-gradient(135deg,#22D6C7,#1AB8AB)',
                  color: '#07080F', border: 'none', cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.6 : 1, fontFamily: 'Sora, sans-serif',
                  boxShadow: '0 4px 18px rgba(34,214,199,0.2)',
                }}>
                {loading ? t('login_connexion_loading') : t('login_connexion')}
              </button>
            )}
          </form>

          <button
            onClick={() => { setShowForgot(!showForgot); setError(''); setSuccess(''); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, color: 'var(--text-sub)',
              display: 'block', margin: '0 auto 18px', fontFamily: 'Sora, sans-serif',
              padding: '4px 0',
            }}
          >
            {showForgot ? t('login_retour') : t('login_mdp_oublie')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-card)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-hint)', fontWeight: 500 }}>{t('login_ou')}</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-card)' }} />
          </div>

          <button
            onClick={handleGuest}
            className="press-scale"
            style={{
              width: '100%', padding: '13px', borderRadius: 13,
              fontWeight: 700, fontSize: 14,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer', fontFamily: 'Sora, sans-serif',
            }}>
            {t('login_invite')}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, marginTop: 20, color: 'var(--text-sub)' }}>
            {t('login_pas_compte')}{' '}
            <Link href="/auth" style={{ fontWeight: 700, color: '#22D6C7', textDecoration: 'none' }}>
              {t('s_inscrire')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
