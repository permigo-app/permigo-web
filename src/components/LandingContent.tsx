'use client';

import Link from 'next/link';
import { useLang } from '@/contexts/LanguageContext';
import { cheapestPlan } from '@/lib/pricing';
import { THEME_COLORS } from '@/lib/constants';

/* ──────────────────────────────────────────────────────────────
   Landing CLAIRE, pleine largeur.
   Parti pris repris des références du marché belge : le prix est
   annoncé dès le premier écran, et trois piliers d'offre suivent
   immédiatement le hero — le visiteur sait en 3 secondes ce qu'il
   obtient et ce que ça coûte, sans avoir à faire défiler.
   ────────────────────────────────────────────────────────────── */
const INK = '#0B1220';
const BRAND = '#22D6C7';
const BRAND_DEEP = '#12A093';
const AMBER = '#F5A524';
const HERO_PHOTO = '/images/questions/G1_Q3.webp';

interface FaqItem { q: string; a: string }
/** Carte d'offre du hero : fond plein coloré, prix en gros, bouton dédié. */
interface Pillar { title: string; price: string; cta: string; href: string; bg: string; fg: string; btnBg: string; btnFg: string }

interface LandingCopy {
  announce: string;
  navLogin: string;
  navStart: string;
  badge: string;
  h1Line1: string;
  h1Line2Pre: string;
  h1Mark: string;
  h1Line2Post: string;
  subtitle: string;
  priceLine: string;
  priceLineStrong: string;
  ctaStart: string;
  ctaLogin: string;
  trust: string[];
  mockTheme: string;
  mockThemeTitle: string;
  mockQuestion: string;
  pillars: Pillar[];
  stats: { v: string; l: string }[];
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
    announce: 'Nouveau · Le quiz des 214 panneaux belges est en ligne',
    navLogin: 'Se connecter',
    navStart: 'Commencer',
    badge: 'Conforme au programme officiel belge',
    h1Line1: 'Ton permis théorique,',
    h1Line2Pre: 'sans y passer',
    h1Mark: 'six mois',
    h1Line2Post: '.',
    subtitle: '1 770 questions sur les 9 thèmes officiels, des leçons courtes et des examens blancs en conditions réelles. Tu commences aujourd\'hui, gratuitement.',
    priceLine: 'Gratuit pour commencer · Premium dès',
    priceLineStrong: 'par semaine',
    ctaStart: 'Commencer gratuitement',
    ctaLogin: 'J\'ai déjà un compte',
    trust: ['Sans carte bancaire', 'Français & Néerlandais', 'Sur mobile et ordinateur'],
    mockTheme: 'Thème A · Leçon 3',
    mockThemeTitle: 'La voie publique',
    mockQuestion: 'Vous roulez sur une voie à sens unique et croisez des véhicules qui arrivent en face. D\'où viennent-ils ?',
    pillars: [
      { title: 'Théorie & quiz', price: 'Première leçon gratuite', cta: 'Commencer !', href: '/register', bg: '#6FD8CC', fg: '#0B2A2A', btnBg: '#0B2A2A', btnFg: '#6FD8CC' },
      { title: 'Examens blancs', price: 'Un examen offert', cta: 'Tester !', href: '/register', bg: '#8FC7F5', fg: '#0B2138', btnBg: '#0B2138', btnFg: '#8FC7F5' },
      { title: 'Premium, tout débloqué', price: 'À partir de 4,99 €', cta: 'Voir Premium', href: '/premium', bg: '#F7A93B', fg: '#3A2200', btnBg: '#3A2200', btnFg: '#F7A93B' },
    ],
    stats: [
      { v: '1 770', l: 'questions officielles' },
      { v: '9', l: 'thèmes du programme' },
      { v: '214', l: 'panneaux belges' },
      { v: '15 min', l: 'par jour suffisent' },
    ],
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
    announce: 'Nieuw · De quiz met de 214 Belgische verkeersborden staat online',
    navLogin: 'Inloggen',
    navStart: 'Beginnen',
    badge: 'Conform het officiële Belgische programma',
    h1Line1: 'Je theorie-examen,',
    h1Line2Pre: 'zonder er',
    h1Mark: 'maanden',
    h1Line2Post: 'aan te verliezen.',
    subtitle: '1 770 vragen over de 9 officiële thema\'s, korte lessen en proefexamens in echte omstandigheden. Je begint vandaag, gratis.',
    priceLine: 'Gratis om te starten · Premium vanaf',
    priceLineStrong: 'per week',
    ctaStart: 'Gratis beginnen',
    ctaLogin: 'Ik heb al een account',
    trust: ['Zonder bankkaart', 'Frans & Nederlands', 'Op gsm en computer'],
    mockTheme: 'Thema A · Les 3',
    mockThemeTitle: 'De openbare weg',
    mockQuestion: 'U rijdt in een eenrichtingsstraat en kruist voertuigen die u tegemoet komen. Waar komen ze vandaan?',
    pillars: [
      { title: 'Theorie & quiz', price: 'Eerste les gratis', cta: 'Beginnen!', href: '/register', bg: '#6FD8CC', fg: '#0B2A2A', btnBg: '#0B2A2A', btnFg: '#6FD8CC' },
      { title: 'Proefexamens', price: 'Eén examen gratis', cta: 'Testen!', href: '/register', bg: '#8FC7F5', fg: '#0B2138', btnBg: '#0B2138', btnFg: '#8FC7F5' },
      { title: 'Premium, alles vrij', price: 'Vanaf 4,99 €', cta: 'Premium bekijken', href: '/premium', bg: '#F7A93B', fg: '#3A2200', btnBg: '#3A2200', btnFg: '#F7A93B' },
    ],
    stats: [
      { v: '1 770', l: 'officiële vragen' },
      { v: '9', l: 'thema\'s van het programma' },
      { v: '214', l: 'Belgische borden' },
      { v: '15 min', l: 'per dag volstaat' },
    ],
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
        q: 'En als ik het examen in het Frans afleg?',
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
  { text: 'A. Ils circulent dans le même sens que vous', correct: false },
  { text: 'B. Ils roulent en sens inverse avec leur propre signal', correct: true },
  { text: 'C. Ils sortent d\'un parking voisin', correct: false },
];

