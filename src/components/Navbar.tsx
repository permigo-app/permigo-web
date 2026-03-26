'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const SIDEBAR_ITEMS = [
  { href: '/', label: 'Accueil', color: '#00B894', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" />
    </svg>
  )},
  { href: '/panneaux', label: 'Panneaux', color: '#FF6348', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )},
  { href: '/turbo', label: 'Turbo', color: '#FFD700', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )},
  { href: '/profil', label: 'Profil', color: '#74B9FF', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )},
];

const NAV_ITEMS = [
  { href: '/', label: 'Accueil', icon: '🏠' },
  { href: '/panneaux', label: 'Panneaux', icon: '🔺' },
  { href: '/profil', label: 'Profil', icon: '👤' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Desktop sidebar — 60px, icons only, tooltips */}
      <nav className="hidden lg:flex flex-col items-center fixed left-0 top-0 h-full z-50 py-5" style={{ width: 80, background: '#0F1923', borderRight: '1px solid #16213E' }}>
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center">
          <span className="text-2xl">🚗</span>
        </Link>

        {/* Nav items */}
        <div className="flex flex-col gap-2 flex-1 items-center">
          {SIDEBAR_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="sidebar-icon-btn group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all press-scale"
                style={active
                  ? { background: `${item.color}20`, color: item.color }
                  : { color: item.color }
                }
              >
                {item.icon}
                {/* Tooltip */}
                <div className="sidebar-tooltip absolute left-[76px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity"
                  style={{ background: '#16213E', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  {item.label}
                  {/* Arrow */}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45" style={{ background: '#16213E' }} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* User avatar at bottom */}
        <div className="mt-auto pt-3" style={{ borderTop: '1px solid #16213E' }}>
          {user ? (
            <Link href="/profil" className="group relative flex items-center justify-center w-11 h-11 rounded-xl press-scale">
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: '#00B894' }}>
                {user.username?.charAt(0).toUpperCase() || '?'}
              </span>
              <div className="sidebar-tooltip absolute left-[76px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity"
                style={{ background: '#16213E', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                {user.username}
              </div>
            </Link>
          ) : (
            <Link href="/login" className="group relative flex items-center justify-center w-11 h-11 rounded-xl press-scale" style={{ color: '#00B894' }}>
              <span className="text-lg">🔑</span>
              <div className="sidebar-tooltip absolute left-[76px] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity"
                style={{ background: '#16213E', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                Connexion
              </div>
            </Link>
          )}
        </div>
      </nav>

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
                  {item.label}
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
