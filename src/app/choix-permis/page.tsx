'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/contexts/LanguageContext';
import { recordLicenseEvent, setChosenLicense } from '@/lib/licenseEvents';

/**
 * Plaque d'immatriculation belge : fond blanc, caractères rouge rubis,
 * bande européenne bleue à gauche. 100 % CSS — aucun asset.
 */
function PlateBadge({ text, muted = false }: { text: string; muted?: boolean }) {
  return (
    <div
      style={{
        display: 'flex', width: 86, height: 56, flexShrink: 0,
        borderRadius: 8, overflow: 'hidden',
        border: '2px solid #262b3d',
        background: '#FDFDFD',
        boxShadow: muted ? 'none' : '0 5px 14px rgba(10,20,60,0.22)',
        filter: muted ? 'grayscale(0.45) brightness(0.96)' : 'none',
        opacity: muted ? 0.8 : 1,
      }}
    >
      {/* Bande européenne */}
      <div style={{
        width: 17, background: '#003399', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4, gap: 2,
      }}>
        <span style={{ color: '#FFD617', fontSize: 6, lineHeight: 1, letterSpacing: -0.5 }}>★</span>
        <span style={{ color: '#fff', fontSize: 8, fontWeight: 800, lineHeight: 1 }}>B</span>
      </div>
      {/* Caractères */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#9B2743', fontWeight: 900, letterSpacing: 1,
        fontSize: text.length > 1 ? 21 : 27, fontFamily: 'Sora, sans-serif',
      }}>
        {text}
      </div>
    </div>
  );
}

export default function ChoixPermisPage() {
  const router = useRouter();
  const { t } = useLang();
  const [choosing, setChoosing] = useState(false);

  const handleChooseB = async () => {
    if (choosing) return;
    setChoosing(true);
    recordLicenseEvent('B', 'selected');
    await setChosenLicense('B');
    router.push('/app');
  };

  const handleChooseAM = async () => {
    if (choosing) return;
    setChoosing(true);
    recordLicenseEvent('AM', 'selected');
    await setChosenLicense('AM');
    router.push('/app');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', fontFamily: 'Sora, sans-serif' }}>
      <div style={{ maxWidth: 470, margin: '0 auto', padding: '42px 20px 60px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: -0.5 }}>
              <span style={{ color: 'var(--text-primary)' }}>My</span>
              <span style={{ color: '#22D6C7' }}>Permi</span>
              <span style={{ color: '#55E6DA' }}>Go</span>
            </span>
          </Link>
        </div>

        {/* Titre */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 25, fontWeight: 900, color: 'var(--text-title)', letterSpacing: '-0.6px', lineHeight: 1.25 }}>
            {t('choix_titre')}
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6 }}>
            {t('choix_sub')}
          </p>
        </div>

        {/* ── Permis B ── */}
        <button
          onClick={handleChooseB}
          disabled={choosing}
          className="press-scale"
          style={{
            width: '100%', textAlign: 'left', padding: '20px 20px 18px',
            borderRadius: 18, cursor: choosing ? 'wait' : 'pointer',
            fontFamily: 'Sora, sans-serif',
            background: 'var(--card-primary)',
            border: '1.5px solid var(--border-card)',
            boxShadow: '0 10px 32px rgba(10,20,60,0.08)',
            opacity: choosing ? 0.7 : 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PlateBadge text="B" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-title)', letterSpacing: '-0.3px', marginBottom: 3 }}>
                {t('choix_permis_B')}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                {t('choix_permis_B_desc')}
              </div>
            </div>
          </div>
          <div style={{
            marginTop: 16, padding: '13px', borderRadius: 12, textAlign: 'center',
            background: 'linear-gradient(135deg,#22D6C7,#1AB8AB)',
            color: '#07080F', fontSize: 14.5, fontWeight: 800,
            boxShadow: '0 4px 14px rgba(34,214,199,0.25)',
          }}>
            {t('choix_continuer')}
          </div>
        </button>

        {/* ── Permis AM ── */}
        <button
          onClick={handleChooseAM}
          disabled={choosing}
          className="press-scale"
          style={{
            width: '100%', textAlign: 'left', padding: '20px 20px 18px', marginTop: 16,
            borderRadius: 18, cursor: choosing ? 'wait' : 'pointer',
            fontFamily: 'Sora, sans-serif',
            background: 'var(--card-primary)',
            border: '1.5px solid var(--border-card)',
            boxShadow: '0 10px 32px rgba(10,20,60,0.08)',
            opacity: choosing ? 0.7 : 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PlateBadge text="AM" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-title)', letterSpacing: '-0.3px' }}>
                  {t('choix_permis_AM')}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.8px', padding: '3px 8px',
                  borderRadius: 999, background: 'rgba(34,214,199,0.14)', color: '#1AB8AB',
                }}>
                  {t('choix_gratuit')}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                {t('choix_permis_AM_desc')}
              </div>
            </div>
          </div>
          <div style={{
            marginTop: 16, padding: '13px', borderRadius: 12, textAlign: 'center',
            background: 'var(--bg-input)', border: '1.5px solid var(--border-card)',
            color: 'var(--text-title)', fontSize: 14.5, fontWeight: 800,
          }}>
            {t('choix_continuer_AM')}
          </div>
        </button>

        {/* Note bas de page */}
        <p style={{ margin: '22px 0 0', textAlign: 'center', fontSize: 12, color: 'var(--text-disabled)', lineHeight: 1.6 }}>
          {t('choix_footer_note')}
        </p>
      </div>
    </div>
  );
}
