'use client';

import Link from 'next/link';
import { useLang } from '@/contexts/LanguageContext';

interface LandingCopy {
  navLogin: string;
  navStart: string;
  badge: string;
  h1Line1: string;
  h1Line2: string;
  subtitle: string;
  ctaStart: string;
  ctaLogin: string;
  stats: { v: string; l: string }[];
  mockTheme: string;
  mockThemeTitle: string;
  mockQuestion: string;
  featuresKicker: string;
  featuresTitle: string;
  features: { icon: string; bg: string; title: string; desc: string }[];
  stepsKicker: string;
  stepsTitle: string;
  steps: { num: string; title: string; desc: string }[];
  themesKicker: string;
  themesTitle: string;
  themeWord: string;
  themes: { code: string; emoji: string; label: string }[];
  finalTitle: string;
  finalDesc: string;
  finalCta: string;
  finalNote: string;
}

const COPY: Record<'fr' | 'nl', LandingCopy> = {
  fr: {
    navLogin: 'Se connecter',
    navStart: 'Commencer →',
    badge: 'Préparation au permis théorique officiel belge',
    h1Line1: 'Réussis ton permis belge.',
    h1Line2: 'La méthode qui marche.',
    subtitle: '2286 questions officielles, 100% gratuites. Apprends thème par thème, à ton rythme, jusqu\'à l\'examen blanc.',
    ctaStart: '🚀 Commencer gratuitement',
    ctaLogin: 'Déjà un compte →',
    stats: [
      { v: '2 286', l: 'questions' },
      { v: '9', l: 'thèmes officiels' },
      { v: '+100', l: 'déjà inscrits' },
      { v: '100%', l: 'gratuit' },
    ],
    mockTheme: 'Thème A · Leçon 3',
    mockThemeTitle: 'Comportement général',
    mockQuestion: 'Quelle est la vitesse maximale autorisée en agglomération belge ?',
    featuresKicker: 'Fonctionnalités',
    featuresTitle: 'Tout ce qu\'il te faut pour réussir',
    features: [
      { icon: '📚', bg: 'rgba(59,130,246,0.14)',  title: '2 286 questions officielles', desc: 'Toutes les questions de l\'examen théorique belge, triées par thème et niveau de difficulté.' },
      { icon: '⚡', bg: 'rgba(245,158,11,0.14)',  title: 'Mode Turbo', desc: 'Sessions express de 3 à 5 minutes pour t\'entraîner à la vitesse de l\'examen réel.' },
      { icon: '📝', bg: 'rgba(34,197,94,0.14)',   title: 'Examen blanc', desc: 'Simule les conditions exactes de l\'examen officiel belge avec feedback immédiat.' },
      { icon: '🚦', bg: 'rgba(239,68,68,0.14)',   title: 'Panneaux de signalisation', desc: 'Apprends et mémorise tous les panneaux belges grâce au mode flash et aux cartes.' },
      { icon: '🔁', bg: 'rgba(255,99,72,0.14)',   title: 'Banque d\'erreurs personnelle', desc: 'Chaque question ratée revient s\'entraîner, classée par thème, jusqu\'à ce qu\'elle soit acquise.' },
      { icon: '🇧🇪', bg: 'rgba(167,139,250,0.14)', title: 'Français & Néerlandais', desc: 'Interface entièrement disponible en français et en néerlandais pour tous les Belges.' },
    ],
    stepsKicker: 'Comment ça marche',
    stepsTitle: '3 étapes vers le succès',
    steps: [
      { num: '01', title: 'Crée ton compte', desc: 'Inscription gratuite en 30 secondes. Aucune carte bancaire requise, jamais.' },
      { num: '02', title: 'Apprends par thème', desc: 'Suis les 9 thèmes officiels avec leçons, flashcards et quiz adaptatifs.' },
      { num: '03', title: 'Réussis l\'examen', desc: 'Mode Turbo, examens blancs, banque d\'erreurs — tu arrives plus que préparé.' },
    ],
    themesKicker: 'Programme officiel',
    themesTitle: '9 thèmes, 2 286 questions',
    themeWord: 'Thème',
    themes: [
      { code: 'A', emoji: '🚗', label: 'Comportement général' },
      { code: 'B', emoji: '🚶', label: 'Usagers vulnérables' },
      { code: 'C', emoji: '🛣️', label: 'Règles de priorité' },
      { code: 'D', emoji: '🏎️', label: 'Vitesse & distances' },
      { code: 'E', emoji: '🅿️', label: 'Stationnement' },
      { code: 'F', emoji: '💡', label: 'Éclairage & signaux' },
      { code: 'G', emoji: '🔧', label: 'Véhicule & technique' },
      { code: 'H', emoji: '🌧️', label: 'Conditions difficiles' },
      { code: 'I', emoji: '⚠️', label: 'Accidents & secours' },
    ],
    finalTitle: 'Prêt à décrocher ton permis ?',
    finalDesc: 'Déjà plus de 100 inscrits en à peine quelques semaines. Rejoins les apprenants belges qui préparent leur permis avec MyPermiGo. Gratuit, sans engagement, en français et en néerlandais.',
    finalCta: 'Créer mon compte gratuit →',
    finalNote: 'Inscription en 30 secondes · Aucune carte requise',
  },
  nl: {
    navLogin: 'Inloggen',
    navStart: 'Beginnen →',
    badge: 'Voorbereiding op het officiële Belgische theorie-examen',
    h1Line1: 'Haal je Belgisch rijbewijs.',
    h1Line2: 'De methode die werkt.',
    subtitle: '2286 officiële vragen, 100% gratis. Leer thema per thema, op je eigen tempo, tot aan het proefexamen.',
    ctaStart: '🚀 Gratis beginnen',
    ctaLogin: 'Al een account →',
    stats: [
      { v: '2 286', l: 'vragen' },
      { v: '9', l: 'officiële thema\'s' },
      { v: '+100', l: 'al ingeschreven' },
      { v: '100%', l: 'gratis' },
    ],
    mockTheme: 'Thema A · Les 3',
    mockThemeTitle: 'Algemeen gedrag',
    mockQuestion: 'Wat is de maximumsnelheid binnen de bebouwde kom in België?',
    featuresKicker: 'Functies',
    featuresTitle: 'Alles wat je nodig hebt om te slagen',
    features: [
      { icon: '📚', bg: 'rgba(59,130,246,0.14)',  title: '2 286 officiële vragen', desc: 'Alle vragen van het Belgische theorie-examen, gesorteerd per thema en moeilijkheidsgraad.' },
      { icon: '⚡', bg: 'rgba(245,158,11,0.14)',  title: 'Turbo-modus', desc: 'Snelle sessies van 3 tot 5 minuten om te oefenen op het tempo van het echte examen.' },
      { icon: '📝', bg: 'rgba(34,197,94,0.14)',   title: 'Proefexamen', desc: 'Simuleert de exacte omstandigheden van het officiële Belgische examen met directe feedback.' },
      { icon: '🚦', bg: 'rgba(239,68,68,0.14)',   title: 'Verkeersborden', desc: 'Leer en onthoud alle Belgische verkeersborden met de flashmodus en de kaarten.' },
      { icon: '🔁', bg: 'rgba(255,99,72,0.14)',   title: 'Persoonlijke foutenbank', desc: 'Elke gemiste vraag komt terug om te oefenen, gesorteerd per thema, tot je ze beheerst.' },
      { icon: '🇧🇪', bg: 'rgba(167,139,250,0.14)', title: 'Frans & Nederlands', desc: 'Interface volledig beschikbaar in het Frans en het Nederlands voor alle Belgen.' },
    ],
    stepsKicker: 'Hoe het werkt',
    stepsTitle: '3 stappen naar succes',
    steps: [
      { num: '01', title: 'Maak je account', desc: 'Gratis inschrijven in 30 seconden. Nooit een bankkaart nodig.' },
      { num: '02', title: 'Leer per thema', desc: 'Volg de 9 officiële thema\'s met lessen, flashcards en adaptieve quizzen.' },
      { num: '03', title: 'Slaag voor je examen', desc: 'Turbo-modus, proefexamens, foutenbank — je bent meer dan klaar.' },
    ],
    themesKicker: 'Officieel programma',
    themesTitle: '9 thema\'s, 2 286 vragen',
    themeWord: 'Thema',
    themes: [
      { code: 'A', emoji: '🚗', label: 'Algemeen gedrag' },
      { code: 'B', emoji: '🚶', label: 'Kwetsbare weggebruikers' },
      { code: 'C', emoji: '🛣️', label: 'Voorrangsregels' },
      { code: 'D', emoji: '🏎️', label: 'Snelheid & afstanden' },
      { code: 'E', emoji: '🅿️', label: 'Parkeren' },
      { code: 'F', emoji: '💡', label: 'Verlichting & signalen' },
      { code: 'G', emoji: '🔧', label: 'Voertuig & techniek' },
      { code: 'H', emoji: '🌧️', label: 'Moeilijke omstandigheden' },
      { code: 'I', emoji: '⚠️', label: 'Ongevallen & hulpverlening' },
    ],
    finalTitle: 'Klaar om je rijbewijs te halen?',
    finalDesc: 'Al meer dan 100 inschrijvingen in amper enkele weken. Sluit je aan bij de Belgische leerlingen die hun rijbewijs voorbereiden met MyPermiGo. Gratis, zonder verplichtingen, in het Frans en het Nederlands.',
    finalCta: 'Maak mijn gratis account →',
    finalNote: 'Inschrijven in 30 seconden · Geen kaart nodig',
  },
};

