'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LanguageContext';
import { useIsPremium } from '@/lib/premium';

interface SubInfo {
  active: boolean;
  renewalAt: number | null;
  amount: number | null;
  cancelAtPeriodEnd: boolean;
}

// Avertit l'abonné quand le prélèvement mensuel est à 2 jours ou moins,
// pour qu'il puisse résilier avant s'il ne souhaite plus l'abonnement.
export default function RenewalNotice() {
  const { t } = useLang();
  const premium = useIsPremium();
  const [info, setInfo] = useState<SubInfo | null>(null);

  useEffect(() => {
    if (!premium || !supabase) return;
    let cancelled = false;
    const load = async () => {
      try {
        const { data: { session } } = await supabase!.auth.getSession();
        const token = session?.access_token;
        if (!token) return;
        const res = await fetch('/api/stripe/subscription', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setInfo(data);
      } catch { /* silencieux — la bannière est optionnelle */ }
    };
    load();
    return () => { cancelled = true; };
  }, [premium]);

  if (!info?.active || info.cancelAtPeriodEnd || !info.renewalAt) return null;

  const daysLeft = Math.ceil((info.renewalAt * 1000 - Date.now()) / 86400000);
  if (daysLeft < 0 || daysLeft > 2) return null;

  const amountStr = info.amount != null
    ? (info.amount / 100).toFixed(2).replace('.', ',') + '€'
    : '';
  const dayWord = daysLeft > 1 ? t('jours_plur') : t('jour_sing');

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(245,158,11,0.1)',
      border: '1.5px solid rgba(245,158,11,0.4)',
      borderRadius: 14, padding: '12px 16px', marginBottom: 16,
      fontFamily: 'Sora, sans-serif',
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>⏳</span>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-title)', lineHeight: 1.5, flex: 1 }}>
        {daysLeft === 0 ? t('renew_notice_pre0') : t('renew_notice_pre')}{' '}
        <strong>{daysLeft === 0 ? t('renew_notice_today') : `${daysLeft} ${dayWord}`}</strong>
        {amountStr && <> — <strong>{amountStr}</strong></>}{' '}
        {t('renew_notice_post')}
      </p>
      <Link href="/profil" style={{
        flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#D97706',
        textDecoration: 'none', whiteSpace: 'nowrap',
        padding: '7px 12px', borderRadius: 9,
        border: '1.5px solid rgba(245,158,11,0.5)',
      }}>
        {t('renew_notice_btn')}
      </Link>
    </div>
  );
}
