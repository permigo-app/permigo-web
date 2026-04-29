'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { isSoundMuted, toggleMute } from '@/lib/sounds';

// Single source of truth — used by both desktop sidebar and mobile bottom nav
const NAV_ITEMS = [
  { href: '/app', labelKey: 'nav_accueil', color: '#00B894', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" />
    </svg>
  )},
  { href: '/panneaux', labelKey: 'nav_panneaux', color: '#FF6348', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )},
  { href: '/turbo', labelKey: 'nav_turbo', color: '#FFD700', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )},
  { href: '/examen', labelKey: 'examen_blanc', color: '#A29BFE', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )},
  { href: '/profil', labelKey: 'nav_profil', color: '#74B9FF', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )},
];

const IconLogin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

function MobileTopBar() {
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
    <div
      className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center px-3 gap-2"
      style={{
        height: 44,
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <Link href="/app" className="flex-shrink-0">
        <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: -0.5 }}>
          <span style={{ color: 'var(--text-primary)' }}>My</span>
          <span style={{ color: '#00B894' }}>Permi</span>
          <span style={{ color: '#4ecdc4' }}>Go</span>
        </span>
      </Link>

      {/* Streak + XP — centre */}
      <div className="flex-1 flex items-center justify-center gap-2">
        {streak > 0 && (
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,99,72,0.18)', border: '1px solid rgba(255,99,72,0.25)' }}
          >
            <span style={{ fontSize: 12 }}>🔥</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#FF6348' }}>{streak}</span>
          </div>
        )}
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.2)' }}
        >
          <span style={{ fontSize: 12 }}>⚡</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#FFD700' }}>{xp}</span>
        </div>
      </div>

      {/* Theme + Lang */}
      <div className="flex-shrink-0 flex items-center gap-2">
        <ThemeToggle />
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
      {/* ── Desktop sidebar ───────────────────────────────────────── */}
      <nav
        className="hidden lg:flex flex-col items-start fixed left-0 top-0 h-full z-50 py-5 pl-3 pr-3"
        style={{
          width: 250,
          background: 'var(--bg-primary)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Logo + Language + ThemeToggle */}
        <div className="flex items-center justify-between w-full mb-5 px-1">
          <Link href="/app" className="flex items-center">
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>My</span>
            <span className="text-xl font-black tracking-tight" style={{ color: '#00B894' }}>Permi</span>
            <span className="text-xl font-black tracking-tight" style={{ color: '#4ecdc4' }}>Go</span>
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Prof. Gaston — simplifié */}
        <div
          className="flex items-center gap-2 w-full mb-5 px-2 py-2 rounded-xl"
          style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}
        >
          <Image
            src="/images/gaston.png"
            width={44}
            height={44}
            alt="Prof. Gaston"
            style={{ objectFit: 'contain', flexShrink: 0 }}
          />
          <div>
            <p className="text-xs font-black uppercase tracking-wide" style={{ color: 'var(--brand)' }}>Prof. Gaston</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)', marginTop: 1 }}>Ton guide</p>
          </div>
        </div>

        {/* Nav items (Accueil → Examen) */}
        <div className="flex flex-col gap-1 w-full">
          {NAV_ITEMS.slice(0, 4).map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="press-scale flex items-center gap-3 w-full px-3 py-2.5 rounded-xl"
                style={{
                  borderLeft: active ? '3px solid var(--brand)' : '3px solid transparent',
                  background: active ? 'var(--card-secondary)' : 'transparent',
                  transition: 'background 0.15s, border-color 0.15s',
                  color: active ? item.color : item.color,
                }}
              >
                <span style={{ color: item.color, opacity: active ? 1 : 0.75, flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Premium button */}
        <div className="w-full mt-2">
          {premium ? (
            <Link
              href="/profil"
              className="press-scale flex items-center gap-3 w-full px-3 py-2.5 rounded-xl"
              style={{
                background: 'rgba(34,214,199,0.08)',
                border: '1px solid rgba(34,214,199,0.2)',
              }}
            >
              <span style={{ fontSize: 16 }}>✓</span>
              <span className="text-sm font-bold" style={{ color: 'var(--brand)' }}>Premium actif</span>
            </Link>
          ) : (
            <Link
              href="/premium"
              className="press-scale premium-pulse flex items-center gap-3 w-full px-3 py-2.5 rounded-xl"
              style={{
                background: 'rgba(255,201,40,0.12)',
                border: '1px solid rgba(255,201,40,0.35)',
              }}
            >
              <span style={{ fontSize: 16 }}>✨</span>
              <span className="text-sm font-bold" style={{ color: '#FFC928' }}>{t('passer_premium')}</span>
            </Link>
          )}
        </div>

        {/* Profil */}
        <div className="w-full mt-1">
          {(() => {
            const item = NAV_ITEMS[4];
            const active = pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link
                href={item.href}
                className="press-scale flex items-center gap-3 w-full px-3 py-2.5 rounded-xl"
                style={{
                  borderLeft: active ? '3px solid var(--brand)' : '3px solid transparent',
                  background: active ? 'var(--card-secondary)' : 'transparent',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                <span style={{ color: item.color, opacity: active ? 1 : 0.75, flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })()}
        </div>

        {/* Bottom section */}
        <div className="mt-auto w-full flex flex-col gap-1">

          {/* User / Login */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, marginTop: 8 }}>
            {user ? (
              <Link href="/profil" className="press-scale flex items-center gap-3 px-3 py-2.5 rounded-xl">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: '#00B894', color: '#fff' }}
                >
                  {user.username?.charAt(0).toUpperCase() || '?'}
                </span>
                <span className="text-sm font-bold truncate" style={{ color: 'var(--text-secondary)' }}>
                  {user.username}
                </span>
                {premium && (
                  <span className="text-sm flex-shrink-0 ml-auto" style={{ color: '#FFC928' }}>✨</span>
                )}
              </Link>
            ) : (
              <Link
                href="/login"
                className="press-scale flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ color: 'var(--brand)' }}
              >
                <IconLogin />
                <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                  {t('nav_connexion')}
                </span>
              </Link>
            )}
          </div>

          {/* Sound + ThemeToggle */}
          <div
            className="flex items-center justify-between px-2 py-1"
          >
            <button
              onClick={handleToggleMute}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: muted ? 'var(--text-disabled)' : 'var(--text-secondary)',
              }}
            >
              <span style={{ fontSize: 15 }}>{muted ? '🔇' : '🔊'}</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{muted ? 'Muet' : 'Son'}</span>
            </button>
            <ThemeToggle />
          </div>

          {/* Legal */}
          <div
            className="flex flex-wrap gap-x-3 gap-y-1 px-3 py-3"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <a
              href="https://www.iubenda.com/privacy-policy/43486445"
              target="_blank"
              style={{ fontSize: 10, color: 'var(--text-disabled)', textDecoration: 'none' }}
            >
              Confidentialité
            </a>
            <a
              href="https://www.iubenda.com/privacy-policy/43486445/cookie-policy"
              target="_blank"
              style={{ fontSize: 10, color: 'var(--text-disabled)', textDecoration: 'none' }}
            >
              Cookies
            </a>
            <a href="/terms" style={{ fontSize: 10, color: 'var(--text-disabled)', textDecoration: 'none' }}>
              CGU
            </a>
            <span style={{ fontSize: 10, color: 'var(--text-disabled)', width: '100%' }}>
              © 2025-2026 MyPermiGo
            </span>
          </div>
        </div>
      </nav>

      {/* ── Mobile top bar ────────────────────────────────────────── */}
      <MobileTopBar />

      {/* ── Mobile bottom nav ─────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex justify-around items-end px-1" style={{ height: 60 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="press-scale flex flex-col items-center"
                style={{ flex: 1, paddingBottom: 8, paddingTop: 6, position: 'relative' }}
              >
                {/* Active indicator bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '25%',
                  right: '25%',
                  height: 2,
                  borderRadius: 2,
                  background: active ? 'var(--brand)' : 'transparent',
                  transition: 'background 0.15s',
                }} />

                {/* SVG icon */}
                <div
                  style={{
                    width: 40,
                    height: 28,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: active ? 'var(--card-secondary)' : 'transparent',
                    color: active ? item.color : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  {item.icon}
                </div>

                <span style={{
                  fontSize: 10,
                  fontWeight: active ? 800 : 600,
                  marginTop: 2,
                  color: active ? 'var(--brand)' : 'var(--text-secondary)',
                  transition: 'color 0.15s',
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
