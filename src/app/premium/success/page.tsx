'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { setPremium } from '@/lib/premium';

export default function PremiumSuccessPage() {
  const { t } = useLang();
  const router = useRouter();
  const { supabaseUser, refreshUser } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function activate() {
      // 1. Activer en localStorage immédiatement
      setPremium(true);

      // 2. Mettre à jour Supabase directement (double sécurité avec le webhook)
      if (supabaseUser?.id) {
        try {
          await fetch('/api/stripe/activate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: supabaseUser.id }),
          });
          // 3. Recharger le profil pour syncer localStorage depuis Supabase
          await refreshUser();
        } catch (e) {
          console.error('[Success] activate error:', e);
        }
      }

      setReady(true);
    }
    activate();
  }, [supabaseUser, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-page)' }}>
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 24, padding: '40px 32px', border: '2px solid var(--brand)', boxShadow: '0 8px 40px rgba(34,214,199,0.15)' }}>

          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>

          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-title)', marginBottom: 8 }}>
            {t('premium_success_titre')}
          </h1>

          <p style={{ fontSize: 15, color: 'var(--text-sub)', marginBottom: 24, lineHeight: 1.6 }}>
            {t('premium_success_msg')}
          </p>

          <div style={{ background: 'var(--bg-input)', borderRadius: 14, padding: '14px 18px', marginBottom: 28, border: '1px solid var(--border-card)' }}>
            <p style={{ fontSize: 13, color: 'var(--brand)', fontStyle: 'italic', margin: 0 }}>
              &ldquo;{t('premium_success_gaston')}&rdquo;
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 4, marginBottom: 0 }}>— Prof. Gaston</p>
          </div>

          <button
            onClick={() => router.push('/app')}
            disabled={!ready}
            className="w-full press-scale"
            style={{
              padding: '16px',
              borderRadius: 14,
              fontWeight: 800,
              fontSize: 16,
              background: ready ? 'var(--brand)' : 'var(--bg-input)',
              color: ready ? 'var(--bg-primary)' : 'var(--text-hint)',
              border: 'none',
              cursor: ready ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {ready ? t('premium_success_btn') : 'Activation en cours…'}
          </button>
        </div>
      </div>
    </div>
  );
}
