'use client';

import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '@/lib/sounds';
import { useLang } from '@/contexts/LanguageContext';

const CONFETTI_MILESTONES = [5, 10, 15, 20, 25, 30, 50, 100];

function getLevelUpMessage(level: number, lang: 'fr' | 'nl'): string {
  if (lang === 'nl') {
    if (level === 2)                return 'Op weg naar succes! 🚗';
    if (level === 3)                return 'Je pakt snelheid! ⚡';
    if (level === 4)                return 'Het loopt voor je! 🎯';
    if (level === 5)                return 'De basis is stevig! 💪';
    if (level >= 6  && level <= 9)  return `Niveau ${level} bereikt! Blijf zo doorgaan! 🚀`;
    if (level === 10)               return 'Middenniveau bereikt! 🎯';
    if (level >= 11 && level <= 14) return `Niveau ${level} — je gaat door! 🔥`;
    if (level === 15)               return 'Bijna een echte rijpro! 🔥';
    if (level >= 16 && level <= 19) return `Niveau ${level} — nog één stap! ⭐`;
    if (level === 20)               return 'ULTIEM NIVEAU BEREIKT! 🏆👑';
    if (level >= 21 && level <= 24) return `Niveau ${level} — je overtreft de verwachtingen! ⭐`;
    if (level === 25)               return 'Je overtreft de verwachtingen! ⭐';
    if (level >= 26 && level <= 29) return `Niveau ${level} — in vuur en vlam! 🔥`;
    if (level === 30)               return 'Meester van de verkeersregels! 👑';
    if (level >= 31 && level <= 49) return `Niveau ${level} — indrukwekkend! 💫`;
    if (level === 50)               return 'Voorbij excellentie! 🌟';
    if (level >= 51 && level <= 99) return `Niveau ${level} — respect! 🏅`;
    return 'MyPermiGo Legende! 🏅✨';
  }
  if (level === 2)                      return "En route vers la réussite ! 🚗";
  if (level === 3)                      return "Tu prends de la vitesse ! ⚡";
  if (level === 4)                      return "Ça roule pour toi ! 🎯";
  if (level === 5)                      return "Les bases sont solides ! 💪";
  if (level >= 6  && level <= 9)        return `Niveau ${level} atteint ! Continue comme ça 🚀`;
  if (level === 10)                     return "Niveau intermédiaire atteint ! 🎯";
  if (level >= 11 && level <= 14)       return `Niveau ${level} — tu enchaînes ! 🔥`;
  if (level === 15)                     return "Presque un pro du volant ! 🔥";
  if (level >= 16 && level <= 19)       return `Niveau ${level} — plus qu'un pas ! ⭐`;
  if (level === 20)                     return "PALIER ULTIME ATTEINT ! 🏆👑";
  if (level >= 21 && level <= 24)       return `Niveau ${level} — tu dépasses les attentes ! ⭐`;
  if (level === 25)                     return "Tu dépasses les attentes ! ⭐";
  if (level >= 26 && level <= 29)       return `Niveau ${level} — en feu ! 🔥`;
  if (level === 30)                     return "Maître du code de la route ! 👑";
  if (level >= 31 && level <= 49)       return `Niveau ${level} — impressionnant ! 💫`;
  if (level === 50)                     return "Au-delà de l'excellence ! 🌟";
  if (level >= 51 && level <= 99)       return `Niveau ${level} — respect ! 🏅`;
  return "Légende MyPermiGo ! 🏅✨";
}

interface Props {
  prevLevel: number;
  newLevel: number;
  onClose: () => void;
}

