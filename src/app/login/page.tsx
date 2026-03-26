'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Gaston from '@/components/Gaston';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
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
    if (!email || !password) { setError('Remplis tous les champs'); return; }
    setError('');
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Entre ton email pour réinitialiser'); return; }
    setError('');
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Email de réinitialisation envoyé ! Vérifie ta boîte mail.');
    }
  };

  const handleGuest = () => {
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto px-5 py-12">
      <div className="text-center mb-8">
        <span className="text-[64px] block mb-3">🚗</span>
        <h1 className="text-2xl font-black">Connexion</h1>
        <p className="text-sm" style={{ color: '#8B9DC3' }}>Retrouve ta progression</p>
      </div>

      <div className="mb-6">
        <Gaston message="Content de te revoir ! Connecte-toi ! 🎓" expression="happy" size="small" />
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-3 mb-4">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="rounded-2xl px-4 py-3.5 text-white placeholder-[#5A6B8A] focus:outline-none"
          style={{ background: '#16213E', border: '2px solid #2A3550' }} />
        {!showForgot && (
          <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)}
            className="rounded-2xl px-4 py-3.5 text-white placeholder-[#5A6B8A] focus:outline-none"
            style={{ background: '#16213E', border: '2px solid #2A3550' }} />
        )}
        {error && <p className="text-sm" style={{ color: '#FF6B6B' }}>{error}</p>}
        {success && <p className="text-sm" style={{ color: '#00B894' }}>{success}</p>}

        {showForgot ? (
          <button type="button" onClick={handleForgotPassword} disabled={loading}
            className="py-3.5 rounded-2xl font-black text-white press-scale disabled:opacity-50"
            style={{ background: '#00B894' }}>
            {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
          </button>
        ) : (
          <button type="submit" disabled={loading}
            className="py-3.5 rounded-2xl font-black text-white press-scale disabled:opacity-50"
            style={{ background: '#00B894' }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        )}
      </form>

      <button
        onClick={() => { setShowForgot(!showForgot); setError(''); setSuccess(''); }}
        className="text-xs font-bold mb-4 block mx-auto"
        style={{ color: '#8B9DC3' }}
      >
        {showForgot ? 'Retour à la connexion' : 'Mot de passe oublié ?'}
      </button>

      <div className="text-center mb-4"><span className="text-sm" style={{ color: '#5A6B8A' }}>ou</span></div>

      <button onClick={handleGuest} className="w-full py-3.5 rounded-2xl font-bold press-scale" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
        Continuer en invité
      </button>

      <p className="text-center text-sm mt-6" style={{ color: '#8B9DC3' }}>
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-bold" style={{ color: '#00B894' }}>S&apos;inscrire</Link>
      </p>
    </div>
  );
}
