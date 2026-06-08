'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { setPremium } from '@/lib/premium';

function SuccessContent() {
  const { t } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const { supabaseUser, refreshUser } = useAuth();
  const [status, setStatus] = useState<'activating' | 'done' | 'error'>('activating');

  useEffect(() => {
    async function activate() {
      // 1. Activer localStorage immédiatement
      setPremium(true);

      // 2. Appeler l'API avec session_id (pas besoin que supabaseUser soit chargé)
      const sessionId = params.get('session_id');
      const userId = supabaseUser?.id;

      try {
        const res = await fetch('/api/stripe/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, userId }),
        });
        const data = await res.json();

        if (data.ok) {
          // 3. Resync le profil si l'utilisateur est connecté
          if (supabaseUser?.id) {
            await refreshUser();
          }
          setStatus('done');
        } else {
          console.error('[Success] activate failed:', data);
          // On met quand même done car localStorage est activé
          setStatus('done');
        }
      } catch (e) {
        console.error('[Success] fetch error:', e);
        setStatus('done'); // localStorage est quand même activé
      }
    }

    activate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // une seule fois au montage

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-page)' }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 24, padding: '40px 32px', border: '2px solid var(--brand)', boxShadow: '0 8px 40px rgba(34,214,199,0.15)' }}>

          <div style={{ fontSize: 56, marginBottom: 16 }}>
            {status === 'activating' ? '⏳' : '🎉'}
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-title)', marginBottom: 8 }}>
            {status === 'activating' ? 'Activation en cours…' : t('premium_success_titre')}
          </h1>

          <p style={{ fontSize: 15, color: 'var(--text-sub)', marginBottom: 24, lineHeight: 1.6 }}>
            {status === 'activating' ? 'Quelques secondes…' : t('premium_success_msg')}
          </p>

          {status === 'done' && (
            <>
              <div style={{ background: 'var(--bg-input)', borderRadius: 14, padding: '14px 18px', marginBottom: 28, border: '1px solid var(--border-card)' }}>
                <p style={{ fontSize: 13, color: 'var(--brand)', fontStyle: 'italic', margin: 0 }}>
                  &ldquo;{t('premium_success_gaston')}&rdquo;
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 4, marginBottom: 0 }}>— Prof. Gaston</p>
              </div>

              <button
                onClick={() => router.push('/app')}
                className="w-full press-scale"
                style={{ padding: '16px', borderRadius: 14, fontWeight: 800, fontSize: 16, background: 'var(--brand)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer' }}
              >
                {t('premium_success_btn')}
              </button>
            </>
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
