'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/contexts/LanguageContext';

const HIDDEN_PATHS = ['/premium', '/login', '/signup'];

export default function PremiumBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();
  const { t } = useLang();

  useEffect(() => {
    const isPremium = localStorage.getItem('isPremium') === 'true';
    const wasDismissed = sessionStorage.getItem('premium_banner_dismissed') === 'true';
    if (!isPremium && !wasDismissed) setShow(true);
    if (wasDismissed) setDismissed(true);
  }, []);

  const hide = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem('premium_banner_dismissed', 'true');
  };

  if (!show || dismissed || HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null;

  return (
    <div
      className="fixed bottom-[60px] lg:bottom-0 left-0 right-0 z-40 lg:left-[250px]"
      style={{ background: 'linear-gradient(90deg, #1C2345, #16213E)', borderTop: '1px solid rgba(255,215,0,0.2)' }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 max-w-3xl mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg flex-shrink-0">🔓</span>
          <p className="text-xs font-semibold truncate" style={{ color: '#d1d5db' }}>
            {t('banner_debloquer')}{' '}
            <span style={{ color: '#FFD700' }}>{t('banner_essai')}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <Link
            href="/premium"
            className="px-3 py-1.5 rounded-lg text-xs font-black press-scale"
            style={{ background: 'linear-gradient(135deg, #FFD700, #F39C12)', color: '#0a0e2a' }}
          >
            {t('banner_essayer')}
          </Link>
          <button
            onClick={hide}
            className="w-6 h-6 flex items-center justify-center rounded-full text-xs press-scale"
            style={{ color: '#5A6B8A', background: 'rgba(255,255,255,0.06)' }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
