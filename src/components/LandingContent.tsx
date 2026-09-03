'use client';

import Link from 'next/link';
import { useLang } from '@/contexts/LanguageContext';
import { cheapestPlan } from '@/lib/pricing';
import { THEME_COLORS } from '@/lib/constants';

/* ──────────────────────────────────────────────────────────────
   Palette de la landing.
   Le hero et le bloc final sont SOMBRES : d'une part c'est ce qui
   se fait de mieux aujourd'hui, d'autre part ça raccorde enfin la
   page aux écrans /login et /register, qui sont sombres eux aussi —
   avant, le visiteur passait du blanc au noir en un clic.
   ────────────────────────────────────────────────────────────── */
const INK = '#070C1A';
const INK_2 = '#0E1828';
const BRAND = '#22D6C7';
const BRAND_DEEP = '#1AB8AB';
const AMBER = '#FFB443';

interface FaqItem { q: string; a: string }

interface LandingCopy {
  navLogin: string;
  navStart: string;
  badge: string;
  h1Line1: string;
  h1Line2: string;
  subtitle: string;
  ctaStart: string;
  ctaLogin: string;
  trust: string[];
  stats: { v: string; l: string }[];
  mockTheme: string;
  mockThemeTitle: string;
  mockQuestion: string;
  featuresKicker: string;
  featuresTitle: string;
  featuresSub: string;
  features: { icon: string; color: string; title: string; desc: string }[];
  stepsKicker: string;
  stepsTitle: string;
  steps: { num: string; title: string; desc: string }[];
  themesKicker: string;
  themesTitle: string;
  themesSub: string;
  themeWord: string;
  themes: { code: string; emoji: string; label: string }[];
  planKicker: string;
  planTitle: string;
  planSubtitle: string;
  freeTitle: string;
  freeBadge: string;
  freeItems: string[];
  premiumTitle: string;
  premiumBadge: string;
  premiumItems: string[];
  premiumPeriod: string;
  premiumNote: string;
  faqKicker: string;
  faqTitle: string;
  faq: FaqItem[];
  finalTitle: string;
  finalDesc: string;
  finalCta: string;
  finalNote: string;
}

