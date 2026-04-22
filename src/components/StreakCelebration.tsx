'use client';

import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useLang } from '@/contexts/LanguageContext';

// ── Paliers avec confettis ──────────────────────────────────────
const CONFETTI_MILESTONES = [7, 14, 30, 60, 100, 365];

// ── Message selon le streak ─────────────────────────────────────
function getStreakMessage(streak: number, isReset: boolean, lang: 'fr' | 'nl'): string {
  if (lang === 'nl') {
    if (isReset)         return 'Nieuwe reeks begint! Je kan het! 💪';
    if (streak === 1)    return 'Begin van een nieuw avontuur! 🔥';
    if (streak < 7)      return 'Blijf zo doorgaan, je groeit! 💪';
    if (streak === 7)    return '1 week op rij! 🎉 Ongelooflijk!';
    if (streak === 14)   return '2 weken regelmaat! 🏆';
    if (streak === 30)   return '1 maand, kampioen! 👑';
    if (streak === 60)   return '2 maanden inzet, je bent uitzonderlijk!';
    if (streak === 100)  return '100 dagen, legende! ⭐';
    if (streak === 365)  return '1 volledig jaar, je bent onsterfelijk! 🌟';
    if (streak > 365)    return `${streak} dagen, je bent een levende legende! 🌟`;
    if (streak > 100)    return `${streak} dagen op rij, ongelooflijk! ⭐`;
    if (streak > 60)     return `${streak} dagen, je bent uitzonderlijk!`;
    if (streak > 30)     return `${streak} dagen regelmaat! 🏆`;
    if (streak > 14)     return `${streak} dagen op rij! Blijf doorgaan! 🔥`;
    return 'Blijf zo doorgaan, je groeit! 💪';
  }
  if (isReset) return 'Nouvelle série commence ! Tu peux le faire 💪';
  if (streak === 1)   return 'Début d\'une nouvelle aventure ! 🔥';
  if (streak < 7)     return 'Continue comme ça, tu progresses ! 💪';
  if (streak === 7)   return '1 semaine consécutive ! 🎉 Incroyable !';
  if (streak === 14)  return '2 semaines de régularité ! 🏆';
  if (streak === 30)  return '1 mois, champion ! 👑';
  if (streak === 60)  return '2 mois d\'engagement, tu es exceptionnel !';
  if (streak === 100) return '100 jours, légende ! ⭐';
  if (streak === 365) return '1 an complet, tu es immortel ! 🌟';
  if (streak > 365)   return `${streak} jours, tu es une légende vivante ! 🌟`;
  if (streak > 100)   return `${streak} jours consécutifs, incroyable ! ⭐`;
  if (streak > 60)    return `${streak} jours, tu es exceptionnel !`;
  if (streak > 30)    return `${streak} jours de régularité ! 🏆`;
  if (streak > 14)    return `${streak} jours consécutifs ! Continue ! 🔥`;
  return 'Continue comme ça, tu progresses ! 💪';
}

// ── Taille et style de la flamme selon le streak ────────────────
function getFlameStyle(streak: number): { size: number; filter: string; aura: string } {
  if (streak >= 365) return {
    size: 130,
    filter: 'drop-shadow(0 0 24px #FFD700) drop-shadow(0 0 48px rgba(255,215,0,0.6))',
    aura: 'radial-gradient(circle, rgba(255,215,0,0.25) 0%, transparent 70%)',
  };
  if (streak >= 100) return {
    size: 120,
    filter: 'drop-shadow(0 0 20px #FFD700) drop-shadow(0 0 40px rgba(255,165,0,0.5))',
    aura: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)',
  };
  if (streak >= 30) return {
    size: 108,
    filter: 'drop-shadow(0 0 16px #FF6348) drop-shadow(0 0 32px rgba(255,99,72,0.45))',
    aura: 'radial-gradient(circle, rgba(255,99,72,0.18) 0%, transparent 70%)',
  };
  if (streak >= 7) return {
    size: 96,
    filter: 'drop-shadow(0 0 12px #FF6348) drop-shadow(0 0 24px rgba(255,99,72,0.35))',
    aura: 'radial-gradient(circle, rgba(255,99,72,0.14) 0%, transparent 70%)',
  };
  return {
    size: 80,
    filter: 'drop-shadow(0 0 8px #FF6348)',
    aura: 'radial-gradient(circle, rgba(255,99,72,0.1) 0%, transparent 70%)',
  };
}

// ── Palier le plus proche atteint ────────────────────────────────
function getMilestoneLabel(streak: number, lang: 'fr' | 'nl'): string | null {
  const d = lang === 'nl' ? 'DAGEN' : 'JOURS';
  if (streak === 365) return lang === 'nl' ? '🌟 1 JAAR' : '🌟 1 AN';
  if (streak === 100) return `⭐ 100 ${d}`;
  if (streak === 60)  return `🏅 60 ${d}`;
  if (streak === 30)  return `👑 30 ${d}`;
  if (streak === 14)  return `🏆 14 ${d}`;
  if (streak === 7)   return `🎉 7 ${d}`;
  return null;
}

interface Props {
  streak: number;
  isReset: boolean; // streak vient de retomber à 1
  onClose: () => void;
}

