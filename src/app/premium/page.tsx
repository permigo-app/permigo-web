'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function PremiumPage() {
  const { t } = useLang();
  const { supabaseUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const FREE_FEATURES = [
    { ok: true,  label: t('premium_f1') },
    { ok: true,  label: t('premium_f2') },
    { ok: true,  label: t('premium_f3') },
    { ok: false, label: t('premium_f4') },
    { ok: false, label: t('premium_f5') },
    { ok: false, label: t('premium_f6') },
    { ok: true,  label: t('premium_f7') },
  ];

  const PREMIUM_FEATURES = [
    { icon: '📚', label: t('premium_pf1') },
    { icon: '📝', label: t('premium_pf2') },
    { icon: '⚡', label: t('premium_pf3') },
    { icon: '🃏', label: t('premium_pf4') },
  ];

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    const controller = new AbortController();
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
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
            {t('premium_badge')}
          </div>
          <h1 className="text-4xl font-black text-white mb-3 leading-tight">
            {t('premium_hero_titre')}<br />
            <span style={{ color: '#FFD700' }}>{t('premium_hero_accent')}</span>
          </h1>
          <p className="text-base" style={{ color: '#8B9DC3' }}>
            {t('premium_hero_subtitle')}
          </p>
        </div>

        {/* Comparison table */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ border: '1px solid #2A3550' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3">
            <div className="px-4 py-3" style={{ background: '#16213E' }} />
            <div className="px-4 py-3 text-center" style={{ background: '#16213E', borderLeft: '1px solid #2A3550' }}>
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#5A6B8A' }}>{t('premium_gratuit_col')}</span>
            </div>
            <div className="px-4 py-3 text-center" style={{ background: 'rgba(255,215,0,0.06)', borderLeft: '1px solid rgba(255,215,0,0.2)' }}>
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#FFD700' }}>⭐ Premium</span>
            </div>
          </div>
          {FREE_FEATURES.map((f, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 card-hover" style={{ borderTop: '1px solid #2A3550' }}>
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
              <h2 className="text-2xl font-black text-white mb-1">{t('premium_card_titre')}</h2>
              <p className="text-sm" style={{ color: '#8B9DC3' }}>{t('premium_card_acces')}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-white">7€</p>
              <p className="text-xs" style={{ color: '#8B9DC3' }}>{t('premium_card_mois')}</p>
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
            className="w-full py-4 rounded-2xl font-black text-lg press-scale mb-3 btn-glow-teal"
            style={{
              background: loading ? 'rgba(78,205,196,0.4)' : 'linear-gradient(135deg, #4ecdc4, #26a69a)',
              color: '#0a0e2a',
            }}
          >
            {loading ? t('premium_chargement') : t('premium_essai_btn')}
          </button>

          <p className="text-center text-xs" style={{ color: '#5A6B8A' }}>
            {t('premium_sans_paiement')}
          </p>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link href="/app" className="text-sm" style={{ color: '#5A6B8A' }}>
            {t('premium_retour')}
          </Link>
        </div>
      </div>
    </div>
  );
}
