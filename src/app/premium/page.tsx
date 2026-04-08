'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const FREE_FEATURES = [
  { ok: true,  label: 'Thème A complet (La route)' },
  { ok: true,  label: '1 examen blanc / semaine' },
  { ok: true,  label: '5 sessions Turbo / jour' },
  { ok: false, label: 'Thèmes B → I (8 thèmes)' },
  { ok: false, label: 'Examens blancs illimités' },
  { ok: false, label: 'Turbo illimité' },
  { ok: true,  label: 'Cartes Flash & Révision' },
];

const PREMIUM_FEATURES = [
  { icon: '📚', label: 'Tous les thèmes A → I débloqués' },
  { icon: '📝', label: 'Examens blancs illimités' },
  { icon: '⚡', label: 'Mode Turbo sans limite' },
  { icon: '🃏', label: 'Cartes Flash & Révision' },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', text: 'Réussi du premier coup grâce à MyPermiGo ! Les thèmes sont super bien expliqués.', stars: 5 },
  { name: 'Lucas D.', text: 'J\'ai passé des heures sur d\'autres applis, ici en 2 semaines j\'étais prêt.', stars: 5 },
  { name: 'Emma V.', text: 'Le mode Turbo est incroyable pour mémoriser vite. Vraiment utile.', stars: 5 },
];

export default function PremiumPage() {
  const { t } = useLang();
  const { supabaseUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: supabaseUser?.id || 'guest',
          email: supabaseUser?.email || '',
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(t('premium_erreur'));
        setLoading(false);
      }
    } catch {
      setError(t('premium_erreur'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0e2a' }}>
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-5 uppercase tracking-widest"
            style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700' }}>
            ✨ Essai gratuit 7 jours
          </div>
          <h1 className="text-4xl font-black text-white mb-3 leading-tight">
            Prépare ton permis<br />
            <span style={{ color: '#FFD700' }}>sans limites</span>
          </h1>
          <p className="text-base" style={{ color: '#8B9DC3' }}>
            Débloque les 8 thèmes restants et passe ton examen du premier coup.
          </p>
        </div>

        {/* Comparison table */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ border: '1px solid #2A3550' }}>
          <div className="grid grid-cols-3">
            <div className="px-4 py-3" style={{ background: '#16213E' }} />
            <div className="px-4 py-3 text-center" style={{ background: '#16213E', borderLeft: '1px solid #2A3550' }}>
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#5A6B8A' }}>Gratuit</span>
            </div>
            <div className="px-4 py-3 text-center" style={{ background: 'rgba(255,215,0,0.06)', borderLeft: '1px solid rgba(255,215,0,0.2)' }}>
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#FFD700' }}>⭐ Premium</span>
            </div>
          </div>
          {FREE_FEATURES.map((f, i) => (
            <div key={i} className="grid grid-cols-3" style={{ borderTop: '1px solid #2A3550' }}>
              <div className="px-4 py-3 text-sm font-medium" style={{ color: '#d1d5db', background: i % 2 === 0 ? '#0F1923' : '#111827' }}>
                {f.label}
              </div>
              <div className="px-4 py-3 text-center" style={{ background: i % 2 === 0 ? '#0F1923' : '#111827', borderLeft: '1px solid #2A3550' }}>
                <span style={{ color: f.ok ? '#2ecc71' : '#e74c3c' }}>{f.ok ? '✓' : '✕'}</span>
              </div>
              <div className="px-4 py-3 text-center" style={{ background: i % 2 === 0 ? 'rgba(255,215,0,0.03)' : 'rgba(255,215,0,0.05)', borderLeft: '1px solid rgba(255,215,0,0.15)' }}>
                <span style={{ color: '#2ecc71' }}>✓</span>
              </div>
            </div>
          ))}
        </div>

        {/* Premium card */}
        <div className="rounded-2xl p-8 mb-8" style={{ background: 'linear-gradient(135deg, #1C2345, #16213E)', border: '2px solid rgba(255,215,0,0.3)', boxShadow: '0 8px 40px rgba(255,215,0,0.1)' }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">MyPermiGo Premium</h2>
              <p className="text-sm" style={{ color: '#8B9DC3' }}>Accès complet à toute l&apos;app</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-white">7€</p>
              <p className="text-xs" style={{ color: '#8B9DC3' }}>/mois</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
            {PREMIUM_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm font-medium" style={{ color: '#d1d5db' }}>{f.label}</span>
              </div>
            ))}
          </div>

          {error && <p className="text-sm mb-4" style={{ color: '#e74c3c' }}>{error}</p>}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-lg press-scale mb-3 transition-all"
            style={{
              background: loading ? 'rgba(78,205,196,0.4)' : '#4ecdc4',
              color: '#0a0e2a',
              boxShadow: loading ? 'none' : '0 4px 24px rgba(78,205,196,0.4)',
            }}
          >
            {loading ? 'Chargement…' : 'Commencer l\'essai gratuit — 7 jours ✨'}
          </button>

          <p className="text-center text-xs" style={{ color: '#5A6B8A' }}>
            Aucun paiement maintenant · Annulable à tout moment
          </p>
        </div>

        {/* Testimonials */}
        <div className="mb-8">
          <h3 className="text-center text-sm font-black uppercase tracking-widest mb-4" style={{ color: '#5A6B8A' }}>Ce qu&apos;ils en disent</h3>
          <div className="flex flex-col gap-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-xl px-5 py-4" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-bold text-white">{t.name}</span>
                  <span className="text-xs" style={{ color: '#FFD700' }}>{'★'.repeat(t.stars)}</span>
                </div>
                <p className="text-sm" style={{ color: '#8B9DC3' }}>{t.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link href="/" className="text-sm" style={{ color: '#5A6B8A' }}>
            Revenir à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