const MOCK_ANSWERS = [
  { text: 'A. 50 km/h', correct: true },
  { text: 'B. 70 km/h', correct: false },
  { text: 'C. 90 km/h', correct: false },
];

export default function LandingContent() {
  const { lang, setLang } = useLang();
  const c = COPY[lang];

  return (
    <main style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'Sora, sans-serif', color: '#0B1220' }}>

      {/* ── STICKY NAV ─────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(11,18,32,0.07)',
        padding: '0 max(20px, calc((100% - 1100px) / 2))',
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5 }}>
          <span style={{ color: '#0B1220' }}>My</span>
          <span style={{ color: '#1AB8AB' }}>Permi</span>
          <span style={{ color: '#22D6C7' }}>Go</span>
        </span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {/* FR / NL toggle */}
          <div style={{
            display: 'flex', borderRadius: 99, overflow: 'hidden',
            border: '1px solid rgba(11,18,32,0.12)', marginRight: 6,
          }}>
            {(['fr', 'nl'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: '4px 10px', fontSize: 11, fontWeight: 800,
                  border: 'none', cursor: 'pointer', letterSpacing: '0.3px',
                  fontFamily: 'inherit',
                  background: lang === l ? '#22D6C7' : 'transparent',
                  color: lang === l ? '#07080F' : 'rgba(11,18,32,0.45)',
                  transition: 'background 150ms, color 150ms',
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Link href="/login" style={{
            fontSize: 12, fontWeight: 600, color: 'rgba(11,18,32,0.55)',
            textDecoration: 'none', padding: '5px 10px', borderRadius: 8,
          }}>
            {c.navLogin}
          </Link>
          <Link href="/register" style={{
            fontSize: 12, fontWeight: 700, color: '#07080F',
            background: '#22D6C7', textDecoration: 'none',
            padding: '6px 13px', borderRadius: 8, letterSpacing: '-0.1px',
          }}>
            {c.navStart}
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(64px,12vw,120px) 24px clamp(48px,8vw,80px)',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(170deg,#FFFFFF 0%,#F0FDFC 55%,#FFFFFF 100%)',
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
              {c.badge}
            </span>
          </div>

          {/* H1 */}
          <h1 style={{
            margin:0,
            fontSize:'clamp(38px,8.5vw,66px)',
            fontWeight:900,
            color:'#0B1220',
            letterSpacing:'-2px',
            lineHeight:1.04,
          }}>
            {c.h1Line1}
            <br />
            <span style={{
              background:'linear-gradient(135deg,#1AB8AB 0%,#22D6C7 100%)',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              backgroundClip:'text',
            }}>
              {c.h1Line2}
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            margin:'22px auto 0', maxWidth:500,
            fontSize:'clamp(15px,2.8vw,17px)',
            color:'rgba(11,18,32,0.6)', lineHeight:1.7,
          }}>
            {c.subtitle}
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
              {c.ctaStart}
            </Link>
            <Link href="/login" style={{
              display:'inline-flex', alignItems:'center',
              padding:'15px 26px',
              background:'rgba(11,18,32,0.04)',
              color:'rgba(11,18,32,0.7)',
              border:'1px solid rgba(11,18,32,0.1)',
              borderRadius:13, fontWeight:600, fontSize:15,
              textDecoration:'none',
            }}>
              {c.ctaLogin}
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:28, justifyContent:'center', marginTop:36, flexWrap:'wrap', alignItems:'center' }}>
            {c.stats.map((s, i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <span style={{ fontSize:'clamp(20px,4vw,26px)', fontWeight:900, color:'#D97706', lineHeight:1 }}>{s.v}</span>
                <span style={{ fontSize:11, color:'rgba(11,18,32,0.45)', fontWeight:500 }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── App preview mockup ── */}
        <div style={{ maxWidth:380, margin:'52px auto 0', position:'relative', zIndex:1 }}>
          <div style={{
            background:'linear-gradient(145deg,#0E1525,#121E35)',
            borderRadius:22,
            border:'1px solid rgba(34,214,199,0.1)',
            padding:20,
            boxShadow:'0 30px 80px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.04)',
          }}>
            {/* Mock header */}
            <div style={{ marginBottom:14 }}>
              <p style={{ margin:0, fontSize:10, fontWeight:700, letterSpacing:'1.2px', textTransform:'uppercase', color:'#22D6C7' }}>{c.mockTheme}</p>
              <p style={{ margin:'2px 0 0', fontSize:14, fontWeight:700, color:'#F1F5F9' }}>{c.mockThemeTitle}</p>
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
                {c.mockQuestion}
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
      <section style={{ padding:'clamp(48px,8vw,80px) 24px', background:'#F5F8FA' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <p style={{ margin:'0 0 10px', fontSize:11, fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', color:'#1AB8AB' }}>{c.featuresKicker}</p>
            <h2 style={{ margin:0, fontSize:'clamp(26px,5vw,38px)', fontWeight:900, color:'#0B1220', letterSpacing:'-1px' }}>
              {c.featuresTitle}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(272px,1fr))', gap:16 }}>
            {c.features.map(f => (
              <div key={f.title} style={{
                background:'#FFFFFF', borderRadius:20, padding:'24px 22px',
                border:'1px solid rgba(11,18,32,0.07)',
              }}>
                <div style={{
                  width:50, height:50, borderRadius:14, background:f.bg,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:24, marginBottom:16,
                }}>
                  {f.icon}
                </div>
                <p style={{ margin:'0 0 7px', fontSize:15, fontWeight:700, color:'#0B1220' }}>{f.title}</p>
                <p style={{ margin:0, fontSize:13, color:'rgba(11,18,32,0.55)', lineHeight:1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section style={{ padding:'clamp(48px,8vw,80px) 24px', background:'#FFFFFF' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <p style={{ margin:'0 0 10px', fontSize:11, fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', color:'#1AB8AB' }}>{c.stepsKicker}</p>
            <h2 style={{ margin:0, fontSize:'clamp(26px,5vw,38px)', fontWeight:900, color:'#0B1220', letterSpacing:'-1px' }}>
              {c.stepsTitle}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:36 }}>
            {c.steps.map((step) => (
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
                <h3 style={{ margin:'0 0 9px', fontSize:18, fontWeight:800, color:'#0B1220', letterSpacing:'-0.3px' }}>{step.title}</h3>
                <p style={{ margin:0, fontSize:14, color:'rgba(11,18,32,0.55)', lineHeight:1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THEMES ─────────────────────────────────────────────── */}
      <section style={{ padding:'clamp(48px,8vw,80px) 24px', background:'#F5F8FA' }}>
        <div style={{ maxWidth:760, margin:'0 auto', textAlign:'center' }}>
          <p style={{ margin:'0 0 10px', fontSize:11, fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', color:'#1AB8AB' }}>{c.themesKicker}</p>
          <h2 style={{ margin:'0 0 36px', fontSize:'clamp(26px,5vw,38px)', fontWeight:900, color:'#0B1220', letterSpacing:'-1px' }}>
            {c.themesTitle}
          </h2>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
            {c.themes.map(row => (
              <div key={row.code} style={{
                background:'#FFFFFF', borderRadius:12, padding:'10px 16px',
                border:'1px solid rgba(11,18,32,0.08)',
                display:'flex', alignItems:'center', gap:8,
              }}>
                <span style={{ fontSize:16 }}>{row.emoji}</span>
                <span style={{ fontSize:13, fontWeight:800, color:'#D97706' }}>{c.themeWord} {row.code}</span>
                <span style={{ fontSize:12, color:'rgba(11,18,32,0.5)', fontWeight:500 }}>{row.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────── */}
      <section style={{ padding:'clamp(48px,8vw,80px) 24px clamp(60px,10vw,100px)', background:'#FFFFFF', textAlign:'center' }}>
        <div style={{
          maxWidth:580, margin:'0 auto',
          background:'linear-gradient(145deg,#F0FDFC,#E6FBF8)',
          borderRadius:28, padding:'clamp(32px,6vw,56px) clamp(24px,5vw,52px)',
          border:'1px solid rgba(34,214,199,0.18)',
          boxShadow:'0 0 60px rgba(34,214,199,0.08)',
          position:'relative', overflow:'hidden',
        }}>
          {/* Inner glow */}
          <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(34,214,199,0.12) 0%,transparent 70%)', pointerEvents:'none' }} />

          <div style={{ fontSize:40, marginBottom:14, position:'relative' }}>🏁</div>
          <h2 style={{ margin:'0 0 12px', fontSize:'clamp(24px,5vw,34px)', fontWeight:900, color:'#0B1220', letterSpacing:'-1px', position:'relative' }}>
            {c.finalTitle}
          </h2>
          <p style={{ margin:'0 0 30px', fontSize:14, color:'rgba(11,18,32,0.55)', lineHeight:1.7, position:'relative' }}>
            {c.finalDesc}
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
            {c.finalCta}
          </Link>
          <p style={{ margin:'16px 0 0', fontSize:12, color:'rgba(11,18,32,0.4)', position:'relative' }}>
            {c.finalNote}
          </p>
        </div>
      </section>

    </main>
  );
}
