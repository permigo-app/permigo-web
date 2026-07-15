'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { recordLicenseEvent, setChosenLicense, type LicenseCode } from '@/lib/licenseEvents';

interface LicenseDef {
  code: LicenseCode;
  emoji: string;
  available: boolean;
}

const LICENSES: LicenseDef[] = [
  { code: 'B', emoji: '🚗', available: true },
  { code: 'A', emoji: '🏍️', available: false },
  { code: 'C', emoji: '🚛', available: false },
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
    // Tracking + persistance en parallèle, sans bloquer la navigation
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
            return (
              <div key={lic.code}>
                <button
                  onClick={() => lic.available ? handleChooseB() : setNotifyOpen(notifyOpen === lic.code ? null : lic.code)}
                  className={lic.available ? 'press-scale' : ''}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                    padding: '20px 18px', borderRadius: 18, textAlign: 'left',
                    cursor: 'pointer', fontFamily: 'Sora, sans-serif',
                    background: lic.available ? 'var(--card-primary)' : 'var(--card-secondary)',
                    border: lic.available ? '2px solid #22D6C7' : '2px dashed var(--border-subtle)',
                    boxShadow: lic.available ? '0 6px 24px rgba(34,214,199,0.15)' : 'none',
                    opacity: lic.available ? 1 : 0.8,
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 15, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                    background: lic.available ? 'rgba(34,214,199,0.12)' : 'var(--bg-input)',
                    filter: lic.available ? 'none' : 'grayscale(0.6)',
                  }}>
                    {lic.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-title)' }}>
                        {t(`choix_permis_${lic.code}`)}
                      </span>
                      {!lic.available && (
                        <span style={{
                          fontSize: 10, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase',
                          background: 'rgba(245,158,11,0.14)', color: '#f59e0b',
                          borderRadius: 20, padding: '3px 10px',
                        }}>
                          {t('choix_bientot')}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      {t(`choix_permis_${lic.code}_desc`)}
                    </p>
                  </div>
                  {lic.available && (
                    <span style={{ fontSize: 20, color: '#22D6C7', flexShrink: 0, fontWeight: 900 }}>→</span>
                  )}
                </button>

                {/* Préviens-moi (permis pas encore dispo) */}
                {!lic.available && (
                  <div style={{ padding: '8px 6px 0' }}>
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
                          style={{
                            flex: 1, borderRadius: 11, padding: '10px 14px', fontSize: 13,
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
                            fontFamily: 'Sora, sans-serif', whiteSpace: 'nowrap',
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
                          fontSize: 13, fontWeight: 700, color: '#f59e0b', fontFamily: 'Sora, sans-serif',
                        }}
                      >
                        🔔 {t('choix_previens')}
                      </button>
                    )}
                  </div>
                )}
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