export default function LevelUpCelebration({ prevLevel, newLevel, onClose }: Props) {
  const { lang } = useLang();
  const [visible, setVisible]       = useState(false);
  const [shaking, setShaking]       = useState(false);
  const [displayLevel, setDisplayLevel] = useState(prevLevel);
  const hasFiredRef = useRef(false);

  const isMilestone   = CONFETTI_MILESTONES.includes(newLevel);
  const isUltimate    = newLevel === 20;
  const message       = getLevelUpMessage(newLevel, lang);

  // ── Fade-in + shake ────────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => { setVisible(true); setShaking(true); }, 30);
    const t2 = setTimeout(() => setShaking(false), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // ── Counter prevLevel → newLevel ────────────────────────────────
  useEffect(() => {
    const diff = newLevel - prevLevel;
    if (diff <= 0) { setDisplayLevel(newLevel); return; }
    const steps = Math.min(diff, 20);
    const interval = 700 / steps;
    let current = prevLevel;
    const timer = setInterval(() => {
      current += 1;
      setDisplayLevel(current);
      if (current >= newLevel) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [prevLevel, newLevel]);

  // ── Sound + confetti ────────────────────────────────────────────
  useEffect(() => {
    if (!visible || hasFiredRef.current) return;
    hasFiredRef.current = true;

    playSound('levelup');

    if (!isMilestone && !isUltimate) return;

    setTimeout(() => {
      const colors = isUltimate
        ? ['#FFD700', '#FFA500', '#FF6348', '#FFFFFF']
        : ['#FFD700', '#4ecdc4', '#2ecc71', '#FF6348', '#A29BFE'];

      confetti({
        particleCount: isUltimate ? 180 : 100,
        spread: isUltimate ? 100 : 75,
        origin: { x: 0.5, y: 0.5 },
        colors,
        shapes: isUltimate ? ['star', 'circle'] : ['circle'],
        scalar: isUltimate ? 1.4 : 1.1,
        zIndex: 9999,
      });
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 55, spread: 60, origin: { x: 0, y: 0.65 }, colors, zIndex: 9999 });
        confetti({ particleCount: 60, angle: 125, spread: 60, origin: { x: 1, y: 0.65 }, colors, zIndex: 9999 });
      }, 350);
    }, 300);
  }, [visible, isMilestone, isUltimate]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  // ── Couleurs selon le niveau ────────────────────────────────────
  const accentColor   = isUltimate ? '#FFD700' : newLevel >= 50 ? '#e67e22' : newLevel >= 20 ? '#9b59b6' : newLevel >= 10 ? '#4ecdc4' : '#2ecc71';
  const glowColor     = isUltimate ? 'rgba(255,215,0,0.35)' : `${accentColor}30`;
  const gradientBg    = isUltimate
    ? 'linear-gradient(160deg, #1a1000 0%, #0a0e2a 100%)'
    : 'linear-gradient(160deg, #0F1F45 0%, #0a0e2a 100%)';

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9100,
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
          background: gradientBg,
          border: `1.5px solid ${accentColor}50`,
          borderRadius: 28,
          padding: '40px 28px 28px',
          maxWidth: 360, width: '100%',
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${glowColor}`,
          textAlign: 'center',
          transform: visible
            ? shaking ? 'scale(1) rotate(-1deg)' : 'scale(1) rotate(0deg)'
            : 'scale(0.8) translateY(24px)',
          transition: shaking
            ? 'transform 0.06s ease-in-out'
            : 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Flash lumineux */}
        {visible && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 28,
            background: 'white',
            animation: 'levelFlash 0.5s ease-out forwards',
            pointerEvents: 'none', zIndex: 0,
          }} />
        )}

        {/* Aura dorée pour niveau ultime */}
        {isUltimate && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 28,
            background: 'radial-gradient(circle at center, rgba(255,215,0,0.18) 0%, transparent 70%)',
            animation: 'levelUltimateAura 2s ease-in-out infinite',
            pointerEvents: 'none', zIndex: 0,
          }} />
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* "NIVEAU" label */}
          <p style={{
            fontSize: 11, fontWeight: 900, letterSpacing: '0.2em',
            color: accentColor, textTransform: 'uppercase', marginBottom: 4,
            animation: 'levelCountEntry 0.4s ease-out 0.1s both',
          }}>
            NIVEAU
          </p>

          {/* Numéro du niveau */}
          <div style={{
            fontSize: 88, fontWeight: 900, lineHeight: 1,
            color: '#FFFFFF',
            fontVariantNumeric: 'tabular-nums',
            textShadow: `0 0 40px ${accentColor}, 0 0 80px ${glowColor}`,
            animation: 'levelCountEntry 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s both',
            marginBottom: 4,
          }}>
            {displayLevel}
          </div>

          {/* Arrow prev → new */}
          {prevLevel > 0 && (
            <p style={{
              fontSize: 13, color: '#5A6B8A', marginBottom: 16,
              animation: 'levelCountEntry 0.4s ease-out 0.3s both',
            }}>
              Niveau {prevLevel} → <span style={{ color: accentColor, fontWeight: 800 }}>Niveau {newLevel}</span>
            </p>
          )}

          {/* Message */}
          <p style={{
            fontSize: 17, fontWeight: 800, color: '#e5e7eb',
            lineHeight: 1.45, marginBottom: 28,
            animation: 'levelCountEntry 0.4s ease-out 0.45s both',
          }}>
            {message}
          </p>

          {/* Bouton */}
          <button
            onClick={handleClose}
            style={{
              width: '100%', padding: '15px 24px',
              borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
              color: isUltimate ? '#0a0e2a' : '#fff',
              fontSize: 16, fontWeight: 900, cursor: 'pointer',
              letterSpacing: '0.04em',
              boxShadow: `0 6px 24px ${glowColor}`,
              animation: 'levelCountEntry 0.4s ease-out 0.55s both',
              touchAction: 'manipulation', WebkitUserSelect: 'none', userSelect: 'none',
            }}
          >
            {lang === 'nl' ? 'Super! 🚀' : 'Super ! 🚀'}
          </button>

          {/* Dev reset */}
          {process.env.NODE_ENV === 'development' && (
            <p style={{ fontSize: 10, color: '#3A3A5C', marginTop: 10, cursor: 'pointer' }}
               onClick={e => { e.stopPropagation(); onClose(); }}>
              [dev] fermer
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes levelFlash {
          0%   { opacity: 0.35; }
          15%  { opacity: 0.25; }
          100% { opacity: 0; }
        }
        @keyframes levelCountEntry {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes levelUltimateAura {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
