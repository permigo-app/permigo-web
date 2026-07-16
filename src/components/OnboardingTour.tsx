'use client';

// Didacticiel de premier lancement : projecteur sur les zones clés de
// l'accueil (le reste de la page est assombri), une bulle explicative par
// étape. S'affiche une seule fois (@tuto_done), toujours passable.

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '@/contexts/LanguageContext';

const TUTO_KEY = '@tuto_done';
const TUTO_PENDING_KEY = '@tuto_pending';
const PAD = 8;          // marge lumineuse autour de l'élément surligné
const BUBBLE_W = 320;

interface Step {
  key: string;      // clés i18n : tuto_<key>_titre / tuto_<key>
  target: string | null; // data-tour ciblé (null = bulle centrée)
}

const STEPS: Step[] = [
  { key: 'welcome', target: null },
  { key: 'progression', target: 'progression' },
  { key: 'themes', target: 'themes' },
  { key: 'route', target: 'route' },
  { key: 'lecons', target: 'lecons' },
  { key: 'turbo', target: 'turbo' },
  { key: 'erreurs', target: 'erreurs' },
  { key: 'panneaux', target: 'nav-panneaux' },
  { key: 'examen', target: 'nav-examen' },
  { key: 'profil', target: 'nav-profil' },
];

interface Rect { top: number; left: number; width: number; height: number }

function findVisibleTarget(tour: string): HTMLElement | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${tour}"]`));
  return els.find(el => el.offsetParent !== null) ?? els[0] ?? null;
}

export default function OnboardingTour() {
  const { t } = useLang();
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  // Démarrage : uniquement si le parcours l'a demandé (@tuto_pending, posé à
  // l'inscription ou par "Revoir le didacticiel") — jamais à une simple
  // connexion sur un compte existant. Une seule diffusion (@tuto_done).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(TUTO_PENDING_KEY) !== 'true') return;
    if (localStorage.getItem(TUTO_KEY) === 'true') {
      localStorage.removeItem(TUTO_PENDING_KEY);
      return;
    }
    const timer = setTimeout(() => setActive(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const updateRect = useCallback(() => {
    const target = STEPS[step]?.target;
    if (!target) { setRect(null); return; }
    const el = findVisibleTarget(target);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  // À chaque étape : scroll auto vers la cible, puis le projecteur SUIT
  // l'élément en continu (listener scroll) pendant le défilement
  useEffect(() => {
    if (!active) return;
    const target = STEPS[step]?.target;
    if (target) {
      const el = findVisibleTarget(target);
      if (el) {
        const r = el.getBoundingClientRect();
        const fullyVisible = r.top >= 70 && r.bottom <= window.innerHeight - 80;
        if (!fullyVisible) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [active, step, updateRect]);

  // Pendant le tour, l'utilisateur ne peut pas faire défiler la page
  // lui-même (molette, tactile, clavier) — seul le scroll automatique bouge
  useEffect(() => {
    if (!active) return;
    const prevent = (e: Event) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) e.preventDefault();
    };
    window.addEventListener('wheel', prevent, { passive: false });
    window.addEventListener('touchmove', prevent, { passive: false });
    window.addEventListener('keydown', preventKeys);
    return () => {
      window.removeEventListener('wheel', prevent);
      window.removeEventListener('touchmove', prevent);
      window.removeEventListener('keydown', preventKeys);
    };
  }, [active]);

  const finish = () => {
    localStorage.setItem(TUTO_KEY, 'true');
    localStorage.removeItem(TUTO_PENDING_KEY);
    setActive(false);
  };

  const next = () => {
    if (step + 1 >= STEPS.length) { finish(); return; }
    setStep(s => s + 1);
  };

  if (!active) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 375;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 700;

  // ── Position de la bulle ──
  let bubbleStyle: React.CSSProperties;
  if (!current.target || !rect) {
    // Bulle en haut de l'écran (bienvenue, ou pendant le scroll) —
    // visible immédiatement sans avoir à chercher
    bubbleStyle = { top: 84, left: '50%', transform: 'translateX(-50%)' };
  } else {
    const centerX = rect.left + rect.width / 2;
    const left = Math.min(Math.max(12, centerX - BUBBLE_W / 2), vw - BUBBLE_W - 12);
    const targetMidY = rect.top + rect.height / 2;
    if (targetMidY > vh / 2) {
      // cible en bas → bulle au-dessus
      bubbleStyle = { bottom: vh - rect.top + PAD + 14, left };
    } else {
      // cible en haut → bulle en dessous
      bubbleStyle = { top: rect.top + rect.height + PAD + 14, left };
    }
  }

  // Portail vers <body> : un ancêtre animé (transform) casserait le
  // position:fixed et décalerait le calque
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, fontFamily: 'Sora, sans-serif' }}>
      {/* Calque bloquant les clics pendant le tour */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={e => e.stopPropagation()} />

      {/* Assombrissement + trou lumineux (le box-shadow géant fait l'ombre) */}
      {current.target && rect ? (
        <div style={{
          position: 'fixed',
          top: rect.top - PAD, left: rect.left - PAD,
          width: rect.width + PAD * 2, height: rect.height + PAD * 2,
          borderRadius: 18,
          boxShadow: '0 0 0 9999px rgba(7,8,15,0.78)',
          border: '2px solid rgba(34,214,199,0.7)',
          pointerEvents: 'none',
        }} />
      ) : (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(7,8,15,0.78)' }} />
      )}

      {/* Bulle */}
      <div style={{
        position: 'fixed', ...bubbleStyle,
        width: BUBBLE_W, maxWidth: 'calc(100vw - 24px)',
        background: 'var(--card-primary, #fff)',
        borderRadius: 18, padding: '20px 20px 16px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
      }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 900, color: 'var(--text-title)', letterSpacing: '-0.3px' }}>
          {t(`tuto_${current.key}_titre`)}
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--text-sub)', lineHeight: 1.6 }}>
          {t(`tuto_${current.key}`)}
        </p>

        {/* Points de progression */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
          {STEPS.map((s, i) => (
            <div key={s.key} style={{
              width: i === step ? 18 : 6, height: 6, borderRadius: 99,
              background: i <= step ? '#22D6C7' : 'var(--border-subtle)',
              transition: 'width 0.25s, background 0.25s',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={finish}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0',
              fontSize: 13, fontWeight: 600, color: 'var(--text-disabled)', fontFamily: 'Sora, sans-serif',
            }}
          >
            {t('tuto_passer')}
          </button>
          <button
            onClick={next}
            className="press-scale"
            style={{
              padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#22D6C7,#1AB8AB)', color: '#07080F',
              fontSize: 13.5, fontWeight: 800, fontFamily: 'Sora, sans-serif',
              boxShadow: '0 4px 14px rgba(34,214,199,0.25)',
            }}
          >
            {isLast ? t('tuto_commencer') : t('tuto_suivant')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
