'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { isSoundMuted, toggleMute } from '@/lib/sounds';
import { THEME_ORDER, getThemeData } from '@/lib/lessonData';
import { isLessonCompleted } from '@/lib/progressStorage';

// ── NAV ITEMS — shared by mobile bottom nav + desktop sidebar ─────
const NAV_ITEMS = [
  { href: '/app', labelKey: 'nav_accueil', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" />
    </svg>
  )},
  { href: '/lecons', labelKey: 'nav_lecons', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )},
  { href: '/panneaux', labelKey: 'nav_panneaux', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )},
  { href: '/examen', labelKey: 'examen_blanc', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )},
  { href: '/profil', labelKey: 'nav_profil', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )},
];

// ── DESKTOP-ONLY EXTRA ITEMS (not in mobile bottom nav) ───────────
const DESKTOP_EXTRA = [
  { href: '/turbo', labelKey: 'nav_turbo', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )},
  { href: '/revisions', labelKey: 'nav_revisions', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )},
];

// Active-state helper — /lecon/* highlights the Leçons item
function isNavActive(href: string, pathname: string): boolean {
  if (href === '/app') return pathname === '/app';
  if (href === '/lecons') return pathname.startsWith('/lecons') || pathname.startsWith('/lecon/');
  return pathname.startsWith(href);
}

// ── Mobile top bar ─────────────────────────────────────────────────
function MobileTopBar({ streak, xp, muted, onToggleMute }: {
  streak: number; xp: number; muted: boolean; onToggleMute: () => void;
}) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center px-3 gap-2"
      style={{ height: 44, background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)' }}>
      <Link href="/app" className="flex-shrink-0">
        <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: -0.5 }}>
          <span style={{ color: 'var(--text-primary)' }}>My</span>
          <span style={{ color: '#00B894' }}>Permi</span>
          <span style={{ color: '#4ecdc4' }}>Go</span>
        </span>
      </Link>
      <div className="flex-1 flex items-center justify-center gap-2">
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,99,72,0.18)', border: '1px solid rgba(255,99,72,0.25)' }}>
            <span style={{ fontSize: 12 }}>🔥</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#FF6348' }}>{streak}</span>
          </div>
        )}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <span style={{ fontSize: 12 }}>⚡</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#FFD700' }}>{xp}</span>
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        <button onClick={onToggleMute}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: 16, lineHeight: 1 }}
          title={muted ? 'Activer le son' : 'Couper le son'}>
          {muted ? '🔇' : '🔊'}
        </button>
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </div>
  );
}

// ── Sidebar nav item ───────────────────────────────────────────────
function SidebarItem({ href, icon, label, active }: {
  href: string; icon: React.ReactNode; label: string; active: boolean;
}) {
  return (
    <Link href={href} className="press-scale"
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px',
        borderRadius: 12, textDecoration: 'none',
        background: active ? 'rgba(11,38,89,0.08)' : 'transparent',
        transition: 'background 0.15s',
      }}>
      <span style={{ color: active ? '#0b2659' : 'var(--text-hint)', flexShrink: 0, transition: 'color 0.15s' }}>
        {icon}
      </span>
      <span style={{ fontSize: 14, fontWeight: active ? 700 : 500, color: active ? '#0b2659' : 'var(--text-sub)', fontFamily: 'Sora, sans-serif', transition: 'color 0.15s' }}>
        {label}
      </span>
      {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />}
    </Link>
  );
}

