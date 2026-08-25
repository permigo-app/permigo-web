'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { PRICING_PLANS, DEFAULT_PLAN, type PlanId } from '@/lib/pricing';
import Link from 'next/link';

export default function PremiumPage() {
  const { t, lang } = useLang();
  const { supabaseUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(DEFAULT_PLAN);

  type TableVal = string | boolean;
  const TABLE_ROWS: { label: string; free: TableVal; prem: TableVal }[] = [
    { label: t('premium_f1'),  free: '1 leçon',         prem: true },
    { label: t('premium_f4'),  free: false,             prem: true },
    { label: t('premium_f8'),  free: '1 essai',         prem: '✅ Illimité' },
    { label: t('premium_f9'),  free: '1 essai',         prem: '✅ Illimité' },
    { label: t('premium_f7'),  free: false,             prem: true },
    { label: t('premium_f10'), free: '3 catégories',    prem: '✅ 10 catégories' },
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
        body: JSON.stringify({ plan: selectedPlan }),
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
          <div className="mb-6">
            <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{t('premium_card_titre')}</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('premium_card_acces')}</p>
          </div>

          {/* Plan picker */}
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            {PRICING_PLANS.map(plan => {
              const active = plan.id === selectedPlan;
              const badge = lang === 'nl' ? plan.badgeNl : plan.badgeFr;
              const label = lang === 'nl' ? plan.labelNl : plan.labelFr;
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className="press-scale rounded-2xl p-3.5 text-center relative"
                  style={{
                    background: active ? 'rgba(78,205,196,0.10)' : 'var(--card-secondary)',
                    border: active ? '2px solid var(--brand)' : '1.5px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}
                >
                  {badge && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide whitespace-nowrap"
                      style={{ background: 'var(--brand)', color: 'var(--bg-primary)' }}>
                      {badge}
                    </span>
                  )}
                  <p className="text-lg font-black" style={{ color: active ? 'var(--brand)' : 'var(--text-primary)' }}>{plan.priceDisplay}</p>
                  <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                </button>
              );
            })}
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
            {loading ? t('premium_chargement') : `${t('premium_essai_btn')} — ${PRICING_PLANS.find(p => p.id === selectedPlan)?.priceDisplay} →`}
          </button>

          <p className="text-center text-xs" style={{ color: 'var(--text-disabled)' }}>
            {t('premium_sans_paiement')}
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
