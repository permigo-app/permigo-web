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
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  inLanguage: ['fr', 'nl'],
  audience: { '@type': 'Audience', audienceType: 'Conducteurs en formation' },
};

const FEATURES = [
  { icon: '📚', bg: 'rgba(59,130,246,0.14)',  title: '2 286 questions officielles', desc: 'Toutes les questions de l\'examen théorique belge, triées par thème et niveau de difficulté.' },
  { icon: '⚡', bg: 'rgba(245,158,11,0.14)',  title: 'Mode Turbo', desc: 'Sessions express de 3 à 5 minutes pour t\'entraîner à la vitesse de l\'examen réel.' },
  { icon: '📝', bg: 'rgba(34,197,94,0.14)',   title: 'Examen blanc', desc: 'Simule les conditions exactes de l\'examen officiel belge avec feedback immédiat.' },
  { icon: '🚦', bg: 'rgba(239,68,68,0.14)',   title: 'Panneaux de signalisation', desc: 'Apprends et mémorise tous les panneaux belges grâce au mode flash et aux cartes.' },
  { icon: '🔥', bg: 'rgba(255,99,72,0.14)',   title: 'Streaks & Badges', desc: 'Reste motivé chaque jour avec un système de récompenses, séries et objectifs gamifiés.' },
  { icon: '🇧🇪', bg: 'rgba(167,139,250,0.14)', title: 'Français & Néerlandais', desc: 'Interface entièrement disponible en français et en néerlandais pour tous les Belges.' },
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
  { code: 'I', emoji: '⚠️', label: 'Accidents & secours' },
];

const STEPS = [
  { num: '01', title: 'Crée ton compte', desc: 'Inscription gratuite en 30 secondes. Aucune carte bancaire requise, jamais.' },
  { num: '02', title: 'Apprends par thème', desc: 'Suis les 9 thèmes officiels avec leçons, flashcards et quiz adaptatifs.' },
  { num: '03', title: 'Réussis l\'examen', desc: 'Mode Turbo, examens blancs, révisions espacées — tu arrives plus que préparé.' },
];

const MOCK_ANSWERS = [
  { text: 'A. 50 km/h', correct: true },
  { text: 'B. 70 km/h', correct: false },
  { text: 'C. 90 km/h', correct: false },
];

