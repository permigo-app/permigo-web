'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { setPremium } from '@/lib/premium';
import { supabase } from '@/lib/supabase';

function SuccessContent() {
  const { t } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const { supabaseUser, loading, refreshUser } = useAuth();
  const [status, setStatus] = useState<'activating' | 'done' | 'timeout'>('activating');
  const [countdown, setCountdown] = useState(3);

  // Auto-redirect countdown once done
  useEffect(() => {
    if (status !== 'done' && status !== 'timeout') return;
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer);
          router.push('/app');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, router]);

  // Wait for auth to load, then poll Supabase for is_premium confirmation
  useEffect(() => {
    if (loading) return;

    let cancelled = false;

    async function activateAndPoll() {
      const userId = supabaseUser?.id;
      const sessionId = params.get('session_id');

      // Guest or no Supabase: set localStorage and move on
      if (!userId || !supabase) {
        setPremium(true);
        setStatus('done');
        return;
      }

      // Trigger activate in background — handles cases where webhook hasn't fired
      fetch('/api/stripe/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId }),
      }).catch(() => {});

      // Poll Supabase for up to 30s (check immediately, then every 1s)
      let confirmed = false;
      for (let i = 0; i < 30 && !cancelled; i++) {
        if (i > 0) await new Promise(r => setTimeout(r, 1000));

        try {
          const { data } = await supabase
            .from('profiles')
            .select('is_premium')
            .eq('id', userId)
            .single();

          if (data?.is_premium) {
            confirmed = true;
            break;
          }
        } catch {}
      }

      if (cancelled) return;

      // Update localStorage only after Supabase confirms (prevents loadProfile from wiping it)
      setPremium(confirmed);
      await refreshUser();
      setStatus(confirmed ? 'done' : 'timeout');
    }

    activateAndPoll();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, supabaseUser?.id]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-page)' }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 24, padding: '40px 32px', border: '2px solid var(--brand)', boxShadow: '0 8px 40px rgba(34,214,199,0.15)' }}>

          <div style={{ fontSize: 56, marginBottom: 16 }}>
            {status === 'activating' ? '⏳' : status === 'done' ? '🎉' : '⚠️'}
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-title)', marginBottom: 8 }}>
            {status === 'activating'
              ? 'Activation en cours…'
              : status === 'done'
              ? t('premium_success_titre')
              : 'Paiement reçu'}
          </h1>

          <p style={{ fontSize: 15, color: 'var(--text-sub)', marginBottom: 24, lineHeight: 1.6 }}>
            {status === 'activating'
              ? 'Confirmation du paiement en cours…'
              : status === 'done'
              ? t('premium_success_msg')
              : 'Ton paiement est confirmé. L\'activation peut prendre quelques secondes supplémentaires — rafraîchis la page si les fonctionnalités ne sont pas encore débloquées.'}
          </p>

          {(status === 'done' || status === 'timeout') && (
            <>
              {status === 'done' && (
                <div style={{ background: 'var(--bg-input)', borderRadius: 14, padding: '14px 18px', marginBottom: 28, border: '1px solid var(--border-card)' }}>
                  <p style={{ fontSize: 13, color: 'var(--brand)', fontStyle: 'italic', margin: 0 }}>
                    &ldquo;{t('premium_success_gaston')}&rdquo;
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 4, marginBottom: 0 }}>— Prof. Gaston</p>
                </div>
              )}

              <button
                onClick={() => router.push('/app')}
                className="w-full press-scale"
                style={{ padding: '16px', borderRadius: 14, fontWeight: 800, fontSize: 16, background: 'var(--brand)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer' }}
              >
                {t('premium_success_btn')}
              </button>

              <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text-hint)' }}>
                Redirection automatique dans {countdown}s…
              </p>
            </>
          )}

          {status === 'activating' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="animate-pulse"
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--brand)',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PremiumSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-hint)' }}>Chargement…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
