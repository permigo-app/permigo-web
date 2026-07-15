'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { recordLicenseEvent, setChosenLicense, type LicenseCode } from '@/lib/licenseEvents';

// Icônes vectorielles (traits Lucide) — rendu identique sur tous les appareils,
// contrairement aux emojis système
function VehicleIcon({ kind, color }: { kind: LicenseCode; color: string }) {
  const common = {
    width: 30, height: 30, viewBox: '0 0 24 24', fill: 'none',
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
  if (kind === 'A') {
    return (
      <svg {...common}>
        <circle cx="5" cy="17.5" r="3" />
        <circle cx="19" cy="17.5" r="3" />
        <path d="M5 17.5 8.5 11h4l2 3.5h2.5" />
        <path d="M13.8 8.5 15.5 6H18" />
        <path d="M8.5 11 7 8.5H4.5" />
        <path d="M12.5 14.5 14 17.5H9" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
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

const LICENSES: { code: LicenseCode; available: boolean }[] = [
  { code: 'B', available: true },
  { code: 'A', available: false },
  { code: 'C', available: false },
];

export default function ChoixPermisPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLang();
  const [notifyOpen, setNotifyOpen] = useState<LicenseCode | null>(null);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notified, setNotified] = useState<Set<LicenseCode>>(new Set());
  const [choosing, setChoosing] = useState(false);

  const handleChooseB = async () => {
    if (choosing) return;
    setChoosing(true);
    recordLicenseEvent('B', 'selected');
    await setChosenLicense('B');
    router.push('/app');
  };

  const handleNotify = async (code: LicenseCode) => {
    const email = (notifyEmail || user?.email || '').trim();
    if (!email || !email.includes('@')) return;
    recordLicenseEvent(code, 'notify_me', email);
    setNotified(prev => new Set(prev).add(code));
    setNotifyOpen(null);
    setNotifyEmail('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', fontFamily: 'Sora, sans-serif' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px 60px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>
              <span style={{ color: 'var(--text-primary)' }}>My</span>
              <span style={{ color: '#22D6C7' }}>Permi</span>
              <span style={{ color: '#55E6DA' }}>Go</span>
            </span>
          </Link>
        </div>

        {/* Titre */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 900, color: 'var(--text-title)', letterSpacing: '-0.6px' }}>
            {t('choix_titre')}
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6 }}>
            {t('choix_sub')}
          </p>
        </div>

        {/* Cartes permis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {LICENSES.map(lic => {
            const isNotified = notified.has(lic.code);

            // ── Carte active (Permis B) — même anatomie que les autres :
            //    en-tête (icône + titre/badge + description) puis rangée de pied
            if (lic.available) {
              return (
                <button
                  key={lic.code}
                  onClick={handleChooseB}
                  className="press-scale"
                  style={{
                    width: '100%', borderRadius: 18, overflow: 'hidden',
                    textAlign: 'left', padding: 0,
                    cursor: 'pointer', fontFamily: 'Sora, sans-serif',
                    background: 'var(--card-primary)',
                    border: '2px solid #22D6C7',
                    boxShadow: '0 6px 24px rgba(34,214,199,0.15)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 18px 14px' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 15, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(34,214,199,0.12)',
                    }}>
                      <VehicleIcon kind="B" color="#22D6C7" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-title)', whiteSpace: 'nowrap' }}>
                          {t('choix_permis_B')}
                        </span>
                        <span style={{ fontSize: 20, color: '#22D6C7', flexShrink: 0, fontWeight: 900 }}>→</span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                        {t('choix_permis_B_desc')}
                      </p>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(34,214,199,0.25)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>
                      ✓ {t('choix_disponible')}
                    </span>
                  </div>
                </button>
              );
            }

            // ── Cartes "Bientôt" (Moto, Camion) — Préviens-moi intégré ──
            return (
              <div
                key={lic.code}
                style={{
                  borderRadius: 18, overflow: 'hidden',
                  background: 'var(--card-secondary)',
                  border: '2px dashed var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 18px 14px', opacity: 0.75 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 15, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-input)',
                  }}>
                    <VehicleIcon kind={lic.code} color="var(--text-disabled)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-title)', whiteSpace: 'nowrap' }}>
                        {t(`choix_permis_${lic.code}`)}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase',
                        background: 'rgba(245,158,11,0.14)', color: '#f59e0b',
                        borderRadius: 20, padding: '3px 10px', flexShrink: 0,
                      }}>
                        {t('choix_bientot')}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      {t(`choix_permis_${lic.code}_desc`)}
                    </p>
                  </div>
                </div>

                {/* Rangée Préviens-moi — DANS la carte */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '12px 18px' }}>
                  {isNotified ? (
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>
                      ✓ {t('choix_note')}
                    </p>
                  ) : notifyOpen === lic.code ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="email"
                        placeholder={user?.email || t('choix_email_ph')}
                        value={notifyEmail}
                        onChange={e => setNotifyEmail(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleNotify(lic.code); }}
                        autoFocus
                        style={{
                          flex: 1, minWidth: 0, borderRadius: 11, padding: '10px 14px', fontSize: 13,
                          fontFamily: 'Sora, sans-serif', background: 'var(--bg-input)',
                          border: '1.5px solid var(--border-card)', color: 'var(--text-primary)', outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => handleNotify(lic.code)}
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
                      onClick={() => { setNotifyOpen(lic.code); setNotifyEmail(user?.email || ''); }}
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
            );
          })}
        </div>

        {/* Continuer avec B (raccourci bas de page) */}
        <button
          onClick={handleChooseB}
          disabled={choosing}
          className="press-scale"
          style={{
            width: '100%', marginTop: 28, padding: '15px', borderRadius: 14,
            fontWeight: 800, fontSize: 15, fontFamily: 'Sora, sans-serif',
            background: 'linear-gradient(135deg,#22D6C7,#1AB8AB)', color: '#07080F',
            border: 'none', cursor: choosing ? 'wait' : 'pointer',
            boxShadow: '0 4px 18px rgba(34,214,199,0.2)', opacity: choosing ? 0.6 : 1,
          }}
        >
          {t('choix_continuer')}
        </button>
      </div>
    </div>
  );
}
