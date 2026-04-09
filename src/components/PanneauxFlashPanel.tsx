'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SIGNS_BY_CATEGORY, getSignsByCategory, type SignDef } from '@/lib/signsData';
import SignImage from '@/components/SignImage';
import { useLang } from '@/contexts/LanguageContext';

/* ── Shared localStorage helpers (key: panneaux_mastered) ── */
export function loadAllMastered(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem('panneaux_mastered');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function saveMastered(code: string, mastered: boolean) {
  try {
    const all = loadAllMastered();
    if (mastered) all[code] = true;
    else delete all[code];
    localStorage.setItem('panneaux_mastered', JSON.stringify(all));
  } catch {}
}

export function getMasteredCount(catId: string): { mastered: number; total: number } {
  const signs = SIGNS_BY_CATEGORY[catId] || [];
  const all = loadAllMastered();
  const mastered = signs.filter(s => all[s.code]).length;
  return { mastered, total: signs.length };
}

/* ── Flash Panel Component ── */
interface FlashPanelProps {
  catId: string;
  color: string;
  initialSignCode?: string | null;
  onMasteredChange?: () => void;
}

export default function PanneauxFlashPanel({ catId, color, initialSignCode, onMasteredChange }: FlashPanelProps) {
  const { t, lang } = useLang();
  const signs = useMemo(() => getSignsByCategory(catId, lang), [catId, lang]);
  // deck = ordered list of sign codes to review; "revoir" pushes to end, "maîtrisé" removes
  const [deck, setDeck] = useState<string[]>([]);
  const [deckPos, setDeckPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredMap, setMasteredMap] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const all = loadAllMastered();
    setMasteredMap(all);
    setFlipped(false);
    // Build deck: unmastered first, then mastered; start on initialSignCode if provided
    const unmastered = signs.filter(s => !all[s.code]).map(s => s.code);
    const mastered   = signs.filter(s =>  all[s.code]).map(s => s.code);
    const newDeck = [...unmastered, ...mastered];
    setDeck(newDeck);
    if (initialSignCode && newDeck.includes(initialSignCode)) {
      setDeckPos(newDeck.indexOf(initialSignCode));
    } else {
      setDeckPos(0);
    }
    setLoaded(true);
  }, [catId, signs, initialSignCode]);

  const current = deck.length > 0 ? (signs.find(s => s.code === deck[deckPos]) ?? null) : null;
  const total = signs.length;
  const masteredCount = signs.filter(s => masteredMap[s.code]).length;
  const isMastered = current ? !!masteredMap[current.code] : false;

  const handleMastered = useCallback((mastered: boolean) => {
    if (!current) return;
    saveMastered(current.code, mastered);
    const updated = { ...masteredMap };
    if (mastered) updated[current.code] = true;
    else delete updated[current.code];
    setMasteredMap(updated);
    setFlipped(false);
    onMasteredChange?.();

    setDeck(prev => {
      const newDeck = [...prev];
      if (mastered) {
        // Maîtrisé : retire la carte du deck
        newDeck.splice(deckPos, 1);
      } else {
        // À revoir : déplace la carte à la fin du deck
        const [code] = newDeck.splice(deckPos, 1);
        newDeck.push(code);
      }
      // Ajuste la position si on était à la fin
      setDeckPos(p => (newDeck.length === 0 ? 0 : p >= newDeck.length ? 0 : p));
      return newDeck;
    });
  }, [current, masteredMap, deckPos, onMasteredChange]);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setDeckPos(i => (i - 1 + deck.length) % Math.max(1, deck.length));
  }, [deck.length]);

  const goNext = useCallback(() => {
    setFlipped(false);
    setDeckPos(i => (i + 1) % Math.max(1, deck.length));
  }, [deck.length]);

  if (!loaded || signs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12" style={{ color: '#5A6B8A' }}>
        <p className="text-sm">{t('panneaux_aucun')}</p>
      </div>
    );
  }

  const allDone = masteredCount === total;
  const pct = Math.max((masteredCount / total) * 100, 2);

  return (
    <div className="flex flex-col items-center">
      {/* Progress bar */}
      <div className="w-full flex items-center gap-2 mb-4">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: '#4ecdc4' }}
          />
        </div>
        <span className="text-xs font-bold whitespace-nowrap" style={{ color: '#4ecdc4' }}>{masteredCount}/{total}</span>
      </div>

      {allDone && (
        <div className="w-full text-center mb-4 py-3 rounded-xl" style={{ background: '#2ecc7120' }}>
          <span className="text-sm font-bold" style={{ color: '#2ecc71' }}>{t('panneaux_tous_maitrises')}</span>
        </div>
      )}

      {/* Flashcard with CSS flip */}
      {current && (
        <div className="w-full select-none" style={{ perspective: 800 }}>
          <div
            className="w-full relative transition-transform"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
              transitionDuration: '0.4s',
              transitionTimingFunction: 'ease-in-out',
            }}
          >
            {/* Front */}
            <div
              className="w-full rounded-2xl flex flex-col items-center justify-center gap-3 p-6"
              style={{
                background: '#0F1923',
                border: `2px solid ${isMastered ? '#2ecc7150' : '#2A3550'}`,
                minHeight: 300,
                backfaceVisibility: 'hidden',
              }}
            >
              <SignImage code={current.code} size={150} />
              <p className="text-lg font-black mt-2" style={{ color: '#CCD6E6' }}>{current.code}</p>
              {isMastered && (
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#2ecc7120', color: '#2ecc71' }}>{t('panneaux_maitrise')}</span>
              )}
              {/* Reveal button */}
              <button
                onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
                className="mt-2 px-5 py-2.5 rounded-xl text-sm font-bold press-scale transition-all flex items-center gap-2"
                style={{ background: 'transparent', border: '1.5px solid #4ecdc4', color: '#4ecdc4' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#4ecdc420'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span>👁️</span> {t('panneaux_reveler')}
              </button>
            </div>

            {/* Back */}
            <div
              className="w-full rounded-2xl flex flex-col items-center justify-center gap-3 p-6 absolute top-0 left-0"
              style={{
                background: '#0F1923',
                border: `2px solid ${color}60`,
                minHeight: 300,
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <SignImage code={current.code} size={100} />
              <p className="text-sm font-bold" style={{ color: '#CCD6E6' }}>{current.code}</p>
              <p className="text-[14px] font-semibold text-center leading-relaxed mt-1 px-2" style={{ color: 'white' }}>
                {current.name}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
                className="mt-2 text-xs press-scale"
                style={{ color: '#5A6B8A' }}
              >
                {t('panneaux_retourner')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nav + action buttons */}
      <div className="w-full mt-4 flex flex-col gap-3">
        {/* Prev / counter / Next */}
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="w-10 h-10 rounded-xl flex items-center justify-center press-scale"
            style={{ background: '#16213E' }}
          >
            <span style={{ color: '#8B9DC3' }}>←</span>
          </button>
          <span className="text-xs font-bold" style={{ color: '#8B9DC3' }}>{deck.length > 0 ? deckPos + 1 : 0} / {total}</span>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="w-10 h-10 rounded-xl flex items-center justify-center press-scale"
            style={{ background: '#16213E' }}
          >
            <span style={{ color: '#8B9DC3' }}>→</span>
          </button>
        </div>

        {/* Action buttons — bigger, solid background */}
        <div className="flex gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); handleMastered(false); }}
            className="flex-1 rounded-xl text-sm font-bold press-scale transition-all"
            style={{ background: '#e74c3c', color: 'white', padding: '12px 24px' }}
          >
            {t('panneaux_a_revoir')}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleMastered(true); }}
            className="flex-1 rounded-xl text-sm font-bold press-scale transition-all"
            style={{ background: '#2ecc71', color: 'white', padding: '12px 24px' }}
          >
            {t('panneaux_maitrise_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
