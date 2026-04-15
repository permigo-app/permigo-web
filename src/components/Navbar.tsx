'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { isSoundMuted, toggleMute } from '@/lib/sounds';

const SIDEBAR_ITEMS = [
  { href: '/app', labelKey: 'nav_accueil', color: '#00B894', icon: (
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
  { href: '/app', labelKey: 'nav_accueil', icon: '🏠' },
  { href: '/panneaux', labelKey: 'nav_panneaux', icon: '🔺' },
  { href: '/turbo', labelKey: 'nav_turbo', icon: '⚡' },
  { href: '/examen', labelKey: 'examen_blanc', icon: '📝' },
  { href: '/profil', labelKey: 'nav_profil', icon: '👤' },
];

function MobileTopBar() {
  const { t } = useLang();
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  useEffect(() => {
    try {
      const s = localStorage.getItem('streakData');
      if (s) setStreak(JSON.parse(s).currentStreak ?? 0);
      const x = localStorage.getItem('xpData');
      if (x) setXp(JSON.parse(x).totalXP ?? 0);
    } catch {}
  }, []);
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center px-3 gap-2" style={{ height: 44, background: '#0a1220', borderBottom: '1px solid #1a2535' }}>
      {/* Logo */}
      <Link href="/app" className="flex-shrink-0">
        <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: -0.5 }}>
          <span style={{ color: '#fff' }}>My</span>
          <span style={{ color: '#00B894' }}>Permi</span>
          <span style={{ color: '#4ecdc4' }}>Go</span>
        </span>
      </Link>
      {/* Streak + XP — centre */}
      <div className="flex-1 flex items-center justify-center gap-2">
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,99,72,0.18)', border: '1px solid rgba(255,99,72,0.25)' }}>
            <span style={{ fontSize: 13 }}>🔥</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#FF6348' }}>{streak}</span>
          </div>
        )}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#FFD700' }}>{xp}</span>
        </div>
      </div>
      {/* Lang switcher */}
      <div className="flex-shrink-0">
        <LanguageSwitcher />
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLang();
  const [premium, setPremium] = useState(false);
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    setPremium(localStorage.getItem('isPremium') === 'true');
    setMuted(isSoundMuted());
  }, []);

  const handleToggleMute = () => {
    const next = toggleMute();
    setMuted(next);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col items-start fixed left-0 top-0 h-full z-50 py-5 pl-4" style={{ width: 250, background: '#0F1923', borderRight: '1px solid #16213E' }}>
        {/* Logo + Language switcher */}
        <div className="flex items-center justify-between w-full pr-4 mb-4">
          <Link href="/app" className="flex items-center px-3">
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
              <span className="text-sm font-bold" style={{ color: '#FFD700' }}>{t('passer_premium')}</span>
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

        {/* Sound toggle */}
        <div style={{ padding: '8px 16px' }}>
          <button
            onClick={handleToggleMute}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 8px', borderRadius: 8, width: '100%',
              color: muted ? '#5A6B8A' : '#8B9DC3',
            }}
          >
            <span style={{ fontSize: 16 }}>{muted ? '🔇' : '🔊'}</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{muted ? 'Sons coupés' : 'Sons actifs'}</span>
          </button>
        </div>

        {/* Legal links */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          <a href="https://www.iubenda.com/privacy-policy/43486445"
             target="_blank"
             style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            Politique de confidentialité
          </a>
          <a href="https://www.iubenda.com/privacy-policy/43486445/cookie-policy"
             target="_blank"
             style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            Cookies
          </a>
          <a href="/terms"
             style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            CGU
          </a>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>© 2025 MyPermiGo</span>
        </div>
        </div>
      </nav>

      {/* Mobile top bar — logo + streak/XP + lang */}
      <MobileTopBar />

      {/* Mobile bottom bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{ background: '#0F1923', borderTop: '1px solid #1e2d3d' }}>
        <div className="flex justify-around items-end px-1" style={{ height: 60 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const itemColor = item.href === '/app' ? '#00B894'
              : item.href === '/panneaux' ? '#FF6348'
              : item.href === '/turbo' ? '#FFD700'
              : item.href === '/examen' ? '#A29BFE'
              : '#74B9FF';
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center press-scale"
                style={{ flex: 1, paddingBottom: 8, paddingTop: 6, position: 'relative' }}
              >
                {/* Active highlight bar at top */}
                <div style={{
                  position: 'absolute', top: 0, left: '20%', right: '20%',
                  height: 2, borderRadius: 2,
                  background: active ? itemColor : 'transparent',
                  transition: 'background 0.2s',
                }} />
                {/* Icon with background highlight when active */}
                <div style={{
                  width: 42, height: 28,
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? `${itemColor}20` : 'transparent',
                  transition: 'background 0.2s',
                }}>
                  <span style={{ fontSize: active ? 20 : 18, transition: 'font-size 0.15s', filter: active ? 'none' : 'grayscale(0.4)' }}>{item.icon}</span>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: active ? 800 : 600, marginTop: 1,
                  color: active ? itemColor : '#4a5a78',
                  transition: 'color 0.2s',
                }}>
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
}
