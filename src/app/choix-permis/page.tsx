'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { recordLicenseEvent, setChosenLicense, type LicenseCode } from '@/lib/licenseEvents';

// Icônes vectorielles (traits Lucide) — rendu identique sur tous les appareils,
// contrairement aux emojis système
function VehicleIcon({ kind, color, size = 30 }: { kind: LicenseCode; color: string; size?: number }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  if (kind === 'B') {
    return (
      <svg {...common}>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    );
  }
  // AM — scooter / cyclomoteur : plancher plat, colonne de direction, guidon
  return (
    <svg {...common}>
      <circle cx="5.5" cy="17.5" r="2.5" />
      <circle cx="18.5" cy="17.5" r="2.5" />
      <path d="M8 17.5h5" />
      <path d="M13 17.5 16.6 7.5" />
      <path d="M15 7.5h3.6" />
      <path d="M5.5 17.5 7.3 12h3.2" />
    </svg>
  );
}

function BellIcon({ color }: { color: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export default function ChoixPermisPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLang();
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notified, setNotified] = useState(false);
  const [choosing, setChoosing] = useState(false);

  const handleChooseB = async () => {
    if (choosing) return;
    setChoosing(true);
    recordLicenseEvent('B', 'selected');
    await setChosenLicense('B');
    router.push('/app');
  };

  const handleNotify = async () => {
    const email = (notifyEmail || user?.email || '').trim();
    if (!email || !email.includes('@')) return;
    recordLicenseEvent('AM', 'notify_me', email);
    setNotified(true);
    setNotifyOpen(false);
    setNotifyEmail('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', fontFamily: 'Sora, sans-serif' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '44px 20px 60px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
              <span style={{ color: 'var(--text-primary)' }}>My</span>
              <span style={{ color: '#22D6C7' }}>Permi</span>
              <span style={{ color: '#55E6DA' }}>Go</span>
            </span>
          </Link>
        </div>

        {/* Titre */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h1 style={{ margin: '0 0 10px', fontSize: 27, fontWeight: 900, color: 'var(--text-title)', letterSpacing: '-0.7px', lineHeight: 1.2 }}>
            {t('choix_titre')}
          </h1>
          <p style={{ margin: '0 auto', maxWidth: 340, fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6 }}>
            {t('choix_sub')}
          </p>
        </div>

        {/* ── Carte principale : Permis B ── */}
        <button
          onClick={handleChooseB}
          disabled={choosing}
          className="press-scale"
          style={{
            width: '100%', borderRadius: 20, overflow: 'hidden',
            textAlign: 'left', padding: 0,
            cursor: choosing ? 'wait' : 'pointer', fontFamily: 'Sora, sans-serif',
            background: 'linear-gradient(160deg, rgba(34,214,199,0.10), rgba(34,214,199,0.02)), var(--card-primary)',
            border: '1.5px solid rgba(34,214,199,0.55)',
            boxShadow: '0 12px 36px rgba(34,214,199,0.16)',
            opacity: choosing ? 0.7 : 1,
          }}
        >
          <div style={{ padding: '22px 20px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 17, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg,#22D6C7,#1AB8AB)',
                boxShadow: '0 6px 16px rgba(34,214,199,0.35)',
              }}>
                <VehicleIcon kind="B" color="#07080F" size={32} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-title)', letterSpacing: '-0.3px' }}>
                    {t('choix_permis_B')}
                  </span>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontWeight: 800, letterSpacing: '0.5px',
                  color: 'var(--success)',
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />
                  {t('choix_disponible')}
                </span>
              </div>
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 13.5, color: 'var(--text-sub)', lineHeight: 1.6 }}>
              {t('choix_permis_B_desc')}
            </p>
          </div>
          <div style={{
            margin: '0 20px 20px', padding: '14px',
            borderRadius: 13, textAlign: 'center',
            background: 'linear-gradient(135deg,#22D6C7,#1AB8AB)',
            color: '#07080F', fontSize: 15, fontWeight: 800,
          }}>
            {t('choix_continuer')}
          </div>
        </button>

        {/* ── Carte secondaire : Permis AM (bientôt) ── */}
        <div
          style={{
            marginTop: 16, borderRadius: 20, overflow: 'hidden',
            background: 'var(--card-secondary)',
            border: '1.5px solid var(--border-card)',
          }}
        >
          <div style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 15, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(245,158,11,0.10)',
              }}>
                <VehicleIcon kind="AM" color="#f59e0b" size={28} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--text-title)', letterSpacing: '-0.2px' }}>
                    {t('choix_permis_AM')}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase',
                    background: 'rgba(245,158,11,0.14)', color: '#f59e0b',
                    borderRadius: 20, padding: '3px 10px', flexShrink: 0,
                  }}>
                    {t('choix_bientot')}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  {t('choix_permis_AM_desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Rangée Préviens-moi */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 20px' }}>
            {notified ? (
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>
                ✓ {t('choix_note')}
              </p>
            ) : notifyOpen ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  placeholder={user?.email || t('choix_email_ph')}
                  value={notifyEmail}
                  onChange={e => setNotifyEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleNotify(); }}
                  autoFocus
                  style={{
                    flex: 1, minWidth: 0, borderRadius: 11, padding: '10px 14px', fontSize: 13,
                    fontFamily: 'Sora, sans-serif', background: 'var(--bg-input)',
                    border: '1.5px solid var(--border-card)', color: 'var(--text-primary)', outline: 'none',
                  }}
                />
                <button
                  onClick={handleNotify}
                  className="press-scale"
                  style={{
                    borderRadius: 11, padding: '10px 16px', fontSize: 13, fontWeight: 800,
                    background: '#f59e0b', color: '#0b2659', border: 'none', cursor: 'pointer',
                    fontFamily: 'Sora, sans-serif', whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  OK
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setNotifyOpen(true); setNotifyEmail(user?.email || ''); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  fontSize: 13, fontWeight: 700, color: '#f59e0b', fontFamily: 'Sora, sans-serif',
                }}
              >
                <BellIcon color="#f59e0b" />
                {t('choix_previens')}
              </button>
            )}
          </div>
        </div>

        {/* Note bas de page */}
        <p style={{ margin: '24px 0 0', textAlign: 'center', fontSize: 12, color: 'var(--text-disabled)', lineHeight: 1.6 }}>
          {t('choix_footer_note')}
        </p>
      </div>
    </div>
  );
}
