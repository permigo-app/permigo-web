'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/contexts/LanguageContext';

interface PremiumGateProps {
  children?: React.ReactNode;
}

const FAKE_QUESTIONS_FR = [
  "Tu approches d'un carrefour avec un feu orange clignotant. Quelle est la bonne conduite à adopter ?",
  'Sur une route à 90 km/h, quelle est la distance de sécurité minimale recommandée derrière le véhicule qui vous précède ?',
  "Un piéton traverse en dehors d'un passage pour piétons. Qui est prioritaire ?",
  'Vous doublez un cycliste sur une route à 70 km/h. Quelle distance latérale minimale devez-vous respecter ?',
];

const FAKE_CHOICES_FR = [
  ["Continuer normalement", "Ralentir et être prêt à céder le passage", "S'arrêter obligatoirement", "Accélérer pour passer"],
  ['20 mètres', '50 mètres', '2 secondes de distance', '1 mètre par km/h de vitesse'],
];

const FAKE_QUESTIONS_NL = [
  'Je nadert een kruispunt met een knipperend oranje licht. Welk rijgedrag is correct?',
  'Op een weg met 90 km/h, wat is de aanbevolen minimale veiligheidsafstand achter het voertuig voor u?',
  'Een voetganger steekt over buiten een zebrapad. Wie heeft voorrang?',
  'U haalt een fietser in op een weg met 70 km/h. Welke minimale zijdelingse afstand moet u respecteren?',
];

const FAKE_CHOICES_NL = [
  ['Normaal doorrijden', 'Vertragen en klaar zijn om voorrang te verlenen', 'Verplicht stoppen', 'Versnellen om door te rijden'],
  ['20 meter', '50 meter', '2 seconden afstand', '1 meter per km/u snelheid'],
];

export default function PremiumGate({ children }: PremiumGateProps) {
  const { lang } = useLang();

  const isNL = lang === 'nl';
  const FAKE_QUESTIONS = isNL ? FAKE_QUESTIONS_NL : FAKE_QUESTIONS_FR;
  const FAKE_CHOICES   = isNL ? FAKE_CHOICES_NL   : FAKE_CHOICES_FR;

  const headline   = isNL ? 'Deze 2286 vragen mis je 😔' : 'Ces 2286 questions te manquent 😔';
  const subtext    = isNL
    ? "Het volledige proefexamen, onbeperkte Turbo-modus, alle thema's B→I. Ontgrendel alles voor"
    : "L'examen blanc complet, le mode Turbo illimité, tous les thèmes B→I. Débloque tout pour";
  const ctaLabel   = isNL ? '⭐ 7 dagen GRATIS uitproberen' : '⭐ Essayer 7 jours GRATUITS';
  const noCommit   = isNL ? 'Geen verbintenis · Op elk moment opzegbaar' : 'Sans engagement · Annulable à tout moment';

  const stats = isNL
    ? [
        { value: '2286', label: 'vragen',   color: '#4ecdc4' },
        { value: '9',    label: "thema's",  color: '#FFD700' },
        { value: '7d',   label: 'gratis',   color: '#2ecc71' },
      ]
    : [
        { value: '2286', label: 'questions', color: '#4ecdc4' },
        { value: '9',    label: 'thèmes',    color: '#FFD700' },
        { value: '7j',   label: 'gratuits',  color: '#2ecc71' },
      ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0a0e2a' }}>

      {/* ── Background: blurred fake questions ── */}
      <div
        className="absolute inset-0 px-6 py-16 flex flex-col gap-5"
        style={{ filter: 'blur(6px)', opacity: 0.25, pointerEvents: 'none', userSelect: 'none' }}
      >
        {FAKE_QUESTIONS.map((q, qi) => (
          <div key={qi} className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550', maxWidth: 640, margin: '0 auto', width: '100%' }}>
            <p className="font-bold text-white mb-4" style={{ fontSize: 15 }}>{q}</p>
            <div className="grid grid-cols-2 gap-2">
              {(FAKE_CHOICES[qi] ?? FAKE_CHOICES[0]).map((c, ci) => (
                <div key={ci} className="rounded-xl p-3 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}>
                    {['A','B','C','D'][ci]}
                  </span>
                  <span className="text-xs" style={{ color: '#d1d5db' }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Overlay ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-12" style={{ background: 'rgba(10,14,42,0.82)' }}>

        {/* Gaston */}
        <Image
          src="/images/gaston.png"
          width={110}
          height={110}
          alt="Prof. Gaston"
          className="mb-4"
          style={{ objectFit: 'contain' }}
        />

        {/* Emotional headline */}
        <h2 className="text-center font-black mb-3" style={{ color: '#fff', fontSize: 26, letterSpacing: '-0.5px' }}>
          {headline}
        </h2>

        <p className="text-center mb-8" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, maxWidth: 360, lineHeight: 1.6 }}>
          {subtext} <strong style={{ color: '#FFD700' }}>7€/mois</strong>.
        </p>

        {/* Stats */}
        <div className="flex gap-8 mb-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="font-black" style={{ color: s.color, fontSize: 24 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/premium"
          className="press-scale"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: '#0a0e2a',
            fontWeight: 900,
            fontSize: 17,
            borderRadius: 100,
            padding: '16px 48px',
            boxShadow: '0 8px 30px rgba(255,215,0,0.45)',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          {ctaLabel}
        </Link>

        <p className="mt-3 text-center" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          {noCommit}
        </p>

        {children}
      </div>
    </div>
  );
}
