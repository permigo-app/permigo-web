'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getThemeData, type LocalTheoryCard } from '@/lib/lessonData';
import { THEME_COLORS, THEME_EMOJIS } from '@/lib/constants';

interface FlashCard extends LocalTheoryCard {
  lessonTitle: string;
  uid: string;
}

function storageKey(themeCode: string) {
  return `flashcards_${themeCode}`;
}

function loadMastered(themeCode: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey(themeCode));
    if (raw) {
      const { mastered = [] } = JSON.parse(raw);
      return mastered;
    }
  } catch {}
  return [];
}

function saveMastered(themeCode: string, uids: string[]) {
  try {
    localStorage.setItem(storageKey(themeCode), JSON.stringify({ mastered: uids, toReview: [] }));
  } catch {}
}

export default function FlashPage() {
  const params = useSearchParams();
  const router = useRouter();
  const themeCode = params.get('theme') || 'A';
  const themeColor = THEME_COLORS[themeCode] || '#74B9FF';
  const themeEmoji = THEME_EMOJIS[themeCode] || '🃏';

  const themeData = getThemeData(themeCode);

  const allCards = useMemo<FlashCard[]>(() => {
    if (!themeData) return [];
    const cards: FlashCard[] = [];
    for (const lesson of themeData.lessons) {
      for (const partie of lesson.theory) {
        for (const card of partie.cards) {
          cards.push({
            ...card,
            lessonTitle: lesson.title,
            uid: `${themeCode}_${lesson.id}_${partie.title}_${card.title}`,
          });
        }
      }
    }
    return cards;
  }, [themeData, themeCode]);

  const totalCards = allCards.length;

  const [queue, setQueue] = useState<FlashCard[]>([]);
  const [masteredUids, setMasteredUids] = useState<string[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Load saved state
  useEffect(() => {
    const mastered = loadMastered(themeCode);
    const masteredSet = new Set(mastered);
    const remaining = allCards.filter(c => !masteredSet.has(c.uid));
    setMasteredUids(mastered);
    if (remaining.length === 0 && totalCards > 0) {
      setDone(true);
    } else {
      setQueue(remaining.length > 0 ? remaining : allCards);
    }
    setLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flipCard = useCallback(() => {
    if (animating) return;
    setFlipped(f => !f);
  }, [animating]);

  const advanceCard = useCallback((updateFn: () => void) => {
    if (animating) return;
    setAnimating(true);
    // Quick fade out
    setTimeout(() => {
      setFlipped(false);
      updateFn();
      setAnimating(false);
    }, 150);
  }, [animating]);

  const handleMastered = useCallback(() => {
    const current = queue[0];
    const newMastered = [...masteredUids, current.uid];
    const newQueue = queue.slice(1);
    advanceCard(() => {
      setMasteredUids(newMastered);
      saveMastered(themeCode, newMastered);
      if (newQueue.length === 0) {
        setDone(true);
      } else {
        setQueue(newQueue);
      }
    });
  }, [queue, masteredUids, advanceCard, themeCode]);

  const handleReview = useCallback(() => {
    const current = queue[0];
    advanceCard(() => {
      setQueue(prev => [...prev.slice(1), current]);
    });
  }, [queue, advanceCard]);

  const restart = useCallback(() => {
    localStorage.removeItem(storageKey(themeCode));
    setMasteredUids([]);
    setQueue(allCards);
    setFlipped(false);
    setDone(false);
    setAnimating(false);
  }, [themeCode, allCards]);

  if (!loaded) return <div className="min-h-screen" />;

  if (!themeData || totalCards === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p style={{ color: '#8B9DC3' }}>Aucune carte disponible pour ce thème.</p>
        <button onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold press-scale" style={{ background: '#16213E' }}>
          ← Retour
        </button>
      </div>
    );
  }

  // Done screen
  if (done) {
    const pct = totalCards > 0 ? Math.round((masteredUids.length / totalCards) * 100) : 0;
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold press-scale" style={{ background: '#16213E' }}>
            ←
          </button>
          <span className="text-lg font-extrabold">{themeEmoji} Flash</span>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4">
          <span className="text-[72px]">🏆</span>
          <h1 className="text-[30px] font-black">Toutes maîtrisées !</h1>
          <p className="text-center" style={{ color: '#8B9DC3' }}>
            Tu as validé {masteredUids.length} fiche{masteredUids.length > 1 ? 's' : ''} sur {totalCards}
          </p>

          {/* Score pill */}
          <div className="px-7 py-2.5 rounded-full" style={{ background: themeColor + '20', border: `1px solid ${themeColor}50` }}>
            <span className="text-4xl font-black" style={{ color: themeColor }}>{pct}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1E2D4A' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: themeColor }} />
          </div>

          <button onClick={() => router.back()} className="w-full h-[54px] rounded-2xl font-bold text-white press-scale mt-2" style={{ background: themeColor }}>
            Retour à la carte
          </button>
          <button onClick={restart} className="w-full h-[54px] rounded-2xl font-bold press-scale" style={{ background: '#16213E', border: '1px solid #2A3550', color: themeColor }}>
            🔁 Recommencer depuis zéro
          </button>
        </div>
      </div>
    );
  }

  // Main card screen
  const card = queue[0];
  const progressPct = totalCards > 0 ? (masteredUids.length / totalCards) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between px-5 pt-5 pb-3">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold press-scale" style={{ background: '#16213E' }}>
          ←
        </button>
        <span className="text-lg font-extrabold">{themeEmoji} Flash</span>
        <span className="text-sm font-extrabold min-w-[40px] text-right" style={{ color: themeColor }}>
          {masteredUids.length}/{totalCards}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mx-auto px-5">
        <div className="h-1 rounded-full overflow-hidden mb-3" style={{ background: '#1E2D4A' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progressPct}%`, background: themeColor }} />
        </div>
      </div>

      {/* Stats chips */}
      <div className="flex gap-2 mb-2 justify-center">
        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#4CAF5020', color: '#4CAF50' }}>
          ✅ {masteredUids.length} maîtrisées
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#16213E', color: '#8B9DC3' }}>
          🔄 {queue.length} restantes
        </span>
      </div>

      {/* Flip hint */}
      <p className="text-center text-xs mb-3" style={{ color: '#5A6B8A' }}>
        Clique sur la carte pour la retourner ↕
      </p>

      {/* 3D Flip Card — portrait format, centered */}
      <div
        className="cursor-pointer mx-auto"
        onClick={flipCard}
        style={{ perspective: 1200, width: 340, height: 480, maxWidth: 'calc(100vw - 40px)' }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            opacity: animating ? 0.3 : 1,
            transition: animating ? 'opacity 0.15s' : 'transform 0.5s ease, opacity 0.15s',
          }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-2xl p-8"
            style={{
              backfaceVisibility: 'hidden',
              background: '#16213E',
              border: `2px solid ${themeColor}60`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            }}
          >
            <span className="text-4xl">{themeEmoji}</span>
            <h2 className="text-2xl font-extrabold text-center leading-snug" style={{ color: themeColor }}>
              {card.title}
            </h2>
            <p className="text-sm text-center" style={{ color: '#8B9DC3' }}>
              {card.lessonTitle}
            </p>
            <p className="absolute bottom-5 text-xs" style={{ color: '#5A6B8A' }}>
              Toucher pour voir l&apos;explication →
            </p>
          </div>

          {/* Back face */}
          <div
            className="absolute inset-0 rounded-2xl p-6 overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: '#1E1E35',
              border: '1px solid #2A3550',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            }}
          >
            <h3 className="text-lg font-extrabold mb-3" style={{ color: themeColor }}>
              {card.title}
            </h3>
            <p className="text-[15px] leading-relaxed mb-4" style={{ color: '#FFFFFF', lineHeight: '24px' }}>
              {card.content}
            </p>
            {card.explanation_simple && (
              <div className="rounded-xl p-4" style={{ background: '#2A2A4A', borderLeft: '3px solid #74B9FF' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#74B9FF' }}>
                  💡 En simple
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#8B9DC3' }}>
                  {card.explanation_simple}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full max-w-[340px] mt-4 mb-6 px-5">
        <button
          onClick={handleReview}
          className="flex-1 h-[60px] rounded-2xl flex flex-col items-center justify-center gap-1 press-scale"
          style={{ background: '#16213E', border: '1px solid #2A3550' }}
        >
          <span className="text-[22px]">🔄</span>
          <span className="text-sm font-bold">À revoir</span>
        </button>
        <button
          onClick={handleMastered}
          className="flex-1 h-[60px] rounded-2xl flex flex-col items-center justify-center gap-1 press-scale text-white"
          style={{ background: themeColor, boxShadow: `0 3px 12px ${themeColor}60` }}
        >
          <span className="text-[22px]">✅</span>
          <span className="text-sm font-bold">Je savais</span>
        </button>
      </div>
    </div>
  );
}
