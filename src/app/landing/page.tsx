import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MyPermiGo — Prépare ton Permis Théorique Belge en Mode Jeu',
  description:
    'Prépare ton examen théorique belge avec 2286 questions officielles. Gamifié, interactif, disponible en français et néerlandais. Essai gratuit 7 jours, 7€/mois.',
  keywords: 'permis belge, code de la route belgique, examen théorique belgique, theorie rijbewijs belgie',
  openGraph: {
    title: 'MyPermiGo — Permis Théorique Belge en Mode Jeu',
    description: "Prépare ton permis belge en t'amusant. 2286 questions officielles, FR + NL.",
    url: 'https://mypermigo.be/landing',
    siteName: 'MyPermiGo',
    locale: 'fr_BE',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <div style={{ background: '#0a0e2a', color: '#fff', fontFamily: 'Nunito, sans-serif', minHeight: '100vh' }}>

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
          Permis théorique belge
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 24 }}>
          Réussis ton examen théorique<br />
          <span style={{ color: '#4ecdc4' }}>en mode jeu</span>
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px' }}>
          MyPermiGo transforme la préparation au code de la route belge en une expérience gamifiée.
          2286 questions officielles, 9 thèmes, disponible en français et néerlandais.
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
            C'est parti ! →
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
            Se connecter
          </Link>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>
          Sans engagement · Annulable à tout moment · Aucune carte requise pour l'essai
        </p>
      </section>

      {/* Stats */}
      <section style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 32 }}>
          {[
            { value: '2286', label: 'Questions officielles' },
            { value: '9', label: 'Thèmes couverts' },
            { value: 'FR + NL', label: 'Langues disponibles' },
            { value: '7j', label: 'Essai gratuit' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#4ecdc4' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Social proof */}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <span style={{ fontSize: 20 }}>⭐⭐⭐⭐⭐</span>
          <p style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
            Rejoins les premiers utilisateurs MyPermiGo en Belgique
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 900, marginBottom: 48 }}>
          Tout ce qu'il te faut pour réussir
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {[
            { icon: '🎮', title: 'Gamification complète', desc: 'XP, niveaux, badges, streaks — apprendre ne ressemble plus à étudier.' },
            { icon: '📝', title: '2286 questions officielles', desc: 'Toutes les questions des thèmes A à I conformes aux examens GOCA/CARA.' },
            { icon: '⚡', title: 'Mode Turbo', desc: 'Questions rapides en rafale pour tester tes réflexes et graver les réponses.' },
            { icon: '📊', title: 'Examen blanc complet', desc: '50 questions chronométrées, identiques au vrai examen théorique belge.' },
            { icon: '🇧🇪', title: 'Français + Néerlandais', desc: 'Bascule entre FR et NL en un clic. Parfait pour les bilingues.' },
            { icon: '🏆', title: 'Suivi de progression', desc: "Graphiques par thème, historique des examens, temps d'étude cumulé." },
          ].map(f => (
            <div key={f.title} style={{ background: '#16213E', border: '1px solid #2A3550', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product preview mockup */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 60px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
          Une expérience vraiment différente
        </h2>
        <p style={{ textAlign: 'center', fontSize: 15, color: 'rgba(255,255,255,0.45)', marginBottom: 32 }}>
          Conduis sur la route de l'apprentissage — débloque les thèmes un à un
        </p>
        <div style={{
          background: '#0F1923',
          border: '1px solid #2A3550',
          borderRadius: 20,
          padding: '32px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Top bar mockup */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e74c3c' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f39c12' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2ecc71' }} />
            <div style={{ flex: 1, height: 24, borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginLeft: 8 }} />
          </div>
          {/* Road mockup */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            {/* Sidebar left mockup */}
            <div style={{ width: 140, flexShrink: 0 }}>
              <div style={{ background: '#16213E', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#4ecdc4', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>MyPermiGo</div>
                {['A', 'B', 'C', 'D', 'E'].map((t, i) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 6px', borderRadius: 6, marginBottom: 3, background: i === 0 ? 'rgba(78,205,196,0.15)' : 'transparent' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: i === 0 ? '#4ecdc4' : i === 1 ? '#3498db' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: i < 2 ? '#0a0e2a' : 'rgba(255,255,255,0.3)' }}>{t}</div>
                    <div style={{ height: 6, flex: 1, borderRadius: 3, background: i === 0 ? '#4ecdc4' : i === 1 ? '#3498db' : 'rgba(255,255,255,0.07)' }} />
                  </div>
                ))}
              </div>
            </div>
            {/* Route center mockup */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 10, fontWeight: 700 }}>THÈME A — SIGNALISATION</div>
              {/* Road */}
              <div style={{ width: '100%', maxWidth: 320, background: '#16213E', borderRadius: 16, padding: '16px 12px', border: '1px solid #2A3550' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((s, i) => (
                    <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? '#4ecdc4' : i === 3 ? '#FFD700' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#0a0e2a', border: i === 3 ? '2px solid #FFD700' : 'none', boxShadow: i === 3 ? '0 0 8px #FFD700' : 'none' }}>{i < 3 ? '✓' : s}</div>
                      {i < 5 && <div style={{ width: 20, height: 2, background: i < 3 ? '#4ecdc4' : 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: -16, marginLeft: 28 }} />}
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <div style={{ display: 'inline-block', background: 'rgba(78,205,196,0.15)', border: '1px solid rgba(78,205,196,0.4)', borderRadius: 8, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#4ecdc4' }}>
                    🚗 COMMENCER D →
                  </div>
                </div>
              </div>
              {/* XP bar */}
              <div style={{ width: '100%', maxWidth: 320, marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: '#FFD700', fontWeight: 900 }}>⭐ 1240 XP</span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                  <div style={{ width: '62%', height: '100%', background: 'linear-gradient(90deg, #4ecdc4, #26a69a)', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>Niv. 4</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: 480, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Tarif simple et honnête</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>Un seul forfait, tout inclus</p>
        <div style={{ background: '#16213E', border: '2px solid #FFD700', borderRadius: 24, padding: '36px 32px' }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: '#FFD700' }}>7€<span style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>/mois</span></div>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: '8px 0 24px' }}>Après 7 jours d'essai gratuit</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', textAlign: 'left' }}>
            {[
              '2286 questions officielles',
              '9 thèmes A → I',
              'Mode Turbo illimité',
              'Examens blancs complets',
              'Accès FR + NL',
              'Sans engagement',
            ].map(item => (
              <li key={item} style={{ padding: '6px 0', fontSize: 15, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#2ecc71', fontWeight: 900 }}>✓</span> {item}
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
            C'est parti ! →
          </Link>
          <p style={{ marginTop: 14, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>
            Sans engagement · Annulable à tout moment
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          <span>© 2025 MyPermiGo</span>
          <a href="https://www.iubenda.com/privacy-policy/43486445" target="_blank" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Politique de confidentialité</a>
          <a href="https://www.iubenda.com/privacy-policy/43486445/cookie-policy" target="_blank" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Cookies</a>
          <Link href="/terms" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>CGU</Link>
        </div>
      </footer>
    </div>
  );
}
