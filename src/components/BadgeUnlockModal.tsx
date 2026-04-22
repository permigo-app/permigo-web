'use client';

import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { BADGES } from '@/lib/constants';
import { useLang } from '@/contexts/LanguageContext';

// ── Descriptions motivantes pour les popups ─────────────────────
const BADGE_POPUP_DESC: Record<'fr' | 'nl', Record<string, string>> = {
  fr: {
    first_step:     'Ta toute première leçon ! Bienvenue à bord 🚗',
    on_fire:        '5 leçons au compteur, tu prends le rythme !',
    bookworm:       '15 leçons maîtrisées, impressionnant !',
    champion:       '40 leçons ! Tu es inarrêtable !',
    habit:          '3 jours consécutifs, une belle régularité !',
    devoted:        "7 jours d'affilée ! Tu fais preuve d'engagement",
    legend:         'Série de 30 jours ! Respect absolu 👏',
    perfectionist:  'Une leçon parfaite à 100% ! Sans faute !',
    sharpshooter:   "80% de précision, c'est du haut niveau !",
    road_king:      'Précision à 90%, tu domines !',
    graduate:       "Premier examen réussi ! Le début d'une série 💪",
    honors:         '3 examens réussis, tu maîtrises !',
    major:          'TOUS les examens réussis ! Tu es incroyable !',
    survivor:       '10 parties survie, tu tiens bon !',
    pilot:          '20 parties survie, tu prends confiance !',
    invincible:     "30 parties survie, rien ne t'arrête !",
    explorer:       '3 thèmes découverts, bonne route !',
    unlocker:       '5 thèmes explorés, tu ouvres tous les horizons',
    traveler:       'Tous les thèmes testés, tu as fait le tour !',
    level5:         'Niveau 5 atteint ! Les bases sont solides',
    level10:        'Niveau 10 ! Intermédiaire confirmé',
    level20:        'NIVEAU 20 ATTEINT ! Tu es une étoile !',
  },
  nl: {
    first_step:     'Je allereerste les! Welkom aan boord 🚗',
    on_fire:        '5 lessen gedaan, je pakt het ritme!',
    bookworm:       '15 lessen beheerst, indrukwekkend!',
    champion:       '40 lessen! Je bent niet te stoppen!',
    habit:          '3 opeenvolgende dagen, mooie regelmaat!',
    devoted:        '7 dagen op rij! Je toont echte inzet',
    legend:         'Reeks van 30 dagen! Absoluut respect 👏',
    perfectionist:  'Een perfecte les op 100%! Geen fout!',
    sharpshooter:   '80% nauwkeurigheid, dat is topniveau!',
    road_king:      '90% nauwkeurigheid, je domineert!',
    graduate:       'Eerste examen geslaagd! Begin van een reeks 💪',
    honors:         '3 examens geslaagd, je beheerst het!',
    major:          'ALLE examens geslaagd! Je bent geweldig!',
    survivor:       '10 survival-partijen, je houdt stand!',
    pilot:          '20 survival-partijen, je wint vertrouwen!',
    invincible:     '30 survival-partijen, niets houdt je tegen!',
    explorer:       "3 thema's ontdekt, goede reis!",
    unlocker:       "5 thema's verkend, je opent alle horizonten",
    traveler:       "Alle thema's getest, je hebt de tour gedaan!",
    level5:         'Niveau 5 bereikt! De basis is stevig',
    level10:        'Niveau 10! Intermediair bevestigd',
    level20:        'NIVEAU 20 BEREIKT! Je bent een ster!',
  },
};

interface Props {
  badgeId: string;
  isFirst: boolean;   // tout premier badge de l'utilisateur
  onClose: () => void;
}