export default function LandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main style={{ background: '#07080F', minHeight: '100vh', fontFamily: 'Sora, sans-serif', color: '#F1F5F9' }}>

        {/* ── STICKY NAV ─────────────────────────────────────────── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(7,8,15,0.85)', backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 max(20px, calc((100% - 1100px) / 2))',
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>
            <span style={{ color: '#F1F5F9' }}>My</span>
            <span style={{ color: '#22D6C7' }}>Permi</span>
            <span style={{ color: '#55E6DA' }}>Go</span>
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Link href="/login" style={{
              fontSize: 13, fontWeight: 600, color: 'rgba(241,245,249,0.5)',
              textDecoration: 'none', padding: '8px 14px', borderRadius: 10,
            }}>
              Se connecter
            </Link>
            <Link href="/register" style={{
              fontSize: 13, fontWeight: 700, color: '#07080F',
              background: '#22D6C7', textDecoration: 'none',
              padding: '9px 18px', borderRadius: 10, letterSpacing: '-0.1px',
            }}>
              Commencer →
            </Link>
          </div>
        </nav>

        {/* ── HERO ───────────────────────────────────────────────── */}
        <section style={{
          padding: 'clamp(64px,12vw,120px) 24px clamp(48px,8vw,80px)',
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(170deg,#07080F 0%,#0B1220 55%,#07080F 100%)',
        }}>
          {/* Decorative glow orbs */}
          <div style={{ position:'absolute', top:-120, right:-80, width:560, height:560, borderRadius:'50%', background:'radial-gradient(circle,rgba(34,214,199,0.07) 0%,transparent 60%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-80, left:-60, width:420, height:420, borderRadius:'50%', background:'radial-gradient(circle,rgba(245,158,11,0.05) 0%,transparent 60%)', pointerEvents:'none' }} />

          <div style={{ maxWidth:680, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>

            {/* Badge */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:7,
              padding:'7px 16px', borderRadius:99,
              background:'rgba(34,214,199,0.08)',
              border:'1px solid rgba(34,214,199,0.2)',
              marginBottom:30,
            }}>
              <span style={{ fontSize:13 }}>🇧🇪</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#22D6C7', letterSpacing:'0.3px' }}>
                Application de préparation officielle belge
              </span>
            </div>

            {/* H1 */}
            <h1 style={{
              margin:0,
              fontSize:'clamp(38px,8.5vw,66px)',
              fontWeight:900,
              color:'#FFFFFF',
              letterSpacing:'-2px',
              lineHeight:1.04,
            }}>
              Réussis ton permis belge.
              <br />
              <span style={{
                background:'linear-gradient(135deg,#22D6C7 0%,#55E6DA 100%)',
                WebkitBackgroundClip:'text',
                WebkitTextFillColor:'transparent',
                backgroundClip:'text',
              }}>
                La méthode qui marche.
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{
              margin:'22px auto 0', maxWidth:500,
              fontSize:'clamp(15px,2.8vw,17px)',
              color:'rgba(241,245,249,0.55)', lineHeight:1.7,
            }}>
              2286 questions officielles, gamifiées et 100% gratuites. Apprends comme tu joues — streaks, badges et examens blancs inclus.
            </p>

            {/* CTAs */}
            <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:36, flexWrap:'wrap' }}>
              <Link href="/register" style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'15px 28px',
                background:'linear-gradient(135deg,#22D6C7,#1AB8AB)',
                color:'#07080F',
                borderRadius:13, fontWeight:800, fontSize:15,
                textDecoration:'none',
                boxShadow:'0 8px 30px rgba(34,214,199,0.22)',
                letterSpacing:'-0.2px',
              }}>
                🚀 Commencer gratuitement
              </Link>
              <Link href="/login" style={{
                display:'inline-flex', alignItems:'center',
                padding:'15px 26px',
                background:'rgba(255,255,255,0.05)',
                color:'rgba(255,255,255,0.75)',
                border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:13, fontWeight:600, fontSize:15,
                textDecoration:'none',
              }}>
                Déjà un compte →
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:28, justifyContent:'center', marginTop:36, flexWrap:'wrap', alignItems:'center' }}>
              {[{v:'2 286',l:'questions'},{v:'9',l:'thèmes officiels'},{v:'100%',l:'gratuit'}].map((s,i) => (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                  <span style={{ fontSize:'clamp(20px,4vw,26px)', fontWeight:900, color:'#F59E0B', lineHeight:1 }}>{s.v}</span>
                  <span style={{ fontSize:11, color:'rgba(241,245,249,0.35)', fontWeight:500 }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── App preview mockup ── */}
          <div style={{ maxWidth:380, margin:'52px auto 0', position:'relative', zIndex:1 }}>
            {/* XP badge */}
            <div style={{
              position:'absolute', top:-14, right:-10, zIndex:2,
              background:'linear-gradient(135deg,#F59E0B,#D97706)',
              color:'#000', borderRadius:10, padding:'6px 11px',
              fontSize:12, fontWeight:800,
              boxShadow:'0 4px 18px rgba(245,158,11,0.35)',
            }}>
              +10 XP 🎉
            </div>

            <div style={{
              background:'linear-gradient(145deg,#0E1525,#121E35)',
              borderRadius:22,
              border:'1px solid rgba(34,214,199,0.1)',
              padding:20,
              boxShadow:'0 30px 80px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.04)',
            }}>
              {/* Mock header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div>
                  <p style={{ margin:0, fontSize:10, fontWeight:700, letterSpacing:'1.2px', textTransform:'uppercase', color:'#22D6C7' }}>Thème A · Leçon 3</p>
                  <p style={{ margin:'2px 0 0', fontSize:14, fontWeight:700, color:'#F1F5F9' }}>Comportement général</p>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:3, padding:'4px 9px', borderRadius:99, background:'rgba(255,99,72,0.15)', border:'1px solid rgba(255,99,72,0.2)' }}>
                    <span style={{ fontSize:11 }}>🔥</span>
                    <span style={{ fontSize:11, fontWeight:800, color:'#FF6348' }}>7</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:3, padding:'4px 9px', borderRadius:99, background:'rgba(255,215,0,0.1)', border:'1px solid rgba(255,215,0,0.2)' }}>
                    <span style={{ fontSize:11 }}>⚡</span>
                    <span style={{ fontSize:11, fontWeight:800, color:'#FFD700' }}>450</span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                <div style={{ flex:1, height:5, borderRadius:99, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:'65%', borderRadius:99, background:'linear-gradient(90deg,#22D6C7,#55E6DA)' }} />
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:'#22D6C7' }}>65%</span>
              </div>

              {/* Question */}
              <div style={{
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.06)',
                borderRadius:13, padding:14, marginBottom:12,
              }}>
                <p style={{ margin:0, fontSize:13, fontWeight:600, color:'#F1F5F9', lineHeight:1.55 }}>
                  Quelle est la vitesse maximale autorisée en agglomération belge ?
                </p>
              </div>

              {/* Answers */}
              {MOCK_ANSWERS.map((a) => (
                <div key={a.text} style={{
                  padding:'10px 13px', borderRadius:10, marginBottom:8,
                  border:`1.5px solid ${a.correct ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  background: a.correct ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.02)',
                  fontSize:13, fontWeight: a.correct ? 700 : 500,
                  color: a.correct ? '#4ADE80' : 'rgba(241,245,249,0.5)',
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                }}>
                  <span>{a.text}</span>
                  {a.correct && <span style={{ fontSize:14 }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ───────────────────────────────────────────── */}
        <section style={{ padding:'clamp(48px,8vw,80px) 24px', background:'#0A0F1E' }}>
          <div style={{ maxWidth:960, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:44 }}>
              <p style={{ margin:'0 0 10px', fontSize:11, fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', color:'#22D6C7' }}>Fonctionnalités</p>
              <h2 style={{ margin:0, fontSize:'clamp(26px,5vw,38px)', fontWeight:900, color:'#FFFFFF', letterSpacing:'-1px' }}>
                Tout ce qu&apos;il te faut pour réussir
              </h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(272px,1fr))', gap:16 }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{
                  background:'#07080F', borderRadius:20, padding:'24px 22px',
                  border:'1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{
                    width:50, height:50, borderRadius:14, background:f.bg,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:24, marginBottom:16,
                  }}>
                    {f.icon}
                  </div>
                  <p style={{ margin:'0 0 7px', fontSize:15, fontWeight:700, color:'#F1F5F9' }}>{f.title}</p>
                  <p style={{ margin:0, fontSize:13, color:'rgba(241,245,249,0.5)', lineHeight:1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────── */}
        <section style={{ padding:'clamp(48px,8vw,80px) 24px', background:'#07080F' }}>
          <div style={{ maxWidth:960, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:44 }}>
              <p style={{ margin:'0 0 10px', fontSize:11, fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', color:'#22D6C7' }}>Comment ça marche</p>
              <h2 style={{ margin:0, fontSize:'clamp(26px,5vw,38px)', fontWeight:900, color:'#FFFFFF', letterSpacing:'-1px' }}>
                3 étapes vers le succès
              </h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:36 }}>
              {STEPS.map((step) => (
                <div key={step.num}>
                  <div style={{
                    width:52, height:52, borderRadius:'50%',
                    background:'linear-gradient(135deg,#22D6C7,#1AB8AB)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:17, fontWeight:900, color:'#07080F',
                    marginBottom:18, boxShadow:'0 6px 20px rgba(34,214,199,0.2)',
                  }}>
                    {step.num}
                  </div>
                  <h3 style={{ margin:'0 0 9px', fontSize:18, fontWeight:800, color:'#FFFFFF', letterSpacing:'-0.3px' }}>{step.title}</h3>
                  <p style={{ margin:0, fontSize:14, color:'rgba(241,245,249,0.5)', lineHeight:1.7 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THEMES ─────────────────────────────────────────────── */}
        <section style={{ padding:'clamp(48px,8vw,80px) 24px', background:'#0A0F1E' }}>
          <div style={{ maxWidth:760, margin:'0 auto', textAlign:'center' }}>
            <p style={{ margin:'0 0 10px', fontSize:11, fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', color:'#22D6C7' }}>Programme officiel</p>
            <h2 style={{ margin:'0 0 36px', fontSize:'clamp(26px,5vw,38px)', fontWeight:900, color:'#FFFFFF', letterSpacing:'-1px' }}>
              9 thèmes, 2 286 questions
            </h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
              {THEMES.map(row => (
                <div key={row.code} style={{
                  background:'#07080F', borderRadius:12, padding:'10px 16px',
                  border:'1px solid rgba(255,255,255,0.07)',
                  display:'flex', alignItems:'center', gap:8,
                }}>
                  <span style={{ fontSize:16 }}>{row.emoji}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:'#F59E0B' }}>Thème {row.code}</span>
                  <span style={{ fontSize:12, color:'rgba(241,245,249,0.4)', fontWeight:500 }}>{row.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ──────────────────────────────────────────── */}
        <section style={{ padding:'clamp(48px,8vw,80px) 24px clamp(60px,10vw,100px)', background:'#07080F', textAlign:'center' }}>
          <div style={{
            maxWidth:580, margin:'0 auto',
            background:'linear-gradient(145deg,#0E1525,#0B1830)',
            borderRadius:28, padding:'clamp(32px,6vw,56px) clamp(24px,5vw,52px)',
            border:'1px solid rgba(34,214,199,0.12)',
            boxShadow:'0 0 80px rgba(34,214,199,0.05)',
            position:'relative', overflow:'hidden',
          }}>
            {/* Inner glow */}
            <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(34,214,199,0.08) 0%,transparent 70%)', pointerEvents:'none' }} />

            <div style={{ fontSize:40, marginBottom:14, position:'relative' }}>🏁</div>
            <h2 style={{ margin:'0 0 12px', fontSize:'clamp(24px,5vw,34px)', fontWeight:900, color:'#FFFFFF', letterSpacing:'-1px', position:'relative' }}>
              Prêt à décrocher ton permis ?
            </h2>
            <p style={{ margin:'0 0 30px', fontSize:14, color:'rgba(241,245,249,0.5)', lineHeight:1.7, position:'relative' }}>
              Rejoins des milliers d&apos;apprenants belges. Gratuit, sans engagement, en français et en néerlandais.
            </p>
            <Link href="/register" style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'16px 36px',
              background:'linear-gradient(135deg,#22D6C7,#1AB8AB)',
              color:'#07080F', borderRadius:13, fontWeight:800, fontSize:16,
              textDecoration:'none',
              boxShadow:'0 8px 32px rgba(34,214,199,0.2)',
              position:'relative',
            }}>
              Créer mon compte gratuit →
            </Link>
            <p style={{ margin:'16px 0 0', fontSize:12, color:'rgba(241,245,249,0.25)', position:'relative' }}>
              Inscription en 30 secondes · Aucune carte requise
            </p>
          </div>
        </section>

      </main>
    </>
  );
}