// ── Main Navbar ────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLang();
  const [premium, setPremium] = useState(false);
  const [muted, setMuted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [globalPct, setGlobalPct] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setPremium(localStorage.getItem('isPremium') === 'true');
    setMuted(isSoundMuted());
    try {
      const s = localStorage.getItem('streakData');
      if (s) setStreak(JSON.parse(s).currentStreak ?? 0);
      const x = localStorage.getItem('xpData');
      if (x) setXp(JSON.parse(x).totalXP ?? 0);
    } catch {}
    // Sidebar progress widget
    let total = 0, done = 0;
    for (const code of THEME_ORDER) {
      const theme = getThemeData(code);
      if (!theme) continue;
      total += theme.lessons.length;
      done += theme.lessons.filter(l => isLessonCompleted(l.id)).length;
    }
    setTotalCount(total);
    setCompletedCount(done);
    setGlobalPct(total > 0 ? Math.round((done / total) * 100) : 0);
  }, []);

  const handleToggleMute = () => setMuted(toggleMute());
  const initials = user?.username?.charAt(0).toUpperCase() || '?';

  return (
    <>
      {/* ── Desktop Top Navbar (1024px+) ──────────────────────────── */}
      <div className="hidden lg:flex"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 200,
          background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)',
          alignItems: 'center', justifyContent: 'space-between', padding: '0 32px',
        }}>
        <Link href="/app" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, fontFamily: 'Sora, sans-serif' }}>
            <span style={{ color: 'var(--text-primary)' }}>My</span>
            <span style={{ color: '#00B894' }}>Permi</span>
            <span style={{ color: '#4ecdc4' }}>Go</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {streak > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fef9ec', border: '1.5px solid #f59e0b', borderRadius: 99, padding: '5px 12px' }}>
              <span style={{ fontSize: 13 }}>🔥</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#92400e' }}>{streak}</span>
            </div>
          )}
          <button onClick={handleToggleMute}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>
            {muted ? '🔇' : '🔊'}
          </button>
          <ThemeToggle />
          <LanguageSwitcher />
          {user ? (
            <Link href="/profil"
              style={{ width: 36, height: 36, borderRadius: '50%', background: '#0b2659', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, textDecoration: 'none', flexShrink: 0 }}>
              {initials}
            </Link>
          ) : (
            <Link href="/login"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 10, background: '#0b2659', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: 'Sora, sans-serif' }}>
              {t('nav_connexion')}
            </Link>
          )}
        </div>
      </div>

      {/* ── Desktop Sidebar (1024px+, starts below top navbar) ────── */}
      <nav className="hidden lg:flex flex-col"
        style={{
          position: 'fixed', top: 64, left: 0, bottom: 0, width: 240,
          background: 'var(--nav-bg)', borderRight: '1px solid var(--nav-border)',
          padding: '20px 12px 16px', overflow: 'auto', zIndex: 100,
        }}>
        {/* Main nav label */}
        <p style={{ margin: '0 4px 6px', fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>
          Navigation
        </p>

        {/* Nav items + desktop extras */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 4 }}>
          {NAV_ITEMS.slice(0, 4).map(item => (
            <SidebarItem key={item.href} href={item.href} icon={item.icon} label={t(item.labelKey)} active={isNavActive(item.href, pathname)} />
          ))}
          {DESKTOP_EXTRA.map(item => (
            <SidebarItem key={item.href} href={item.href} icon={item.icon} label={t(item.labelKey)} active={isNavActive(item.href, pathname)} />
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 4px' }} />

        {/* Profil + premium */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SidebarItem href={NAV_ITEMS[4].href} icon={NAV_ITEMS[4].icon} label={t(NAV_ITEMS[4].labelKey)} active={isNavActive(NAV_ITEMS[4].href, pathname)} />
          {premium ? (
            <Link href="/profil" className="press-scale"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, textDecoration: 'none', background: 'rgba(34,214,199,0.08)', border: '1px solid rgba(34,214,199,0.2)' }}>
              <span>✓</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)' }}>Premium actif</span>
            </Link>
          ) : (
            <Link href="/premium" className="press-scale premium-pulse"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, textDecoration: 'none', background: 'rgba(255,201,40,0.12)', border: '1px solid rgba(255,201,40,0.35)' }}>
              <span>✨</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#FFC928' }}>{t('passer_premium')}</span>
            </Link>
          )}
        </div>

        {/* Progress widget */}
        <div style={{ marginTop: 'auto', padding: '14px', background: 'var(--bg-input)', borderRadius: 14, border: '1.5px solid var(--border-card)', marginBottom: 8 }}>
          <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>
            {t('home_progression_globale')}
          </p>
          <p style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 800, color: 'var(--text-title)', lineHeight: 1 }}>
            {globalPct}%
          </p>
          <div style={{ height: 6, borderRadius: 99, background: 'var(--border-card)', overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', borderRadius: 99, background: '#0b2659', width: `${globalPct}%`, transition: 'width 0.6s ease' }} />
          </div>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-hint)' }}>
            {completedCount}/{totalCount} {t('home_lecons_terminees')}
          </p>
        </div>

        {/* Legal */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', padding: '10px 4px 0', borderTop: '1px solid var(--border-subtle)' }}>
          <a href="https://www.iubenda.com/privacy-policy/43486445" target="_blank" style={{ fontSize: 10, color: 'var(--text-disabled)', textDecoration: 'none' }}>Confidentialité</a>
          <a href="https://www.iubenda.com/privacy-policy/43486445/cookie-policy" target="_blank" style={{ fontSize: 10, color: 'var(--text-disabled)', textDecoration: 'none' }}>Cookies</a>
          <a href="/terms" style={{ fontSize: 10, color: 'var(--text-disabled)', textDecoration: 'none' }}>CGU</a>
          <span style={{ fontSize: 10, color: 'var(--text-disabled)', width: '100%' }}>© 2025-2026 MyPermiGo</span>
        </div>
      </nav>

      {/* ── Mobile top bar (< 1024px) ──────────────────────────────── */}
      <MobileTopBar streak={streak} xp={xp} muted={muted} onToggleMute={handleToggleMute} />

      {/* ── Mobile bottom nav (< 1024px) ───────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ background: 'var(--nav-bg)', borderTop: '1px solid var(--nav-border)' }}>
        <div className="flex justify-around items-end px-1" style={{ height: 58, paddingBottom: 2 }}>
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item.href, pathname);
            return (
              <Link key={item.href} href={item.href} className="press-scale flex flex-col items-center"
                style={{ flex: 1, paddingBottom: 8, paddingTop: 6, position: 'relative' }}>
                <div style={{ width: 36, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#0b2659' : 'var(--text-hint)', transition: 'color 0.15s' }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, marginTop: 2, color: active ? '#0b2659' : 'var(--text-hint)', fontFamily: 'Sora, sans-serif', transition: 'color 0.15s' }}>
                  {t(item.labelKey)}
                </span>
                {active && (
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#f59e0b', marginTop: 2 }} />
                )}
              </Link>
            );
          })}
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </nav>
    </>
  );
}
