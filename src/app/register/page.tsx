'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';

const BENEFITS = [
  { icon: '📚', text: '2 286 questions officielles' },
  { icon: '🎯', text: '9 thèmes, leçon par leçon' },
  { icon: '📝', text: 'Examens blancs & entraînement chronométré' },
  { icon: '🇧🇪', text: 'FR + NL · gratuit pour commencer' },
];

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
  // Pendant l'inscription, `user` se remplit avant notre redirection vers
  // /choix-permis — ce garde ne doit viser que les visiteurs déjà connectés.
  const registeringRef = useRef(false);

  if (user && !registeringRef.current) {
    router.push('/app');
    return null;
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
    registeringRef.current = true;
    const result = await signUp(email, password, username);
    setLoading(false);
    if (result.error) registeringRef.current = false;

    if (result.error) {
      setError(result.error);
    } else if (result.needsConfirmation) {
      setShowConfirmation(true);
    } else {
      localStorage.setItem('@onboarding_done', 'true');
      document.cookie = 'onboarding_done=true; path=/; max-age=31536000; SameSite=Lax';
      // Nouveau parcours : inscription → choix du permis → accueil
      window.location.href = '/choix-permis';
    }
  };

  const inputStyle: React.CSSProperties = {
    borderRadius: 13, padding: '14px 16px',
    fontSize: 14, fontFamily: 'Sora, sans-serif',
    background: 'var(--bg-input)',
    border: '1.5px solid var(--border-card)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#22D6C7';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34,214,199,0.12)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--border-card)';
    e.currentTarget.style.boxShadow = 'none';
  };

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
        <div style={{ position:'absolute', top:-100, right:-60, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(34,214,199,0.07) 0%,transparent 60%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, left:-60, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle,rgba(245,158,11,0.05) 0%,transparent 60%)', pointerEvents:'none' }} />

        <div style={{ position: 'relative' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 40 }}>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
              <span style={{ color: '#F1F5F9' }}>My</span>
              <span style={{ color: '#22D6C7' }}>Permi</span>
              <span style={{ color: '#55E6DA' }}>Go</span>
            </span>
          </Link>

          <h2 style={{ margin: '0 0 10px', fontSize: 30, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.8px', lineHeight: 1.15 }}>
            Prépare ton<br />
            <span style={{
              background: 'linear-gradient(135deg,#22D6C7,#55E6DA)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              permis belge
            </span>
          </h2>
          <p style={{ margin: '0 0 36px', fontSize: 14, color: 'rgba(241,245,249,0.5)', lineHeight: 1.7 }}>
            Crée ton compte gratuit et suis ta progression, thème par thème.
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
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <LanguageSwitcher />
        </div>

        <div style={{ width: '100%', maxWidth: 400 }}>
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
                <span style={{ color: 'var(--text-primary)' }}>My</span>
                <span style={{ color: '#22D6C7' }}>Permi</span>
                <span style={{ color: '#55E6DA' }}>Go</span>
              </span>
            </Link>
          </div>

          {showConfirmation ? (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 64, display: 'block', marginBottom: 16 }}>📧</span>
              <h1 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 900, color: 'var(--text-title)', letterSpacing: '-0.5px' }}>
                {t('register_verif_titre')}
              </h1>
              <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7 }}>
                {t('register_verif_msg')} <strong style={{ color: '#22D6C7' }}>{email}</strong>. {t('register_verif_lien')}
              </p>
              <Link href="/login" className="press-scale" style={{
                display: 'inline-flex', padding: '14px 28px', borderRadius: 13,
                background: 'linear-gradient(135deg,#22D6C7,#1AB8AB)', color: '#07080F',
                fontWeight: 800, fontSize: 15, textDecoration: 'none',
              }}>
                {t('register_retour')}
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 900, color: 'var(--text-title)', letterSpacing: '-0.5px' }}>
                  {t('register_titre')}
                </h1>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-sub)' }}>{t('register_subtitle')}</p>
              </div>

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                <input
                  type="text" placeholder={t('register_nom')} value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                />
                <input
                  type="email" placeholder={t('register_email')} value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                />
                <input
                  type="password" placeholder={t('register_mdp')} value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                />
                <input
                  type="password" placeholder={t('register_mdp_confirm')} value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                />

                {error && <p style={{ fontSize: 13, color: 'var(--error)', margin: '2px 0 0', fontWeight: 600 }}>{error}</p>}

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
                    marginTop: 4,
                  }}>
                  {loading ? t('register_loading') : t('register_creer')}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 13, marginTop: 20, color: 'var(--text-sub)' }}>
                {t('register_deja_compte')}{' '}
                <Link href="/login" style={{ fontWeight: 700, color: '#22D6C7', textDecoration: 'none' }}>
                  {t('se_connecter')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