export default function BadgeUnlockModal({ badgeId, isFirst, onClose }: Props) {
  const { lang } = useLang();
  const [visible, setVisible] = useState(false);
  const hasFiredRef = useRef(false);

  const badge = BADGES.find(b => b.id === badgeId);
  if (!badge) { onClose(); return null; }

  const popupDesc = BADGE_POPUP_DESC[lang][badgeId] ?? badge.desc;

  // ── Fade-in ─────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  // ── Confettis ────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible || hasFiredRef.current) return;
    hasFiredRef.current = true;

    const duration = isFirst ? 4000 : 2200;
    const colors   = ['#FFD700', '#4ecdc4', '#2ecc71', '#FF6348', '#A29BFE', '#FD79A8'];

    setTimeout(() => {
      confetti({ particleCount: isFirst ? 140 : 90, spread: 80, origin: { x: 0.5, y: 0.5 }, colors, zIndex: 9999 });
      setTimeout(() => {
        confetti({ particleCount: 50, angle: 60,  spread: 55, origin: { x: 0, y: 0.6 }, colors, zIndex: 9999 });
        confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors, zIndex: 9999 });
      }, 400);
      if (isFirst) {
        setTimeout(() => {
          confetti({ particleCount: 80, spread: 100, origin: { x: 0.5, y: 0.3 }, colors, shapes: ['star'], zIndex: 9999 });
        }, duration / 2);
      }
    }, 300);
  }, [visible, isFirst]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9200,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        background: 'rgba(5, 8, 28, 0.9)',
        backdropFilter: 'blur(10px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #0F1F45 0%, #0a0e2a 100%)',
          border: '1.5px solid rgba(255,215,0,0.35)',
          borderRadius: 28,
          padding: '36px 28px 28px',
          maxWidth: 360, width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(255,215,0,0.12)',
          textAlign: 'center',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(24px)',
          transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Aura dorée pulsante */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 28,
          background: 'radial-gradient(circle at center, rgba(255,215,0,0.14) 0%, transparent 65%)',
          animation: 'badgeAuraPulse 2s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Rayons de lumière dorés (SVG) */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', opacity: 0.55,
          animation: 'badgeRaysRotate 8s linear infinite',
        }}>
          <svg width="280" height="280" viewBox="0 0 280 280" style={{ position: 'absolute' }}>
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i * 45) * (Math.PI / 180);
              const x1 = 140 + Math.cos(angle) * 55;
              const y1 = 140 + Math.sin(angle) * 55;
              const x2 = 140 + Math.cos(angle) * 130;
              const y2 = 140 + Math.sin(angle) * 130;
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#FFD700" strokeWidth="10" strokeLinecap="round"
                  opacity="0.6"
                />
              );
            })}
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Premier badge */}
          {isFirst && (
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(90deg, #FFD700, #FF6348)',
              borderRadius: 99, padding: '4px 16px',
              fontSize: 13, fontWeight: 900, color: '#0a0e2a',
              marginBottom: 12, letterSpacing: '0.06em',
              animation: 'badgeEntryUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both',
            }}>
              {lang === 'nl' ? '🎊 JE EERSTE BADGE!' : '🎊 TON PREMIER BADGE !'}
            </div>
          )}

          {/* "BADGE DÉBLOQUÉ !" */}
          {!isFirst && (
            <p style={{
              fontSize: 12, fontWeight: 900, letterSpacing: '0.16em',
              color: '#FFD700', textTransform: 'uppercase', marginBottom: 12,
              animation: 'badgeEntryUp 0.4s ease-out 0.1s both',
            }}>
              {lang === 'nl' ? '🎉 BADGE VRIJGESPEELD!' : '🎉 BADGE DÉBLOQUÉ !'}
            </p>
          )}

          {/* Badge emoji */}
          <div style={{
            fontSize: 88, lineHeight: 1, marginBottom: 14,
            display: 'inline-block',
            filter: 'drop-shadow(0 0 16px rgba(255,215,0,0.7)) drop-shadow(0 0 32px rgba(255,215,0,0.35))',
            animation: 'badgeSpin 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both',
          }}>
            {badge.emoji}
          </div>

          {/* Glow ring */}
          <div style={{
            width: 110, height: 110,
            borderRadius: '50%',
            border: '3px solid rgba(255,215,0,0.5)',
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            top: isFirst ? 110 : 76,
            animation: 'badgeRingPulse 1.6s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          {/* Nom du badge */}
          <h2 style={{
            fontSize: 26, fontWeight: 900, color: '#FFFFFF',
            marginBottom: 6, lineHeight: 1.2,
            animation: 'badgeEntryUp 0.4s ease-out 0.4s both',
          }}>
            {badge.name}
          </h2>

          {/* Description */}
          <p style={{
            fontSize: 15, fontWeight: 600, color: '#9BB4D4',
            marginBottom: isFirst ? 10 : 26, lineHeight: 1.5,
            animation: 'badgeEntryUp 0.4s ease-out 0.5s both',
          }}>
            {popupDesc}
          </p>

          {/* Message extra premier badge */}
          {isFirst && (
            <p style={{
              fontSize: 14, fontWeight: 700, color: '#4ecdc4',
              marginBottom: 26,
              animation: 'badgeEntryUp 0.4s ease-out 0.6s both',
            }}>
              {lang === 'nl' ? 'En dit is nog maar het begin 💪' : 'Et ce n\'est que le début 💪'}
            </p>
          )}

          {/* Bouton */}
          <button
            onClick={handleClose}
            style={{
              width: '100%', padding: '15px 24px',
              borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #FFD700, #e67e22)',
              color: '#0a0e2a', fontSize: 16, fontWeight: 900,
              cursor: 'pointer', letterSpacing: '0.04em',
              boxShadow: '0 6px 24px rgba(255,215,0,0.35)',
              animation: 'badgeEntryUp 0.4s ease-out 0.65s both',
              touchAction: 'manipulation', WebkitUserSelect: 'none', userSelect: 'none',
            }}
          >
            {lang === 'nl' ? 'Super! 🔥' : 'Super ! 🔥'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes badgeSpin {
          from { opacity: 0; transform: scale(0.3) rotate(-180deg); }
          70%  { transform: scale(1.15) rotate(10deg); opacity: 1; }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes badgeEntryUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgeAuraPulse {
          0%, 100% { opacity: 0.7; }
          50%      { opacity: 1; }
        }
        @keyframes badgeRingPulse {
          0%   { transform: translateX(-50%) scale(1); opacity: 0.7; }
          50%  { transform: translateX(-50%) scale(1.15); opacity: 0.3; }
          100% { transform: translateX(-50%) scale(1.3); opacity: 0; }
        }
        @keyframes badgeRaysRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
