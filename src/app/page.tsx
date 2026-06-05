import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MyPermiGo — Permis Théorique Belge Gratuit & Gamifié',
  description:
    'Prépare ton permis de conduire théorique belge avec MyPermiGo. 2286 questions officielles, 9 thèmes, mode Turbo, examen blanc et panneaux. Gratuit, en français et en néerlandais.',
  keywords: [
    'mypermigo', 'permis théorique belge', 'code de la route belgique',
    'examen théorique permis belgique', 'préparation permis belge',
    'questions permis belge', 'permis théorique gratuit', 'rijbewijs theorie belgie',
  ].join(', '),
  openGraph: {
    title: 'MyPermiGo — Permis Théorique Belge',
    description: 'Prépare ton permis belge en mode jeu. 2286 questions officielles, gratuit.',
    url: 'https://mypermigo.be',
    siteName: 'MyPermiGo',
    locale: 'fr_BE',
    type: 'website',
  },
  alternates: {
    canonical: 'https://mypermigo.be',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'MyPermiGo',
  url: 'https://mypermigo.be',
  description:
    'Application web gratuite pour préparer le permis théorique belge. 2286 questions officielles, mode Turbo, examen blanc, panneaux de signalisation.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  inLanguage: ['fr', 'nl'],
  audience: {
    '@type': 'Audience',
    audienceType: 'Conducteurs en formation',
  },
};

const FEATURES = [
  { emoji: '📚', title: '2286 questions officielles', desc: 'Toutes les questions de l\'examen théorique belge, classées par thème' },
  { emoji: '⚡', title: 'Mode Turbo', desc: 'Entraîne ta rapidité avec des sessions de 3 ou 5 minutes' },
  { emoji: '📝', title: 'Examen blanc', desc: 'Simule les conditions réelles de l\'examen officiel' },
  { emoji: '🚦', title: 'Panneaux de signalisation', desc: 'Apprends tous les panneaux belges avec le mode Flash' },
  { emoji: '🔥', title: 'Streaks & badges', desc: 'Reste motivé avec un système de récompenses gamifié' },
  { emoji: '🇧🇪', title: 'FR + NL', desc: 'Disponible en français et en néerlandais' },
];

const THEMES = [
  { code: 'A', emoji: '🚗', label: 'Comportement général' },
  { code: 'B', emoji: '🚶', label: 'Usagers vulnérables' },
  { code: 'C', emoji: '🛣️', label: 'Règles de priorité' },
  { code: 'D', emoji: '🏎️', label: 'Vitesse & distances' },
  { code: 'E', emoji: '🅿️', label: 'Stationnement' },
  { code: 'F', emoji: '💡', label: 'Éclairage & signaux' },
  { code: 'G', emoji: '🔧', label: 'Véhicule & technique' },
  { code: 'H', emoji: '🌧️', label: 'Conditions difficiles' },
  { code: 'I', emoji: '⚠️', label: 'Accidents & premiers secours' },
];

export default function LandingPage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main style={{ background: '#f0f2f5', minHeight: '100vh', fontFamily: 'Sora, sans-serif' }}>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section style={{ background: '#0b2659', padding: '60px 20px 48px', textAlign: 'center' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
              Permis théorique belge
            </p>
            <h1 style={{ margin: 0, fontSize: 42, fontWeight: 900, color: '#ffffff', letterSpacing: -1, lineHeight: 1.1 }}>
              MyPermiGo
            </h1>
            <p style={{ margin: '14px 0 0', fontSize: 18, fontWeight: 600, color: '#f59e0b', lineHeight: 1.4 }}>
              Ton permis belge, version jeu 🎮
            </p>
            <p style={{ margin: '10px 0 0', fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
              2286 questions officielles · Gratuit · FR & NL
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
              <Link href="/register" style={{
                display: 'inline-block', padding: '16px 32px',
                background: '#f59e0b', color: '#0b2659',
                borderRadius: 14, fontWeight: 800, fontSize: 16,
                textDecoration: 'none',
              }}>
                Commencer gratuitement →
              </Link>
              <Link href="/login" style={{
                display: 'inline-block', padding: '16px 32px',
                background: 'rgba(255,255,255,0.1)', color: '#ffffff',
                border: '1.5px solid rgba(255,255,255,0.25)',
                borderRadius: 14, fontWeight: 700, fontSize: 15,
                textDecoration: 'none',
              }}>
                Se connecter
              </Link>
            </div>
          </div>
        </section>

        {/* ── STATS BAND ───────────────────────────────────────────── */}
        <section style={{ background: '#ffffff', borderBottom: '1px solid #e8eaed', padding: '20px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', justifyContent: 'space-around', gap: 16, flexWrap: 'wrap' }}>
            {[
              { value: '2286', label: 'questions officielles' },
              { value: '9', label: 'thèmes couverts' },
              { value: '100%', label: 'gratuit' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#0b2659' }}>{s.value}</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────── */}
        <section style={{ padding: '40px 20px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 800, color: '#0b2659', textAlign: 'center' }}>
              Tout ce qu&apos;il te faut pour réussir
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{ background: '#ffffff', borderRadius: 16, padding: '20px', border: '1.5px solid #e8eaed', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{f.emoji}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0b2659' }}>{f.title}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THEMES ───────────────────────────────────────────────── */}
        <section style={{ padding: '0 20px 40px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 800, color: '#0b2659', textAlign: 'center' }}>
              9 thèmes officiels
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {THEMES.map(row => (
                <div key={row.code} style={{ background: '#ffffff', borderRadius: 12, padding: '10px 16px', border: '1.5px solid #e8eaed', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#0b2659' }}>
                  <span>{row.emoji}</span>
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>Thème {row.code}</span>
                  <span style={{ color: '#6b7280', fontSize: 12 }}>{row.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────── */}
        <section style={{ padding: '40px 20px 60px', textAlign: 'center' }}>
          <div style={{ maxWidth: 480, margin: '0 auto', background: '#0b2659', borderRadius: 24, padding: '36px 28px' }}>
            <p style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 900, color: '#ffffff' }}>Prêt à passer ton permis ?</p>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              Rejoins des milliers d&apos;apprenants belges et prépare ton examen théorique gratuitement.
            </p>
            <Link href="/register" style={{
              display: 'inline-block', padding: '16px 40px',
              background: '#f59e0b', color: '#0b2659',
              borderRadius: 14, fontWeight: 800, fontSize: 16,
              textDecoration: 'none',
            }}>
              Créer un compte gratuit →
            </Link>
          </div>
        </section>

      </main>
    </>
  );
}
