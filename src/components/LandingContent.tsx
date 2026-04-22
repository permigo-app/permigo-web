'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScreenshotCarousel from '@/components/ScreenshotCarousel';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLang } from '@/contexts/LanguageContext';

export default function LandingContent() {
  const { t } = useLang();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: '🎮', titleKey: 'landing_feat1_title', descKey: 'landing_feat1_desc' },
    { icon: '📝', titleKey: 'landing_feat2_title', descKey: 'landing_feat2_desc' },
    { icon: '⚡', titleKey: 'landing_feat3_title', descKey: 'landing_feat3_desc' },
    { icon: '📊', titleKey: 'landing_feat4_title', descKey: 'landing_feat4_desc' },
    { icon: '🇧🇪', titleKey: 'landing_feat5_title', descKey: 'landing_feat5_desc' },
    { icon: '🏆', titleKey: 'landing_feat6_title', descKey: 'landing_feat6_desc' },
  ];

  const pricingItems = [
    'landing_pricing_item1',
    'landing_pricing_item2',
    'landing_pricing_item3',
    'landing_pricing_item4',
    'landing_pricing_item5',
    'landing_pricing_item6',
  ];

  return (
    <div style={{ background: '#0a0e2a', color: '#fff', fontFamily: 'Nunito, sans-serif', minHeight: '100vh' }}>

      {/* Language switcher — fixed top right */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50 }}>
        <LanguageSwitcher />
      </div>

      {/* Hero */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px 50px', textAlign: 'center' }}>

        {/* Logo + Gaston */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
          <Image src="/images/gaston.png" width={72} height={72} alt="Prof. Gaston" style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>
            My<span style={{ color: '#4ecdc4' }}>Permi</span>Go
          </span>
        </div>

        <p style={{ color: '#4ecdc4', fontWeight: 800, fontSize: 14, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
          {t('landing_badge')}
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 24 }}>
          {t('landing_hero_title_1')}<br />
          <span style={{ color: '#4ecdc4' }}>{t('landing_hero_title_2')}</span>
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px' }}>
          {t('landing_hero_desc')}
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <Link
            href="/auth"
            style={{
              background: 'linear-gradient(135deg, #4ecdc4, #26a69a)',
              color: '#0a0e2a',
              fontWeight: 900,
              fontSize: 18,
              borderRadius: 100,
              padding: '16px 48px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            {t('landing_cta_primary')}
          </Link>
          <Link
            href="/auth"
            style={{
              border: '2px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 100,
              padding: '16px 40px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            {t('landing_cta_secondary')}
          </Link>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>
          {t('landing_cta_sub')}
        </p>
      </section>

      {/* Stats */}
      <section className="reveal" style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 32 }}>
          {[
            { value: '2286', labelKey: 'landing_stat_questions' },
            { value: '9', labelKey: 'landing_stat_themes' },
            { value: 'FR + NL', labelKey: 'landing_stat_languages' },
            { value: '7j', labelKey: 'landing_stat_trial' },
          ].map(s => (
            <div key={s.labelKey} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#4ecdc4' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{t(s.labelKey)}</div>
            </div>
          ))}
        </div>
        {/* Social proof */}
        <div className="reveal" style={{ textAlign: 'center', marginTop: 28 }}>
          <span style={{ fontSize: 20 }}>⭐⭐⭐⭐⭐</span>
          <p style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
            {t('landing_social_proof')}
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
        <h2 className="reveal" style={{ textAlign: 'center', fontSize: 28, fontWeight: 900, marginBottom: 48 }}>
          {t('landing_features_titre')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {features.map(f => (
            <div key={f.titleKey} className="reveal" style={{ background: '#16213E', border: '1px solid #2A3550', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{t(f.titleKey)}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Screenshots carousel */}
      <section className="reveal" style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
          {t('landing_carousel_titre')}
        </h2>
        <p style={{ textAlign: 'center', fontSize: 15, color: 'rgba(255,255,255,0.45)', marginBottom: 32 }}>
          {t('landing_carousel_sub')}
        </p>
        <ScreenshotCarousel />
      </section>

      {/* Pricing */}
      <section className="reveal" style={{ maxWidth: 480, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>{t('landing_pricing_titre')}</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>{t('landing_pricing_sub')}</p>
        <div style={{ background: '#16213E', border: '2px solid #FFD700', borderRadius: 24, padding: '36px 32px' }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: '#FFD700' }}>7€<span style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>/{t('landing_pricing_month')}</span></div>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: '8px 0 24px' }}>{t('landing_pricing_after_trial')}</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', textAlign: 'left' }}>
            {pricingItems.map(key => (
              <li key={key} style={{ padding: '6px 0', fontSize: 15, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#2ecc71', fontWeight: 900 }}>✓</span> {t(key)}
              </li>
            ))}
          </ul>
          <Link
            href="/auth"
            style={{
              display: 'block',
              background: 'linear-gradient(135deg, #4ecdc4, #26a69a)',
              color: '#0a0e2a',
              fontWeight: 900,
              fontSize: 16,
              borderRadius: 100,
              padding: '14px 24px',
              textDecoration: 'none',
            }}
          >
            {t('landing_cta_primary')}
          </Link>
          <p style={{ marginTop: 14, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>
            {t('landing_pricing_no_commit')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          <span>© 2025-2026 MyPermiGo</span>
          <a href="https://www.iubenda.com/privacy-policy/43486445" target="_blank" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Politique de confidentialité</a>
          <a href="https://www.iubenda.com/privacy-policy/43486445/cookie-policy" target="_blank" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Cookies</a>
          <Link href="/terms" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>CGU</Link>
        </div>
      </footer>
    </div>
  );
}
