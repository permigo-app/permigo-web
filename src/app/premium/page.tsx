'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function PremiumPage() {
  const { t } = useLang();
  const { supabaseUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  type TableVal = string | boolean;
  const TABLE_ROWS: { label: string; free: TableVal; prem: TableVal }[] = [
    { label: t('premium_f1'),  free: true,              prem: true },
    { label: t('premium_f4'),  free: false,             prem: true },
    { label: t('premium_f8'),  free: '1 / jour',        prem: '✅ Illimité' },
    { label: t('premium_f9'),  free: '3 / jour',        prem: '✅ Illimité' },
    { label: t('premium_f10'), free: '3 catégories',    prem: '✅ 10 catégories' },
    { label: t('premium_f7'),  free: 'Thème A',         prem: '✅ Tous les thèmes' },
    { label: t('premium_f5'),  free: false,             prem: true },
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
    try {
      // Récupère le token de session Supabase côté client
      const sessionData = supabase ? await supabase.auth.getSession() : null;
      const token = sessionData?.data?.session?.access_token;

      if (!token) {
        setError(t('premium_erreur'));
        setLoading(false);
        return;
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === 'already_subscribed') {
        router.push('/app');
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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-5 uppercase tracking-widest"
            style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700' }}>
            {t('premium_badge')}
          </div>
          <h1 className="text-4xl font-black mb-3 leading-tight" style={{ color: 'var(--text-primary)' }}>
            {t('premium_hero_titre')}<br />
            <span style={{ color: '#FFD700' }}>{t('premium_hero_accent')}</span>
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            {t('premium_hero_subtitle')}
          </p>
        </div>

        {/* Comparison table */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ border: '1px solid var(--border-subtle)' }}>
          <div className="grid grid-cols-3">
            <div className="px-4 py-3" style={{ background: 'var(--card-secondary)' }} />
            <div className="px-4 py-3 text-center" style={{ background: 'var(--card-secondary)', borderLeft: '1px solid var(--border-subtle)' }}>
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-disabled)' }}>{t('premium_gratuit_col')}</span>
            </div>
            <div className="px-4 py-3 text-center" style={{ background: 'rgba(255,215,0,0.06)', borderLeft: '1px solid rgba(255,215,0,0.2)' }}>
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#FFD700' }}>⭐ Premium</span>
            </div>
          </div>
          {TABLE_ROWS.map((row, i) => {
            const renderVal = (val: TableVal, isOdd: boolean, isPrem: boolean) => {
              const bg = isPrem
                ? (isOdd ? 'rgba(255,215,0,0.05)' : 'rgba(255,215,0,0.03)')
                : (isOdd ? 'var(--card-secondary)' : 'var(--card-primary)');
              const border = isPrem ? '1px solid rgba(255,215,0,0.15)' : '1px solid var(--border-subtle)';
              const content = val === true
                ? <span style={{ color: 'var(--success)', fontSize: 16 }}>✓</span>
                : val === false
                ? <span style={{ color: 'var(--error)', fontSize: 16 }}>✕</span>
                : <span style={{ fontSize: 12, fontWeight: 600, color: isPrem ? '#FFD700' : 'var(--text-secondary)' }}>{val as string}</span>;
              return (
                <div className="px-3 py-3 text-center flex items-center justify-center" style={{ background: bg, borderLeft: border }}>
                  {content}
                </div>
              );
            };
            return (
              <div key={i} className="grid grid-cols-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div className="px-4 py-3 text-sm font-medium flex items-center" style={{ color: 'var(--text-primary)', background: i % 2 === 0 ? 'var(--card-primary)' : 'var(--card-secondary)' }}>
                  {row.label}
                </div>
                {renderVal(row.free, i % 2 !== 0, false)}
                {renderVal(row.prem, i % 2 !== 0, true)}
              </div>
            );
          })}
        </div>

        {/* Premium card */}
        <div className="rounded-2xl p-8 mb-8" style={{ background: 'var(--card-primary)', border: '2px solid var(--premium)', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{t('premium_card_titre')}</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('premium_card_acces')}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>7€</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('premium_card_mois')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
            {PREMIUM_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{f.label}</span>
              </div>
            ))}
          </div>

          {error && <p className="text-sm mb-4" style={{ color: 'var(--error)' }}>{error}</p>}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-lg press-scale mb-3 btn-glow-teal"
            style={{
              background: loading ? 'rgba(78,205,196,0.4)' : 'var(--brand)',
              color: 'var(--bg-primary)',
            }}
          >
            {loading ? t('premium_chargement') : t('premium_essai_btn')}
          </button>

          <p className="text-center text-xs" style={{ color: 'var(--text-disabled)' }}>
            {t('premium_sans_paiement')}
          </p>
          <p className="text-center text-xs mt-1" style={{ color: 'var(--text-disabled)' }}>
            Sans engagement · Annulez quand vous voulez
          </p>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link href="/app" className="text-sm" style={{ color: 'var(--text-disabled)' }}>
            {t('premium_retour')}
          </Link>
        </div>
      </div>
    </div>
  );
}
