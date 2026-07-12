'use client';

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

  const eyebrow  = 'PREMIUM';
  const headline = isNL ? 'Deze inhoud is voor Premium-leden' : 'Ce contenu est réservé aux membres Premium';
  const features = isNL
    ? ["Alle thema's B → I", 'Onbeperkte proefexamens', 'Onbeperkte reflextraining', 'Flashcards & foutenbank per thema']
    : ['Tous les thèmes B → I', 'Examens blancs illimités', 'Entraînement réflexe illimité', 'Cartes flash & banque d\'erreurs par thème'];
  const ctaLabel = isNL ? 'Premium worden — 14,99€/maand →' : 'Passer Premium — 14,99€/mois →';
  const noCommit = isNL ? 'Zonder verbintenis · Op elk moment opzegbaar' : 'Sans engagement · Annulable à tout moment';
  const back     = isNL ? '← Terug naar startpagina' : "← Revenir à l'accueil";

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-page)', fontFamily: 'Sora, sans-serif' }}>

      {/* ── Fond : questions floutées ── */}
      <div
        className="absolute inset-0 px-6 py-16 flex flex-col gap-5"
        style={{ filter: 'blur(6px)', opacity: 0.25, pointerEvents: 'none', userSelect: 'none' }}
      >
        {FAKE_QUESTIONS.map((q, qi) => (
          <div key={qi} className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', maxWidth: 640, margin: '0 auto', width: '100%' }}>
            <p className="font-bold mb-4" style={{ fontSize: 15, color: 'var(--text-title)' }}>{q}</p>
            <div className="grid grid-cols-2 gap-2">
              {(FAKE_CHOICES[qi] ?? FAKE_CHOICES[0]).map((c, ci) => (
                <div key={ci} className="rounded-xl p-3 flex items-center gap-2" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}>
                  <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black flex-shrink-0" style={{ background: 'var(--border-card)', color: 'var(--text-title)' }}>
                    {['A','B','C','D'][ci]}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-sub)' }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Carte centrale ── */}
      <div className="absolute inset-0 flex items-center justify-center px-5 py-12">
        <div style={{
          maxWidth: 420, width: '100%',
          background: 'linear-gradient(135deg, #0E1828 0%, #132240 100%)',
          border: '1px solid rgba(34,214,199,0.15)',
          borderRadius: 22, padding: '32px 28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          textAlign: 'center',
        }}>
          {/* Cadenas */}
          <div style={{
            width: 52, height: 52, borderRadius: 15, margin: '0 auto 18px',
            background: 'rgba(34,214,199,0.12)', border: '1px solid rgba(34,214,199,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22D6C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(34,214,199,0.7)' }}>
            {eyebrow}
          </p>
          <h2 style={{ margin: '0 0 20px', fontSize: 21, fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.5px', lineHeight: 1.25 }}>
            {headline}
          </h2>

          {/* Ce qui est débloqué */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24, textAlign: 'left' }}>
            {features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22D6C7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(241,245,249,0.8)' }}>{f}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/premium"
            className="press-scale"
            style={{
              display: 'block', padding: '15px',
              background: 'linear-gradient(135deg, #22D6C7, #1AB8AB)',
              color: '#07080F', borderRadius: 13,
              fontWeight: 800, fontSize: 15, textDecoration: 'none',
              boxShadow: '0 6px 24px rgba(34,214,199,0.25)',
            }}
          >
            {ctaLabel}
          </Link>

          <p style={{ margin: '12px 0 0', fontSize: 11, color: 'rgba(241,245,249,0.35)' }}>
            {noCommit}
          </p>

          <Link href="/app" style={{ display: 'inline-block', marginTop: 18, fontSize: 12, fontWeight: 600, color: 'rgba(241,245,249,0.45)', textDecoration: 'none' }}>
            {back}
          </Link>

          {children}
        </div>
      </div>
    </div>
  );
}
