'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const SIDEBAR_ITEMS = [
  { href: '/', labelKey: 'nav_accueil', color: '#00B894', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" />
    </svg>
  )},
  { href: '/panneaux', labelKey: 'nav_panneaux', color: '#FF6348', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )},
  { href: '/turbo', labelKey: 'nav_turbo', color: '#FFD700', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )},
  { href: '/examen', labelKey: 'examen_blanc', color: '#A29BFE', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )},
  { href: '/profil', labelKey: 'nav_profil', color: '#74B9FF', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )},
];

const NAV_ITEMS = [
  { href: '/', labelKey: 'nav_accueil', icon: '🏠' },
  { href: '/panneaux', labelKey: 'nav_panneaux', icon: '🔺' },
  { href: '/examen', labelKey: 'examen_blanc', icon: '📝' },
  { href: '/profil', labelKey: 'nav_profil', icon: '👤' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLang();
  const [premium, setPremium] = useState(false);
  useEffect(() => {
    setPremium(localStorage.getItem('isPremium') === 'true');
  }, []);

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col items-start fixed left-0 top-0 h-full z-50 py-5 pl-4" style={{ width: 250, background: '#0F1923', borderRight: '1px solid #16213E' }}>
        {/* Logo + Language switcher */}
        <div className="flex items-center justify-between w-full pr-4 mb-4">
          <Link href="/" className="flex items-center px-3">
            <span className="text-xl font-black tracking-tight" style={{ color: '#ffffff' }}>My</span>
            <span className="text-xl font-black tracking-tight" style={{ color: '#00B894' }}>Permi</span>
            <span className="text-xl font-black tracking-tight" style={{ color: '#4ecdc4' }}>Go</span>
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Prof. Gaston */}
        <div className="flex items-center gap-2 px-3 mb-6">
          <Image src="/images/gaston.png" width={64} height={64} alt="Prof. Gaston" className="gaston-float" style={{ objectFit: 'contain', flexShrink: 0 }} />
          <span className="text-xs font-black uppercase tracking-wide" style={{ color: '#8B9DC3' }}>Prof. Gaston</span>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-2 flex-1 items-start w-full">
          {SIDEBAR_ITEMS.slice(0, 4).map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="sidebar-icon-btn group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all press-scale"
                style={active
                  ? { background: `${item.color}20`, color: item.color }
                  : { color: item.color }
                }
              >
                {item.icon}
                <span className="text-sm font-bold" style={{ color: active ? item.color : '#8B9DC3' }}>
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}

          {/* Premium button */}
          {premium ? (
            <Link
              href="/profil"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl press-scale"
              style={{ background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.25)' }}
            >
              <span className="text-xl">⭐</span>
              <span className="text-sm font-bold" style={{ color: '#4ecdc4' }}>Premium ✓</span>
            </Link>
          ) : (
            <Link
              href="/premium"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl press-scale premium-pulse"
              style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)' }}
            >
              <span className="text-xl">⭐</span>
              <span className="text-sm font-bold" style={{ color: '#FFD700' }}>Passer Premium</span>
            </Link>
          )}

          {/* Profil */}
          {(() => {
            const item = SIDEBAR_ITEMS[4];
            const active = pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link
                href={item.href}
                className="sidebar-icon-btn group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all press-scale"
                style={active ? { background: `${item.color}20`, color: item.color } : { color: item.color }}
              >
                {item.icon}
                <span className="text-sm font-bold" style={{ color: active ? item.color : '#8B9DC3' }}>
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })()}
        </div>

        {/* User avatar at bottom */}
        <div className="mt-auto" style={{ width: '100%' }}>
          <div style={{ height: '1px', background: '#16213E', marginLeft: '-16px', marginRight: '-16px' }} />
        <div className="pt-3">
          {user ? (
            <Link href="/profil" className="flex items-center gap-3 px-3 py-2.5 rounded-xl press-scale">
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: '#00B894' }}>
                {user.username?.charAt(0).toUpperCase() || '?'}
              </span>
              <span className="text-sm font-bold truncate" style={{ color: '#8B9DC3' }}>{user.username}</span>
              {premium && <span className="text-sm flex-shrink-0" title="Premium" style={{ filter: 'drop-shadow(0 0 3px #FFD700)' }}>⭐</span>}
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-xl press-scale" style={{ color: '#00B894' }}>
              <span className="text-lg">🔑</span>
              <span className="text-sm font-bold" style={{ color: '#8B9DC3' }}>{t('nav_connexion')}</span>
            </Link>
          )}
        </div>
        </div>
      </nav>

      {/* Mobile top bar — language switcher */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4" style={{ height: 44, background: '#0F1923', borderBottom: '1px solid #16213E' }}>
        <span className="text-sm font-black">
          <span style={{ color: '#ffffff' }}>My</span>
          <span style={{ color: '#00B894' }}>Permi</span>
          <span style={{ color: '#4ecdc4' }}>Go</span>
        </span>
        <LanguageSwitcher />
      </div>

      {/* Mobile bottom bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ background: '#0F1923', borderTop: '1px solid #16213E' }}>
        <div className="flex justify-around items-center" style={{ height: 60 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 press-scale"
              >
                <span className={`text-[22px] transition-transform ${active ? 'scale-110' : ''}`}>{item.icon}</span>
                <span className="text-[11px] font-semibold" style={{ color: active ? '#00B894' : '#5A6B8A' }}>
                  {t(item.labelKey)}
                </span>
                {active && (
                  <div className="w-[5px] h-[5px] rounded-full mt-0.5" style={{ background: '#00B894' }} />
                )}
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
}
