'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Gaston from '@/components/Gaston';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, user } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (user) {
    router.push('/');
    return null;
  }

  if (showConfirmation) {
    return (
      <div className="max-w-md mx-auto px-5 py-12 text-center">
        <span className="text-[80px] block mb-4">📧</span>
        <h1 className="text-2xl font-black mb-3">Vérifie ta boîte mail !</h1>
        <p className="text-sm mb-6" style={{ color: '#8B9DC3' }}>
          Un email de confirmation a été envoyé à <strong style={{ color: '#00B894' }}>{email}</strong>.
          <br />Clique sur le lien pour activer ton compte.
        </p>
        <div className="mb-6">
          <Gaston message="Vérifie aussi tes spams ! 📬" expression="happy" size="small" />
        </div>
        <Link href="/login" className="inline-block py-3.5 px-8 rounded-2xl font-black text-white press-scale" style={{ background: '#00B894' }}>
          Retour à la connexion
        </Link>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('Remplis tous les champs');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setError('Min. 6 caractères pour le mot de passe');
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
      router.push('/');
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-12">
      <div className="text-center mb-8">
        <span className="text-[64px] block mb-3">🎓</span>
        <h1 className="text-2xl font-black">Inscription</h1>
        <p className="text-sm" style={{ color: '#8B9DC3' }}>Crée ton compte PermiGo</p>
      </div>

      <div className="mb-6">
        <Gaston message="Bienvenue ! On va conquérir le permis ensemble ! 🚗" expression="party" size="small" />
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-3 mb-6">
        <input type="text" placeholder="Nom d'utilisateur" value={username} onChange={e => setUsername(e.target.value)}
          className="rounded-2xl px-4 py-3.5 text-white placeholder-[#5A6B8A] focus:outline-none"
          style={{ background: '#16213E', border: '2px solid #2A3550' }} />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="rounded-2xl px-4 py-3.5 text-white placeholder-[#5A6B8A] focus:outline-none"
          style={{ background: '#16213E', border: '2px solid #2A3550' }} />
        <input type="password" placeholder="Mot de passe (min. 6 car.)" value={password} onChange={e => setPassword(e.target.value)}
          className="rounded-2xl px-4 py-3.5 text-white placeholder-[#5A6B8A] focus:outline-none"
          style={{ background: '#16213E', border: '2px solid #2A3550' }} />
        <input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
          className="rounded-2xl px-4 py-3.5 text-white placeholder-[#5A6B8A] focus:outline-none"
          style={{ background: '#16213E', border: '2px solid #2A3550' }} />
        {error && <p className="text-sm" style={{ color: '#FF6B6B' }}>{error}</p>}
        <button type="submit" disabled={loading}
          className="py-3.5 rounded-2xl font-black text-white press-scale disabled:opacity-50"
          style={{ background: '#00B894' }}>
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>

      <p className="text-center text-sm" style={{ color: '#8B9DC3' }}>
        Déjà un compte ?{' '}
        <Link href="/login" className="font-bold" style={{ color: '#00B894' }}>Se connecter</Link>
      </p>
    </div>
  );
}