const MOCK_ANSWERS_NL = [
  { text: 'A. Ze rijden in dezelfde richting als u', correct: false },
  { text: 'B. Ze rijden tegengesteld met hun eigen bord', correct: true },
  { text: 'C. Ze komen uit een nabije parking', correct: false },
];

export default function LandingContent() {
  const { lang, setLang } = useLang();
  const c = COPY[lang];
  const plan = cheapestPlan();
  const answers = lang === 'nl' ? MOCK_ANSWERS_NL : MOCK_ANSWERS;

  const check = (color: string, size = 15) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3"
         strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <main style={{ background: '#FFFFFF', fontFamily: 'Sora, sans-serif', color: INK, overflowX: 'hidden' }}>

      {/* ── BANDEAU D'ANNONCE ──────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(90deg, ${BRAND} 0%, #7DE8DD 100%)`,
        padding: '9px 20px', textAlign: 'center',
      }}>
        <Link href="/panneaux" style={{
          display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <span style={{
            background: INK, color: BRAND, fontSize: 10.5, fontWeight: 900,
            padding: '3px 9px', borderRadius: 6, letterSpacing: '0.4px', whiteSpace: 'nowrap',
          }}>
            {lang === 'nl' ? 'NIEUW' : 'NOUVEAU'}
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#06342F', textDecoration: 'underline' }}>
            {c.announce}
          </span>
        </Link>
      </div>

      {/* ── NAV ────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between"
        style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(11,18,32,0.07)',
          padding: '0 max(16px, calc((100% - 1200px) / 2))', height: 64,
        }}
      >
        <span style={{ fontSize: 19, fontWeight: 900, letterSpacing: -0.6, whiteSpace: 'nowrap' }}>
          <span style={{ color: INK }}>My</span>
          <span style={{ color: BRAND_DEEP }}>Permi</span>
          <span style={{ color: AMBER }}>Go</span>
        </span>

        <div className="flex items-center" style={{ gap: 6 }}>
          <div style={{ display: 'flex', borderRadius: 99, overflow: 'hidden', border: '1px solid rgba(11,18,32,0.13)' }}>
            {(['fr', 'nl'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: '4px 9px', fontSize: 11, fontWeight: 800, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: '0.3px',
                  background: lang === l ? BRAND : 'transparent',
                  color: lang === l ? INK : 'rgba(11,18,32,0.45)',
                  transition: 'background 150ms, color 150ms',
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Masqué sur très petit écran : doublon avec le lien du hero,
              et la barre débordait depuis l'ajout du sélecteur FR/NL. */}
          <Link href="/login" className="hidden sm:inline-flex" style={{
            fontSize: 12.5, fontWeight: 600, color: 'rgba(11,18,32,0.55)',
            textDecoration: 'none', padding: '6px 10px', whiteSpace: 'nowrap',
          }}>
            {c.navLogin}
          </Link>

          <Link href="/register" style={{
            fontSize: 12.5, fontWeight: 800, color: INK, whiteSpace: 'nowrap',
            background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DEEP})`,
            textDecoration: 'none', padding: '9px 16px', borderRadius: 10,
            boxShadow: `0 4px 14px ${BRAND}3A`,
          }}>
            {c.navStart}
          </Link>
        </div>
      </nav>

      {/* ── HERO : deux colonnes, pleine largeur ───────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(165deg, #F2FCFB 0%, #FFFFFF 45%, #FFF8EC 100%)',
        padding: 'clamp(40px,6vw,72px) 20px clamp(48px,7vw,80px)',
        borderBottom: '1px solid rgba(11,18,32,0.06)',
      }}>
        <div style={{ position: 'absolute', top: -220, left: -160, width: 620, height: 620, borderRadius: '50%', background: `radial-gradient(circle, ${BRAND}26 0%, transparent 62%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -240, right: -140, width: 640, height: 640, borderRadius: '50%', background: `radial-gradient(circle, ${AMBER}22 0%, transparent 62%)`, pointerEvents: 'none' }} />

        <div
          className="grid items-center"
          style={{
            maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1,
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'clamp(32px,5vw,64px)',
          }}
        >
          {/* colonne texte */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 15px', borderRadius: 99,
              background: 'rgba(34,214,199,0.12)', border: `1px solid ${BRAND}4D`, marginBottom: 22,
            }}>
              <span style={{ fontSize: 13 }}>🇧🇪</span>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: BRAND_DEEP, letterSpacing: '0.3px' }}>{c.badge}</span>
            </div>

            <h1 style={{
              margin: 0, fontSize: 'clamp(32px,5.4vw,56px)', fontWeight: 900,
              letterSpacing: '-1.7px', lineHeight: 1.07,
            }}>
              {c.h1Line1}
              <br />
              {c.h1Line2Pre}{' '}
              {/* Le mot clé dans un bloc sombre : c'est le repère visuel qui
                  fait respirer un titre long et accroche l'œil en premier. */}
              <span style={{
                display: 'inline-block', background: INK, color: '#FFFFFF',
                padding: '0.02em 0.22em', borderRadius: 8, transform: 'rotate(-1.2deg)',
              }}>
                {c.h1Mark}
              </span>
              {c.h1Line2Post === '.' ? '.' : ` ${c.h1Line2Post}`}
            </h1>

            <p style={{ margin: '20px 0 0', maxWidth: 480, fontSize: 'clamp(14.5px,2vw,16.5px)', color: 'rgba(11,18,32,0.62)', lineHeight: 1.72 }}>
              {c.subtitle}
            </p>

            {/* PRIX, dès le premier écran */}
            <div className="inline-flex flex-wrap items-baseline" style={{
              gap: 7, marginTop: 22, padding: '11px 18px', borderRadius: 13,
              background: '#FFFFFF', border: `1.5px solid ${AMBER}59`, boxShadow: '0 4px 16px rgba(11,18,32,0.05)',
            }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(11,18,32,0.62)' }}>{c.priceLine}</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: AMBER, letterSpacing: '-0.5px' }}>{plan.priceDisplay}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(11,18,32,0.45)' }}>{c.priceLineStrong}</span>
            </div>

            <div className="flex flex-wrap items-center" style={{ gap: 12, marginTop: 26 }}>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 30px',
                background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DEEP})`, color: INK,
                borderRadius: 14, fontWeight: 800, fontSize: 15.5, textDecoration: 'none',
                boxShadow: `0 10px 30px ${BRAND}44`, letterSpacing: '-0.2px',
              }}>
                🚀 {c.ctaStart}
              </Link>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', padding: '16px 24px',
                background: '#FFFFFF', color: 'rgba(11,18,32,0.68)',
                border: '1px solid rgba(11,18,32,0.14)', borderRadius: 14,
                fontWeight: 600, fontSize: 15, textDecoration: 'none',
              }}>
                {c.ctaLogin}
              </Link>
            </div>

            <div className="flex flex-wrap items-center" style={{ gap: 16, marginTop: 22 }}>
              {c.trust.map(t => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'rgba(11,18,32,0.48)' }}>
                  {check(BRAND_DEEP, 13)}{t}
                </span>
              ))}
            </div>
          </div>

          {/* colonne visuel : une vraie question du site */}
          <div style={{ position: 'relative' }}>
            <div style={{
              background: '#FFFFFF', borderRadius: 24, border: '1px solid rgba(11,18,32,0.09)',
              padding: 18, boxShadow: '0 28px 70px rgba(11,18,32,0.16)', maxWidth: 440, margin: '0 auto',
            }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 9.5, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: BRAND_DEEP }}>{c.mockTheme}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 800 }}>{c.mockThemeTitle}</p>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: BRAND_DEEP, background: `${BRAND}1F`, padding: '4px 9px', borderRadius: 8 }}>65%</span>
              </div>

              <div style={{ height: 5, borderRadius: 99, background: 'rgba(11,18,32,0.08)', overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ height: '100%', width: '65%', borderRadius: 99, background: `linear-gradient(90deg, ${BRAND_DEEP}, ${BRAND})` }} />
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_PHOTO}
                alt=""
                width={440}
                height={330}
                style={{ width: '100%', borderRadius: 14, display: 'block', marginBottom: 13, aspectRatio: '4 / 3', objectFit: 'cover' }}
              />

              <p style={{ margin: '0 0 12px', fontSize: 13.5, fontWeight: 700, lineHeight: 1.5 }}>{c.mockQuestion}</p>

              {answers.map(a => (
                <div key={a.text} className="flex items-center justify-between" style={{
                  padding: '11px 13px', borderRadius: 11, marginBottom: 7,
                  border: `1.5px solid ${a.correct ? 'rgba(34,197,94,0.5)' : 'rgba(11,18,32,0.09)'}`,
                  background: a.correct ? 'rgba(34,197,94,0.10)' : '#FFFFFF',
                  fontSize: 12.5, fontWeight: a.correct ? 700 : 500,
                  color: a.correct ? '#15803D' : 'rgba(11,18,32,0.6)', gap: 8,
                }}>
                  <span>{a.text}</span>
                  {a.correct && <span style={{ fontSize: 14 }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TROIS CARTES D'OFFRE, prix en évidence ─────────────── */}
      <section style={{ padding: 'clamp(32px,5vw,52px) 20px clamp(40px,6vw,64px)', background: '#FFFFFF' }}>
        <div className="grid" style={{ maxWidth: 1200, margin: '0 auto', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
          {c.pillars.map(p => (
            <div key={p.title} style={{
              background: p.bg, borderRadius: 20, padding: '28px 24px 26px', textAlign: 'center',
              boxShadow: '0 10px 30px rgba(11,18,32,0.10)',
            }}>
              <p style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 800, color: p.fg }}>{p.title}</p>
              <p style={{ margin: '0 0 20px', fontSize: 'clamp(21px,3.2vw,27px)', fontWeight: 900, color: p.fg, letterSpacing: '-0.7px', lineHeight: 1.2 }}>
                {p.price}
              </p>
              <Link href={p.href} style={{
                display: 'inline-block', background: p.btnBg, color: p.btnFg,
                padding: '12px 26px', borderRadius: 11, fontWeight: 800, fontSize: 14, textDecoration: 'none',
              }}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CHIFFRES ───────────────────────────────────────────── */}
      <section style={{ padding: '0 20px clamp(48px,7vw,72px)', background: '#FFFFFF' }}>
        <div className="grid" style={{
          maxWidth: 1200, margin: '0 auto', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
          gap: 1, background: 'rgba(11,18,32,0.09)', borderRadius: 20, overflow: 'hidden',
          border: '1px solid rgba(11,18,32,0.09)',
        }}>
          {c.stats.map((s, i) => (
            <div key={i} style={{ background: '#FBFCFD', padding: '24px 14px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 'clamp(23px,4vw,32px)', fontWeight: 900, color: i % 2 ? AMBER : BRAND_DEEP, lineHeight: 1.1, letterSpacing: '-1px' }}>{s.v}</p>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(11,18,32,0.5)', fontWeight: 500, lineHeight: 1.45 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FONCTIONNALITÉS ────────────────────────────────────── */}
      <section style={{ padding: 'clamp(56px,8vw,88px) 20px', background: '#F5F8FB' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 46 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '2.4px', textTransform: 'uppercase', color: BRAND_DEEP }}>{c.featuresKicker}</p>
            <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(25px,4.6vw,38px)', fontWeight: 900, letterSpacing: '-1px' }}>{c.featuresTitle}</h2>
            <p style={{ margin: '0 auto', maxWidth: 500, fontSize: 15, color: 'rgba(11,18,32,0.55)', lineHeight: 1.7 }}>{c.featuresSub}</p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {c.features.map(f => (
              <div key={f.title} style={{
                background: '#FFFFFF', borderRadius: 20, padding: '26px 24px',
                border: '1px solid rgba(11,18,32,0.08)', boxShadow: '0 2px 12px rgba(11,18,32,0.04)',
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
      <section style={{ padding: 'clamp(56px,8vw,88px) 20px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 46 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '2.4px', textTransform: 'uppercase', color: BRAND_DEEP }}>{c.stepsKicker}</p>
            <h2 style={{ margin: 0, fontSize: 'clamp(25px,4.6vw,38px)', fontWeight: 900, letterSpacing: '-1px' }}>{c.stepsTitle}</h2>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 30 }}>
            {c.steps.map((s, i) => (
              <div key={s.num}>
                <div style={{
                  width: 54, height: 54, borderRadius: 16,
                  background: i === 2 ? `linear-gradient(135deg, ${AMBER}, #E08700)` : `linear-gradient(135deg, ${BRAND}, ${BRAND_DEEP})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, fontWeight: 900, color: i === 2 ? '#FFFFFF' : INK, marginBottom: 17,
                  boxShadow: `0 8px 22px ${i === 2 ? AMBER : BRAND}40`,
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
      <section style={{ padding: 'clamp(56px,8vw,88px) 20px', background: '#F5F8FB' }}>
        <div style={{ maxWidth: 940, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '2.4px', textTransform: 'uppercase', color: BRAND_DEEP }}>{c.themesKicker}</p>
          <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(25px,4.6vw,38px)', fontWeight: 900, letterSpacing: '-1px' }}>{c.themesTitle}</h2>
          <p style={{ margin: '0 auto 36px', maxWidth: 480, fontSize: 15, color: 'rgba(11,18,32,0.55)', lineHeight: 1.7 }}>{c.themesSub}</p>

          <div className="flex flex-wrap justify-center" style={{ gap: 11 }}>
            {c.themes.map(row => {
              const col = THEME_COLORS[row.code] || BRAND;
              return (
                <div key={row.code} className="flex items-center" style={{
                  background: '#FFFFFF', borderRadius: 13, padding: '12px 17px',
                  border: `1.5px solid ${col}59`, gap: 9, boxShadow: `0 2px 10px ${col}1A`,
                }}>
                  <span style={{ fontSize: 16 }}>{row.emoji}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 900, color: col }}>{c.themeWord} {row.code}</span>
                  <span style={{ fontSize: 12.5, color: 'rgba(11,18,32,0.62)', fontWeight: 500 }}>{row.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GRATUIT / PREMIUM ──────────────────────────────────── */}
      <section style={{ padding: 'clamp(56px,8vw,88px) 20px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 42 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '2.4px', textTransform: 'uppercase', color: BRAND_DEEP }}>{c.planKicker}</p>
            <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(25px,4.6vw,38px)', fontWeight: 900, letterSpacing: '-1px' }}>{c.planTitle}</h2>
            <p style={{ margin: '0 auto', maxWidth: 520, fontSize: 15, color: 'rgba(11,18,32,0.55)', lineHeight: 1.7 }}>{c.planSubtitle}</p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20, alignItems: 'start' }}>
            {/* Gratuit */}
            <div style={{ background: '#F9FBFC', borderRadius: 22, padding: '28px 26px', border: '1px solid rgba(11,18,32,0.09)' }}>
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
              background: '#FFFFFF', borderRadius: 22, padding: '28px 26px',
              border: `2px solid ${BRAND}`, boxShadow: `0 16px 44px ${BRAND}2E`,
            }}>
              <div className="flex flex-wrap items-center" style={{ gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 900 }}>{c.premiumTitle}</span>
                <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, background: BRAND, color: INK }}>{c.premiumBadge}</span>
              </div>
              <p className="flex flex-wrap items-baseline" style={{ margin: '0 0 20px', gap: 7 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: BRAND_DEEP, letterSpacing: '-1px' }}>{plan.priceDisplay}</span>
                <span style={{ fontSize: 13, color: 'rgba(11,18,32,0.5)', fontWeight: 600 }}>{c.premiumPeriod}</span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 22 }}>
                {c.premiumItems.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    {check(BRAND_DEEP)}
                    <span style={{ fontSize: 13.5, color: 'rgba(11,18,32,0.72)', lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
              <p style={{ margin: 0, fontSize: 11.5, color: 'rgba(11,18,32,0.42)', lineHeight: 1.6 }}>{c.premiumNote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(56px,8vw,88px) 20px', background: '#F5F8FB' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '2.4px', textTransform: 'uppercase', color: BRAND_DEEP }}>{c.faqKicker}</p>
            <h2 style={{ margin: 0, fontSize: 'clamp(25px,4.6vw,38px)', fontWeight: 900, letterSpacing: '-1px' }}>{c.faqTitle}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {c.faq.map((item, i) => (
              <details key={i} className="faq-item" style={{
                background: '#FFFFFF', borderRadius: 15, border: '1px solid rgba(11,18,32,0.08)', padding: '16px 19px',
              }}>
                <summary style={{
                  cursor: 'pointer', listStyle: 'none', fontSize: 15, fontWeight: 700,
                  display: 'flex', alignItems: 'flex-start', gap: 12, lineHeight: 1.5,
                }}>
                  <span style={{ color: BRAND_DEEP, fontWeight: 900, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{item.q}</span>
                </summary>
                <p style={{ margin: '13px 0 0 32px', fontSize: 14, color: 'rgba(11,18,32,0.62)', lineHeight: 1.75 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden', textAlign: 'center',
        background: 'linear-gradient(165deg, #FFFFFF 0%, #F2FCFB 55%, #FFF8EC 100%)',
        padding: 'clamp(60px,9vw,96px) 20px clamp(68px,10vw,104px)',
        borderTop: '1px solid rgba(11,18,32,0.06)',
      }}>
        <div style={{ position: 'absolute', top: -180, left: '50%', width: 760, height: 520, transform: 'translateX(-50%)', background: `radial-gradient(ellipse, ${BRAND}24 0%, transparent 64%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 42, marginBottom: 16 }}>🏁</div>
          <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(26px,4.8vw,40px)', fontWeight: 900, letterSpacing: '-1.2px' }}>{c.finalTitle}</h2>
          <p style={{ margin: '0 0 30px', fontSize: 15, color: 'rgba(11,18,32,0.58)', lineHeight: 1.72 }}>{c.finalDesc}</p>
          <Link href="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '17px 38px',
            background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DEEP})`, color: INK,
            borderRadius: 14, fontWeight: 800, fontSize: 16, textDecoration: 'none',
            boxShadow: `0 12px 36px ${BRAND}4D`,
          }}>
            {c.finalCta} →
          </Link>
          <p style={{ margin: '15px 0 0', fontSize: 12, color: 'rgba(11,18,32,0.42)' }}>{c.finalNote}</p>
        </div>
      </section>

    </main>
  );
}
