'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getThemeDataLocalized, type LocalTheoryCard } from '@/lib/lessonData';
import { useLang } from '@/contexts/LanguageContext';
import { THEME_COLORS, THEME_EMOJIS } from '@/lib/constants';
import { addStudyTime } from '@/lib/progressStorage';

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
  const { t, lang } = useLang();
  const themeCode = params.get('theme') || 'A';
  const themeColor = THEME_COLORS[themeCode] || '#74B9FF';
  const themeEmoji = THEME_EMOJIS[themeCode] || '🃏';

  const themeData = getThemeDataLocalized(themeCode, lang);
  const themeTitle = themeData?.title || '';

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
  const [sessionViewed, setSessionViewed] = useState(0);
  const sessionStartRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Load saved state
  useEffect(() => {
    const mastered = loadMastered(themeCode);
    const masteredSet = new Set(mastered);
    const remaining = allCards.filter(c => !masteredSet.has(c.uid));
    setMasteredUids(mastered);
    if (remaining.length === 0 && totalCards > 0) {
      setDone(true);
      addStudyTime(Math.floor((Date.now() - sessionStartRef.current) / 1000));
    } else {
      setQueue(remaining.length > 0 ? remaining : allCards);
    }
    setLoaded(true);
  }, [themeCode, allCards, totalCards]);

  const flipCard = useCallback(() => {
    if (animating) return;
    setFlipped(f => !f);
  }, [animating]);

  const advanceCard = useCallback((updateFn: () => void) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setFlipped(false);
      updateFn();
      setAnimating(false);
      setSessionViewed(v => v + 1);
    }, 150);
  }, [animating, sessionViewed]);

  const handleMastered = useCallback(() => {
    const current = queue[0];
    const newMastered = [...masteredUids, current.uid];
    const newQueue = queue.slice(1);
    advanceCard(() => {
      setMasteredUids(newMastered);
      saveMastered(themeCode, newMastered);
      if (newQueue.length === 0) {
        setDone(true);
        addStudyTime(Math.floor((Date.now() - sessionStartRef.current) / 1000));
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

  const shuffleQueue = useCallback(() => {
    setQueue(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setFlipped(false);
  }, []);

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
        <p style={{ color: 'var(--text-secondary)' }}>{t('flash_aucune_carte')}</p>
        <button onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold press-scale" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
          {t('flash_retour')}
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
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold press-scale" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
            ←
          </button>
          <span className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{themeEmoji} Flash</span>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4 max-w-lg mx-auto w-full">
          <span className="text-[72px]">🏆</span>
          <h1 className="text-[30px] font-black" style={{ color: 'var(--text-primary)' }}>{t('flash_toutes_maitrisees')}</h1>
          <p className="text-center" style={{ color: 'var(--text-secondary)' }}>
            Tu as validé {masteredUids.length} fiche{masteredUids.length > 1 ? 's' : ''} sur {totalCards}
          </p>

          {/* Score pill */}
          <div className="px-7 py-2.5 rounded-full" style={{ background: themeColor + '20', border: `1px solid ${themeColor}50` }}>
            <span className="text-4xl font-black" style={{ color: themeColor }}>{pct}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: themeColor }} />
          </div>

          <button onClick={() => router.back()} className="w-full h-[54px] rounded-2xl font-bold text-white press-scale mt-2" style={{ background: themeColor }}>
            {t('flash_retour_carte')}
          </button>
          <button onClick={restart} className="w-full h-[54px] rounded-2xl font-bold press-scale" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)', color: themeColor }}>
            {t('flash_recommencer')}
          </button>
        </div>
      </div>
    );
  }

  // Main card screen
  const card = queue[0];
  const progressPct = totalCards > 0 ? (masteredUids.length / totalCards) * 100 : 0;
  const masteredCount = masteredUids.length;
  const remainingCount = queue.length;
  const sessionPct = sessionViewed > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  // Upcoming cards (next 5)
  const upcoming = queue.slice(1, 6);

  return (
    <div className="min-h-screen flex flex-col" style={{ minHeight: '100vh' }}>
      {/* ── Sticky header ── */}
      <div
        className="sticky top-0 z-30 px-6 py-3"
        style={{ background: 'var(--bg-blur)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center press-scale" style={{ background: 'var(--card-secondary)', color: 'var(--text-secondary)' }}>
              ✕
            </button>
            <div className="flex-1 flex items-center justify-center gap-2">
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('flash_titre')} {themeCode}</span>
            </div>
            <span className="text-sm font-extrabold" style={{ color: themeColor }}>
              {masteredCount + 1}/{totalCards}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, background: themeColor }}
              />
            </div>
            <span className="text-xs font-bold flex-shrink-0" style={{ color: themeColor }}>
              {Math.round(progressPct)}%
            </span>
          </div>
        </div>
      </div>

      {/* ── 3-column layout ── */}
      <div className="flex-1 px-6 py-6">
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">

          {/* ── Left sidebar (desktop only) ── */}
          <div className="hidden lg:block lg:w-56 xl:w-72 lg:flex-shrink-0">
            <div className="sticky top-20 flex flex-col gap-5">

              {/* Progression */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--brand)' }}>{t('flash_progression')}</h4>

                {/* Mastered bar */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg">✅</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold" style={{ color: 'var(--success)' }}>{masteredCount} {t('flash_maitrisees')}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-disabled)' }}>{Math.round(progressPct)}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: 'var(--success)' }} />
                    </div>
                  </div>
                </div>

                {/* Remaining bar */}
                <div className="flex items-center gap-3">
                  <span className="text-lg">🔄</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold" style={{ color: 'var(--error)' }}>{remainingCount} {t('flash_restantes')}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-disabled)' }}>{totalCards > 0 ? Math.round((remainingCount / totalCards) * 100) : 0}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${totalCards > 0 ? (remainingCount / totalCards) * 100 : 0}%`, background: 'var(--error)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming cards */}
              {upcoming.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brand)' }}>{t('flash_prochaines')}</h4>
                  <div className="flex flex-col gap-2">
                    {upcoming.map((uq, i) => (
                      <p key={i} className="text-xs leading-relaxed truncate" style={{ color: 'var(--text-disabled)' }}>
                        {i + 1}. {uq.title}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Shuffle button */}
              <button
                onClick={shuffleQueue}
                className="w-full py-3 rounded-xl font-bold text-sm press-scale"
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--brand)',
                  color: 'var(--brand)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {t('flash_melanger')}
              </button>
            </div>
          </div>

          {/* ── Center: Card + Actions ── */}
          <div className="flex-1 flex flex-col items-center">

            {/* Mobile stats chips */}
            <div className="lg:hidden flex gap-2 mb-3 justify-center">
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(46,204,113,0.15)', color: 'var(--success)' }}>
                ✅ {masteredCount} {t('flash_maitrisees')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--card-secondary)', color: 'var(--text-secondary)' }}>
                🔄 {remainingCount} {t('flash_restantes')}
              </span>
            </div>

            {/* 3D Flip Card */}
            <div
              className="cursor-pointer"
              onClick={!flipped ? flipCard : undefined}
              style={{ perspective: 1200, width: 420, height: 420, maxWidth: 'calc(100vw - 40px)', maxHeight: 'calc(100vw - 40px)' }}
            >
              <div
                className="relative w-full h-full"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  opacity: animating ? 0.3 : 1,
                  transition: animating ? 'opacity 0.15s' : 'transform 0.4s ease, opacity 0.15s',
                }}
              >
                {/* Front face */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl p-8"
                  style={{
                    backfaceVisibility: 'hidden',
                    background: 'var(--card-primary)',
                    border: `1px solid ${themeColor}30`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.12), 0 0 20px ${themeColor}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)'; }}
                >
                  <span className="text-[80px] leading-none">{themeEmoji}</span>
                  <h2 className="text-2xl font-black text-center leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {card.title}
                  </h2>
                  <div className="px-3 py-1.5 rounded-lg" style={{ background: themeColor + '18' }}>
                    <span className="text-xs font-bold" style={{ color: themeColor }}>
                      📚 {t('theme')} {themeCode} : {themeTitle}
                    </span>
                  </div>

                  {/* CTA button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); flipCard(); }}
                    className="mt-4 px-6 py-2.5 rounded-xl font-bold text-sm press-scale"
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--brand)',
                      color: 'var(--brand)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {t('flash_voir_explication')}
                  </button>
                </div>

                {/* Back face */}
                <div
                  className="absolute inset-0 rounded-2xl p-8 overflow-y-auto cursor-pointer"
                  onClick={flipCard}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'var(--card-secondary)',
                    border: `1px solid ${themeColor}30`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  }}
                >
                  <h3 className="text-lg font-black mb-3" style={{ color: themeColor }}>
                    {card.title}
                  </h3>
                  <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-primary)', lineHeight: '26px' }}>
                    {card.content}
                  </p>
                  {card.explanation_simple && (
                    <div className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', borderLeft: `3px solid ${themeColor}` }}>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: themeColor }}>
                        {t('flash_en_simple')}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {card.explanation_simple}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons — always visible, sticky on mobile */}
            <div className="flex gap-4 w-full max-w-[420px] mt-5 sticky bottom-6 z-20">
              <button
                onClick={handleReview}
                className="flex-1 px-8 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold press-scale"
                style={{
                  background: 'rgba(231,76,60,0.12)',
                  border: '1.5px solid rgba(231,76,60,0.45)',
                  color: 'var(--error)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,76,60,0.22)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(231,76,60,0.12)'; }}
              >
                <span className="text-lg">🔄</span>
                <span className="text-sm font-bold">{t('flash_a_revoir')}</span>
              </button>
              <button
                onClick={handleMastered}
                className="flex-1 px-8 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold press-scale"
                style={{
                  background: 'rgba(46,204,113,0.12)',
                  border: '1.5px solid rgba(46,204,113,0.45)',
                  color: 'var(--success)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(46,204,113,0.22)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(46,204,113,0.12)'; }}
              >
                <span className="text-lg">✅</span>
                <span className="text-sm font-bold">{t('flash_je_savais')}</span>
              </button>
            </div>

            {/* Mobile shuffle */}
            <button
              onClick={shuffleQueue}
              className="lg:hidden mt-3 px-5 py-2 rounded-lg text-xs font-bold press-scale"
              style={{ color: 'var(--brand)', background: 'transparent', border: '1px solid var(--border-subtle)' }}
            >
              {t('flash_melanger')}
            </button>
          </div>

          {/* ── Right sidebar (desktop only) ── */}
          <div className="hidden lg:block lg:w-56 xl:w-72 lg:flex-shrink-0">
            <div className="sticky top-20 flex flex-col gap-5">

              {/* Session stats */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--brand)' }}>{t('flash_session')}</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('flash_cartes_vues')}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{sessionViewed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('flash_maitrisees')}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>{sessionPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('flash_temps_passe')}</span>
                    <span className="text-sm font-bold" style={{ color: themeColor }}>{formatTime(elapsed)}</span>
                  </div>
                </div>
              </div>

              {/* End session button */}
              <button
                onClick={() => router.back()}
                className="w-full py-3 rounded-xl font-bold text-sm press-scale"
                style={{
                  background: 'transparent',
                  border: '1.5px solid var(--brand)',
                  color: 'var(--brand)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {t('flash_terminer')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
