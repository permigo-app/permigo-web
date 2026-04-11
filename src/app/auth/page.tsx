'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const router = useRouter();
  const { signUp, signIn, user } = useAuth();

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (user) {
    router.replace('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Remplis tous les champs.');
      return;
    }
    setLoading(true);

    if (mode === 'signup') {
      const result = await signUp(email.trim().toLowerCase(), password, username.trim() || 'Pilote');
      setLoading(false);
      if (result.error) { setError(result.error); return; }
      if (result.needsConfirmation) { setConfirmed(true); return; }
      window.location.href = '/';
    } else {
      const result = await signIn(email.trim().toLowerCase(), password);
      setLoading(false);
      if (result.error) { setError(result.error); return; }
      window.location.href = '/';
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 12,
    border: '1.5px solid #2A3550',
    background: '#16213E',
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Nunito, sans-serif',
    outline: 'none',
  };

  if (confirmed) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e2a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>📧</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Vérifie ton email !</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
            Un lien de confirmation a été envoyé à <strong style={{ color: '#4ecdc4' }}>{email}</strong>.<br />
            Clique dessus pour activer ton compte.
          </p>
          <button
            onClick={() => { setConfirmed(false); setMode('login'); }}
            style={{ background: '#4ecdc4', color: '#0a0e2a', fontWeight: 900, fontSize: 16, borderRadius: 100, padding: '14px 40px', border: 'none', cursor: 'pointer' }}
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e2a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ maxWidth: 420, width: '100%' }}>

        {/* Gaston */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Image src="/images/gaston.png" width={90} height={90} alt="Prof. Gaston" style={{ objectFit: 'contain' }} />
        </div>

        <h1 style={{ textAlign: 'center', fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
          {mode === 'signup' ? 'Crée ton compte' : 'Content de te revoir !'}
        </h1>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 32 }}>
          {mode === 'signup' ? 'Pour sauvegarder ta progression' : 'Connecte-toi pour continuer'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#8B9DC3', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Prénom</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ex: Lucas"
                style={inputStyle}
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#8B9DC3', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ton@email.be"
              style={inputStyle}
              autoComplete="email"
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#8B9DC3', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(231,76,60,0.12)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: 10, padding: '10px 14px', color: '#e74c3c', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: loading ? 'rgba(78,205,196,0.4)' : 'linear-gradient(135deg, #4ecdc4, #26a69a)',
              color: '#0a0e2a',
              fontWeight: 900,
              fontSize: 16,
              borderRadius: 100,
              padding: '15px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            {loading ? '...' : mode === 'signup' ? "S'inscrire" : 'Se connecter'}
          </button>
        </form>

        {/* Toggle mode */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
          {mode === 'signup' ? (
            <>Déjà un compte ?{' '}
              <button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: '#4ecdc4', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Nunito, sans-serif' }}>
                Se connecter
              </button>
            </>
          ) : (
            <>Pas encore de compte ?{' '}
              <button onClick={() => { setMode('signup'); setError(''); }} style={{ background: 'none', border: 'none', color: '#4ecdc4', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'Nunito, sans-serif' }}>
                S'inscrire
              </button>
            </>
          )}
        </p>

        {/* Skip */}
        <p style={{ textAlign: 'center', marginTop: 12 }}>
          <button
            onClick={() => {
              localStorage.setItem('@onboarding_done', 'true');
              document.cookie = 'onboarding_done=true; path=/; max-age=31536000; SameSite=Lax';
              window.location.href = '/';
            }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}
          >
            Continuer sans compte →
          </button>
        </p>

      </div>
    </div>
  );
}