const COPY: Record<'fr' | 'nl', LandingCopy> = {
  fr: {
    navLogin: 'Se connecter',
    navStart: 'Commencer',
    badge: 'Conforme au programme officiel belge',
    h1Line1: 'Ton permis théorique,',
    h1Line2: 'sans y passer six mois.',
    subtitle: '1 770 questions sur les 9 thèmes officiels, des leçons courtes et des examens blancs en conditions réelles. Commence gratuitement, aujourd\'hui.',
    ctaStart: 'Commencer gratuitement',
    ctaLogin: 'J\'ai déjà un compte',
    trust: ['Sans carte bancaire', 'Français & Néerlandais', 'Sur mobile et ordinateur'],
    stats: [
      { v: '1 770', l: 'questions' },
      { v: '9', l: 'thèmes officiels' },
      { v: '+100', l: 'inscrits en quelques semaines' },
      { v: '15 min', l: 'par jour suffisent' },
    ],
    mockTheme: 'Thème A · Leçon 3',
    mockThemeTitle: 'La voie publique',
    mockQuestion: 'Quelle est la vitesse maximale autorisée en agglomération belge ?',
    featuresKicker: 'Ce que tu obtiens',
    featuresTitle: 'Six façons d\'arriver prêt le jour J',
    featuresSub: 'Pas juste une liste de questions : une méthode qui te fait revenir chaque jour.',
    features: [
      { icon: '📚', color: '#3B82F6', title: '1 770 questions', desc: 'Les 9 thèmes du programme officiel belge, triés par difficulté, avec l\'explication après chaque réponse.' },
      { icon: '⚡', color: AMBER, title: 'Mode Turbo', desc: 'Trois à cinq minutes chrono en main. Parfait dans le bus, entre deux cours, quand tu n\'as pas le temps.' },
      { icon: '📝', color: '#22C55E', title: 'Examen blanc', desc: 'Les conditions réelles de l\'examen belge : même format, même pression, sans la correction en direct.' },
      { icon: '🚦', color: '#EF4444', title: '214 panneaux', desc: 'Tout le catalogue belge en cartes flash, plus un quiz qui interroge chaque panneau un par un.' },
      { icon: '🔁', color: '#FF6348', title: 'Banque d\'erreurs', desc: 'Chaque question ratée revient jusqu\'à ce que tu la maîtrises. Réussie une fois, elle sort du tas.' },
      { icon: '🇧🇪', color: '#A78BFA', title: 'Français & Néerlandais', desc: 'Toute la plateforme bascule d\'une langue à l\'autre, questions et explications comprises.' },
    ],
    stepsKicker: 'Comment ça marche',
    stepsTitle: 'Trois étapes, pas une de plus',
    steps: [
      { num: '01', title: 'Crée ton compte', desc: 'Trente secondes, une adresse mail. Aucune carte bancaire pour commencer.' },
      { num: '02', title: 'Avance thème par thème', desc: 'Un peu de théorie, puis le quiz. Tes erreurs sont mises de côté pour plus tard.' },
      { num: '03', title: 'Passe l\'examen blanc', desc: 'Quand tu le réussis régulièrement, tu es prêt à réserver la vraie date.' },
    ],
    themesKicker: 'Le programme',
    themesTitle: 'Les 9 thèmes officiels, en entier',
    themesSub: 'Exactement le découpage du programme belge — rien en plus, rien en moins.',
    themeWord: 'Thème',
    themes: [
      { code: 'A', emoji: '🛣️', label: 'La voie publique' },
      { code: 'B', emoji: '🚶', label: 'Les usagers de la route' },
      { code: 'C', emoji: '🚗', label: 'La voiture' },
      { code: 'D', emoji: '🏎️', label: 'La vitesse' },
      { code: 'E', emoji: '↔️', label: 'Croisement et dépassement' },
      { code: 'F', emoji: '🔺', label: 'La priorité' },
      { code: 'G', emoji: '🧭', label: 'Où circuler' },
      { code: 'H', emoji: '🅿️', label: 'Arrêt et stationnement' },
      { code: 'I', emoji: '📋', label: 'Divers' },
    ],
    planKicker: 'Gratuit & Premium',
    planTitle: 'Essaie d\'abord, décide ensuite',
    planSubtitle: 'De quoi te faire une vraie idée sans sortir ta carte. Premium débloque le reste le jour où tu veux accélérer.',
    freeTitle: 'Gratuit',
    freeBadge: 'Sans carte bancaire',
    freeItems: [
      'La première leçon complète : théorie + quiz',
      '5 cartes flash par leçon, dans tous les thèmes',
      'Un examen blanc en conditions réelles',
      'Une session d\'entraînement Turbo',
      '3 catégories de panneaux de signalisation',
      'Tout le permis AM (cyclomoteur), sans limite',
    ],
    premiumTitle: 'Premium',
    premiumBadge: 'Tout débloqué',
    premiumItems: [
      'Les 9 thèmes et les 1 770 questions',
      'Examens blancs illimités',
      'Entraînement Turbo illimité',
      'Toutes les cartes flash de chaque leçon',
      'Ta banque d\'erreurs personnelle par thème',
      'Les 214 panneaux de signalisation belges',
    ],
    premiumPeriod: 'par semaine',
    premiumNote: 'Aussi en 2 semaines et 1 mois · Sans engagement, résiliable à tout moment',
    faqKicker: 'Questions fréquentes',
    faqTitle: 'Ce qu\'on nous demande le plus',
    faq: [
      {
        q: 'Vos questions correspondent-elles vraiment à l\'examen ?',
        a: 'Elles couvrent les 9 thèmes du programme officiel belge et reprennent le format de l\'examen : un énoncé, quatre propositions, une seule bonne réponse. L\'examen blanc reproduit les conditions réelles, sans correction en direct. Nous ne sommes pas l\'organisme officiel : pour passer l\'examen, tu réserves auprès d\'un centre agréé.',
      },
      {
        q: 'Pourquoi une partie est-elle payante ?',
        a: 'Écrire, traduire et illustrer 1 770 questions prend un temps considérable, et la plateforme doit rester en ligne et à jour. La partie gratuite est volontairement assez large pour que tu juges par toi-même avant de payer quoi que ce soit — une leçon entière, un examen blanc, des cartes flash dans chaque thème.',
      },
      {
        q: 'En combien de temps peut-on être prêt ?',
        a: 'Cela dépend surtout de ta régularité. Quinze à vingt minutes par jour pendant deux à trois semaines suffisent à la plupart des gens pour boucler les 9 thèmes et enchaîner les examens blancs. Le mode Turbo existe précisément pour les jours où tu n\'as que trois minutes.',
      },
      {
        q: 'Ça marche sur téléphone ?',
        a: 'Oui, directement dans ton navigateur, rien à installer. La plateforme est pensée pour le téléphone d\'abord — c\'est là qu\'on révise vraiment, dans les transports ou entre deux cours — et fonctionne aussi bien sur ordinateur.',
      },
      {
        q: 'Et si je passe l\'examen en néerlandais ?',
        a: 'Tout bascule : l\'interface, les questions, les propositions et les explications. Tu changes de langue quand tu veux, en haut de la page, et ta progression te suit.',
      },
      {
        q: 'Je peux arrêter quand je veux ?',
        a: 'Oui. Premium est sans engagement et se résilie à tout moment depuis ton profil, en deux clics. Tu gardes l\'accès jusqu\'à la fin de la période déjà payée.',
      },
    ],
    finalTitle: 'On commence maintenant ?',
    finalDesc: 'Plus de 100 inscrits en quelques semaines. Trente secondes pour créer ton compte, et tu attaques la première leçon dans la foulée.',
    finalCta: 'Créer mon compte gratuit',
    finalNote: 'Gratuit · Aucune carte bancaire pour commencer',
  },
  nl: {
    navLogin: 'Inloggen',
    navStart: 'Beginnen',
    badge: 'Conform het officiële Belgische programma',
    h1Line1: 'Je theorie-examen,',
    h1Line2: 'zonder er maanden aan te verliezen.',
    subtitle: '1 770 vragen over de 9 officiële thema\'s, korte lessen en proefexamens in echte omstandigheden. Begin vandaag, gratis.',
    ctaStart: 'Gratis beginnen',
    ctaLogin: 'Ik heb al een account',
    trust: ['Zonder bankkaart', 'Frans & Nederlands', 'Op gsm en computer'],
    stats: [
      { v: '1 770', l: 'vragen' },
      { v: '9', l: 'officiële thema\'s' },
      { v: '+100', l: 'ingeschreven in enkele weken' },
      { v: '15 min', l: 'per dag volstaat' },
    ],
    mockTheme: 'Thema A · Les 3',
    mockThemeTitle: 'De openbare weg',
    mockQuestion: 'Wat is de maximumsnelheid binnen de bebouwde kom in België?',
    featuresKicker: 'Wat je krijgt',
    featuresTitle: 'Zes manieren om klaar te zijn op de grote dag',
    featuresSub: 'Niet zomaar een lijst vragen: een methode die je elke dag doet terugkomen.',
    features: [
      { icon: '📚', color: '#3B82F6', title: '1 770 vragen', desc: 'De 9 thema\'s van het officiële Belgische programma, gesorteerd op moeilijkheid, met uitleg na elk antwoord.' },
      { icon: '⚡', color: AMBER, title: 'Turbo-modus', desc: 'Drie tot vijf minuten, klok mee. Ideaal op de bus, tussen twee lessen, wanneer je weinig tijd hebt.' },
      { icon: '📝', color: '#22C55E', title: 'Proefexamen', desc: 'De echte examenomstandigheden: zelfde formaat, zelfde druk, zonder verbetering tussendoor.' },
      { icon: '🚦', color: '#EF4444', title: '214 verkeersborden', desc: 'De volledige Belgische catalogus als flashcards, plus een quiz die elk bord één voor één overhoort.' },
      { icon: '🔁', color: '#FF6348', title: 'Foutenbank', desc: 'Elke gemiste vraag komt terug tot je ze beheerst. Eén keer juist, en ze verdwijnt uit de stapel.' },
      { icon: '🇧🇪', color: '#A78BFA', title: 'Frans & Nederlands', desc: 'Het hele platform schakelt van taal, vragen en uitleg inbegrepen.' },
    ],
    stepsKicker: 'Hoe het werkt',
    stepsTitle: 'Drie stappen, niet meer',
    steps: [
      { num: '01', title: 'Maak je account', desc: 'Dertig seconden, één e-mailadres. Geen bankkaart om te starten.' },
      { num: '02', title: 'Werk thema per thema', desc: 'Wat theorie, dan de quiz. Je fouten worden apart gezet voor later.' },
      { num: '03', title: 'Doe het proefexamen', desc: 'Slaag je er geregeld voor, dan ben je klaar om je echte datum te boeken.' },
    ],
    themesKicker: 'Het programma',
    themesTitle: 'De 9 officiële thema\'s, volledig',
    themesSub: 'Exact de indeling van het Belgische programma — niets meer, niets minder.',
    themeWord: 'Thema',
    themes: [
      { code: 'A', emoji: '🛣️', label: 'De openbare weg' },
      { code: 'B', emoji: '🚶', label: 'De weggebruikers' },
      { code: 'C', emoji: '🚗', label: 'De auto' },
      { code: 'D', emoji: '🏎️', label: 'De snelheid' },
      { code: 'E', emoji: '↔️', label: 'Kruisen en inhalen' },
      { code: 'F', emoji: '🔺', label: 'De voorrang' },
      { code: 'G', emoji: '🧭', label: 'Waar rijden' },
      { code: 'H', emoji: '🅿️', label: 'Stilstaan en parkeren' },
      { code: 'I', emoji: '📋', label: 'Diversen' },
    ],
    planKicker: 'Gratis & Premium',
    planTitle: 'Eerst proberen, dan beslissen',
    planSubtitle: 'Genoeg om je een echt beeld te vormen zonder je bankkaart. Premium ontgrendelt de rest op de dag dat je wil versnellen.',
    freeTitle: 'Gratis',
    freeBadge: 'Zonder bankkaart',
    freeItems: [
      'De volledige eerste les: theorie + quiz',
      '5 flashcards per les, in alle thema\'s',
      'Eén proefexamen in echte omstandigheden',
      'Eén Turbo-oefensessie',
      '3 categorieën verkeersborden',
      'Het volledige AM-rijbewijs (bromfiets), onbeperkt',
    ],
    premiumTitle: 'Premium',
    premiumBadge: 'Alles ontgrendeld',
    premiumItems: [
      'De 9 thema\'s en alle 1 770 vragen',
      'Onbeperkt proefexamens',
      'Onbeperkt Turbo-training',
      'Alle flashcards van elke les',
      'Je persoonlijke foutenbank per thema',
      'De 214 Belgische verkeersborden',
    ],
    premiumPeriod: 'per week',
    premiumNote: 'Ook in 2 weken en 1 maand · Zonder verplichtingen, elk moment opzegbaar',
    faqKicker: 'Veelgestelde vragen',
    faqTitle: 'Wat men ons het vaakst vraagt',
    faq: [
      {
        q: 'Komen jullie vragen echt overeen met het examen?',
        a: 'Ze dekken de 9 thema\'s van het officiële Belgische programma en volgen het examenformaat: een vraag, vier voorstellen, één juist antwoord. Het proefexamen bootst de echte omstandigheden na, zonder verbetering tussendoor. Wij zijn niet de officiële instantie: voor het examen zelf boek je bij een erkend centrum.',
      },
      {
        q: 'Waarom is een deel betalend?',
        a: '1 770 vragen schrijven, vertalen en illustreren kost enorm veel tijd, en het platform moet online en up-to-date blijven. Het gratis gedeelte is bewust ruim genoeg om zelf te oordelen vóór je iets betaalt — een volledige les, een proefexamen, flashcards in elk thema.',
      },
      {
        q: 'Hoe lang duurt het voor je klaar bent?',
        a: 'Dat hangt vooral af van je regelmaat. Vijftien tot twintig minuten per dag gedurende twee à drie weken volstaat voor de meeste mensen om de 9 thema\'s af te werken en proefexamens te doen. De Turbo-modus bestaat net voor de dagen waarop je maar drie minuten hebt.',
      },
      {
        q: 'Werkt het op een gsm?',
        a: 'Ja, gewoon in je browser, niets te installeren. Het platform is in de eerste plaats voor de gsm gemaakt — daar wordt echt geoefend, onderweg of tussen twee lessen — en werkt even goed op de computer.',
      },
      {
        q: 'En als ik het examen in het Frans aflegt?',
        a: 'Alles schakelt mee: de interface, de vragen, de voorstellen en de uitleg. Je wisselt van taal wanneer je wil, bovenaan de pagina, en je voortgang volgt mee.',
      },
      {
        q: 'Kan ik stoppen wanneer ik wil?',
        a: 'Ja. Premium is zonder verplichtingen en je zegt het op elk moment op vanuit je profiel, in twee klikken. Je behoudt toegang tot het einde van de reeds betaalde periode.',
      },
    ],
    finalTitle: 'Zullen we beginnen?',
    finalDesc: 'Meer dan 100 inschrijvingen in enkele weken. Dertig seconden om je account te maken, en je start meteen met de eerste les.',
    finalCta: 'Maak mijn gratis account',
    finalNote: 'Gratis · Geen bankkaart om te starten',
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
  const plan = cheapestPlan();

  const check = (color: string) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3"
         strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <main style={{ background: '#FFFFFF', fontFamily: 'Sora, sans-serif', color: '#0B1220', overflowX: 'hidden' }}>

      {/* ── NAV ────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between"
        style={{
          background: 'rgba(7,12,26,0.72)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0 max(16px, calc((100% - 1140px) / 2))', height: 62,
        }}
      >
        <span style={{ fontSize: 19, fontWeight: 900, letterSpacing: -0.6, whiteSpace: 'nowrap' }}>
          <span style={{ color: '#FFFFFF' }}>My</span>
          <span style={{ color: BRAND }}>Permi</span>
          <span style={{ color: AMBER }}>Go</span>
        </span>

        <div className="flex items-center" style={{ gap: 6 }}>
          <div style={{ display: 'flex', borderRadius: 99, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.16)' }}>
            {(['fr', 'nl'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: '4px 9px', fontSize: 11, fontWeight: 800, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: '0.3px',
                  background: lang === l ? BRAND : 'transparent',
                  color: lang === l ? INK : 'rgba(255,255,255,0.55)',
                  transition: 'background 150ms, color 150ms',
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Masqué sur très petit écran : le lien fait doublon avec le
              « J'ai déjà un compte » du hero, et la barre débordait. */}
          <Link
            href="/login"
            className="hidden sm:inline-flex"
            style={{
              fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.62)',
              textDecoration: 'none', padding: '6px 10px', whiteSpace: 'nowrap',
            }}
          >
            {c.navLogin}
          </Link>

          <Link
            href="/register"
            style={{
              fontSize: 12.5, fontWeight: 800, color: INK, whiteSpace: 'nowrap',
              background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DEEP})`,
              textDecoration: 'none', padding: '8px 15px', borderRadius: 10,
            }}
          >
            {c.navStart}
          </Link>
        </div>
      </nav>

      {/* ── HERO (sombre) ──────────────────────────────────────── */}
      <section
        style={{
          position: 'relative', overflow: 'hidden',
          background: `linear-gradient(175deg, ${INK} 0%, ${INK_2} 55%, ${INK} 100%)`,
          padding: 'clamp(56px,10vw,104px) 20px clamp(48px,8vw,88px)',
        }}
      >
        {/* halos colorés */}
        <div style={{ position: 'absolute', top: -180, left: '50%', width: 900, height: 620, transform: 'translateX(-50%)', background: `radial-gradient(ellipse, ${BRAND}22 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -140, right: -120, width: 520, height: 520, borderRadius: '50%', background: `radial-gradient(circle, ${AMBER}18 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 120, left: -140, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 15px', borderRadius: 99,
            background: 'rgba(34,214,199,0.10)', border: `1px solid ${BRAND}35`, marginBottom: 26,
          }}>
            <span style={{ fontSize: 13 }}>🇧🇪</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: BRAND, letterSpacing: '0.3px' }}>{c.badge}</span>
          </div>

          <h1 style={{
            margin: 0, fontSize: 'clamp(34px,7.5vw,62px)', fontWeight: 900, letterSpacing: '-1.8px',
            lineHeight: 1.06, color: '#FFFFFF',
          }}>
            {c.h1Line1}
            <br />
            <span style={{
              background: `linear-gradient(110deg, ${BRAND} 0%, #7DE8DD 45%, ${AMBER} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {c.h1Line2}
            </span>
          </h1>

          <p style={{
            margin: '22px auto 0', maxWidth: 540, fontSize: 'clamp(14.5px,2.6vw,17px)',
            color: 'rgba(241,245,249,0.62)', lineHeight: 1.72,
          }}>
            {c.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center" style={{ gap: 12, marginTop: 34 }}>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 30px',
              background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DEEP})`, color: INK,
              borderRadius: 14, fontWeight: 800, fontSize: 15.5, textDecoration: 'none',
              boxShadow: `0 10px 34px ${BRAND}33`, letterSpacing: '-0.2px',
            }}>
              🚀 {c.ctaStart}
            </Link>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', padding: '16px 26px',
              background: 'rgba(255,255,255,0.05)', color: 'rgba(241,245,249,0.8)',
              border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14,
              fontWeight: 600, fontSize: 15, textDecoration: 'none',
            }}>
              {c.ctaLogin}
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center" style={{ gap: 18, marginTop: 24 }}>
            {c.trust.map(t => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(241,245,249,0.42)' }}>
                {check(BRAND)}{t}
              </span>
            ))}
          </div>
        </div>

        {/* aperçu de l'app */}
        <div style={{ maxWidth: 392, margin: '54px auto 0', position: 'relative', zIndex: 1 }}>
          <div style={{
            background: 'linear-gradient(160deg, #101B2F, #16233D)', borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.09)', padding: 21,
            boxShadow: '0 40px 90px rgba(0,0,0,0.55)',
          }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: BRAND }}>{c.mockTheme}</p>
            <p style={{ margin: '3px 0 15px', fontSize: 14.5, fontWeight: 700, color: '#F1F5F9' }}>{c.mockThemeTitle}</p>

            <div className="flex items-center" style={{ gap: 10, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '65%', borderRadius: 99, background: `linear-gradient(90deg, ${BRAND}, #7DE8DD)` }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: BRAND }}>65%</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, padding: 14, marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#F1F5F9', lineHeight: 1.55 }}>{c.mockQuestion}</p>
            </div>

            {MOCK_ANSWERS.map(a => (
              <div key={a.text} className="flex items-center justify-between" style={{
                padding: '11px 13px', borderRadius: 11, marginBottom: 8,
                border: `1.5px solid ${a.correct ? 'rgba(34,197,94,0.42)' : 'rgba(255,255,255,0.07)'}`,
                background: a.correct ? 'rgba(34,197,94,0.11)' : 'rgba(255,255,255,0.02)',
                fontSize: 13, fontWeight: a.correct ? 700 : 500,
                color: a.correct ? '#4ADE80' : 'rgba(241,245,249,0.5)',
              }}>
                <span>{a.text}</span>
                {a.correct && <span style={{ fontSize: 14 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* bandeau de chiffres */}
        <div style={{ maxWidth: 940, margin: '52px auto 0', position: 'relative', zIndex: 1 }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden' }}>
            {c.stats.map((s, i) => (
              <div key={i} style={{ background: INK_2, padding: '20px 14px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 'clamp(21px,4vw,28px)', fontWeight: 900, color: i % 2 ? AMBER : BRAND, lineHeight: 1.1 }}>{s.v}</p>
                <p style={{ margin: '5px 0 0', fontSize: 11.5, color: 'rgba(241,245,249,0.45)', fontWeight: 500, lineHeight: 1.4 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS ────────────────────────────────────── */}
      <section style={{ padding: 'clamp(56px,9vw,92px) 20px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 46 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '2.4px', textTransform: 'uppercase', color: BRAND_DEEP }}>{c.featuresKicker}</p>
            <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(25px,4.8vw,38px)', fontWeight: 900, letterSpacing: '-1px' }}>{c.featuresTitle}</h2>
            <p style={{ margin: '0 auto', maxWidth: 480, fontSize: 15, color: 'rgba(11,18,32,0.55)', lineHeight: 1.7 }}>{c.featuresSub}</p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(276px,1fr))', gap: 16 }}>
            {c.features.map(f => (
              <div key={f.title} style={{
                background: '#FFFFFF', borderRadius: 20, padding: '26px 24px',
                border: '1px solid rgba(11,18,32,0.08)',
                borderTop: `3px solid ${f.color}`,
                boxShadow: '0 2px 14px rgba(11,18,32,0.04)',
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 13, background: `${f.color}1A`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 15,
                }}>
                  {f.icon}
                </div>
                <p style={{ margin: '0 0 7px', fontSize: 15.5, fontWeight: 800 }}>{f.title}</p>
                <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(11,18,32,0.56)', lineHeight: 1.68 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ──────────────────────────────────── */}
      <section style={{ padding: 'clamp(56px,9vw,92px) 20px', background: '#F5F8FB' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 46 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '2.4px', textTransform: 'uppercase', color: BRAND_DEEP }}>{c.stepsKicker}</p>
            <h2 style={{ margin: 0, fontSize: 'clamp(25px,4.8vw,38px)', fontWeight: 900, letterSpacing: '-1px' }}>{c.stepsTitle}</h2>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 30 }}>
            {c.steps.map((s, i) => (
              <div key={s.num} style={{ position: 'relative' }}>
                <div style={{
                  width: 54, height: 54, borderRadius: 16,
                  background: i === 2 ? `linear-gradient(135deg, ${AMBER}, #F59E0B)` : `linear-gradient(135deg, ${BRAND}, ${BRAND_DEEP})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, fontWeight: 900, color: INK, marginBottom: 17,
                  boxShadow: `0 8px 22px ${i === 2 ? AMBER : BRAND}30`,
                }}>
                  {s.num}
                </div>
                <h3 style={{ margin: '0 0 9px', fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px' }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(11,18,32,0.56)', lineHeight: 1.72 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMME ──────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(56px,9vw,92px) 20px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '2.4px', textTransform: 'uppercase', color: BRAND_DEEP }}>{c.themesKicker}</p>
          <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(25px,4.8vw,38px)', fontWeight: 900, letterSpacing: '-1px' }}>{c.themesTitle}</h2>
          <p style={{ margin: '0 auto 36px', maxWidth: 460, fontSize: 15, color: 'rgba(11,18,32,0.55)', lineHeight: 1.7 }}>{c.themesSub}</p>

          <div className="flex flex-wrap justify-center" style={{ gap: 11 }}>
            {c.themes.map(row => {
              const col = THEME_COLORS[row.code] || BRAND;
              return (
                <div key={row.code} className="flex items-center" style={{
                  background: `${col}12`, borderRadius: 13, padding: '11px 16px',
                  border: `1px solid ${col}38`, gap: 9,
                }}>
                  <span style={{ fontSize: 16 }}>{row.emoji}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 900, color: col }}>{c.themeWord} {row.code}</span>
                  <span style={{ fontSize: 12.5, color: 'rgba(11,18,32,0.6)', fontWeight: 500 }}>{row.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GRATUIT / PREMIUM ──────────────────────────────────── */}
      <section style={{ padding: 'clamp(56px,9vw,92px) 20px', background: '#F5F8FB' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 42 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '2.4px', textTransform: 'uppercase', color: BRAND_DEEP }}>{c.planKicker}</p>
            <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(25px,4.8vw,38px)', fontWeight: 900, letterSpacing: '-1px' }}>{c.planTitle}</h2>
            <p style={{ margin: '0 auto', maxWidth: 500, fontSize: 15, color: 'rgba(11,18,32,0.55)', lineHeight: 1.7 }}>{c.planSubtitle}</p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(298px,1fr))', gap: 20, alignItems: 'start' }}>
            {/* Gratuit */}
            <div style={{ background: '#FFFFFF', borderRadius: 22, padding: '28px 26px', border: '1px solid rgba(11,18,32,0.09)' }}>
              <div className="flex flex-wrap items-center" style={{ gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 900 }}>{c.freeTitle}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(11,18,32,0.06)', color: 'rgba(11,18,32,0.55)' }}>{c.freeBadge}</span>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: 32, fontWeight: 900, letterSpacing: '-1px' }}>0€</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {c.freeItems.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    {check(BRAND_DEEP)}
                    <span style={{ fontSize: 13.5, color: 'rgba(11,18,32,0.7)', lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium */}
            <div style={{
              background: `linear-gradient(155deg, ${INK_2}, #16264A)`, borderRadius: 22, padding: '28px 26px',
              border: `1px solid ${BRAND}3D`, boxShadow: '0 20px 55px rgba(11,18,32,0.22)',
            }}>
              <div className="flex flex-wrap items-center" style={{ gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#F1F5F9' }}>{c.premiumTitle}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: `${BRAND}26`, color: BRAND }}>{c.premiumBadge}</span>
              </div>
              <p className="flex flex-wrap items-baseline" style={{ margin: '0 0 20px', gap: 7 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: BRAND, letterSpacing: '-1px' }}>{plan.priceDisplay}</span>
                <span style={{ fontSize: 13, color: 'rgba(241,245,249,0.5)', fontWeight: 600 }}>{c.premiumPeriod}</span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 22 }}>
                {c.premiumItems.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    {check(BRAND)}
                    <span style={{ fontSize: 13.5, color: 'rgba(241,245,249,0.8)', lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
              <p style={{ margin: 0, fontSize: 11.5, color: 'rgba(241,245,249,0.4)', lineHeight: 1.6 }}>{c.premiumNote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(56px,9vw,92px) 20px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '2.4px', textTransform: 'uppercase', color: BRAND_DEEP }}>{c.faqKicker}</p>
            <h2 style={{ margin: 0, fontSize: 'clamp(25px,4.8vw,38px)', fontWeight: 900, letterSpacing: '-1px' }}>{c.faqTitle}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {c.faq.map((item, i) => (
              <details key={i} className="faq-item" style={{
                background: '#F5F8FB', borderRadius: 15, border: '1px solid rgba(11,18,32,0.07)',
                padding: '16px 19px',
              }}>
                <summary style={{
                  cursor: 'pointer', listStyle: 'none', fontSize: 15, fontWeight: 700,
                  color: '#0B1220', display: 'flex', alignItems: 'flex-start', gap: 12, lineHeight: 1.5,
                }}>
                  <span style={{ color: BRAND_DEEP, fontWeight: 900, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{item.q}</span>
                </summary>
                <p style={{ margin: '13px 0 0 32px', fontSize: 14, color: 'rgba(11,18,32,0.62)', lineHeight: 1.75 }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL (sombre, raccorde au pied de page) ───────── */}
      <section style={{
        position: 'relative', overflow: 'hidden', textAlign: 'center',
        background: `linear-gradient(185deg, ${INK_2} 0%, ${INK} 100%)`,
        padding: 'clamp(64px,10vw,104px) 20px clamp(72px,11vw,112px)',
      }}>
        <div style={{ position: 'absolute', top: -160, left: '50%', width: 760, height: 520, transform: 'translateX(-50%)', background: `radial-gradient(ellipse, ${BRAND}1F 0%, transparent 65%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 42, marginBottom: 16 }}>🏁</div>
          <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(26px,5vw,40px)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-1.2px' }}>
            {c.finalTitle}
          </h2>
          <p style={{ margin: '0 0 30px', fontSize: 15, color: 'rgba(241,245,249,0.58)', lineHeight: 1.72 }}>
            {c.finalDesc}
          </p>
          <Link href="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '17px 38px',
            background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DEEP})`, color: INK,
            borderRadius: 14, fontWeight: 800, fontSize: 16, textDecoration: 'none',
            boxShadow: `0 12px 38px ${BRAND}30`,
          }}>
            {c.finalCta} →
          </Link>
          <p style={{ margin: '15px 0 0', fontSize: 12, color: 'rgba(241,245,249,0.34)' }}>{c.finalNote}</p>
        </div>
      </section>

    </main>
  );
}