export default function StreakCelebration({ streak, isReset, onClose }: Props) {
  const { lang } = useLang();
  // Compteur animé 0 → streak
  const [displayCount, setDisplayCount] = useState(0);
  // Apparition overlay
  const [visible, setVisible] = useState(false);
  const hasFiredConfetti = useRef(false);

  const flameStyle = getFlameStyle(streak);
  const message    = getStreakMessage(streak, isReset, lang);
  const milestone  = getMilestoneLabel(streak, lang);
  const showConfetti = !isReset && CONFETTI_MILESTONES.includes(streak);

  // Fade-in au mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  // Compteur animé
  useEffect(() => {
    if (streak <= 1) { setDisplayCount(streak); return; }
    const duration = 900;
    const steps = Math.min(streak, 60);
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += Math.max(1, Math.ceil(streak / steps));
      if (current >= streak) {
        setDisplayCount(streak);
        clearInterval(timer);
      } else {
        setDisplayCount(current);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [streak]);

  // Confettis aux paliers (une seule fois)
  useEffect(() => {
    if (!showConfetti || hasFiredConfetti.current) return;
    hasFiredConfetti.current = true;

    // Délai pour laisser l'animation s'ouvrir
    const t = setTimeout(() => {
      // Burst central
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { x: 0.5, y: 0.55 },
        colors: ['#FFD700', '#4ecdc4', '#2ecc71', '#FF6348', '#A29BFE', '#FD79A8'],
        zIndex: 9999,
      });
      // Canons latéraux
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors: ['#FFD700', '#4ecdc4', '#FF6348'], zIndex: 9999 });
        confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ['#FFD700', '#4ecdc4', '#FF6348'], zIndex: 9999 });
      }, 300);
    }, 400);

    return () => clearTimeout(t);
  }, [showConfetti]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 250);
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(5, 8, 28, 0.88)',
        backdropFilter: 'blur(8px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* ── Card centrale ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #0F1F45 0%, #0a0e2a 100%)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          borderRadius: 28,
          padding: '36px 28px 28px',
          maxWidth: 360,
          width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          textAlign: 'center',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(20px)',
          transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Aura background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: flameStyle.aura,
          pointerEvents: 'none',
          borderRadius: 28,
        }} />

        {/* Milestone badge */}
        {milestone && (
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(90deg, #FFD700, #FF6348)',
            borderRadius: 99,
            padding: '4px 14px',
            fontSize: 12,
            fontWeight: 900,
            color: '#0a0e2a',
            marginBottom: 16,
            letterSpacing: '0.08em',
            animation: 'streakBadgePop 0.5s cubic-bezier(0.22,1,0.36,1) 0.2s both',
          }}>
            {milestone}
          </div>
        )}

        {/* Flamme */}
        <div style={{
          fontSize: flameStyle.size,
          lineHeight: 1,
          margin: '0 auto 12px',
          filter: flameStyle.filter,
          display: 'inline-block',
          animation: 'streakFlameEntry 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both',
        }}>
          🔥
        </div>

        {/* Compteur */}
        <div style={{
          fontSize: 72,
          fontWeight: 900,
          lineHeight: 1,
          color: '#FFFFFF',
          fontVariantNumeric: 'tabular-nums',
          textShadow: '0 0 30px rgba(255,99,72,0.5)',
          animation: 'streakCountEntry 0.5s ease-out 0.3s both',
          marginBottom: 6,
        }}>
          {displayCount}
        </div>

        {/* Label "JOUR(S) D'AFFILÉE" */}
        <p style={{
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: '0.12em',
          color: '#FF6348',
          textTransform: 'uppercase',
          marginBottom: 20,
          animation: 'streakCountEntry 0.5s ease-out 0.35s both',
        }}>
          {lang === 'nl'
            ? (streak <= 1 ? 'DAG OP RIJ' : 'DAGEN OP RIJ')
            : (streak <= 1 ? 'JOUR D\'AFFILÉE' : 'JOURS D\'AFFILÉE')}
        </p>

        {/* Message contextuel */}
        <p style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#e5e7eb',
          lineHeight: 1.5,
          marginBottom: 28,
          animation: 'streakCountEntry 0.5s ease-out 0.45s both',
        }}>
          {message}
        </p>

        {/* Bouton CTA */}
        <button
          onClick={handleClose}
          style={{
            width: '100%',
            padding: '15px 24px',
            borderRadius: 14,
            border: 'none',
            background: isReset
              ? 'linear-gradient(135deg, #4ecdc4, #26a69a)'
              : 'linear-gradient(135deg, #FF6348, #e55039)',
            color: '#fff',
            fontSize: 16,
            fontWeight: 900,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            boxShadow: isReset
              ? '0 6px 24px rgba(78,205,196,0.4)'
              : '0 6px 24px rgba(255,99,72,0.45)',
            animation: 'streakCountEntry 0.5s ease-out 0.55s both',
            touchAction: 'manipulation',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
        >
          {lang === 'nl' ? 'Laten we gaan! 🚀' : 'C\'est parti ! 🚀'}
        </button>

        {/* Lien debug discret */}
        {process.env.NODE_ENV === 'development' && (
          <p
            onClick={e => { e.stopPropagation(); localStorage.removeItem('streakAnimationShownDate'); alert('Cache effacé — rechargez la page pour revoir l\'animation.'); }}
            style={{ fontSize: 10, color: '#3A3A5C', marginTop: 12, cursor: 'pointer', userSelect: 'none' }}
          >
            [dev] reset animation cache
          </p>
        )}
      </div>

      {/* ── Keyframes inline ── */}
      <style>{`
        @keyframes streakFlameEntry {
          from { opacity: 0; transform: scale(0.4) rotate(-15deg); }
          60%  { transform: scale(1.15) rotate(4deg); opacity: 1; }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes streakCountEntry {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes streakBadgePop {
          from { opacity: 0; transform: scale(0.6); }
          60%  { transform: scale(1.1); opacity: 1; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
